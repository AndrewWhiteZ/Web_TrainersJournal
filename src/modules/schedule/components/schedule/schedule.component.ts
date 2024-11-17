import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiAppearance, TuiButton, tuiDateFormatProvider, tuiDialog, TuiDialogContext, TuiDialogService, TuiError, TuiNotification, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiConnected, TuiDataListWrapper, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputModule, TuiInputTimeModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { LessonService } from '../../services/lesson.service';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { GroupDto } from '../../../../app/shared/models/dto/group.dto';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { AsyncPipe } from '@angular/common';
import { TuiInputDateTimeModule } from '@taiga-ui/legacy';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { ScheduleLessonRequest } from '../../../../app/shared/models/requests/schedule-lesson.request';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';

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
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })]
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

  protected selectedGroup: GroupEntity | null = null;

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

  private readonly dialog = tuiDialog(ListSelectionComponent<GroupDto>, {
    dismissible: true,
    label: 'Выберите группу',
    size: 'fullscreen',
    required: true
  });

  protected showSelectionDialog(): void {
    const observe = this.facadeService.getGroups();
    this.dialog(observe).subscribe({
      next: (next) => {
        this.selectedGroup = next ? GroupMapper.mapToEntity(next) : null;
        this.searchForm.controls.search.setValue(this.selectedGroup?.name);
      }
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Новое занятие' }).subscribe();
  }

  protected createLesson(observer: any) {

    if (!this.selectedGroup) {
      return;
    }

    const dateValue = this.createLessonGroup.controls.date.value;
    const startTimeValue = this.createLessonGroup.controls.startTime.value;
    const endTimeValue = this.createLessonGroup.controls.endTime.value;

    const startDateTime: Date = new Date(dateValue?.toLocalNativeDate().getMilliseconds() + startTimeValue.toAbsoluteMilliseconds());
    const endDateTime: Date = new Date(dateValue?.toLocalNativeDate().getMilliseconds() + endTimeValue.toAbsoluteMilliseconds());
    
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
}
