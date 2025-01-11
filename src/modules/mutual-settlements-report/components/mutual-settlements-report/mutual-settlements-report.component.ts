import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, tuiDialog, TuiExpand, TuiInitialsPipe, TuiScrollbar, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiChip, TuiConnected, TuiDataListWrapper, TuiPagination, TuiSegmented, TuiSkeleton, TuiStatus, TuiTabs } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WaIntersectionObserver } from '@ng-web-apis/intersection-observer';
import { TuiInputDateTimeModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiTable } from '@taiga-ui/addon-table';
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { GroupDto } from '../../../../app/shared/models/dto/group.dto';
import { StudentDto } from '../../../../app/shared/models/dto/student.dto';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { StudentMapper } from '../../../../app/shared/models/mapper/student.mapper';
import { TransactionEntity } from '../../../../app/shared/models/entity/transaction.entity';
import { TransactionMapper } from '../../../../app/shared/models/mapper/transaction.mapper';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { DatePipe } from '@angular/common';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';
import { TuiDay, TuiLet, TuiTime } from '@taiga-ui/cdk';
import { TransactionType } from '../../../../app/shared/models/enum/transaction-type.enum';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { UserRole } from '../../../../app/shared/models/enum/user-role.enum';

export type Transaction = {
  id: string,
  type: TransactionType,
  datetime: Date,
  startBalance: number,
  income: number,
  outcome: number,
  endBalance: number,
}

export type StudentTransactions = {
  student: StudentEntity,
  transactions: Array<Transaction>,
  expanded: boolean,
  startBalance: number,
  endBalance: number,
}

