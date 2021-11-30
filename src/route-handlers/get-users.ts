import dynamoose from 'dynamoose';
import { User, UserDoc, UserRecord } from '../models/user';
import { RouteHandler } from '@jmsoffredi/ms-common';
import { PaginatedUserCollection } from '../models/types';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Scan, ScanResponse } from 'dynamoose/dist/DocumentRetriever';

export const getUsersHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<PaginatedUserCollection> => {
    let filter = new dynamoose.Condition();

    if (!event.pathParameters || !event.pathParameters.includeDeleted) {
        filter = filter.where('deletedAt').not().exists();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scan: Scan<UserDoc> | any = User.scan(filter);

    if (event.pathParameters && event.pathParameters.lastKey) {
        scan = scan.startAt({ id: String(event.pathParameters.lastKey) });
    }

    if (event.pathParameters && event.pathParameters.scanLimit) {
        scan = scan.limit(Number(event.pathParameters.scanLimit));
    }

    const scanResponse = (await scan.exec()) as ScanResponse<UserDoc>;

    const users = scanResponse.map((user): UserRecord => {
        return {
            id: user.id,
            email: user.email,
        };
    });

    const response: PaginatedUserCollection = {
        data: users,
        count: users.length,
    };

    if (scanResponse.lastKey && scanResponse.lastKey.id) {
        response.lastKey = String(scanResponse.lastKey.id);
    }

    return response;
};
