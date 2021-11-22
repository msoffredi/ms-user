// eslint-disable-next-line no-undef
module.exports = {
    tables: [
        {
            TableName: 'ms-user',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
    ],
    port: 8001,
};
