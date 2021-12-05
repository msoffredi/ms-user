import {
    DatabaseError,
    RequestValidationError,
    ResponseBody,
    Serializers,
} from '@jmsoffredi/ms-common';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { API, Endpoint } from '../types';
import { createModel, validateRequiredParameters } from './common-api';
import { publishEvents } from './common-events';

export const createEntity = async (
    apiConfig: API,
    event: APIGatewayProxyEvent,
    endpoint: Endpoint,
): Promise<ResponseBody> => {
    const { apiEntityName, pkName } = endpoint;
    const errors = validateRequiredParameters(
        event,
        apiConfig[apiEntityName].schema,
    );

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const body = JSON.parse(event.body!);

    try {
        const entityModel = createModel(apiConfig, apiEntityName);
        const newRecord = { ...body };

        if (!(pkName in newRecord)) {
            // @todo the schema could be using a non-string pk
            newRecord[pkName] = newRecord[pkName] || randomUUID();
        }

        const newEntity = await entityModel.create(newRecord);

        if (apiConfig[apiEntityName].api.post.collection.events) {
            await publishEvents(
                apiConfig[apiEntityName],
                newEntity,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                apiConfig[apiEntityName].api.post.collection.events!,
            );
        }

        return new entityModel(
            await newEntity.serialize(Serializers.RemoveTimestamps),
        );
    } catch (err) {
        throw new DatabaseError(`Could not create new ${apiEntityName}`);
    }
};
