import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { BillDto } from '../../../app/shared/models/dto/bill.dto';
import { EmptyResponse } from '../../../app/shared/models/response/empty.response';

@Injectable({
  providedIn: 'root'
})
export class BillService {

  constructor(private http: HttpClient) { }

  public uploadBill(body: FormData) {
    return this.http.post<ApiResponse<BillDto>>("/api/v1/bills", body);
  }

  public getPendingBills() {
    return this.http.get<ApiResponse<Array<BillDto>>>("/api/v1/bills/pending");
  }

  public getMyBills() {
    return this.http.get<ApiResponse<Array<BillDto>>>("/api/v1/me/bills");
  }

  public getBill(id: string) {
    return this.http.get<ApiResponse<BillDto>>(`/api/v1/bills/by-id/${id}`);
  }

  public getBillImg(id: string) {
    return this.http.get(`/api/v1/bills/by-id/${id}/img`, { responseType: 'blob' });
  }

  public deleteBill(id: string) {
    return this.http.delete<EmptyResponse>(`/api/v1/bills/by-id/${id}`);
  }

  public approveBill(id: string) {
    return this.http.post<EmptyResponse>(`/api/v1/bills/by-id/${id}/approve`, null);
  }

  public declineBill(id: string) {
    return this.http.post<EmptyResponse>(`/api/v1/bills/by-id/${id}/decline`, null);
  }

}
