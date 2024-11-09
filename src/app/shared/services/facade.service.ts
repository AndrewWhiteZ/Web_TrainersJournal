import { Injectable } from '@angular/core';
import { UserService } from '../../../modules/users/services/user.service';
import { SignUpRequest } from '../models/requests/sign-up-request';
import { SignInRequest } from '../models/requests/sign-in-request';
import { GroupService } from '../../../modules/groups/services/group.service';
import { CreateGroupRequest } from '../models/requests/create-group-request';
import { StudentService } from '../../../modules/users/services/student.service';

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private studentService: StudentService,
  ) {}

  public register(body: SignUpRequest) {
    return this.userService.register(body);
  }

  public login(body: SignInRequest) {
    return this.userService.login(body);
  }

  public logout() {
    return this.userService.logout();
  }

  public me() {
    return this.userService.me();
  }

  public getGroups() {
    return this.groupService.getGroups();
  }

  public getMyGroups() {
    return this.groupService.getMyGroups();
  }

  public getGroupById(id: String) {
    return this.groupService.getGroupById(id);
  }

  public getGroupStudentsById(id: String) {
    return this.groupService.getGroupStudentsById(id);
  }

  public createGroup(body: CreateGroupRequest) {
    return this.groupService.createGroup(body);
  }

  public addStudentToGroup(groupId: String, studentId: String) {
    return this.groupService.addStudent(groupId, studentId);
  }

  public removeStudentFromGroup(groupId: String, studentId: String) {
    return this.groupService.removeStudent(groupId, studentId);
  }

  public getStudents() {
    return this.studentService.getStudents();
  }

  public getStudentById(id: String) {
    return this.studentService.getStudentById(id);
  }

}
