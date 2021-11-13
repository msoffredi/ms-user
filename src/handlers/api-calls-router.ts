import { APIGatewayProxyEvent } from 'aws-lambda';
import { ResponseBody, HandlerResponse } from './types';
import { CustomError } from '../errors/custom-error';
import { BadMethodError } from '../errors/bad-method-error';
import { BadRequestError } from '../errors/bad-request-error';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { getUsersHandler } from '../route-handlers/getUsers';
import { getOneUserHandler } from '../route-handlers/getOneUser';
import { postUserHandler } from '../route-handlers/postUser';
import { delUserHandler } from '../route-handlers/delUser';

export const apiCallsRouter = async (
    event: APIGatewayProxyEvent,
): Promise<HandlerResponse> => {
    let status = 200;
    let body: ResponseBody = null;

    try {
        switch (event.resource) {
            case '/v0/users/{email}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getOneUserHandler(event);
                        break;
                    case 'DELETE':
                        body = await delUserHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/users':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getUsersHandler(event);
                        break;
                    case 'POST':
                        body = await postUserHandler(event);
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

    return { status, body };
};
