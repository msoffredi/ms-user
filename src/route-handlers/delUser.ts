import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { User } from '../models/user';
import { RouteHandler } from './types';

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
