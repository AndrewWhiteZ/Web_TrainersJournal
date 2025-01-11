import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  TuiTextfield,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiTabs,
} from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiForm, TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { UserEntity } from './shared/models/entity/user.entity';
import { FacadeService } from './shared/services/facade.service';
import { LoginDialogComponent } from './shared/components/login-dialog/login-dialog.component';
import { UserMapper } from './shared/models/mapper/user.mapper';
import { UserRole } from './shared/models/enum/user-role.enum';
import { SignInRequest } from './shared/models/requests/sign-in.request';
import { RegisterDialogComponent } from './shared/components/register-dialog/register-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterOutlet,
    TuiRoot,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    TuiAppearance,
    TuiButton,
    TuiChevron,
    TuiIcon,
    TuiCardLarge,
    TuiHeader,
    TuiBlockStatus,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
],
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  private readonly registerDialog = tuiDialog(RegisterDialogComponent, {
    dismissible: false,
  });

  protected loginForm = new FormGroup({
    loginValue: new FormControl('', Validators.required),
    passwordValue: new FormControl('', Validators.required),
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

  protected isStudent(): boolean {
    return this.currentUser?.role === UserRole.STUDENT;
  }

  protected isTrainer(): boolean {
    return this.currentUser?.role === UserRole.TRAINER;
  }

  protected isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
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
      },
      error: (response) => {
        this.showAlert("Ошибка", response.error.message, "negative", 5000);
      },
      complete: () => this.cdr.detectChanges()
    });
  }

  protected submitLogin(): void {
    const request: SignInRequest = {
      username: this.loginForm.controls.loginValue.value ?? "",
      password: this.loginForm.controls.passwordValue.value ?? "",
    };

    this.facadeService.login(request).subscribe({
      next: (response) => {
        this.currentUser = UserMapper.mapToEntity(response.data);
        this.alerts.open(`Авторизован под пользователем <b>${response.data.fullName}</b>`, { appearance: "positive", label: "Успех", autoClose: 3000 }).subscribe();
      },
      error: (response) => {
        this.showAlert("Ошибка", response.error.message, "negative", 5000);
      },
      complete: () => this.cdr.detectChanges()
    });
  }

  protected showLoginDialog() {
    this.loginDialog(0).subscribe({
      complete: () => this.me()
    });
  }

  protected showRegisterDialog() {
    this.registerDialog(null).subscribe({
      complete: () => this.me()
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number) {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
