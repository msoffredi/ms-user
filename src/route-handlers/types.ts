import { APIGatewayProxyEvent } from 'aws-lambda';
import { ResponseBody } from '../handlers/types';

export type RouteHandler = (
    event: APIGatewayProxyEvent,
) => Promise<ResponseBody>;

export interface RouteHandlerResponse {
    status: number;
    body: Record<string, unknown> | unknown[];
}
