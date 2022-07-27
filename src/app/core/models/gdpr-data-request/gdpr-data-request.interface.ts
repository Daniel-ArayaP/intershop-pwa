/**
 * response data type for confirm data request
 */
export interface GDPRDataRequestData {
  data?: [
    {
      hash: string;
    }
  ];
  infos?: GDPRDataRequestInfo[];
}

export interface GDPRDataRequestInfo {
  causes?: GDPRDataRequestCauses[];
}

interface GDPRDataRequestCauses {
  code: string;
}
