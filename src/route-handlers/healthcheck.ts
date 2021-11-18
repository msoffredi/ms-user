import {
    HealthcheckResponseBody,
    ServiceStatus,
    RouteHandler,
} from '@jmsoffredi/ms-common';

export const healthcheckHandler: RouteHandler =
    async (): Promise<HealthcheckResponseBody> => {
        return {
            serviceStatus: ServiceStatus.Healthy,
        };
    };
