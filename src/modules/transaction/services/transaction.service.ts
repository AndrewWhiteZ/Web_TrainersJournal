import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TransactionDto } from '../../../app/shared/models/dto/transaction.dto';
import { DepositRequest } from '../../../app/shared/models/requests/deposit.request';
import { StudentTransactionsDto } from '../../../app/shared/models/dto/student-transactions.dto';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http: HttpClient) {}

  public deposit(body: DepositRequest) {
    return this.http.post<ApiResponse<TransactionDto>>(`/api/v1/deposit_test`, body);
  }

  public getMyBalance() {
    return this.http.get<ApiResponse<number>>(`/api/v1/me/balance`);
  }

  public getStudentBalance(studentId: string) {
    return this.http.get<ApiResponse<number>>(`/api/v1/students/${studentId}/balance`);
  }

  public getStudentTransactions(studentId: string, startTime?: string, endTime?: string) {
    let params = new HttpParams();
    if (startTime) params = params.append('startTime', startTime);
    if (endTime) params = params.append('endTime', endTime);
    return this.http.get<ApiResponse<StudentTransactionsDto>>(`/api/v1/students/${studentId}/transactions`, { params });
  } 

  public getGroupTransactions(groupId: string, startTime?: string, endTime?: string) {
    let params = new HttpParams();
    if (startTime) params = params.append('startTime', startTime);
    if (endTime) params = params.append('endTime', endTime);
    return this.http.get<ApiResponse<Array<StudentTransactionsDto>>>(`/api/v1/groups/${groupId}/transactions`, { params });
  }

}
