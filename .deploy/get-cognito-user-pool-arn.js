import { printUserPoolArn } from '@jmsoffredi/ms-common';
import AWS from 'aws-sdk';
import { exit } from 'process';

// Configure region
if (!process.env.AWS_REGION) {
    console.error('AWS_REGION environment variable not defined');
    exit(1);
}

AWS.config.update({ region: process.env.AWS_REGION });

try {
    const cognitoISP = new AWS.CognitoIdentityServiceProvider();
    printUserPoolArn('MsId', cognitoISP);
} catch (err) {
    console.error(err.message);
}
