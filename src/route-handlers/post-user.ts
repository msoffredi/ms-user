import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import {
    DatabaseError,
    RequestValidationError,
    RouteHandler,
    Serializers,
    Types,
} from '@jmsoffredi/ms-common';
import { User, UserDoc } from '../models/user';
import { userPublisher } from '../events/user-publisher';

export const postUserHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<UserDoc> => {
    const errors = [];

    if (!event.body) {
        throw new RequestValidationError([
            {
                message: 'You need to provide a user email to add a new user',
            },
        ]);
    }

    const request = JSON.parse(event.body);

    if (!request.email || request.email.trim() === '') {
        errors.push({
            message: 'User email is missing in provided body',
            field: 'email',
        });
    } else {
        const users = await User.scan().where('email').eq(request.email).exec();

        if (users.length) {
            errors.push({
                message: 'User email already exists.',
                field: 'email',
            });
        }
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    const id = request.id || randomUUID();

    const newUser = await User.create({
        email: request.email,
        id,
    });

    if (newUser) {
        // Publish user.created event
        await userPublisher({
            type: Types.UserCreated,
            data: {
                id: newUser.id,
                email: newUser.email,
            },
        });
    } else {
        throw new DatabaseError(
            `Could not create user with email ${request.email}`,
        );
    }

    return new User(await newUser.serialize(Serializers.RemoveTimestamps));
};
