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
