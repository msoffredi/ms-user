import { Config } from '../config';
import {
    eventBuses,
    EventSources,
    publisher,
    UserCreatedEventDataType,
    UserDeletedEventDataType,
} from '@jmsoffredi/ms-common';

export const userPublisher = async (
    data: UserCreatedEventDataType | UserDeletedEventDataType,
    detailType = '',
): Promise<void> => {
    await publisher(
        data,
        detailType || data.type,
        Config.events.eventBusType,
        eventBuses[Config.events.eventBusType].busName,
        EventSources.Users,
    );
};
