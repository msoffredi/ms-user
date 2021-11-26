import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    DatabaseError,
    RequestValidationError,
    DeleteRecordResponseBody,
    RouteHandler,
    Types,
} from '@jmsoffredi/ms-common';
import { User } from '../models/user';
import { userPublisher } from '../events/user-publisher';

export const delUserHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<DeleteRecordResponseBody> => {
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

    if (user) {
        await User.delete(id);
    } else {
        throw new DatabaseError(`Could not delete user with id: ${id}`);
    }

    // Publish user.deleted event
    await userPublisher({
        type: Types.UserDeleted,
        data: {
            id,
            email: user.email,
        },
    });

    return {
        deleted: id,
    };
};
