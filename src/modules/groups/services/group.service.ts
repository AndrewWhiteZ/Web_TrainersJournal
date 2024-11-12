import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateGroupRequest } from '../../../app/shared/models/requests/create-group-request';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { GroupDto } from '../../../app/shared/models/dto/group.dto';
import { StudentDto } from '../../../app/shared/models/dto/student.dto';
import { EmptyResponse } from '../../../app/shared/models/response/empty.response';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient) { }

  public getGroups() {
    return this.http.get<ApiResponse<Array<GroupDto>>>("/api/v1/groups");
  }

  public getMyGroups() {
    return this.http.get<ApiResponse<Array<GroupDto>>>("/api/v1/me/groups");
  }

  public getGroupById(id: string) {
    return this.http.get<ApiResponse<GroupDto>>(`/api/v1/groups/${id}`);
  }

  public getGroupStudentsById(id: string) {
    return this.http.get<ApiResponse<Array<StudentDto>>>(`/api/v1/groups/${id}/students`);
  }

  public createGroup(body: CreateGroupRequest) {
    return this.http.post<ApiResponse<GroupDto>>("/api/v1/groups", body);
  }

  public addStudent(groupId: string, studentId: string) {
    return this.http.put<EmptyResponse>(`/api/v1/groups/${groupId}/students/${studentId}`, null);
  }

  public removeStudent(groupId: string, studentId: string) {
    return this.http.delete<EmptyResponse>(`/api/v1/groups/${groupId}/students/${studentId}`);
  }

}
