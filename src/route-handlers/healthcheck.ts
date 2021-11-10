import { HealthcheckResponseBody, ServiceStatus } from '../handlers/types';
import { RouteHandler } from './types';

export const healthcheckHandler: RouteHandler =
    async (): Promise<HealthcheckResponseBody> => {
        console.log(process.env);

        return {
            serviceStatus: ServiceStatus.Healthy,
        };
    };
