import { EventBusTypes } from '@jmsoffredi/ms-common';
import { ConfigType } from './types';

export const Config: ConfigType = {
    events: {
        eventBusType: EventBusTypes.AWSEventBridge,
        inputEvents: {
            eventTypeLocation: 'detail.type',
            eventDataLocation: 'detail.data',
        },
    },
};
