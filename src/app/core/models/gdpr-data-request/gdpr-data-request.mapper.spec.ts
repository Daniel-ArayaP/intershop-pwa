import { GDPRDataRequestData, GDPRDataRequestInfo } from './gdpr-data-request.interface';
import { GDPRDataRequestMapper } from './gdpr-data-request.mapper';
import { GDPRDataRequest } from './gdpr-data-request.model';

describe('Gdpr Data Request Mapper', () => {
  describe('fromData', () => {
    it(`should return DataRequest when getting DataRequestData with request id`, () => {
      const payloadData = {
        infos: [{ causes: [{ code: 'already confirmed' }] } as GDPRDataRequestInfo],
      } as GDPRDataRequestData;
      const requestData = { hash: 'test_hash', requestID: 'test_ID' } as GDPRDataRequest;
      const dataRequest = GDPRDataRequestMapper.fromData(payloadData, requestData);

      expect(dataRequest.requestID).toEqual(requestData.requestID);
      expect(dataRequest.hash).toEqual(requestData.hash);
      expect(dataRequest.status).toEqual('already confirmed');
    });
  });
});
