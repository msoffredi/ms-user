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
): Promise<void> => {
    await publisher(
        type,
        data,
        detailType || type,
        Config.events.eventBusType,
        eventBuses[Config.events.eventBusType].busName,
        EventSources.Users,
    );
};
