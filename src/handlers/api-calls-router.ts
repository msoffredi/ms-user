import { APIGatewayProxyEvent } from 'aws-lambda';
import { ResponseBody, HandlerResponse } from './types';
import { CustomError } from '../errors/custom-error';
import { BadMethodError } from '../errors/bad-method-error';
import { BadRequestError } from '../errors/bad-request-error';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { getUsersHandler } from '../route-handlers/getUsers';

export const apiCallsRouter = async (
    event: APIGatewayProxyEvent,
): Promise<HandlerResponse> => {
    let status = 200;
    let body: ResponseBody = null;

    try {
        switch (event.resource) {
            case '/v0/users':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getUsersHandler(event);
                        break;
                    // case 'POST':
                    //     body = await routeAuthorizer(event, postUserHandler, [
                    //         auth.Users.AddUser,
                    //     ]);
                    //     break;
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

    return { status, body };
};
