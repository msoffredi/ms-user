import { AuthPermission, EventBusTypes } from '@jmsoffredi/ms-common';

export interface ConfigType {
    events: {
        eventBusType: EventBusTypes;
        inputEvents: {
            eventTypeLocation: string;
            eventDataLocation: string;
        };
    };
    userService: {
        users: {
            readUsers: AuthPermission;
            deleteUser: AuthPermission;
            createUser: AuthPermission;
        };
    };
}

export enum UsersModules {
    Users = 'users-api-users',
}

export enum UsersOperations {
    Read = 'read',
    Create = 'create',
    Delete = 'delete',
}
