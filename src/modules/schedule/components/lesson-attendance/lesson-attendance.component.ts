import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { StudentAttendanceDTO } from '../../../../app/shared/models/dto/student-attendance.dto';
import { AttendanceService } from '../../services/attendance.service';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiAlertService, TuiAutoColorPipe, TuiButton, TuiDialogContext, TuiDialogService, TuiInitialsPipe, TuiTitle } from '@taiga-ui/core';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { LessonEntity } from '../../../../app/shared/models/entity/lesson.entity';
import { GroupService } from '../../../groups/services/group.service';
import { TuiCell, TuiHeader } from '@taiga-ui/layout';
import { TuiAvatar, TuiChip, TuiConnected, TuiSkeleton } from '@taiga-ui/kit';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { StudentMapper } from '../../../../app/shared/models/mapper/student.mapper';
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';

type Input = {
  group: GroupEntity,
  lesson: LessonEntity
}

@Component({
  selector: 'app-lesson-attendance',
  standalone: true,
  imports: [
    TuiCell,
    TuiButton,
    TuiHeader,
    TuiTitle,
    TuiAvatar,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    TuiSkeleton,
    TuiChip,
    BeltLevelPipe,
    BeltLevelColorPipe,
    TuiConnected,
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

  skeletonStudents: boolean = true;

  students: Array<StudentEntity> = new Array;
  attendance: Array<StudentAttendanceDTO> = new Array;
  
  constructor() {}

  ngOnInit(): void {
    this.getGroupStudents(this.context.data.group.id);
    this.getAttendance(this.context.data.group.id, this.context.data.lesson.id);
  }

  private getGroupStudents(groupId: string) {
    this.skeletonStudents = true;
    this.groupService.getGroupStudentsById(groupId).subscribe({
      next: (response) => {
        this.students = new Array;
        response.data.map((item) => this.students.push(StudentMapper.mapToEntity(item)));
        this.students.sort((a, b) => a.beltLevel - b.beltLevel);
        this.skeletonStudents = false;
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
        this.showAlert('Успех', `Посещаемость отмечена`, 'positive', 3000);
        const studentAttendance = this.attendance.find((item) => item.studentId === studentId);
        if (studentAttendance) {
          studentAttendance.attended = true;
          this.cdr.detectChanges();
        }
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected unmarkAttenadance(studentId: string) {
    this.attendanceService.unmarkAttendance(this.context.data.group.id, this.context.data.lesson.id, studentId).subscribe({
      next: () => {
        this.showAlert('Успех', `Посещаемость отмечена`, 'positive', 3000);
        const studentAttendance = this.attendance.find((item) => item.studentId === studentId);
        if (studentAttendance) {
          studentAttendance.attended = false;
          this.cdr.detectChanges();
        }
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
