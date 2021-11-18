import { handler } from '../../src/handlers/user-api';
import { User, UserDoc } from '../../src/models/user';
import { constructAPIGwEvent } from '../utils/helpers';

const addUser = async (): Promise<UserDoc> => {
    return await User.create({
        email: 'test@test.com',
        id: 'user123',
    });
};

it('should return a 200 and array of users', async () => {
    await addUser();

    const getAllEvent = constructAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/users' },
    );

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toBeInstanceOf(Array);
    expect(JSON.parse(result.body).length).toBeGreaterThan(0);
});

it('returns 200 and adds a new user on proper POST call', async () => {
    const payload = {
        email: 'newuser@test.com',
        id: 'user123',
    };

    const postRoleEvent = constructAPIGwEvent(payload, {
        method: 'POST',
        resource: '/v0/users',
    });
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).id).toEqual(payload.id);
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAPIGwEvent(
        {},
        {
            method: 'POST',
            resource: '/v0/users',
        },
    );

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(400);
});

it('should return a 200 and a user on GET with id', async () => {
    const user = await addUser();

    const getEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{email}',
            pathParameters: { email: user.email },
        },
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toMatchObject({
        email: user.email,
        id: user.id,
    });
});

it('throws a 422 error if the id provided to retrieve a user is not found', async () => {
    const getEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{email}',
            pathParameters: { email: 'wrong-email' },
        },
    );
    const getResult = await handler(getEvent);
    expect(getResult.statusCode).toEqual(422);
});

it('throws an error if we do not provide a user id on get', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{email}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('deletes a user when calling endpoint with id and DELETE method', async () => {
    const user = await addUser();

    const result = await User.get(user.email);
    expect(result).toBeDefined();

    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{email}',
            pathParameters: { email: user.email },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const result2 = await User.get(user.email);
    expect(result2).toBeUndefined();

    // expect(publisher).toHaveBeenCalledWith(
    //     AuthEventDetailTypes.AuthUserDeleted,
    //     {
    //         userId: user.id,
    //     },
    // );
});

it('throws an error if we do not provide an user id on delete', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{email}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws a 422 error if the id provided to delete a user is not found', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{email}',
            pathParameters: { email: 'wrong-email' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});
