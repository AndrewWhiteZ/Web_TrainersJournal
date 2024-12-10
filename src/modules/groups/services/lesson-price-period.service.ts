import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { LessonPricePeriodDto } from '../../../app/shared/models/dto/lesson-price-period.dto';
import { LessonPricePeriodRequest } from '../../../app/shared/models/requests/lesson-price-period.request';
import { EmptyResponse } from '../../../app/shared/models/response/empty.response';

@Injectable({
  providedIn: 'root'
})
export class LessonPricePeriodService {

  constructor(private http: HttpClient) {}

  public getPrices(groupId: string) {
    return this.http.get<ApiResponse<Array<LessonPricePeriodDto>>>(`/api/v1/groups/${groupId}/prices`);
  }

  public addPrice(groupId: string, body: LessonPricePeriodRequest) {
    return this.http.post<ApiResponse<LessonPricePeriodDto>>(`/api/v1/groups/${groupId}/prices`, body);
  }

  public getPriceById(groupId: string, priceId: string) {
    return this.http.get<ApiResponse<LessonPricePeriodDto>>(`/api/v1/groups/${groupId}/prices/${priceId}`);
  }

  public deletePrice(groupId: string, priceId: string) {
    return this.http.delete<EmptyResponse>(`/api/v1/groups/${groupId}/prices/${priceId}`);
  }

  public updatePrice(groupId: string, priceId: string, body: LessonPricePeriodRequest) {
    return this.http.patch<ApiResponse<LessonPricePeriodDto>>(`/api/v1/groups/${groupId}/prices/${priceId}`, body);
  }

}
