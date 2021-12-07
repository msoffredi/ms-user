import { HealthcheckResponseBody, ServiceStatus } from '@jmsoffredi/ms-common';

export const healthcheck = async (): Promise<HealthcheckResponseBody> => {
    return {
        serviceStatus: ServiceStatus.Healthy,
    };
};
