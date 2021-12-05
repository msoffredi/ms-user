import { Serializers } from '@jmsoffredi/ms-common';
import { SchemaDefinition, TimestampObject } from 'dynamoose/dist/Schema';

export interface SchemaSettings {
    timestamps?: boolean | TimestampObject;
    saveUnknown?: boolean | string[];
}

export interface Endpoint {
    resource: string;
    method: string;
    apiEntityName: string;
    collection?: boolean;
    pkName: string;
}

export interface EventDefinition {
    type: string;
    dataProperties: string[];
}

interface OperationDefinition {
    events?: EventDefinition[];
}

export interface APIDefinition {
    get: {
        collection?: boolean;
        entity?: boolean;
    };
    delete: {
        entity: OperationDefinition;
    };
    post: {
        collection: OperationDefinition;
    };
}

export interface APIEntity {
    schema: SchemaDefinition;
    api: APIDefinition;
    timestamps?: boolean | TimestampObject;
    saveUnknown?: boolean | string[];
    dbName?: string;
    serializers?: Serializers[];
    path?: string;
    softDelete?: boolean;
    eventSource?: string;
}

export interface API {
    [apiName: string]: APIEntity;
}
