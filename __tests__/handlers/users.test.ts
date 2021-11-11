import { handler } from '../../src/handlers/user-ms-handler';
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
