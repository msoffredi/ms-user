import { APIGatewayProxyEvent } from 'aws-lambda';

export const testUserEmail = 'test@test.com';
export const readUsersPermissionId = 'authorization-api-read-users';

export function constructAPIGwEvent(
    message: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any> = {},
): APIGatewayProxyEvent {
    return {
        httpMethod: options.method || 'GET',
        path: options.path || '/',
        queryStringParameters: options.query || {},
        headers: options.headers || {},
        body: options.rawBody || JSON.stringify(message),
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        isBase64Encoded: false,
        pathParameters: options.pathParameters || {},
        stageVariables: options.stageVariables || {},
        requestContext: options.requestContext || {},
        resource: options.resource || '',
    };
}

// export const constructAuthenticatedAPIGwEvent = (
//     message: unknown,
//     options: Record<string, unknown>,
//     userEmail = testUserEmail,
// ): APIGatewayProxyEvent => {
//     const token = jwt.sign(
//         {
//             email: userEmail,
//         },
//         'test',
//     );

//     const event = constructAPIGwEvent(message, options);

//     event.headers = {
//         ...event.headers,
//         Authorization: `Bearer ${token}`,
//     };

//     return event;
// };

// /**
//  * detail format: { type: 'user.deleted', userId: 'test@test.com' }
//  *
//  * @param detailType
//  * @param detail
//  * @returns
//  */
// export const constructEventBridgeEvent = (
//     detailType: AuthEventsDetailTypes,
//     detail: AuthEventDetail,
// ): EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail> => {
//     return {
//         version: '0',
//         id: '123456',
//         'detail-type': detailType,
//         source: 'test.users',
//         account: '123456789',
//         time: new Date().toISOString(),
//         region: 'us-east-1',
//         resources: [],
//         detail: detail,
//     };
// };
