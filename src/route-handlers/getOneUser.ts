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

    if (!user) {
        throw new DatabaseError(`Could not retrieve user with email: ${email}`);
    }

    return new User(await user.serialize(Serializers.RemoveTimestamps));
};
