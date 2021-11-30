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

    const body = JSON.parse(result.body);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.length).toEqual(body.count);
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

it('throws an error if trying to add a user with existing email', async () => {
    const payload = {
        email: 'newuser@test.com',
    };

    const postRoleEvent = constructAuthenticatedAPIGwEvent(payload, {
        method: 'POST',
        resource: '/v0/users',
    });
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);

    const result2 = await handler(postRoleEvent);
    expect(result2.statusCode).toEqual(400);
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
    const user = await User.get(testUser.id);
    expect(user).toBeDefined();
    expect(user.deletedAt).toBeUndefined();

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

    const user2 = await User.get(testUser.id);
    expect(user2.deletedAt).toBeDefined();
    expect(new Date(Number(user2.deletedAt)).getDate()).toEqual(
        new Date().getDate(),
    );

    expect(userPublisher).toHaveBeenCalledWith({
        type: Types.UserDeleted,
        data: {
            id: testUser.id,
            email: testUser.email,
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

it('should not return a soft deleted user by default', async () => {
    const user = await User.create({ id: '1', email: 'test1@test.com' });
    await User.create({ id: '2', email: 'test2@test.com' });
    await User.create({ id: '3', email: 'test3@test.com' });

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/users' },
    );

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).data.length).toEqual(3);

    user.deletedAt = Date.now();
    await user.save();
    const result2 = await handler(getAllEvent);
    expect(result2.statusCode).toEqual(200);
    expect(JSON.parse(result2.body).data.length).toEqual(2);
});
