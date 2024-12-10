import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, tuiDialog, TuiDialogContext, TuiDialogService, TuiInitialsPipe, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar, TuiBadgedContent, TuiCheckbox, TuiChip, TuiConfirmData, TuiSkeleton, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { StudentDto } from '../../../../app/shared/models/dto/student.dto';
import { StudentMapper } from '../../../../app/shared/models/mapper/student.mapper';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiInputDateModule, TuiInputModule, TuiInputNumberModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { LessonPricePeriodEntity } from '../../../../app/shared/models/entity/lesson-price-period.entity';
import { LessonPricePeriodMapper } from '../../../../app/shared/models/mapper/lesson-price-period.mapper';
import { LessonPricePeriodRequest } from '../../../../app/shared/models/requests/lesson-price-period.request';
import { TuiDay } from '@taiga-ui/cdk';
import { TuiAmountPipe, TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { AsyncPipe, DatePipe } from '@angular/common';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    TuiAvatar,
    TuiHeader,
    TuiButton,
    TuiCardLarge,
    TuiAppearance,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiSkeleton,
    TuiCell,
    TuiBadgedContent,
    TuiBlockStatus,
    TuiAutoColorPipe,
    TuiInitialsPipe,
    TuiInputDateModule,
    TuiInputNumberModule,
    TuiCurrencyPipe,
    TuiTabs,
    TuiTab,
    TuiSearch,
    TuiTextfield,
    TuiAmountPipe,
    AsyncPipe,
    DatePipe,
    TuiChip,
    BeltLevelColorPipe,
    BeltLevelPipe,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent implements OnInit, OnDestroy {

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  private readonly dialog = tuiDialog(ListSelectionComponent<StudentDto>, {
    dismissible: true,
    label: 'Выберите учащегося',
    size: 'fullscreen'
  });

  protected skeletonGroup: boolean = true;
  protected skeletonStudents: boolean = true;
  protected skeletonPrices: boolean = true;
  
  protected group: GroupEntity | null = null;
  protected students: Array<StudentEntity> = new Array;
  protected lessonPrices: Array<LessonPricePeriodEntity> = new Array;
  private routeSub: Subscription = new Subscription;

  protected activeTabIndex = 0;
  
  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
  });

  protected readonly addLessonPricePeriodForm = new FormGroup({
    startTime: new FormControl(TuiDay.currentLocal(), { validators: [Validators.required], nonNullable: true } ),
    endTime: new FormControl(TuiDay.currentLocal(), { validators: [Validators.required], nonNullable: true } ),
    price: new FormControl(0, { validators: [Validators.required], nonNullable: true } ),
  });

  protected readonly updateLessonPricePeriodForm = new FormGroup({
    id: new FormControl('', { validators: [Validators.required], nonNullable: true } ), 
    startTime: new FormControl(TuiDay.currentLocal(), { validators: [Validators.required], nonNullable: true } ),
    endTime: new FormControl(TuiDay.currentLocal(), { validators: [Validators.required], nonNullable: true } ),
    price: new FormControl(0, { validators: [Validators.required], nonNullable: true } ),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private facadeService: FacadeService,
  ) {}
    
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.getGroupById(groupId);
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  protected getGroupById(groupId: string): void {
    this.skeletonGroup = true;
    this.facadeService.getGroupById(groupId).subscribe({
      next: (response) => {
        this.group = GroupMapper.mapToEntity(response.data);
        this.skeletonGroup = false;
        this.getStudents(groupId);
        this.getLessonPricePeriods(groupId);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getStudents(groupId: string): void {
    if (this.group === null) return;
    this.skeletonStudents = true;
    this.cdr.detectChanges();
    this.facadeService.getGroupStudentsById(groupId).subscribe({
      next: (next) => {
        this.students = new Array;
        next.data.map((studentDto) => this.students.push(StudentMapper.mapToEntity(studentDto)));
        this.students.sort((a, b) => a.beltLevel - b.beltLevel);
      },
      error: (response) => {
        this.showAlert("Ошибка", response.error.message, "negative", 5000);
      },
      complete: () => {
        this.skeletonStudents = false;
        this.cdr.detectChanges();
      }
    });
  }

  protected getLessonPricePeriods(groupId: string): void {
    if (this.group === null) return;
    this.skeletonPrices = true;
    this.cdr.detectChanges();
    this.facadeService.getLessonPricePeriodsByGroupId(groupId).subscribe({
      next: (response) => {
        this.lessonPrices = new Array;
        response.data.map((lessonPriceDto) => this.lessonPrices.push(LessonPricePeriodMapper.mapToEntity(lessonPriceDto)));
      },
      error: (response) => {
        this.showAlert("Ошибка", response.error.message, "negative", 5000);
      },
      complete: () => {
        this.skeletonPrices = false;
        this.cdr.detectChanges();
      }
    });
  }

  protected deleteStudent(student: StudentEntity): void {
    if (this.group === null) return;
    this.facadeService.removeStudentFromGroup(this.group.id, student.id).subscribe({
      next: () => {
        if (this.group === null) return;
        this.showAlert("Успех", 'Учащийся успешно исключен из группы', "positive", 3000);
        this.getStudents(this.group.id);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected deleteLessonPricePeriod(lessonPricePeriod: LessonPricePeriodEntity): void {
    if (this.group === null) return;
    this.facadeService.deletePricePeriod(this.group.id, lessonPricePeriod.id).subscribe({
      next: () => {
        if (this.group === null) return;
        this.showAlert("Успех", 'Период цен успешно удален', "positive", 3000);
        this.getLessonPricePeriods(this.group.id);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected addLessonPricePeriod(observer: any): void {
    if (this.group === null) return;
    
    const startTimeValue = this.addLessonPricePeriodForm.controls.startTime.value;
    const endTimeValue = this.addLessonPricePeriodForm.controls.endTime.value;

    const startDateTime: Date = new Date(startTimeValue.year, startTimeValue.month, startTimeValue.day);
    const endDateTime: Date = new Date(endTimeValue.year, endTimeValue.month, endTimeValue.day);
    
    const request: LessonPricePeriodRequest = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      price: this.addLessonPricePeriodForm.controls.price.value,
    };

    this.facadeService.addLessonPricePeriod(this.group.id, request).subscribe({
      next: () => {
        if (this.group === null) return;
        this.showAlert("Успех", `Цена успешно добавлена`, "positive", 3000);
        observer.complete();
        this.getLessonPricePeriods(this.group.id);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected updateLessonPricePeriod(observer: any): void {
    if (this.group === null) return;
    
    const startTimeValue = this.updateLessonPricePeriodForm.controls.startTime.value;
    const endTimeValue = this.updateLessonPricePeriodForm.controls.endTime.value;

    const startDateTime: Date = new Date(startTimeValue.year, startTimeValue.month, startTimeValue.day);
    const endDateTime: Date = new Date(endTimeValue.year, endTimeValue.month, endTimeValue.day);
    
    const request: LessonPricePeriodRequest = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      price: this.updateLessonPricePeriodForm.controls.price.value,
    };

    this.facadeService.updatePricePeriod(this.group.id, this.updateLessonPricePeriodForm.controls.id.value, request).subscribe({
      next: () => {
        if (this.group === null) return;
        this.showAlert("Успех", `Цена успешно изменена`, "positive", 3000);
        observer.complete();
        this.getLessonPricePeriods(this.group.id);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, data?: Object): void {
    this.dialogs.open(content, { label }).subscribe();
  }

  protected showLessonPricePeriodUpdateDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, lessonPricePeriod: LessonPricePeriodEntity) {
    this.updateLessonPricePeriodForm.controls.id.setValue(lessonPricePeriod.id);
    this.updateLessonPricePeriodForm.controls.startTime.setValue(TuiDay.fromLocalNativeDate(lessonPricePeriod.startTime));
    this.updateLessonPricePeriodForm.controls.endTime.setValue(TuiDay.fromLocalNativeDate(lessonPricePeriod.endTime));
    this.updateLessonPricePeriodForm.controls.price.setValue(lessonPricePeriod.price);
    this.showDialog(content, label);
  }

  protected showSelectionDialog(): void {
    const observe = this.facadeService.getStudents();
    this.dialog(observe).subscribe({
      next: (next) => {
        if (next === null || this.group === null) return;
        this.facadeService.addStudentToGroup(this.group.id, next.id).subscribe({
          next: () => {
            if (this.group === null) return;
            this.showAlert("Успех", 'Учащийся успешно добавлен в группу', "positive", 3000);
            this.getStudents(this.group.id);
          },
          error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
          complete: () => this.cdr.detectChanges()
        });
      }
    });
  }

  protected approveStudentDeletion(student: StudentEntity): void {
    const data: TuiConfirmData = { content: `Вы действительно хотите исключить студента <b>${student.fullName}</b> из группы?`, yes: 'Да', no: 'Отмена' };
    this.dialogs.open<boolean>(TUI_CONFIRM, { label: 'Подтвердите действие', size: 's', data }).subscribe({
      next: (response) => { if (response) this.deleteStudent(student) }
    });
  }

  protected approveLessonPricePeriodDeletion(lessonPricePeriod: LessonPricePeriodEntity): void {
    const data: TuiConfirmData = { content: `Вы действительно хотите удалить период цены?\nЭто может привести к необходимости перерасчета баланса учащихся`, yes: 'Да', no: 'Отмена' };
    this.dialogs.open<boolean>(TUI_CONFIRM, { label: 'Подтвердите действие', size: 'm', data }).subscribe({
      next: (response) => { if (response) this.deleteLessonPricePeriod(lessonPricePeriod) }
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
