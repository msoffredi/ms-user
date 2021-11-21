import { Config } from '../config';
import {
    eventBuses,
    EventData,
    EventSources,
    publisher,
} from '@jmsoffredi/ms-common';

export const userPublisher = async (
    type: string,
    data: EventData,
    detailType = '',
    eventBusType = Config.events.eventBusType,
): Promise<void> => {
    await publisher(
        type,
        data,
        detailType || type,
        eventBusType,
        eventBuses[Config.events.eventBusType].busName,
        EventSources.Users,
    );
};
