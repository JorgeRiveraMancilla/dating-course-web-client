export interface HttpErrorResponse {
  error: {
    error: string;
    statusCode?: number;
    message?: string[];
  };
  status: number;
  statusText: string;
}
