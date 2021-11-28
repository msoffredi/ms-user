import { User, UserDoc } from '../models/user';
import { RouteHandler, Serializers } from '@jmsoffredi/ms-common';

export const getUsersHandler: RouteHandler = async (): Promise<UserDoc[]> => {
    // @todo we may not be able to always return all users (we need pagination on this route)
    const users = await User.scan().all().exec();

    const serializedUsers = User.serializeMany(
        users,
        Serializers.RemoveTimestamps,
    );

    return serializedUsers;
};
