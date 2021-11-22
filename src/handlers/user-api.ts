import dynamoose from 'dynamoose';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exit } from 'process';
import {
    BadMethodError,
    BadRequestError,
    CustomError,
    ResponseBody,
    routeAuthorizer,
} from '@jmsoffredi/ms-common';
import { getOneUserHandler } from '../route-handlers/getOneUser';
import { delUserHandler } from '../route-handlers/delUser';
import { getUsersHandler } from '../route-handlers/getUsers';
import { postUserHandler } from '../route-handlers/postUser';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { Config } from '../config';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (
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
                        body = await routeAuthorizer(event, getOneUserHandler, [
                            perm.users.readUsers,
                        ]);
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
