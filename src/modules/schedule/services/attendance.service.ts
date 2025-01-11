import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { StudentAttendanceDTO } from '../../../app/shared/models/dto/student-attendance.dto';
import { LessonWithAttendanceDto } from '../../../app/shared/models/dto/lesson-with-attendance.dto';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private http: HttpClient) {}

  public getAttendanceByLesson(groupId: string, lessonId: string) {
    return this.http.get<ApiResponse<Array<StudentAttendanceDTO>>>(`/api/v1/groups/${groupId}/lessons/${lessonId}/attendance`);
  }

  public markAttendance(groupId: string, lessonId: string, studentId: string) {
    return this.http.put<ApiResponse<StudentAttendanceDTO>>(`/api/v1/groups/${groupId}/lessons/${lessonId}/attendance/${studentId}`, null);
  }

  public unmarkAttendance(groupId: string, lessonId: string, studentId: string) {
    return this.http.delete<ApiResponse<StudentAttendanceDTO>>(`/api/v1/groups/${groupId}/lessons/${lessonId}/attendance/${studentId}`);
  }

  public getAttendanceForPeriod(groupId: string, startTime?: string, endTime?: string) {
    let params = new HttpParams();
    if (startTime) params = params.append('startTime', startTime);
    if (endTime) params = params.append('endTime', endTime);
    return this.http.get<ApiResponse<Array<LessonWithAttendanceDto>>>(`/api/v1/groups/${groupId}/attendance`, { params });
  }
  
}
