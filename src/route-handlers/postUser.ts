import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { RequestValidationError } from '../errors/request-validation-error';
import { User, UserDoc } from '../models/user';
import { Serializers } from '../models/_common';
import { RouteHandler } from './types';

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
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    const id = request.id || randomUUID();

    const newUser = await User.create({
        email: request.email,
        id,
    });

    return new User(await newUser.serialize(Serializers.RemoveTimestamps));
};
