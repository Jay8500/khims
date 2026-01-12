export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: any;
}