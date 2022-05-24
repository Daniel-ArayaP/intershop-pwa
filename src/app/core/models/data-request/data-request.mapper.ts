import { DataRequestData } from './data-request.interface';
import { DataRequest } from './data-request.model';

export class DataRequestMapper {
  /**
   * Map data request payload to data request model
   */
  static fromData(payload: DataRequestData, requestData: DataRequest): DataRequest {
    return {
      requestID: requestData.requestID,
      hash: requestData.hash,
      status: payload?.infos ? payload.infos[0].status : 204,
      code: payload?.infos ? payload.infos[0].code : '',
    } as DataRequest;
  }
}
