export class LikeParams {
  predicate: string = 'liked';
  pageNumber: number = 1;
  pageSize: number = 12;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.predicate = 'liked';
    this.pageNumber = 1;
    this.pageSize = 12;
  }
}
