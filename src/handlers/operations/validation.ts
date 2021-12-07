import { DatabaseError } from '@jmsoffredi/ms-common';
import { ValueType } from 'dynamoose/dist/Schema';
import { API } from '../types';
import { createModel } from './common-api';

export const unique = async (
    attrName: string,
    value: ValueType,
    apiConfig: API,
    apiEntityName: string,
): Promise<boolean> => {
    const entityModel = createModel(apiConfig, apiEntityName);

    try {
        const scanResult = await entityModel
            .scan()
            .where(attrName)
            .eq(value)
            .exec();
        if (scanResult && scanResult.length) {
            return false;
        }

        return true;
    } catch (err) {
        throw new DatabaseError(
            `Could not validate ${attrName} as unique with value ${value}`,
        );
    }
};
