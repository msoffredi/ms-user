import { handler } from '../../src/handlers/user-api';
import {
    constructAuthenticatedAPIGwEvent,
    testUserEmail,
} from '../utils/helpers';
import {
    Types,
    publisher,
    events,
    eventBuses,
    EventSources,
} from '@jmsoffredi/ms-common';
import { Config } from '../../src/config';

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
    expect(publisher).toHaveBeenCalledWith(
        {
            type: Types.UserCreated,
            data: {
                id: payload.id,
                email: payload.email,
            },
        },
        events.UserCreated.type,
        Config.events.eventBusType,
        eventBuses[Config.events.eventBusType].busName,
        EventSources.Users,
    );
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

it('gets a 401 id requesting user does not have enough permissions', async () => {
    const payload = {
        email: 'newuser@test.com',
        id: 'user123',
    };

    const postRoleEvent = constructAuthenticatedAPIGwEvent(
        payload,
        {
            method: 'POST',
            resource: '/v0/users',
        },
        testUserEmail,
        [['wrong-module', 'wrong-operation']],
    );
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(401);
});

it('adds user if request done with enough permissions', async () => {
    const payload = {
        email: 'newuser@test.com',
        id: 'user123',
    };

    const postRoleEvent = constructAuthenticatedAPIGwEvent(
        payload,
        {
            method: 'POST',
            resource: '/v0/users',
        },
        testUserEmail,
        [['users-api-users', 'create']],
    );
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).id).toEqual(payload.id);
});
