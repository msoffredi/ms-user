import { handler } from '../../src/handlers/user-api';
import { constructAuthenticatedAPIGwEvent } from '../utils/helpers';
import { userPublisher } from '../../src/events/user-publisher';
import { Types } from '@jmsoffredi/ms-common';

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
