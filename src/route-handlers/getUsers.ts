import { User, UserRecord } from '../models/user';
import { RouteHandler } from '@jmsoffredi/ms-common';
import { PaginatedUserCollection } from '../models/types';

export const getUsersHandler: RouteHandler =
    async (): Promise<PaginatedUserCollection> => {
        // @todo we may not be able to always return all users (we need pagination on this route)

        const users = await User.scan()
            .where('deletedAt')
            .not()
            .exists()
            .exec();

        const formattedUsers = users.map((user): UserRecord => {
            return {
                id: user.id,
                email: user.email,
            };
        });

        const response: PaginatedUserCollection = {
            data: formattedUsers,
            count: users.count | 0,
        };

        if (users.lastKey) {
            response.lastKey = users.lastKey;
        }

        console.debug(response);
        return response;
    };
