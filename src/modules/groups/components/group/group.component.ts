import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, tuiDialog, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiError, TuiIcon, TuiInitialsPipe, TuiLabel, TuiScrollable, TuiScrollbar, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar, TuiBadge, TuiBadgedContent, TuiBadgeNotification, TuiConnected, TuiFieldErrorPipe, TuiItemsWithMore, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { GroupService } from '../../services/group.service';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { StudentDto } from '../../../../app/shared/models/dto/student.dto';
import { StudentMapper } from '../../../../app/shared/models/mapper/student.mapper';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiInputDateModule, TuiInputModule, TuiInputNumberModule, TuiInputTimeModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { LessonPricePeriodService } from '../../../lesson-price-period/services/lesson-price-period.service';
import { LessonPricePeriodDto } from '../../../../app/shared/models/dto/lesson-price-period.dto';
import { TuiDay } from '@taiga-ui/cdk';
import { LessonPricePeriodRequest } from '../../../../app/shared/models/requests/lesson-price-period.request';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';

@Component({
  selector: 'app-group',
  imports: [
    TuiTable,
    TuiIcon,
    TuiAvatar,
    TuiHeader,
    TuiButton,
    TuiCardLarge,
    TuiAppearance,
    TuiItemsWithMore,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiSkeleton,
    TuiCell,
    TuiBadgedContent,
    TuiBlockStatus,
    TuiAutoColorPipe,
    TuiInitialsPipe,
    TuiCurrencyPipe,
    TuiTitle,
    TuiConnected,
    TuiInputDateModule,
    TuiInputTimeModule,
    TuiInputNumberModule,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent implements OnInit, OnDestroy {

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected skeletonGroup: boolean = true;
  protected skeletonStudents: boolean = true;
  protected skeletonPrices: boolean = true;
  
  protected group: GroupEntity | null = null;
  protected students: Array<StudentEntity> = new Array;
  protected prices: Array<LessonPricePeriodDto> = new Array;

  private routeSub: Subscription = new Subscription;

  protected readonly addStudentForm = new FormGroup({
    studentValue: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
  });

  protected readonly newPriceGroup = new FormGroup({
    startDate: new FormControl(TuiDay.currentLocal(), { nonNullable: true }),
    endDate: new FormControl(TuiDay.currentLocal(), { nonNullable: true }),
    price: new FormControl(0, { nonNullable: true }),
  });

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private lessonPricePeriodService: LessonPricePeriodService,
    private facadeService: FacadeService,
    private cdr: ChangeDetectorRef
  ) {}
    
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.groupService.getGroupById(groupId).subscribe({
        next: (next) => {
          this.group = GroupMapper.mapToEntity(next.data);
          this.skeletonGroup = false;
          this.cdr.detectChanges();
          this.getStudents(groupId);
          this.getPrices(groupId);
        } ,
        error: (error) => this.alerts.open(error.error.message, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe(),
      });
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Добавить учащегося' }).subscribe();
  }

  private getStudents(groupId: string) {
    if (this.group === null) return;
    this.skeletonStudents = true;
    this.cdr.detectChanges();
    this.groupService.getGroupStudentsById(groupId).subscribe({
      next: (next) => {
        this.students = new Array;
        next.data.map((studentDto) => this.students.push(StudentMapper.mapToEntity(studentDto)));
      },
      error: (error) => {
        this.alerts.open(error.error.message, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe();
      },
      complete: () => {
        this.skeletonStudents = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getPrices(groupId: string) {
    this.skeletonPrices = true;
    this.cdr.detectChanges();
    this.lessonPricePeriodService.getPrices(groupId).subscribe({
      next: (next) => {
        this.prices = next.data;
      },
      error: (error) => {
        this.alerts.open(error.error.message, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe();
      },
      complete: () => {
        this.skeletonPrices = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  private readonly dialog = tuiDialog(ListSelectionComponent<StudentDto>, {
    dismissible: true,
    label: 'Выберите учащегося',
    size: 'fullscreen'
  });

  protected showSelectionDialog(): void {
    const observe = this.facadeService.getStudents();
    this.dialog(observe).subscribe({
      next: (next) => {
        if (next === null || this.group === null) return;
        this.groupService.addStudent(this.group.id, next.id).subscribe({
          next: () => {
            if (this.group === null) return;
            this.alerts.open('Учащийся успешно добавлен в группу', { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
            this.getStudents(this.group.id);
          },
          error: (error) => {
            this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe();
          },
        });
      }
    });
  }

  protected showNewPriceDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, size: TuiDialogSize): void {
    this.dialogs.open(content, { label, size }).subscribe();
  }

  protected approveStudentRemoving(student: StudentEntity): void {
    this.dialogs.open<boolean>(
      TUI_CONFIRM,
      {
        label: 'Подтвердите действие',
        data: {
          content: `Вы действительно хотите исключить студента <b>${student.fullName}</b> из группы?`,
          yes: 'Да',
          no: 'Отмена'
        }
      }).subscribe({ next: (next) => { if (next) { this.removeStudent(student); }}}
    );
  }

  private removeStudent(student: StudentEntity) {
    if (this.group === null) return;
    this.groupService.removeStudent(this.group.id, student.id).subscribe({
      next: () => {
        if (this.group === null) return;
        this.alerts.open('Учащийся успешно исключен из группы', { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        this.getStudents(this.group.id);
        this.cdr.detectChanges();
      },
      error: (error) => this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe(),
    });
  }

  protected addNewPrice() {
    if (this.group === null) return;
    
    const startDate = this.newPriceGroup.controls.startDate.value;
    const endDate = this.newPriceGroup.controls.endDate.value;

    const startDateTime: Date = new Date(startDate.year, startDate.month, startDate.day);
    const endDateTime: Date = new Date(endDate.year, endDate.month, endDate.day);

    const request: LessonPricePeriodRequest = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      price: this.newPriceGroup.controls.price.value
    };

    console.log(request);

    this.lessonPricePeriodService.postPrices(this.group.id, request).subscribe({
      next: () => {
        if (this.group === null) return;
        this.alerts.open('Цена успешно добавлена', { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        this.getPrices(this.group.id);
        this.cdr.detectChanges();
      },
      error: (error) => this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe(),
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
