import { handler } from '../../src/handlers/user-api';
import { User, UserDoc } from '../../src/models/user';
import {
    constructAuthenticatedAPIGwEvent,
    testUserEmail,
} from '../utils/helpers';

const testUser = {
    id: 'user123',
    email: 'test@test.com',
};

const addUser = async (): Promise<UserDoc> => {
    return await User.create(testUser);
};

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
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
        id: testUser.id,
        email: testUser.email,
    });
    expect(body.deletedAt).toBeUndefined();
});

it('should return deleted date if a soft deleted user', async () => {
    const user = await addUser();
    user.deletedAt = Date.now();
    await user.save();

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
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
        id: testUser.id,
        email: testUser.email,
    });
    expect(body.deletedAt).toBeDefined();
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

it('throws a 401 error if the authenticated user does not have the right permission', async () => {
    await addUser();
    const user = await User.get(testUser.id);
    expect(user).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: testUser.id },
        },
        'test2@test.com',
        [['wrong-module', 'wrong-operation']],
        'another-user',
    );
    const result = await handler(deleteEvent);
    expect(result.statusCode).toEqual(401);
});

it('gets a user if the authenticated user have the right permission', async () => {
    await addUser();
    const user = await User.get(testUser.id);
    expect(user).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: testUser.id },
        },
        testUserEmail,
        [['users-api-users', 'read']],
    );
    const result = await handler(deleteEvent);
    expect(result.statusCode).toEqual(200);
});

it('gets a user if getting their own user', async () => {
    await addUser();
    const user = await User.get(testUser.id);
    expect(user).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: testUser.id },
        },
        testUser.email,
        [],
        testUser.id,
    );
    const result = await handler(deleteEvent);
    expect(result.statusCode).toEqual(200);
});
