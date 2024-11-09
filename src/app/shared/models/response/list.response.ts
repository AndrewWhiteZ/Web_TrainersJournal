import { ApiResponse } from "./api.response";

export interface ListResponse<T> extends ApiResponse {
  data: Array<T>;
}
