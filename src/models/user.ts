import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface UserDoc extends Document {
    id: string;
    [key: string]: unknown;
}

const userSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
    },
    {
        timestamps: true,
    },
);
const User = dynamoose.model<UserDoc>('ms-user', userSchema, localModelOptions);

User.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { User, UserDoc };
