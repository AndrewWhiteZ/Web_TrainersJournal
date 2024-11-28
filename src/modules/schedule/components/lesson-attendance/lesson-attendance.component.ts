import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, Type } from '@angular/core';
import { StudentAttendanceDTO } from '../../../../app/shared/models/dto/student-attendance.dto';
import { AttendanceService } from '../../services/attendance.service';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiAlertService, TuiAutoColorPipe, TuiButton, TuiDialogContext, TuiDialogService, TuiIcon, TuiInitialsPipe, TuiTitle } from '@taiga-ui/core';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { LessonEntity } from '../../../../app/shared/models/entity/lesson.entity';
import { GroupService } from '../../../groups/services/group.service';
import { StudentDto } from '../../../../app/shared/models/dto/student.dto';
import { TuiCell, TuiHeader } from '@taiga-ui/layout';
import { TuiAvatar, TuiSkeleton } from '@taiga-ui/kit';

type Input = {
  group: GroupEntity,
  lesson: LessonEntity
}

@Component({
    selector: 'app-lesson-attendance',
    imports: [
        TuiCell,
        TuiButton,
        TuiHeader,
        TuiTitle,
        TuiAvatar,
        TuiInitialsPipe,
        TuiAutoColorPipe,
        TuiSkeleton
    ],
    templateUrl: './lesson-attendance.component.html',
    styleUrl: './lesson-attendance.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonAttendanceComponent implements OnInit {
  
  public readonly context = injectContext<TuiDialogContext<null, Input>>();
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  private groupService = inject(GroupService);
  private attendanceService = inject(AttendanceService);
  private cdr = inject(ChangeDetectorRef)

  students: Array<StudentDto> = new Array;
  attendance: Array<StudentAttendanceDTO> = new Array;
  
  constructor() {}

  ngOnInit(): void {
    this.getGroupStudents(this.context.data.group.id);
    this.getAttendance(this.context.data.group.id, this.context.data.lesson.id);
  }

  private getGroupStudents(groupId: string) {
    this.groupService.getGroupStudentsById(groupId).subscribe({
      next: (next) => {
        this.students = next.data;
        this.cdr.detectChanges();
      }
    });
  }
  
  private getAttendance(groupId: string, lessonId: string) {
    this.attendanceService.getAttendanceByLesson(groupId, lessonId).subscribe({
      next: (next) => {
        this.attendance = next.data;
        this.cdr.detectChanges();
      }
    });
  }

  protected getStudentAttendance(studentId: string): boolean {
    const studentAttendance = this.attendance.find((item) => item.studentId === studentId);
    if (studentAttendance) {
      return studentAttendance.attended;
    } else {
      return false;
    }
  }

  protected markAttendance(studentId: string) {
    this.attendanceService.markAttendance(this.context.data.group.id, this.context.data.lesson.id, studentId).subscribe({
      next: () => {
        this.alerts.open(`Посещаемость отмечена`, { autoClose: 1000, label: 'Успех', appearance: 'positive' }).subscribe();
        const studentAttendance = this.attendance.find((item) => item.studentId === studentId);
        if (studentAttendance) {
          studentAttendance.attended = true;
          this.cdr.detectChanges();
        }
      },
      error: (error) => this.alerts.open(error.error.message, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe()
    });
  }

  protected unmarkAttenadance(studentId: string) {
    this.attendanceService.unmarkAttendance(this.context.data.group.id, this.context.data.lesson.id, studentId).subscribe({
      next: () => {
        this.alerts.open(`Посещаемость отмечена`, { autoClose: 1000, label: 'Успех', appearance: 'positive' }).subscribe();
        const studentAttendance = this.attendance.find((item) => item.studentId === studentId);
        if (studentAttendance) {
          studentAttendance.attended = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => this.alerts.open(error.error.message, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe()
    });
  }

}
