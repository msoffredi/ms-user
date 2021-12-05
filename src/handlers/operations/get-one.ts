import {
    DatabaseError,
    ResponseBody,
    Serializers,
} from '@jmsoffredi/ms-common';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { API, Endpoint } from '../types';
import { createModel, validatePkOnPath } from './common-api';

export const getEntity = async (
    apiConfig: API,
    event: APIGatewayProxyEvent,
    endpoint: Endpoint,
): Promise<ResponseBody> => {
    const { apiEntityName, pkName } = endpoint;

    // Check if entity id was provided in the path/url
    validatePkOnPath(event, pkName);

    const entityModel = createModel(apiConfig, apiEntityName);
    // @todo the pk has to be passed by in the expected type (not always string)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pk = String(event.pathParameters![pkName]);

    // Get entity from DB table
    try {
        const entity = await entityModel.get(pk);

        return new entityModel(
            await entity.serialize(Serializers.RemoveTimestamps),
        );
    } catch (err) {
        throw new DatabaseError(
            `Could not retrieve ${apiEntityName} with pk ${pk}`,
        );
    }
};
