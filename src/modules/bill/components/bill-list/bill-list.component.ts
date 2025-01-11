import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, TuiDialogContext, TuiDialogService, TuiError, TuiInitialsPipe, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiChip, TuiFieldErrorPipe, TuiFile, TuiFileLike, TuiFiles, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiInputNumberModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { BillEntity } from '../../../../app/shared/models/entity/bill.entity';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { BillMapper } from '../../../../app/shared/models/mapper/bill.mapper';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { finalize, map, Observable, of, Subject, switchMap, timer } from 'rxjs';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { UserRole } from '../../../../app/shared/models/enum/user-role.enum';
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';
import { Router } from '@angular/router';
import { BillStatus } from '../../../../app/shared/models/enum/bill-status.enum';

@Component({
  selector: 'app-bill-list',
  imports: [
    TuiAppearance,
    TuiCardLarge,
    TuiSearch,
    TuiTextfield,
    ReactiveFormsModule,
    TuiButton,
    TuiHeader,
    TuiTitle,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiInputNumberModule,
    TuiCell,
    TuiAvatar,
    TuiCurrencyPipe,
    TuiFiles,
    DatePipe,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    TuiSkeleton,
    TuiChip,
    BeltLevelPipe,
    BeltLevelColorPipe,
    TuiBadge,
    TuiStatus,
  ],
  templateUrl: './bill-list.component.html',
  styleUrl: './bill-list.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillListComponent implements OnInit {

  protected skeletonBills: boolean = true;

  protected currentUser: UserEntity | null = null;

  protected choosenFile: TuiFileLike | null = null;
  protected billList: Array<BillEntity> = new Array;

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
  });

  protected readonly uploadBillForm = new FormGroup({
    amount: new FormControl(0, { validators: [Validators.required, Validators.min(1)], nonNullable: true } ),
    file: new FormControl<TuiFileLike | null>(null, { validators: [Validators.required], nonNullable: true } ),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private facadeService: FacadeService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
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

  protected onFileChange() {
    this.choosenFile = this.uploadBillForm.controls.file.value;
  }

  protected getCurrentUser() {
    this.facadeService.me().subscribe({
      next: (response) => {
        this.currentUser = UserMapper.mapToEntity(response.data);
        if (this.currentUser.role === UserRole.STUDENT) {
          this.getMyBills();
        } else {
          this.getBills();
        }
      },
      complete: () => this.cdr.detectChanges()
    })
  }

  protected getBills() {
    this.skeletonBills = true;
    this.facadeService.getPendingBills().subscribe({
      next: (response) => {
        this.billList = new Array;
        response.data.map((dto) => this.billList.push(BillMapper.mapToEntity(dto)));
        this.skeletonBills = false;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getMyBills() {
    this.skeletonBills = true;
    this.facadeService.getMyBills().subscribe({
      next: (response) => {
        this.billList = new Array;
        response.data.map((dto) => this.billList.push(BillMapper.mapToEntity(dto)));
        this.skeletonBills = false;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected uploadBill(observer: any) {
    if (this.uploadBillForm.controls.file.value === null) return;
    
    const formData = new FormData();
    formData.append('amount', this.uploadBillForm.controls.amount.value.toString());
    formData.append('file', this.uploadBillForm.controls.file.value as File);;

    this.facadeService.uploadBill(formData).subscribe({
      next: (response) => {
        this.showAlert("Успех", 'Чек успешно загружен', "positive", 3000);
        observer.complete();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected changeRoute(route: String) {
    this.router.navigate(['bill/', route]);
  }

  protected getAppearanceByBillStatus(status: BillStatus) {
    switch (status) {
      case BillStatus.PENDING:
        return 'info'
      case BillStatus.VERIFIED:
        return 'positive'
      case BillStatus.DECLINED:
        return 'negative'
      default:
        return 'neutral'
    }
  }

  protected removeFile(): void {
    this.uploadBillForm.controls.file.setValue(null);
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Загрузка чека', dismissible: false }).subscribe();
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number) {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }

}
