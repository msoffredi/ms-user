import dynamoose from 'dynamoose';
import {
    ErrorEntry,
    modelOptions,
    RequestValidationError,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import { API, APIEntity, SchemaSettings, ValidationType } from '../types';
import { ModelType, ObjectType } from 'dynamoose/dist/General';
import { AnyDocument } from 'dynamoose/dist/Document';
import { SchemaDefinition } from 'dynamoose/dist/Schema';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { unique } from './validation';

export const createModel = (
    apiConfig: API,
    apiEntityName: string,
): ModelType<AnyDocument> => {
    const dbTableName = apiConfig[apiEntityName].dbName ?? apiEntityName;
    const schemaSettings: SchemaSettings = {};

    if (apiConfig[apiEntityName].timestamps) {
        schemaSettings.timestamps = apiConfig[apiEntityName].timestamps;
    }

    if (apiConfig[apiEntityName].saveUnknown) {
        schemaSettings.saveUnknown = apiConfig[apiEntityName].saveUnknown;
    }

    const schemaDef = getSchema(apiConfig[apiEntityName]);

    const entityModel = dynamoose.model(
        dbTableName,
        new dynamoose.Schema(schemaDef, schemaSettings),
        modelOptions,
    );

    entityModel.serializer.add(
        Serializers.RemoveTimestamps,
        SerializersOptions[Serializers.RemoveTimestamps],
    );

    return entityModel;
};

export const softDeleteFieldName = 'deletedAt';

const getSchema = (apiEntity: APIEntity): SchemaDefinition => {
    const baseSchema = { ...apiEntity.schema };

    if (apiEntity.softDelete && !baseSchema[softDeleteFieldName]) {
        baseSchema[softDeleteFieldName] = Date;
    }

    return baseSchema;
};

export const validatePkOnPath = (
    event: APIGatewayProxyEvent,
    pkName: string,
): void => {
    if (!event.pathParameters || !event.pathParameters[pkName]) {
        throw new RequestValidationError([
            {
                message: 'User id missing in URL or invalid',
                field: 'id',
            },
        ]);
    }
};

export const validateRequiredParameters = async (
    event: APIGatewayProxyEvent,
    apiConfig: API,
    apiEntityName: string,
): Promise<ErrorEntry[]> => {
    const schema = apiConfig[apiEntityName].schema;
    const body = event.body ? JSON.parse(event.body) : null;
    const errors: ErrorEntry[] = [];

    for (const propertyName in schema) {
        if (typeof schema[propertyName] === 'object') {
            const prop = JSON.parse(JSON.stringify(schema[propertyName]));

            if (prop.required) {
                const apiEntity = apiConfig[apiEntityName];

                if (
                    typeof body !== 'object' ||
                    !body ||
                    !(propertyName in body)
                ) {
                    errors.push({
                        message: `${propertyName} is required and was not provided in body`,
                        field: propertyName,
                    });
                } else if (
                    apiEntity.validations &&
                    propertyName in apiEntity.validations
                ) {
                    let vals: ValidationType[] = [];

                    if (Array.isArray(apiEntity.validations[propertyName])) {
                        vals = apiEntity.validations[
                            propertyName
                        ] as ValidationType[];
                    } else {
                        vals.push(
                            apiEntity.validations[
                                propertyName
                            ] as ValidationType,
                        );
                    }

                    for (const val of vals) {
                        if (val === ValidationType.Unique) {
                            if (
                                !(await unique(
                                    propertyName,
                                    body[propertyName],
                                    apiConfig,
                                    apiEntityName,
                                ))
                            ) {
                                errors.push({
                                    message: `${propertyName} is required and was not provided in body`,
                                    field: propertyName,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    return errors;
};

export const extractRecord = (
    entity: AnyDocument,
    schema: SchemaDefinition,
    softDelete: boolean,
): ObjectType => {
    const record: ObjectType = {};

    for (const propertyName in schema) {
        if (entity[propertyName]) {
            record[propertyName] = entity[propertyName];
        }
    }

    if (softDelete && entity[softDeleteFieldName]) {
        record[softDeleteFieldName] = entity[softDeleteFieldName];
    }

    return record;
};
