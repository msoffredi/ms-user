import { constructAPIGwEvent } from '../utils/helpers';
import { handler } from '../../src/handlers/user-ms-handler';
import { ServiceStatus } from '../../src/handlers/types';

// This includes all tests for auth.handler()
it('should return a 200 and a valid status as healthy on GET over healthcheck endpoint', async () => {
    const event = constructAPIGwEvent(
        {},
        { method: 'GET', resource: '/healthcheck' },
    );
    const result = await handler(event);

    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify({ serviceStatus: ServiceStatus.Healthy }),
    };
    expect(result).toEqual(expectedResult);
});
