import { randomUUID } from 'crypto';
import dynamoose from 'dynamoose';
import { exit } from 'process';
import { User } from '../models/user';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (): Promise<void> => {
    console.log('Init function started...');

    if (process.env.SUPER_ADMIN_EMAIL) {
        const user = await User.create({
            id: randomUUID(),
            email: process.env.SUPER_ADMIN_EMAIL,
        });

        if (user) {
            console.log(
                `User with email ${process.env.SUPER_ADMIN_EMAIL} created`,
            );
        }
    }
};
