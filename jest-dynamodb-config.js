// eslint-disable-next-line no-undef
module.exports = {
    tables: [
        {
            TableName: 'ms-user',
            KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'email', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
    ],
    port: 8001,
};
