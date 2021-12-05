import dynamoose from 'dynamoose';
import { PaginatedCollection, ResponseBody } from '@jmsoffredi/ms-common';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { API, Endpoint } from '../types';
import { createModel, extractRecord, softDeleteFieldName } from './common-api';
import { Scan, ScanResponse } from 'dynamoose/dist/DocumentRetriever';
import { AnyDocument } from 'dynamoose/dist/Document';

export const getCollection = async (
    apiConfig: API,
    event: APIGatewayProxyEvent,
    endpoint: Endpoint,
): Promise<ResponseBody> => {
    const { apiEntityName, pkName } = endpoint;

    let filter = new dynamoose.Condition();

    if (
        apiConfig[apiEntityName].softDelete &&
        apiConfig[apiEntityName].softDelete === true
    ) {
        if (!event.pathParameters || !event.pathParameters.includeDeleted) {
            filter = filter.where(softDeleteFieldName).not().exists();
        }
    }

    const entityModel = createModel(apiConfig, apiEntityName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scan: Scan<AnyDocument> | any = entityModel.scan(filter);

    if (event.pathParameters && event.pathParameters.lastKey) {
        scan = scan.startAt({
            [pkName]: String(event.pathParameters.lastKey),
        });
    }

    if (event.pathParameters && event.pathParameters.scanLimit) {
        scan = scan.limit(Number(event.pathParameters.scanLimit));
    }

    const scanResponse = (await scan.exec()) as ScanResponse<AnyDocument>;

    const collection = scanResponse.map((entity) => {
        return extractRecord(
            entity,
            apiConfig[apiEntityName].schema,
            Boolean(apiConfig[apiEntityName].softDelete),
        );
    });

    const response: PaginatedCollection = {
        data: collection,
        count: collection.length,
    };

    if (scanResponse.lastKey && scanResponse.lastKey[pkName]) {
        response.lastKey = String(scanResponse.lastKey[pkName]);
    }

    return response;
};
