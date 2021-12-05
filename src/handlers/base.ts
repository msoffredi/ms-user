import {
    BadRequestError,
    CustomError,
    ResponseBody,
} from '@jmsoffredi/ms-common';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createEntity } from './operations/add-one';
import { deleteEntity } from './operations/delete-one';
import { getCollection } from './operations/get-collection';
import { getEntity } from './operations/get-one';
import { API, APIDefinition, APIEntity, Endpoint } from './types';

export const APIHandler = async (
    apiConfig: API,
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    let status = 200;
    let body: ResponseBody = null;
    const { resource, httpMethod } = event;

    try {
        const endpoints = allowedEndpoints(apiConfig).filter((endpoint) => {
            return (
                resource === endpoint.resource &&
                httpMethod.toLowerCase() === endpoint.method
            );
        });

        if (endpoints.length === 1) {
            switch (httpMethod) {
                case 'GET':
                    if (endpoints[0].collection) {
                        body = await getCollection(
                            apiConfig,
                            event,
                            endpoints[0],
                        );
                    } else {
                        body = await getEntity(apiConfig, event, endpoints[0]);
                    }

                    break;

                case 'DELETE':
                    body = await deleteEntity(apiConfig, event, endpoints[0]);
                    break;

                case 'POST':
                    body = await createEntity(apiConfig, event, endpoints[0]);
                    break;
            }
        } else {
            throw new BadRequestError();
        }
    } catch (err) {
        console.error(err);
        console.debug(err);

        if (err instanceof CustomError) {
            status = err.statusCode;
            body = err.serializeErrors();
        }
    }

    return {
        statusCode: status,
        body: JSON.stringify(body),
    };
};

const allowedEndpoints = (apiConfig: API): Endpoint[] => {
    const endpoints: Endpoint[] = [];

    for (const apiName in apiConfig) {
        const pkName = getAPIPkName(apiConfig[apiName]);
        let path = `/${apiName}`;

        if ('path' in apiConfig[apiName]) {
            path = String(apiConfig[apiName].path);
        }

        for (const methodName in apiConfig[apiName].api) {
            const method = JSON.parse(
                JSON.stringify(
                    apiConfig[apiName].api[methodName as keyof APIDefinition],
                ),
            );

            const endpointTemplate = {
                method: methodName,
                apiEntityName: apiName,
                pkName: pkName,
            };

            if (method.collection) {
                endpoints.push({
                    ...endpointTemplate,
                    resource: `${path}`,
                    collection: true,
                });
            }

            if (method.entity) {
                endpoints.push({
                    ...endpointTemplate,
                    resource: `${path}/{${pkName}}`,
                });
            }
        }
    }

    return endpoints;
};

const getAPIPkName = (api: APIEntity): string => {
    for (const propName in api.schema) {
        const prop = JSON.parse(JSON.stringify(api.schema[propName]));

        if (prop.hashKey === true) {
            return propName;
        }
    }

    throw new Error(`No hashKey available in the API entity`);
};
