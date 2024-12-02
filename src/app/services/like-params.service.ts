import { Injectable } from '@angular/core';
import { LikeParams } from '../interfaces/like-params';

@Injectable({
  providedIn: 'root',
})
export class LikeParamsService {
  private currentParams: LikeParams | undefined;

  initializeParams(): LikeParams {
    this.currentParams = new LikeParams();
    return this.currentParams;
  }

  getParams(): LikeParams | undefined {
    return this.currentParams;
  }

  setParams(params: LikeParams): void {
    this.currentParams = params;
  }

  resetParams(): LikeParams {
    return this.initializeParams();
  }
}
