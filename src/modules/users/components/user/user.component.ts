import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiInitialsPipe, TuiLabel, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiChip, TuiConnected } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { UserRole } from '../../../../app/shared/models/enum/user-role.enum';
import { DatePipe } from '@angular/common';
import { AgePipe } from '../../../../app/shared/pipes/age.pipe';
import { DeclensionPipe } from '../../../../app/shared/pipes/declension.pipe';
import { TransactionEntity } from '../../../../app/shared/models/entity/transaction.entity';
import { TransactionMapper } from '../../../../app/shared/models/mapper/transaction.mapper';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DepositRequest } from '../../../../app/shared/models/requests/deposit.request';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiInputModule, TuiInputNumberModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiCardLarge,
    TuiTitle,
    TuiHeader,
    TuiAvatar,
    TuiAppearance,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    TuiChip,
    BeltLevelPipe,
    BeltLevelColorPipe,
    TuiCell,
    DatePipe,
    AgePipe,
    TuiButton,
    DeclensionPipe,
    TuiCurrencyPipe,
    TuiTextfieldControllerModule,
    TuiInputNumberModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit, OnDestroy {
  
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected skeletonUser: boolean = true;
  protected skeletonTransactions: boolean = true;

  protected user: StudentEntity | UserEntity | null = null;
  protected transactions: Array<TransactionEntity> = new Array;
  protected balance: number = 0;

  private routeSub: Subscription = new Subscription;

  protected readonly depositGroup = new FormGroup({
    sum: new FormControl(0, { nonNullable: true }),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private facadeService: FacadeService
  ) {}
  
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const userId = params['id'];
      this.getUserById(userId);
      this.getStudentTransactions(userId);
      this.getStudentBalance(userId);
    })
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  protected getUserById(userId: string): void {
    this.skeletonUser = true;
    this.facadeService.getStudentById(userId).subscribe({
      next: (response) => {
        this.user = UserMapper.mapToEntity(response.data);
        this.skeletonUser = false;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getStudentTransactions(userId: string) {
    this.skeletonTransactions = true;
    this.facadeService.getStudentTransactions(userId).subscribe({
      next: (response) => {
        this.transactions = new Array;
        response.data.map((dto) => this.transactions.push(TransactionMapper.mapToEntity(dto)));
        this.skeletonTransactions = false;
        console.log(this.transactions);
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

  protected deposit(observer: any) {
    if (!this.user) return;
    
    const request: DepositRequest = {
      studentId: this.user.id,
      sum: this.depositGroup.controls.sum.value
    };

    this.facadeService.deposit(request).subscribe({
      next: () => {
        this.showAlert("Успех", "Баланс успешно пополнен", "positive", 3000);
        observer.complete();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected isStudent(user: UserEntity): boolean {
    return user.role === UserRole.STUDENT;
  }

  protected getTypeStudentEntity(user: UserEntity | StudentEntity): StudentEntity {
    return (user as StudentEntity);
  }

  protected navigateTo(routePieces: string[], queryParams: Params) {
    this.router.navigate(routePieces, queryParams);
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, size: TuiDialogSize) {
    this.dialogs.open(content, { label, size }).subscribe();
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
