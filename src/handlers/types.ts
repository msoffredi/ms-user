import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayEventRequestContextWithAuthorizer,
    APIGatewayProxyEvent,
    APIGatewayProxyEventHeaders,
    APIGatewayProxyEventMultiValueHeaders,
    APIGatewayProxyEventMultiValueQueryStringParameters,
    APIGatewayProxyEventPathParameters,
    APIGatewayProxyEventQueryStringParameters,
    APIGatewayProxyEventStageVariables,
} from 'aws-lambda';
import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';
import { ErrorEntry } from '../errors/types';
// import { UserDoc } from '../models/user';

export interface APIGatewayExtendedEvent extends APIGatewayProxyEvent {
    // currentUser?: UserDoc;
    currentUser?: unknown;
}

interface ErrorResponseBody {
    message: string;
}

export enum ServiceStatus {
    Healthy = 'healthy',
}

export interface HealthcheckResponseBody {
    serviceStatus: ServiceStatus;
}

export interface DeleteRecordResponseBody {
    deleted: string;
}

export type ResponseBody =
    | Document
    | ObjectType[]
    | ErrorResponseBody
    | HealthcheckResponseBody
    | DeleteRecordResponseBody
    | ErrorEntry[]
    | null;

export interface HandlerResponse {
    status: number;
    body: ResponseBody;
}

export interface MsUserEvents<TDetailType, TDetail> {
    // APIGatewayProxyEvent
    resource?: string;
    httpMethod?: string;
    body?: string | null;
    headers?: APIGatewayProxyEventHeaders;
    multiValueHeaders?: APIGatewayProxyEventMultiValueHeaders;
    isBase64Encoded?: boolean;
    path?: string;
    pathParameters?: APIGatewayProxyEventPathParameters | null;
    queryStringParameters?: APIGatewayProxyEventQueryStringParameters | null;
    multiValueQueryStringParameters?: APIGatewayProxyEventMultiValueQueryStringParameters | null;
    stageVariables?: APIGatewayProxyEventStageVariables | null;
    requestContext?: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>;

    // EventBridgeEvent
    id?: string;
    version?: string;
    time?: string;
    resources?: string[];
    source?: string;
    'detail-type'?: TDetailType;
    detail?: TDetail;
}
