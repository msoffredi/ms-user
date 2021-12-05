import dynamoose from 'dynamoose';
import { clearAllTables } from './dynamodb-utils';

jest.mock('@jmsoffredi/ms-common', () => {
    const originalModule = jest.requireActual('@jmsoffredi/ms-common');

    return {
        __esModule: true,
        ...originalModule,
        publisher: jest.fn(),
    };
});

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

    if (!process.env.DEBUG) {
        global.console.log = jest.fn();
        global.console.error = jest.fn();
    }
});

beforeEach(async () => {
    await clearAllTables(dynamoose.aws.ddb());
});
