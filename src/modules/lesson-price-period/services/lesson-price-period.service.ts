import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { LessonPricePeriodDto } from '../../../app/shared/models/dto/lesson-price-period.dto';
import { EmptyResponse } from '../../../app/shared/models/response/empty.response';
import { LessonPricePeriodRequest } from '../../../app/shared/models/requests/lesson-price-period.request';

@Injectable({
  providedIn: 'root'
})
export class LessonPricePeriodService {

  constructor(private http: HttpClient) { }

  public getPrices(groupId: string) {
    return this.http.get<ApiResponse<Array<LessonPricePeriodDto>>>(`/api/v1/groups/${groupId}/prices`);
  }

  public postPrices(groupId: string, body: LessonPricePeriodRequest) {
    return this.http.post<ApiResponse<LessonPricePeriodDto>>(`/api/v1/groups/${groupId}/prices`, body);
  }

  public getPriceById(groupId: string, periodId: string) {
    return this.http.get<ApiResponse<LessonPricePeriodDto>>(`/api/v1/groups/${groupId}/prices/${periodId}`);
  }

  public deletePriceById(groupId: string, periodId: string) {
    return this.http.delete<EmptyResponse>(`/api/v1/groups/${groupId}/prices/${periodId}`);
  }

  public patchPriceById(groupId: string, periodId: string, body: LessonPricePeriodRequest) {
    return this.http.patch<ApiResponse<LessonPricePeriodDto>>(`/api/v1/groups/${groupId}/prices/${periodId}`, body);
  }

}
