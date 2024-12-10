import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, tuiDialog, TuiExpand, TuiInitialsPipe, TuiLabel, TuiSelect, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiChevron, TuiChip, TuiConnected, TuiDataListWrapper, TuiPagination, TuiSegmented, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
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

export type StudentTransactions = {
  student: StudentEntity,
  transactions: Array<TransactionEntity>,
  expanded: boolean,
  balance: number,
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
    TuiExpand,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    BeltLevelColorPipe,
    BeltLevelPipe,
  ],
  templateUrl: './mutual-settlements-report.component.html',
  styleUrl: './mutual-settlements-report.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutualSettlementsReportComponent implements OnInit, OnDestroy {

  private readonly alerts = inject(TuiAlertService);

  private routeSub: Subscription = new Subscription;

  protected length = 1;
  protected index = 1;

  protected skeletonTransactions: boolean = true;

  protected balance: number = 0;
  protected group: GroupEntity | null = null;
  protected student: StudentEntity | null = null;

  protected studentTransactions: Array<StudentTransactions> = new Array;
  protected transactions: Array<TransactionEntity> = new Array;

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
    select: new FormControl('Группа'),
  });

  protected readonly items = ['Группа', 'Учащийся'];

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

  protected clearSearch() {
    this.searchForm.controls.search.reset();
  }

  protected getStudent(studentId: string) {
    this.facadeService.getStudentById(studentId).subscribe({
      next: (response) => {
        this.searchForm.controls.search.setValue(response.data.fullName);
        console.log(response.data.fullName);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getStudentTransactions(studentId: string) {
    this.skeletonTransactions = true;
    this.facadeService.getStudentTransactions(studentId).subscribe({
      next: (response) => {
        this.skeletonTransactions = false;
        this.transactions = new Array;
        this.studentTransactions = new Array;
        response.data.map((dto) => this.transactions.push(TransactionMapper.mapToEntity(dto)));
        this.transactions.sort((a, b) => a.dt.getMilliseconds() - b.dt.getMilliseconds());
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getGroupTransactions(groupId: string) {
    this.skeletonTransactions = true;
    this.facadeService.getGroupTransactions(groupId).subscribe({
      next: (response) => {
        this.skeletonTransactions = false;
        this.transactions = new Array;
        this.studentTransactions = new Array;
        response.data.forEach(studentTransactionDto => {
          const transactions: Array<TransactionEntity> = new Array;
          studentTransactionDto.transactions.map((dto) => transactions.push(TransactionMapper.mapToEntity(dto)));
          transactions.sort((a, b) => a.dt.getMilliseconds() - b.dt.getMilliseconds());
          const studentTransaction: StudentTransactions = {
            student: StudentMapper.mapToEntity(studentTransactionDto.student),
            transactions: transactions,
            expanded: false,
            balance: studentTransactionDto.balance,
          };
          this.studentTransactions.push(studentTransaction);
        });
        this.transactions.sort((a, b) => a.dt.getMilliseconds() - b.dt.getMilliseconds());
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getStudentBalance(userId: string) {
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
    const type = this.searchForm.controls.select.value;
    if (type === 'Группа') {
      const observe = this.facadeService.getGroups();
      this.selectGroupDialog(observe).subscribe({
        next: (response) => {
          if (response === null) return;
          this.group = GroupMapper.mapToEntity(response);
          this.searchForm.controls.search.setValue(this.group.name);
          if (this.group) {
            this.getGroupTransactions(this.group.id); 
          }
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
