import { SpecialHttpErrorHandler } from 'ish-core/interceptors/icm-error-mapper.interceptor';

export const dataRequestErrorHandler: SpecialHttpErrorHandler = {
  test: (error, request) => error.url.endsWith('/confirmations') && request.method === 'PUT',
  map: error => {
    switch (error.status) {
      case 404:
        return { code: 'gdpr_request.confirmation_link_expired.error' };
      case 422:
        return { code: 'gdpr_request.unprocessable.error' };
      default:
        return { code: 'gdpr_request.server_connection_failed.error' };
    }
  },
};
