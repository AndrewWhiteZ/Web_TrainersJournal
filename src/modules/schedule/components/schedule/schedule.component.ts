import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiAppearance, TuiButton, tuiDialog, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadgedContent, TuiConnected, TuiDataListWrapper, TuiTabs, TUI_CONFIRM, TuiPagination } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputModule, TuiInputTimeModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { LessonService } from '../../services/lesson.service';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { GroupDto } from '../../../../app/shared/models/dto/group.dto';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { DatePipe } from '@angular/common';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { ScheduleLessonRequest } from '../../../../app/shared/models/requests/schedule-lesson.request';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { LessonEntity } from '../../../../app/shared/models/entity/lesson.entity';
import { LessonMapper } from '../../../../app/shared/models/mapper/lesson.mapper';
import { ScheduleBatchRequest } from '../../../../app/shared/models/requests/schedule-batch.request';
import { ScheduledLessonDto } from '../../../../app/shared/models/dto/scheduled-lesson.dto';
import { LessonAttendanceComponent } from '../lesson-attendance/lesson-attendance.component';

type ScheduledLesson = {
  day: number,
  startTime: Date,
  endTime: Date,
}

type LessonByDay = {
  day: Date,
  lessons: Array<LessonEntity>,
}

@Component({
  selector: 'app-schedule',
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiAvatar,
    TuiCardLarge,
    TuiCell,
    TuiDataListWrapper,
    TuiTextfield,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiTitle,
    TuiConnected,
    TuiInputModule,
    TuiSearch,
    TuiButton,
    TuiInputDateModule,
    TuiInputTimeModule,
    TuiBlockStatus,
    TuiHeader,
    TuiTabs,
    TuiBadgedContent,
    DatePipe,
    TuiPagination,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent {
  
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected lessons: Array<LessonEntity> = new Array;
  protected lessonsByDays: Array<LessonByDay> = new Array;
  protected selectedGroup: GroupEntity | null = null;

  protected length = 1;
  protected index = 1;
  protected activeTabIndex = 0;

  protected scheduledLessons: Array<ScheduledLesson> = new Array;
  protected activeDayIndex: number = 0;

  constructor(
    private facadeService: FacadeService,
    private lessonService: LessonService,
    private cdr: ChangeDetectorRef,
  ) {}

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
  });

  protected readonly createLessonGroup = new FormGroup({
    date: new FormControl(TuiDay.currentLocal(), { nonNullable: true }),
    startTime: new FormControl(TuiTime.currentLocal(), { nonNullable: true }),
    endTime: new FormControl(TuiTime.currentLocal(), { nonNullable: true }),
  });

  protected readonly scheduleLessonsGroup = new FormGroup({
    startTime: new FormControl(TuiDay.currentLocal(), { nonNullable: true }),
    endTime: new FormControl(TuiDay.currentLocal(), { nonNullable: true }),
    scheduledLessons: new FormControl(Array<ScheduledLesson>),
  });

  protected readonly scheduleLessonGroup = new FormGroup({
    startTime: new FormControl(TuiTime.currentLocal(), { nonNullable: true }),
    endTime: new FormControl(TuiTime.currentLocal(), { nonNullable: true }),
  });

  private readonly dialog = tuiDialog(ListSelectionComponent<GroupDto>, {
    dismissible: true,
    label: 'Выберите группу',
    size: 'fullscreen'
  });

  private readonly attendanceDialog = tuiDialog(LessonAttendanceComponent, {
    dismissible: false,
    size: 'l',
  });

  protected showAttendanceDialog(group: GroupEntity, lesson: LessonEntity): void {
    this.attendanceDialog({ group, lesson }).subscribe();
  }
  
  protected showSelectionDialog(): void {
    const observe = this.facadeService.getGroups();
    this.dialog(observe).subscribe({
      next: (next) => {
        if (next === null) return;
        this.selectedGroup = GroupMapper.mapToEntity(next);
        this.searchForm.controls.search.setValue(this.selectedGroup?.name);
        if (this.selectedGroup) {
          this.getLessonsByGroup(this.selectedGroup); 
        }
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, size: TuiDialogSize) {
    this.dialogs.open(content, { label, size }).subscribe();
  }

  protected createLesson(observer: any) {
    if (!this.selectedGroup) return;

    const dateValue = this.createLessonGroup.controls.date.value;
    const startTimeValue = this.createLessonGroup.controls.startTime.value;
    const endTimeValue = this.createLessonGroup.controls.endTime.value;

    const startDateTime: Date = new Date(dateValue.year, dateValue.month, dateValue.day, startTimeValue.hours, startTimeValue.minutes);
    const endDateTime: Date = new Date(dateValue.year, dateValue.month, dateValue.day, endTimeValue.hours, endTimeValue.minutes);
    
    const request: ScheduleLessonRequest = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    };

    this.lessonService.createGroupLesson(this.selectedGroup.id, request).subscribe({
      next: () => {
        this.showAlert('Успех', `Занятие успешно создано`, 'positive', 3000);
        observer.complete();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getLessonsByGroup(group: GroupEntity) {
    this.lessonService.getLessonsByGroup(group.id).subscribe({
      next: (next) => {
        this.lessons = new Array;
        this.lessonsByDays = new Array;
        next.data.map((item) => this.lessons.push(LessonMapper.mapToEntity(item)));
        this.lessons.forEach((lesson) => {
          const day = new Date(lesson.endTime.getFullYear(), lesson.endTime.getMonth(), lesson.endTime.getDate());
          const dayLessons = this.lessonsByDays.find((item) => item.day.toDateString() === day.toDateString());
          if (dayLessons) {
            dayLessons.lessons.push(lesson);
          } else {
            this.lessonsByDays.push({ day: day, lessons: new Array(lesson) });
          }
        });
        this.lessonsByDays = this.lessonsByDays.sort((a, b) => a.day.getMilliseconds() - b.day.getMilliseconds());
        this.cdr.detectChanges();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected addLesson(dayIndex: number, content: PolymorpheusContent<TuiDialogContext>) {
    this.dialogs.open(content, { label: 'Новое занятие', size: 'l', data: { dayIndex } }).subscribe({
      complete: () => {
        const startTimeValue = this.scheduleLessonGroup.controls.startTime.value;
        const endTimeValue = this.scheduleLessonGroup.controls.endTime.value;
        
        const startDateTime: Date = new Date(0, 0, 0, startTimeValue.hours, startTimeValue.minutes);
        const endDateTime: Date = new Date(0, 0, 0, endTimeValue.hours, endTimeValue.minutes);
        
        const scheduledLesson: ScheduledLesson = {
          day: dayIndex,
          startTime: startDateTime,
          endTime: endDateTime,
        }
        this.scheduledLessons.push(scheduledLesson);
      }
    });
  }

  protected approveLessonCancelation(lesson: LessonEntity) {
    this.dialogs.open<boolean>(
      TUI_CONFIRM,
      {
        label: 'Подтвердите действие',
        data: {
          content: `Вы действительно хотите отменить занятие с ${lesson.startTime.toLocaleTimeString()} по ${lesson.endTime.toLocaleTimeString()}?`,
          yes: 'Да',
          no: 'Отмена'
        }
      }).subscribe({ next: (next) => console.log(next) });
  }

  protected scheduleLessons(observer: any) {
    if (!this.selectedGroup) return;

    const startTimeValue = this.scheduleLessonsGroup.controls.startTime.value;
    const endTimeValue = this.scheduleLessonsGroup.controls.endTime.value;

    const startDateTime: Date = new Date(startTimeValue.year, startTimeValue.month, startTimeValue.day);
    const endDateTime: Date = new Date(endTimeValue.year, endTimeValue.month, endTimeValue.day);

    const scheduledLessonsDtos = new Array<ScheduledLessonDto>;
    
    this.scheduledLessons.forEach((item: ScheduledLesson) => {
      const lessonDto: ScheduledLessonDto = {
        day: item.day + 1,
        startTime: `${item.startTime.getHours()}:00:00`,
        endTime: `${item.endTime.getHours()}:00:00`
      };
      scheduledLessonsDtos.push(lessonDto);
    });

    const request: ScheduleBatchRequest = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      scheduledLessons: scheduledLessonsDtos
    }

    this.lessonService.scheduleGroupLessons(this.selectedGroup.id, request).subscribe({
      next: () => {
        this.alerts.open(`Занятие успешно создано`, { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        observer.complete();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
