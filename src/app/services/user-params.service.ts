import { Injectable } from '@angular/core';
import { Auth } from '../interfaces/auth';
import { UserParams } from '../interfaces/user-params';

@Injectable({
  providedIn: 'root',
})
export class UserParamsService {
  private currentParams: UserParams | undefined;

  initializeParams(auth: Auth): UserParams {
    this.currentParams = new UserParams(auth);
    return this.currentParams;
  }

  getParams(): UserParams | undefined {
    return this.currentParams;
  }

  setParams(params: UserParams): void {
    this.currentParams = params;
  }

  resetParams(auth: Auth | null): UserParams | undefined {
    if (!auth) return undefined;
    return this.initializeParams(auth);
  }
}
