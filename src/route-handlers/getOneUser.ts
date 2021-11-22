import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    DatabaseError,
    RequestValidationError,
    RouteHandler,
} from '@jmsoffredi/ms-common';
import { User, UserDoc } from '../models/user';
import { Serializers } from '../models/_common';

export const getOneUserHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<UserDoc> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new RequestValidationError([
            {
                message: 'User id missing in URL or invalid',
                field: 'id',
            },
        ]);
    }

    const { id } = event.pathParameters;

    const user = await User.get(id);

    if (!user) {
        throw new DatabaseError(`Could not retrieve user with id: ${id}`);
    }

    return new User(await user.serialize(Serializers.RemoveTimestamps));
};
