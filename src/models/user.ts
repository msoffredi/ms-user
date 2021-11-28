import {
    modelOptions,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';

interface UserDoc extends Document {
    id: string;
    email: string;
    deletedAt?: number;
}

const userSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        email: {
            type: String,
            required: true,
        },
        deletedAt: Date,
    },
    {
        timestamps: true,
    },
);
const User = dynamoose.model<UserDoc>('ms-user', userSchema, modelOptions);

User.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { User, UserDoc };
