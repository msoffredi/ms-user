import { EventBusTypes } from '@jmsoffredi/ms-common';
import { ConfigType, UsersModules, UsersOperations } from './types';

export const Config: ConfigType = {
    events: {
        eventBusType: EventBusTypes.AWSEventBridge,
        inputEvents: {
            eventTypeLocation: 'detail.type',
            eventDataLocation: 'detail.data',
        },
    },
    userService: {
        users: {
            readUsers: {
                moduleId: UsersModules.Users,
                operationId: UsersOperations.Read,
            },
            createUser: {
                moduleId: UsersModules.Users,
                operationId: UsersOperations.Create,
            },
            deleteUser: {
                moduleId: UsersModules.Users,
                operationId: UsersOperations.Delete,
            },
        },
    },
};