@Component({
  selector: 'app-mutual-settlements-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiCardLarge,
    TuiAppearance,
    TuiConnected,
    TuiTitle,
    TuiHeader,
    TuiTextfieldControllerModule,
    TuiSegmented,
    TuiSkeleton,
    TuiPagination,
    TuiCell,
    TuiAvatar,
    TuiButton,
    TuiDataListWrapper,
    TuiTextfield,
    TuiSearch,
    TuiCurrencyPipe,
    DatePipe,
    TuiBadge,
    TuiStatus,
    TuiChip,
    TuiLet,
    TuiExpand,
    TuiInputDateTimeModule,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    TuiScrollbar,
    TuiTable,
    BeltLevelColorPipe,
    BeltLevelPipe,
    WaIntersectionObserver,
  ],
  templateUrl: './mutual-settlements-report.component.html',
  styleUrl: './mutual-settlements-report.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutualSettlementsReportComponent implements OnInit, OnDestroy {

  private readonly alerts = inject(TuiAlertService);

  protected currentUser: UserEntity | null = null;

  private routeSub: Subscription = new Subscription;

  protected length = 1;
  protected index = 1;

  protected activeTab = 0;

  protected skeletonTransactions: boolean = true;

  protected balance: number = 0;
  protected group: GroupEntity | null = null;
  protected student: StudentEntity | null = null;

  protected studentTransactions: Array<StudentTransactions> = new Array;
  protected studentTransaction: StudentTransactions | null = null;

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
    select: new FormControl('Группа'),
    startDate: new FormControl([TuiDay.currentLocal().append({ month: -1 }), new TuiTime(0, 0, 0)], { nonNullable: true }),
    endDate: new FormControl([TuiDay.currentLocal(), new TuiTime(0, 0, 0)], { nonNullable: true }),
  });

  protected readonly items = ['Группа', 'Учащийся'];
  protected readonly groupTableColumns = ['date', 'type', 'startSum', 'income', 'outcome', 'endSum'] as const;
  protected readonly columns = ['date', 'type', 'startSum', 'income', 'outcome', 'endSum'] as const;

  private selectGroupDialog = tuiDialog(ListSelectionComponent<GroupDto>, {
    dismissible: true,
    label: 'Выберите группу',
    size: 'fullscreen'
  });

  private selectStudentDialog = tuiDialog(ListSelectionComponent<StudentDto>, {
    dismissible: true,
    label: 'Выберите учащегося',
    size: 'fullscreen'
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private facadeService: FacadeService,
  ) {}
  
  ngOnInit(): void {
    this.facadeService.me().subscribe({
      next: (response) => {
        this.currentUser = UserMapper.mapToEntity(response.data);
        if (this.isStudent()) {
          this.student = StudentMapper.mapToEntity(response.data as StudentDto);
          this.searchForm.controls.select.setValue('Учащийся');
          this.searchForm.controls.search.setValue(this.currentUser.fullName);
          this.getStudentTransactions(this.student.id);
          this.getStudentBalance(this.student.id);
        }
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });

    this.routeSub = this.route.queryParams.subscribe(params => {
      const groupId = params['groupId'];
      const studentId = params['studentId'];

      if (groupId) {
        this.searchForm.controls.select.setValue('Группа');
      } else if (studentId) {
        this.searchForm.controls.select.setValue('Учащийся');
        this.getStudent(studentId);
        this.getStudentTransactions(studentId);
        this.getStudentBalance(studentId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
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

  protected clearSearch(): void {
    this.searchForm.controls.search.reset();
  }

  protected getStudent(studentId: string): void {
    this.facadeService.getStudentById(studentId).subscribe({
      next: (response) => {
        this.searchForm.controls.search.setValue(response.data.fullName);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getStudentTransactions(studentId?: string): void {
    if (!studentId) return;
    
    this.skeletonTransactions = true;

    const startDateValue = this.searchForm.controls.startDate.value[0] as TuiDay;
    const startTimeValue = this.searchForm.controls.startDate.value[1] as TuiTime;
    const endDateValue = this.searchForm.controls.endDate.value[0] as TuiDay;
    const endTimeValue = this.searchForm.controls.endDate.value[1] as TuiTime;
    
    const startDateTime: Date = new Date(startDateValue.year, startDateValue.month, startDateValue.day, startTimeValue.hours, startTimeValue.minutes, startTimeValue.seconds);
    const endDateTime: Date = new Date(endDateValue.year, endDateValue.month, endDateValue.day, endTimeValue.hours, endTimeValue.minutes, endTimeValue.seconds);

    this.facadeService.getStudentTransactions(studentId, startDateTime.toISOString(), endDateTime.toISOString()).subscribe({
      next: (response) => {

        this.skeletonTransactions = false;
        
        this.studentTransaction = null;
        this.studentTransactions = new Array;

        this.student = StudentMapper.mapToEntity(response.data.student);

        const transactions: Array<TransactionEntity> = new Array;
        response.data.transactions.map((dto) => transactions.push(TransactionMapper.mapToEntity(dto)));
        transactions.sort((a, b) => a.dt.getTime() - b.dt.getTime());

        let currentBalance: number = response.data.startBalance;

        const transacts: Array<Transaction> = new Array;
        transactions.forEach(item => {
          const transact: Transaction = {
            id: item.id,
            datetime: item.dt,
            type: item.type,
            startBalance: currentBalance,
            endBalance: currentBalance + item.sum,
            income: item.type === TransactionType.DEPOSIT ? item.sum : 0,
            outcome: item.type === TransactionType.LESSON_PAYMENT ? -item.sum : 0,
          };
          currentBalance = currentBalance + item.sum;
          transacts.push(transact);
        });
        
        this.studentTransaction = {
          student: StudentMapper.mapToEntity(response.data.student),
          transactions: transacts,
          expanded: false,
          startBalance: response.data.startBalance,
          endBalance: response.data.endBalance,
        };
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getGroupTransactions(groupId?: string): void {
    if (!groupId) return;
    this.skeletonTransactions = true;

    const startDateValue = this.searchForm.controls.startDate.value[0] as TuiDay;
    const startTimeValue = this.searchForm.controls.startDate.value[1] as TuiTime;
    const endDateValue = this.searchForm.controls.endDate.value[0] as TuiDay;
    const endTimeValue = this.searchForm.controls.endDate.value[1] as TuiTime;
    
    const startDateTime: Date = new Date(startDateValue.year, startDateValue.month, startDateValue.day, startTimeValue.hours, startTimeValue.minutes, startTimeValue.seconds);
    const endDateTime: Date = new Date(endDateValue.year, endDateValue.month, endDateValue.day, endTimeValue.hours, endTimeValue.minutes, endTimeValue.seconds); 

    this.facadeService.getGroupTransactions(groupId, startDateTime.toISOString(), endDateTime.toISOString()).subscribe({
      next: (response) => {
        this.skeletonTransactions = false;

        this.studentTransaction = null;
        this.studentTransactions = new Array;

        response.data.forEach(studentTransactionDto => {
          const transactions: Array<TransactionEntity> = new Array;
          studentTransactionDto.transactions.map((dto) => transactions.push(TransactionMapper.mapToEntity(dto)));
          transactions.sort((a, b) => a.dt.getTime() - b.dt.getTime());

          let currentBalance: number = studentTransactionDto.startBalance;

          const transacts: Array<Transaction> = new Array;
          transactions.forEach(item => {
            const transact: Transaction = {
              id: item.id,
              datetime: item.dt,
              type: item.type,
              startBalance: currentBalance,
              endBalance: currentBalance + item.sum,
              income: item.type === TransactionType.DEPOSIT ? item.sum : 0,
              outcome: item.type === TransactionType.LESSON_PAYMENT ? -item.sum : 0,
            };
            currentBalance = currentBalance + item.sum;
            transacts.push(transact);
          });

          console.log(transacts);

          const studentTransaction: StudentTransactions = {
            student: StudentMapper.mapToEntity(studentTransactionDto.student),
            transactions: transacts,
            expanded: false,
            startBalance: studentTransactionDto.startBalance,
            endBalance: studentTransactionDto.endBalance,
          };
          this.studentTransactions.push(studentTransaction);
        });
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getStudentBalance(userId: string): void {
    this.skeletonTransactions = true;
    this.facadeService.getStudentBalance(userId).subscribe({
      next: (response) => {
        this.balance = response.data;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getTransactionBalance(value: number): string {
    if (value > 0) {
      return 'positive';
    } else if (value < 0) {
      return 'negative';
    } else {
      return '';
    }
  }

  protected getBalanceAppearance(value: number): string {
    if (value > 0) {
      return 'var(--tui-text-positive)';
    } else if (value < 0) {
      return 'var(--tui-text-negative)';
    } else {
      return '';
    }
  }

  protected showSelectionDialog(): void {
    if (this.isStudent()) return;
    let observe;
    const type = this.searchForm.controls.select.value;
    if (type === 'Группа') {
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
    } else if (type === 'Учащийся') {
      const observe = this.facadeService.getStudents();
      this.selectStudentDialog(observe).subscribe({
        next: (response) => {
          if (response === null) return;
          this.student = StudentMapper.mapToEntity(response);
          this.searchForm.controls.search.setValue(this.student.fullName);
          if (this.student) {
            this.getStudentTransactions(this.student.id);
            this.getStudentBalance(this.student.id);
          }
        },
        error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
        complete: () => this.cdr.detectChanges()
      });
    }
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
