import { EventBusTypes } from '@jmsoffredi/ms-common';

export interface ConfigType {
    events: {
        eventBusType: EventBusTypes;
        inputEvents: {
            eventTypeLocation: string;
            eventDataLocation: string;
        };
    };
}
