import { PaginatedCollection } from '@jmsoffredi/ms-common';
import { UserRecord } from './user';

export interface PaginatedUserCollection extends PaginatedCollection {
    data: UserRecord[];
}
