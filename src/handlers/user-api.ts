import dynamoose from 'dynamoose';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exit } from 'process';
import {
    BadMethodError,
    BadRequestError,
    CustomError,
    events,
    EventSources,
    ResponseBody,
    routeAuthorizer,
} from '@jmsoffredi/ms-common';
import { getOneUserHandler } from '../route-handlers/get-one-user';
import { delUserHandler } from '../route-handlers/del-user';
import { getUsersHandler } from '../route-handlers/get-users';
import { postUserHandler } from '../route-handlers/post-user';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { Config } from '../config';
import { API, APIHandler, ValidationType } from '@jmsoffredi/ms-fast-api';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const api: API = {
    users: {
        schema: {
            id: {
                type: String,
                hashKey: true,
            },
            email: {
                type: String,
                required: true,
            },
        },
        validations: {
            email: ValidationType.Unique,
        },
        api: {
            get: {
                collection: true,
                entity: true,
                auth: Config.userService.users.readUsers,
                authSelf: true,
            },
            delete: {
                entity: {
                    events: [
                        {
                            type: events.UserDeleted.type,
                            dataProperties: ['id', 'email'],
                        },
                    ],
                },
                auth: Config.userService.users.deleteUser,
            },
            post: {
                collection: {
                    events: [
                        {
                            type: events.UserCreated.type,
                            dataProperties: ['id', 'email'],
                        },
                    ],
                },
                auth: Config.userService.users.createUser,
            },
        },
        timestamps: true,
        dbName: 'ms-user',
        path: '/v0/users',
        softDelete: true,
        eventSource: EventSources.Users,
        eventBusType: Config.events.eventBusType,
    },
    healthcheck: {
        schema: {},
        api: {},
        path: '/healthcheck',
        healthcheck: true,
        eventBusType: Config.events.eventBusType,
    },
};

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return APIHandler(api, event);
};

export const handler2 = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', event);

    let status = 200;
    let body: ResponseBody = null;
    const perm = Config.userService;

    try {
        switch (event.resource) {
            case '/v0/users/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(
                            event,
                            getOneUserHandler,
                            [perm.users.readUsers],
                            true,
                        );
                        break;
                    case 'DELETE':
                        body = await routeAuthorizer(event, delUserHandler, [
                            perm.users.deleteUser,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/users':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(event, getUsersHandler, [
                            perm.users.readUsers,
                        ]);
                        break;
                    case 'POST':
                        body = await routeAuthorizer(event, postUserHandler, [
                            perm.users.createUser,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/healthcheck':
                if (event.httpMethod === 'GET') {
                    body = await healthcheckHandler(event);
                } else {
                    throw new BadMethodError();
                }
                break;

            default:
                // We should never reach this point if the API Gateway is configured properly
                throw new BadRequestError();
        }
    } catch (err) {
        console.error(err);

        if (err instanceof CustomError) {
            status = err.statusCode;
            body = err.serializeErrors();
        }
    }

    return {
        statusCode: status,
        body: JSON.stringify(body),
    };
};
