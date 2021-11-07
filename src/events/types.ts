import { EventBridgeEvent } from 'aws-lambda';
import { ResponseBody } from '../handlers/types';

export enum AuthEventsDetailTypes {
    UserDeleted = 'User Deleted',
}

export enum AuthEventDetailTypes {
    UserDeleted = 'user.deleted',
    AuthUserDeleted = 'authorization.user.deleted',
}

export interface AuthEventDetail {
    type: AuthEventDetailTypes;
    data: {
        userId?: string;
    };
}

export type EventHandler = (
    event: EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
) => Promise<ResponseBody>;
