import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BillEntity } from '../../../../app/shared/models/entity/bill.entity';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, TuiDialogService, TuiExpand, TuiInitialsPipe, TuiTitle } from '@taiga-ui/core';
import { BillMapper } from '../../../../app/shared/models/mapper/bill.mapper';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { TuiAvatar, TuiBadge, TuiChip, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';
import { BillStatus } from '../../../../app/shared/models/enum/bill-status.enum';
import { TuiCurrency, TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { DatePipe } from '@angular/common';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { UserRole } from '../../../../app/shared/models/enum/user-role.enum';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [
    TuiAppearance,
    TuiCardLarge,
    TuiHeader,
    TuiSkeleton,
    TuiAutoColorPipe,
    TuiAvatar,
    TuiButton,
    TuiInitialsPipe,
    TuiChip,
    BeltLevelColorPipe,
    BeltLevelPipe,
    TuiBadge,
    TuiStatus,
    TuiCell,
    TuiTitle,
    TuiExpand,
    TuiCurrencyPipe,
    DatePipe
  ],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillComponent implements OnInit, OnDestroy {
  
  protected currentUser: UserEntity | null = null;
  
  protected skeletonBill: boolean = true;
  protected expanded: boolean = false;

  protected bill: BillEntity | null = null;
  protected blob: Blob = new Blob;
  protected imageUrl: string = "";

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  
  private routeSub: Subscription = new Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private facadeService: FacadeService
  ) {}
  
  ngOnInit(): void {
    this.facadeService.me().subscribe({
      next: (response) => this.currentUser = UserMapper.mapToEntity(response.data),
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });

    this.routeSub = this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.getBill(groupId);
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

  protected isVerified(): boolean {
    return this.bill?.status === BillStatus.VERIFIED;
  }

  protected isDeclined(): boolean {
    return this.bill?.status === BillStatus.DECLINED;
  }

  protected isPending(): boolean {
    return this.bill?.status === BillStatus.PENDING;
  }

  protected getBill(id: string) {
    this.skeletonBill = true;
    this.facadeService.getBill(id).subscribe({
      next: (response) => {
        this.bill = BillMapper.mapToEntity(response.data);
        this.skeletonBill = false;
        this.getBillPicture(this.bill.id);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected getBillPicture(billId: string) {
    if (!this.bill) return;
    this.facadeService.getBillImg(billId).subscribe({
      next: (response) => {
        var downloadURL = window.URL.createObjectURL(response);
        this.imageUrl = downloadURL;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }
  
  protected downloadReceipt() {
    if (!this.bill) return;
    this.facadeService.getBillImg(this.bill?.id).subscribe({
      next: (response) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        this.imageUrl = downloadURL;
        link.href = downloadURL;
        link.download = `receipt_${this.bill?.id}`;
        link.click();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected approveBill(billId: string) {
    this.facadeService.approveBill(billId).subscribe({
      next: (response) => {
        this.getBill(billId);
        this.showAlert("Успех", "Чек успешно утвержден", "positive", 3000);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected declineBill(billId: string) {
    this.facadeService.declineBill(billId).subscribe({
      next: (response) => {
        this.getBill(billId);
        this.showAlert("Успех", "Чек успешно отклонен", "positive", 3000);
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
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

  private showAlert(label: string, data: string, appearance: string, autoClose: number) {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
