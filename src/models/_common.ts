import { DeepPartial } from 'dynamoose/dist/General';
import { ModelOptions } from 'dynamoose/dist/Model';

const localModelOptions: DeepPartial<ModelOptions> = {
    create: false,
    waitForActive: false,
};

if (process.env.AWS_SAM_LOCAL) {
    localModelOptions.create = true;
}

enum Serializers {
    RemoveTimestamps = 'removeTimeStamps',
    PopulateAndRemoveTimestamps = 'populateAndRemoveTimestamps',
}

const SerializersOptions = {
    [Serializers.RemoveTimestamps]: { exclude: ['createdAt', 'updatedAt'] },
};

export { localModelOptions, Serializers, SerializersOptions };
