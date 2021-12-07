import { DatabaseError, ResponseBody } from '@jmsoffredi/ms-common';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { API, Endpoint } from '../types';
import {
    createModel,
    softDeleteFieldName,
    validatePkOnPath,
} from './common-api';
import { publishEvents } from './common-events';

export const deleteEntity = async (
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

        // Soft delete?
        if (
            apiConfig[apiEntityName].softDelete &&
            apiConfig[apiEntityName].softDelete === true
        ) {
            try {
                entity[softDeleteFieldName] = Date.now();
                await entity.save();
            } catch (err) {
                throw new DatabaseError(
                    `Could not delete (soft) user with id ${pk}`,
                );
            }
        } else {
            await entity.delete();
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (apiConfig[apiEntityName].api.delete!.entity.events) {
            await publishEvents(
                apiConfig[apiEntityName],
                entity,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                apiConfig[apiEntityName].api.delete!.entity.events!,
            );
        }
    } catch (err) {
        throw new DatabaseError(
            `Could not retrieve ${apiEntityName} with pk ${pk}`,
        );
    }

    return { deleted: pk };
};
