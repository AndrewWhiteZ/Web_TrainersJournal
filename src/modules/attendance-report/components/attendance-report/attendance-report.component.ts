import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDay, TuiLet, TuiTime } from '@taiga-ui/cdk';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, tuiDialog, TuiInitialsPipe, TuiScrollbar, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiCheckbox, TuiConnected, TuiSegmented } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateTimeModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { GroupDto } from '../../../../app/shared/models/dto/group.dto';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { ActivatedRoute } from '@angular/router';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { LessonWithAttendanceDto } from '../../../../app/shared/models/dto/lesson-with-attendance.dto';
import { LessonEntity } from '../../../../app/shared/models/entity/lesson.entity';
import { LessonMapper } from '../../../../app/shared/models/mapper/lesson.mapper';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { UserRole } from '../../../../app/shared/models/enum/user-role.enum';

export type StudentShortDto = {
  fullName: string,
  studentId: string,
}

export type StudentAttendance = StudentShortDto & {
  attended: boolean
}

export type AttendanceByStudent = StudentAttendance & {
  lesson: LessonEntity,
}

export type LessonWithAttendance = {
  lesson: LessonEntity,
  attendance: Array<StudentAttendance>
}

export type LessonAttendance = {
  lesson: LessonEntity,
  attended: boolean
}

export type FullRecord = {
  student: StudentShortDto,
  lesson: LessonEntity,
  attended: boolean,
}

export type Attendance = {
  student: StudentShortDto,
  lessons: Array<LessonAttendance>,
}

function mapToEntity(dto: LessonWithAttendanceDto): LessonWithAttendance {
  return {
    lesson: LessonMapper.mapToEntity(dto.lesson),
    attendance: dto.attendance.map((item) => {
      return {
        fullName: item.studentFullName,
        studentId: item.studentId,
        attended: item.attended
      }
    })
  };
}

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TuiCardLarge,
    TuiHeader,
    TuiTitle,
    TuiCell,
    TuiAppearance,
    TuiConnected,
    TuiTextfieldControllerModule,
    TuiInputDateTimeModule,
    TuiTextfield,
    TuiTable,
    TuiSearch,
    TuiAvatar,
    TuiButton,
    TuiScrollbar,
    DatePipe,
    TuiLet,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    TuiCheckbox,
  ],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceReportComponent implements OnInit {

  private readonly alerts = inject(TuiAlertService);

  protected currentUser: UserEntity | null = null;

  protected group: GroupEntity | null = null;
  protected groupAttendance: Array<LessonWithAttendance> = new Array;

  protected lessonList: Array<LessonEntity> = new Array;
  protected studentList: Array<StudentShortDto> = new Array;
  protected list: Array<Attendance> = new Array;
  protected fullList: Array<FullRecord> = new Array;

  protected groupTableColumns = ['student'];

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
    startDate: new FormControl([TuiDay.currentLocal().append({ day: -10 }), new TuiTime(0, 0, 0)], { nonNullable: true }),
    endDate: new FormControl([TuiDay.currentLocal().append({ day: 10 }), new TuiTime(0, 0, 0)], { nonNullable: true }),
  });

  private selectGroupDialog = tuiDialog(ListSelectionComponent<GroupDto>, {
    dismissible: true,
    label: 'Выберите группу',
    size: 'fullscreen'
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private facadeService: FacadeService,
  ) {}

  ngOnInit(): void {
    this.facadeService.me().subscribe({
      next: (response) => this.currentUser = UserMapper.mapToEntity(response.data),
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected isStudent(): boolean {
    return this.currentUser?.role === UserRole.STUDENT;
  }

  protected isTrainer(): boolean {
    return this.currentUser?.role === UserRole.TRAINER;
  }

  protected isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  protected getGroupAttendance(groupId?: string): void {
    if (!groupId) return;

    const startDateValue = this.searchForm.controls.startDate.value[0] as TuiDay;
    const startTimeValue = this.searchForm.controls.startDate.value[1] as TuiTime;
    const endDateValue = this.searchForm.controls.endDate.value[0] as TuiDay;
    const endTimeValue = this.searchForm.controls.endDate.value[1] as TuiTime;
    
    const startDateTime: Date = new Date(startDateValue.year, startDateValue.month, startDateValue.day, startTimeValue.hours, startTimeValue.minutes, startTimeValue.seconds);
    const endDateTime: Date = new Date(endDateValue.year, endDateValue.month, endDateValue.day, endTimeValue.hours, endTimeValue.minutes, endTimeValue.seconds); 

    this.groupTableColumns = ['student'];
    this.lessonList = new Array;
    this.studentList = new Array;
    this.fullList = new Array;
    this.list = new Array;

    this.facadeService.getAttendanceForPeriod(groupId, startDateTime.toISOString(), endDateTime.toISOString()).subscribe({
      next: (response) => {
        response.data.forEach(item => {
          const lesson: LessonEntity = LessonMapper.mapToEntity(item.lesson);
          this.lessonList.push(lesson);
          this.groupTableColumns.push(lesson.id);
          item.attendance.forEach(element => {
            let student = this.studentList.find((value) => value.studentId === element.studentId);
            if (student === undefined) {
              student = { studentId: element.studentId, fullName: element.studentFullName };
              this.studentList.push(student);
            }
            
            const record: FullRecord = {
              student: student,
              lesson: lesson,
              attended: element.attended,
            };
            this.fullList.push(record);
          });
        });

        this.lessonList.forEach(lesson => {
          this.studentList.forEach(student => {
            if (this.fullList.find((item) => item.lesson.id === lesson.id && item.student.studentId === student.studentId) === undefined) {
              const record: FullRecord = {
                student: student,
                lesson: lesson,
                attended: false,
              };
              this.fullList.push(record);
            }
          });
        });

        this.fullList.forEach(item => {
          let foundedItem = this.list.find((value) => value.student.studentId === item.student.studentId);
          if (foundedItem === undefined) {
            foundedItem = { student: item.student, lessons: new Array };
            this.list.push(foundedItem);
          }

          const attendance: LessonAttendance = { lesson: item.lesson, attended: item.attended };
          foundedItem.lessons.push(attendance);
        });
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected changeAttendance(lessonId: string, studentId: string, lessonAttendance: LessonAttendance): void {
    if (!this.group) return;

    if (lessonAttendance.attended) {
      this.facadeService.markAttendance(this.group.id, lessonId, studentId).subscribe({
        next: (response) => {
          this.showAlert('Успех', `Посещаемость отмечена`, 'positive', 3000);
        },
        error: (response) => {
          this.showAlert("Ошибка", response.error.message, "negative", 5000);
        },
        complete: () => this.cdr.detectChanges()
      });
    } else {
      this.facadeService.unmarkAttendance(this.group.id, lessonId, studentId).subscribe({
        next: (response) => {
          this.showAlert('Успех', `Посещаемость отмечена`, 'positive', 3000);
        },
        error: (response) => {
          this.showAlert("Ошибка", response.error.message, "negative", 5000);
        },
        complete: () => this.cdr.detectChanges()
      });
    }
  }

  protected showSelectionDialog(): void {
    let observe;
    
    if (this.currentUser?.role === UserRole.ADMIN) {
      observe = this.facadeService.getGroups(); 
    } else {
      observe = this.facadeService.getMyGroups();
    }
    
    this.selectGroupDialog(observe).subscribe({
      next: (response) => {
        if (response === null) return;
        this.group = GroupMapper.mapToEntity(response);
        this.searchForm.controls.search.setValue(this.group.name);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
