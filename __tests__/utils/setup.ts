import dynamoose from 'dynamoose';
import { clearAllTables } from './dynamodb-utils';

jest.mock('../../src/events/event-publisher');

/**
 * jest won't work in watchAll mode because of a known BUG.
 * Waiting for new @shelfio/jest-dynamodb release (currently using v2.1.0)
 */
beforeAll(async () => {
    dynamoose.aws.sdk.config.update({
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey',
        region: 'local-env',
        sslEnabled: false,
    });

    dynamoose.aws.ddb.local('http://localhost:8001');
});

beforeEach(async () => {
    await clearAllTables(dynamoose.aws.ddb());
});
