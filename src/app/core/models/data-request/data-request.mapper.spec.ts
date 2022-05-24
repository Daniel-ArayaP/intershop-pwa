import { DataRequestData, DataRequestInfo } from './data-request.interface';
import { DataRequestMapper } from './data-request.mapper';
import { DataRequest } from './data-request.model';

describe('Data Request Mapper', () => {
  describe('fromData', () => {
    it(`should return DataRequest when getting DataRequestData with request id`, () => {
      const payloadData = {
        infos: [{ status: 200, code: 'already confirmed' } as DataRequestInfo],
      } as DataRequestData;
      const requestData = { hash: 'test_hash', requestID: 'test_ID' } as DataRequest;
      const dataRequest = DataRequestMapper.fromData(payloadData, requestData);

      expect(dataRequest.requestID).toEqual(requestData.requestID);
      expect(dataRequest.hash).toEqual(requestData.hash);
      expect(dataRequest.status).toEqual(200);
      expect(dataRequest.code).toEqual('already confirmed');
    });
  });
});
