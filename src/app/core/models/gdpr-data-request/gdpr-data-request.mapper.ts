import { GDPRDataRequestData } from './gdpr-data-request.interface';
import { GDPRDataRequest } from './gdpr-data-request.model';

export class GDPRDataRequestMapper {
  /**
   * Map data request payload to data request model
   */
  static fromData(payload: GDPRDataRequestData, requestData: GDPRDataRequest): GDPRDataRequest {
    return {
      requestID: requestData.requestID,
      hash: requestData.hash,
      infoCode: payload.infos[0].causes[0].code,
    };
  }
}
