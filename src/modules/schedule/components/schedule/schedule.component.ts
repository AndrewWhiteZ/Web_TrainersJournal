import { ChangeDetectionStrategy, Component, inject, LOCALE_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiAppearance, TuiButton, tuiDateFormatProvider, tuiDialog, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiError, TuiIcon, TuiNotification, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBadgedContent, TuiConnected, TuiDataListWrapper, TuiFieldErrorPipe, TuiTabs, TUI_CONFIRM } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputModule, TuiInputTimeModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { LessonService } from '../../services/lesson.service';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { GroupDto } from '../../../../app/shared/models/dto/group.dto';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { AsyncPipe, DatePipe } from '@angular/common';
import { TuiInputDateTimeModule } from '@taiga-ui/legacy';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { ScheduleLessonRequest } from '../../../../app/shared/models/requests/schedule-lesson.request';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { LessonEntity } from '../../../../app/shared/models/entity/lesson.entity';
import { LessonMapper } from '../../../../app/shared/models/mapper/lesson.mapper';

type ScheduledLesson = {
  day: number,
  startTime: TuiTime,
  endTime: TuiTime,
}

type LessonByDay = {
  day: Date,
  lessons: Array<LessonEntity>,
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiAvatar,
    TuiCardLarge,
    TuiCell,
    TuiDataListWrapper,
    TuiTextfield,
    TuiNotification,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiTitle,
    TuiConnected,
    TuiInputModule,
    TuiSearch,
    TuiError,
    AsyncPipe,
    TuiFieldErrorPipe,
    TuiButton,
    TuiInputDateModule,
    TuiInputTimeModule,
    TuiBlockStatus,
    TuiHeader,
    TuiIcon,
    TuiTabs,
    TuiBadge,
    TuiBadgedContent,
    DatePipe,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class ScheduleComponent {
  
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  
  protected readonly items = [
    {
        icon: '@tui.eye',
        title: 'Show more',
        subtitle: 'Ctrl + Shift + M',
    },
    {
        icon: '@tui.mail',
        title: 'Send message',
        subtitle: 'Keep it short',
    },
    {
        icon: '@tui.lock',
        title: 'Access',
        subtitle: 'Block your account',
    },
  ];

  protected value = this.items[0]!;

  protected lessons: Array<LessonEntity> = new Array;
  protected lessonsByDays: Array<LessonByDay> = new Array;
  protected selectedGroup: GroupEntity | null = null;

  protected sheduledLessons: Array<ScheduledLesson> = new Array;
  protected activeDayIndex: number = 0;

  constructor(
    private facadeService: FacadeService,
    private lessonService: LessonService
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

  private readonly dialog = tuiDialog(ListSelectionComponent<GroupDto>, {
    dismissible: true,
    label: 'Выберите группу',
    size: 'fullscreen'
  });

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
      }
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, size: TuiDialogSize): void {
    this.dialogs.open(content, { label, size }).subscribe();
  }

  protected createLesson(observer: any) {
    
    if (!this.selectedGroup) {
      return;
    }

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
        this.alerts.open(`Занятие успешно создано`, { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        observer.complete();
      },
      error: (error) => this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe()
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
        console.log(this.lessonsByDays);
      }
    });
  }

  protected addLesson(dayIndex: number) {
    const lesson: ScheduledLesson = {
      day:  dayIndex,
      startTime: TuiTime.currentLocal(),
      endTime: TuiTime.currentLocal(),
    };
    this.sheduledLessons.push(lesson);
  }

  protected approveLessonCancelation(lesson: LessonEntity) {
    this.dialogs.open<boolean>(
      TUI_CONFIRM,
      {
        label: 'Подтвердите действие',
        data: {
          content: `Вы действительно хотите отменить занятие с ${lesson.startTime.toLocaleString()} по ${lesson.endTime.toLocaleString()}?`,
          yes: 'Да',
          no: 'Отмена'
        }
      }).subscribe({ next: (next) => console.log(next) });
  }
}
