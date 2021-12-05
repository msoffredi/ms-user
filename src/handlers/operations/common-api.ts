import dynamoose from 'dynamoose';
import {
    ErrorEntry,
    modelOptions,
    RequestValidationError,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import { API, APIEntity, SchemaSettings } from '../types';
import { ModelType, ObjectType } from 'dynamoose/dist/General';
import { AnyDocument } from 'dynamoose/dist/Document';
import { SchemaDefinition } from 'dynamoose/dist/Schema';
import { APIGatewayProxyEvent } from 'aws-lambda';

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

export const validateRequiredParameters = (
    event: APIGatewayProxyEvent,
    schema: SchemaDefinition,
): ErrorEntry[] => {
    const body = event.body ? JSON.parse(event.body) : null;
    const errors: ErrorEntry[] = [];

    for (const propertyName in schema) {
        if (typeof schema[propertyName] === 'object') {
            const prop = JSON.parse(JSON.stringify(schema[propertyName]));

            if (prop.required) {
                if (
                    typeof body !== 'object' ||
                    !body ||
                    !(propertyName in body)
                ) {
                    errors.push({
                        message: `${propertyName} is required and was not provided in body`,
                        field: propertyName,
                    });
                }
                // @todo it could use some customizable value validation
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
