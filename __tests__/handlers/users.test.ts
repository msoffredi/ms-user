import { handler } from '../../src/handlers/user-api';
import { User, UserDoc } from '../../src/models/user';
import { constructAuthenticatedAPIGwEvent } from '../utils/helpers';
import { userPublisher } from '../../src/events/user-publisher';
import { Types } from '@jmsoffredi/ms-common';

const testUser = {
    id: 'user123',
    email: 'test@test.com',
};

const addUser = async (): Promise<UserDoc> => {
    return await User.create(testUser);
};

it('should return a 200 and array of users', async () => {
    await addUser();

    const getAllEvent = constructAuthenticatedAPIGwEvent(
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

    const postRoleEvent = constructAuthenticatedAPIGwEvent(payload, {
        method: 'POST',
        resource: '/v0/users',
    });
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).id).toEqual(payload.id);
    expect(userPublisher).toHaveBeenCalledWith({
        type: Types.UserCreated,
        data: {
            id: payload.id,
            email: payload.email,
        },
    });
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAuthenticatedAPIGwEvent(
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
    await addUser();

    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: testUser.id },
        },
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toMatchObject({
        id: testUser.id,
        email: testUser.email,
    });
});

it('throws a 422 error if the id provided to retrieve a user is not found', async () => {
    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const getResult = await handler(getEvent);
    expect(getResult.statusCode).toEqual(422);
});

it('throws an error if we do not provide a user id on get', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('deletes a user when calling endpoint with id and DELETE method', async () => {
    await addUser();

    const result = await User.get(testUser.id);
    expect(result).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
            pathParameters: { id: testUser.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const result2 = await User.get(testUser.id);
    expect(result2).toBeUndefined();

    expect(userPublisher).toHaveBeenCalledWith({
        type: Types.UserDeleted,
        data: {
            userId: testUser.id,
        },
    });
});

it('throws an error if we do not provide an user id on delete', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws a 422 error if the id provided to delete a user is not found', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});
