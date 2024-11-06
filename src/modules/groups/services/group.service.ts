import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateGroupRequest } from '../../../app/shared/models/requests/create-group-request';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient) { }

  public getGroups() {
    return this.http.get("/groups");
  }

  public getMyGroups() {
    return this.http.get("/me/groups");
  }

  public getGroupById(id: String) {
    return this.http.get(`/groups/${id}`);
  }

  public getGroupStudentsById(id: String) {
    return this.http.get(`/groups/${id}/students`);
  }

  public createGroup(body: CreateGroupRequest) {
    return this.http.post("/groups", body);
  }

  public addStudent(groupId: String, studentId: String) {
    return this.http.put(`/groups/${groupId}/students/${studentId}`, null);
  }

  public removeStudent(groupId: String, studentId: String) {
    return this.http.delete(`/groups/${groupId}/students/${studentId}`);
  }

}
