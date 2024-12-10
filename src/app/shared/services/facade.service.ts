import { Injectable } from '@angular/core';
import { UserService } from '../../../modules/users/services/user.service';
import { SignUpRequest } from '../models/requests/sign-up.request';
import { SignInRequest } from '../models/requests/sign-in.request';
import { GroupService } from '../../../modules/groups/services/group.service';
import { CreateGroupRequest } from '../models/requests/create-group.request';
import { StudentService } from '../../../modules/users/services/student.service';
import { LessonPricePeriodService } from '../../../modules/groups/services/lesson-price-period.service';
import { LessonPricePeriodRequest } from '../models/requests/lesson-price-period.request';
import { LessonService } from '../../../modules/schedule/services/lesson.service';
import { ScheduleLessonRequest } from '../models/requests/schedule-lesson.request';
import { ScheduleBatchRequest } from '../models/requests/schedule-batch.request';
import { TransactionService } from '../../../modules/transaction/services/transaction.service';
import { DepositRequest } from '../models/requests/deposit.request';
import { AttendanceService } from '../../../modules/schedule/services/attendance.service';

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private studentService: StudentService,
    private lessonService: LessonService,
    private lessonPricePeriodService: LessonPricePeriodService,
    private attendanceService: AttendanceService,
    private transactionService: TransactionService,
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

  public getGroupById(id: string) {
    return this.groupService.getGroupById(id);
  }

  public getGroupStudentsById(id: string) {
    return this.groupService.getGroupStudentsById(id);
  }

  public createGroup(body: CreateGroupRequest) {
    return this.groupService.createGroup(body);
  }

  public addStudentToGroup(groupId: string, studentId: string) {
    return this.groupService.addStudent(groupId, studentId);
  }

  public removeStudentFromGroup(groupId: string, studentId: string) {
    return this.groupService.removeStudent(groupId, studentId);
  }

  public getStudents() {
    return this.studentService.getStudents();
  }

  public getStudentById(id: string) {
    return this.studentService.getStudentById(id);
  }

  public getLessonsByGroup(groupId: string) {
    return this.lessonService.getLessonsByGroup(groupId);
  }
  
  public createGroupLesson(groupId: string, body: ScheduleLessonRequest) {
    return this.lessonService.createGroupLesson(groupId, body);
  }

  public scheduleGroupLessons(groupId: string, body: ScheduleBatchRequest) {
    return this.lessonService.scheduleGroupLessons(groupId, body);
  }

  public getMyLessons() {
    return this.lessonService.getMyLessons();
  }

  public getLessonPricePeriodsByGroupId(groupId: string) {
    return this.lessonPricePeriodService.getPrices(groupId);
  }

  public addLessonPricePeriod(groupId: string, body: LessonPricePeriodRequest) {
    return this.lessonPricePeriodService.addPrice(groupId, body);
  }

  public getLessonPricePeriodById(groupId: string, priceId: string) {
    return this.lessonPricePeriodService.getPriceById(groupId, priceId);
  }

  public deletePricePeriod(groupId: string, priceId: string) {
    return this.lessonPricePeriodService.deletePrice(groupId, priceId);
  }

  public updatePricePeriod(groupId: string, priceId: string, body: LessonPricePeriodRequest) {
    return this.lessonPricePeriodService.updatePrice(groupId, priceId, body);
  }

  public getAttendanceByLesson(groupId: string, lessonId: string) {
    return this.attendanceService.getAttendanceByLesson(groupId, lessonId);
  }

  public markAttendance(groupId: string, lessonId: string, studentId: string) {
    return this.attendanceService.markAttendance(groupId, lessonId, studentId);
  }

  public unmarkAttendance(groupId: string, lessonId: string, studentId: string) {
    return this.attendanceService.unmarkAttendance(groupId, lessonId, studentId);
  }
  
  public deposit(body: DepositRequest) {
    return this.transactionService.deposit(body);
  }

  public getMyBalance() {
    return this.transactionService.getMyBalance();
  }

  public getStudentBalance(studentId: string) {
    return this.transactionService.getStudentBalance(studentId);
  }

  public getStudentTransactions(studentId: string) {
    return this.transactionService.getStudentTransactions(studentId);
  } 

  public getGroupTransactions(groupId: string) {
    return this.transactionService.getGroupTransactions(groupId);
  }

}
