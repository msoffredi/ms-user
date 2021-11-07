import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import dynamoose from 'dynamoose';
import { exit } from 'process';
import { apiCallsRouter } from './api-calls-router';
import { ResponseBody } from './types';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (
    event?: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', event);

    let status = 200;
    let body: ResponseBody = null;

    if (isAPIGatewayProxyEvent(event)) {
        const response = await apiCallsRouter(event as APIGatewayProxyEvent);
        status = response.status;
        body = response.body;
        // } else if (isAuthEvent(event)) {
        //     const response = await eventsRouter(
        //         event as EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
        //     );
        //     status = response.status;
        //     body = response.body;
    }

    return {
        statusCode: status,
        body: JSON.stringify(body),
    };
};

const isAPIGatewayProxyEvent = (
    // event?: MsAuthEvents<AuthEventsDetailTypes, AuthEventDetail>,
    event?: APIGatewayProxyEvent,
): boolean => {
    return Boolean(
        event &&
            event.resource &&
            event.httpMethod &&
            (event.body || event.body === null) &&
            event.headers &&
            event.multiValueHeaders &&
            (event.isBase64Encoded || event.isBase64Encoded === false) &&
            (event.pathParameters || event.pathParameters === null) &&
            (event.queryStringParameters ||
                event.queryStringParameters === null) &&
            (event.multiValueQueryStringParameters ||
                event.multiValueQueryStringParameters === null) &&
            (event.stageVariables || event.stageVariables === null) &&
            event.requestContext,
    );
};
