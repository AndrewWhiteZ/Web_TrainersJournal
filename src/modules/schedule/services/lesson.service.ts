import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { LessonDto } from '../../../app/shared/models/dto/lesson.dto';
import { ScheduleLessonRequest } from '../../../app/shared/models/requests/schedule-lesson.request';
import { ScheduleBatchRequest } from '../../../app/shared/models/requests/schedule-batch.request';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  constructor(private http: HttpClient) {}

  public getLessonsByGroup(groupId: string, startTime?: string, endTime?: string) {
    let params = new HttpParams();
    if (startTime) params = params.append('startTime', startTime);
    if (endTime) params = params.append('endTime', endTime);
    return this.http.get<ApiResponse<Array<LessonDto>>>(`/api/v1/groups/${groupId}/schedule`, { params });
  }

  public createGroupLesson(groupId: string, body: ScheduleLessonRequest) {
    return this.http.post<ApiResponse<LessonDto>>(`/api/v1/groups/${groupId}/schedule`, body);
  }

  public scheduleGroupLessons(groupId: string, body: ScheduleBatchRequest) {
    return this.http.post<ApiResponse<Array<LessonDto>>>(`/api/v1/groups/${groupId}/schedule/batch`, body);
  } 

  public getMyLessons() {
    return this.http.get<ApiResponse<Array<LessonDto>>>(`/api/v1/me/schedule`);
  }

}
