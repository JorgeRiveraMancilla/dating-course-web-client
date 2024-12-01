import { JwtPayload } from './jwt-payload';

export interface TokenInfo {
  payload: JwtPayload;
  isValid: boolean;
}
