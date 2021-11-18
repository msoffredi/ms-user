import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    DatabaseError,
    RequestValidationError,
    DeleteRecordResponseBody,
    RouteHandler,
} from '@jmsoffredi/ms-common';
import { User } from '../models/user';

export const delUserHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<DeleteRecordResponseBody> => {
    if (!event.pathParameters || !event.pathParameters.email) {
        throw new RequestValidationError([
            {
                message: 'Email missing in URL or invalid',
                field: 'email',
            },
        ]);
    }

    const { email } = event.pathParameters;

    const user = await User.get(email);

    if (user) {
        await User.delete(email);
    } else {
        throw new DatabaseError(`Could not delete user with email: ${email}`);
    }

    // Publish authorization.user.deleted event
    // await publisher(AuthEventDetailTypes.AuthUserDeleted, {
    //     userId: id,
    // });

    return {
        deleted: email,
    };
};
