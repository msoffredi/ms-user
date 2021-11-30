import { handler } from '../../src/handlers/user-api';
import { User, UserDoc } from '../../src/models/user';
import { constructAuthenticatedAPIGwEvent } from '../utils/helpers';

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

it('should return a soft deleted user if includeDeleted path param provided', async () => {
    const user = await User.create({ id: '1', email: 'test1@test.com' });
    await User.create({ id: '2', email: 'test2@test.com' });
    await User.create({ id: '3', email: 'test3@test.com' });

    user.deletedAt = Date.now();
    await user.save();

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users',
            pathParameters: {
                includeDeleted: 1,
            },
        },
    );

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).data.length).toEqual(3);
});

it('should paginate if number of users to return exceeds the response limit', async () => {
    const scanLimit = 5;
    const totalUsers = 10;

    // Add 10 users to the DB
    for (let x = 1; x <= totalUsers; x++) {
        await User.create({ id: x.toString(), email: `test${x}@test.com` });
    }

    const get5Event = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users',
            pathParameters: {
                scanLimit,
            },
        },
    );

    const result = await handler(get5Event);
    expect(result.statusCode).toEqual(200);
    const body = JSON.parse(result.body);
    expect(body.data.length).toEqual(scanLimit);
    expect(body.lastKey).toBeDefined();

    const getRestEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users',
            pathParameters: {
                lastKey: body.lastKey,
            },
        },
    );

    const result2 = await handler(getRestEvent);
    expect(result2.statusCode).toEqual(200);
    expect(JSON.parse(result.body).data.length).toEqual(totalUsers - scanLimit);
});
