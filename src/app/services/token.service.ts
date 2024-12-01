import { Injectable } from '@angular/core';
import { JwtPayload } from '../interfaces/jwt-payload';
import { TokenInfo } from '../interfaces/token-info';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  parseToken(token: string): TokenInfo {
    try {
      const [, payloadBase64] = token.split('.');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson) as JwtPayload;

      return {
        payload,
        isValid: true,
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return {
        payload: { role: [] },
        isValid: false,
      };
    }
  }

  extractRoles(payload: JwtPayload): string[] {
    if (!payload.role) return [];
    return Array.isArray(payload.role) ? payload.role : [payload.role];
  }
}
