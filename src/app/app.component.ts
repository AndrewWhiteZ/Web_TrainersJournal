import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { tuiAsPortal, TuiPortals } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDataList,
  tuiDialog,
  TuiDropdown,
  TuiDropdownService,
  TuiIcon,
  TuiRoot,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiTabs,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { UserEntity } from './shared/models/entity/user.entity';
import { FacadeService } from './shared/services/facade.service';
import { LoginDialogComponent } from './shared/components/login-dialog/login-dialog.component';
import { UserMapper } from './shared/models/mapper/user.mapper';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    TuiAppearance,
    TuiButton,
    TuiChevron,
    TuiIcon,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiTabs,
],
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends TuiPortals implements OnInit {
  
  protected open = false;
  protected expanded = true;
  protected currentUser: UserEntity | null = null;
  protected profileDropdownState: boolean = false;

  private readonly alerts = inject(TuiAlertService);

  private readonly loginDialog = tuiDialog(LoginDialogComponent, {
    dismissible: false,
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private facadeService: FacadeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.me();
  }

  protected me() {
    this.facadeService.me().subscribe({
      next: (response) => {
        this.currentUser = UserMapper.mapToEntity(response.data);
        this.cdr.detectChanges();
      }
    });
  }

  protected logout() {
    this.facadeService.logout().subscribe({
      next: () => {
        this.showAlert("Успех", "Выполнен выход из аккаунта", "positive", 3000);
        this.profileDropdownState = false;
        this.currentUser = null;
        this.router.navigate(['/']);
        this.cdr.detectChanges();
      },
      error: (response) => {
        this.showAlert("Ошибка", response.error.message, "negative", 5000);
        this.cdr.detectChanges();
      }
    });
  }

  protected showLoginDialog() {
    this.loginDialog(0).subscribe({
      complete: () => this.me()
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number) {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
