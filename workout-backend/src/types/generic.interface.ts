import { Request } from "express";

export interface IProviderResponse {
  status: string;
  responseMsg: string;
  message: string;
  balance: null | number;
  from: string;
  to: string;
  message_id: null | number;
}
