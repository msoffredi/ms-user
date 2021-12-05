import {
    BaseEventDataType,
    eventBuses,
    EventError,
    publisher,
} from '@jmsoffredi/ms-common';
import { AnyDocument } from 'dynamoose/dist/Document';
import { Config } from '../../config';
import { APIEntity, EventDefinition } from '../types';

export const publishEvents = async (
    apiEntity: APIEntity,
    entity: AnyDocument,
    events: EventDefinition[],
): Promise<void> => {
    if (events) {
        for (const event of events) {
            const data: { [key: string]: unknown } = {};

            for (const propName in entity) {
                if (event.dataProperties.includes(propName)) {
                    data[propName] = entity[propName];
                }
            }

            await eventPublisher(apiEntity, {
                type: event.type,
                data,
            });
        }
    }
};

const eventPublisher = async (
    apiEntity: APIEntity,
    data: BaseEventDataType,
    detailType = '',
): Promise<void> => {
    if (!apiEntity.eventSource) {
        throw new EventError('Event source not defined');
    }

    await publisher(
        data,
        detailType || data.type,
        Config.events.eventBusType,
        eventBuses[Config.events.eventBusType].busName,
        apiEntity.eventSource,
    );
};
