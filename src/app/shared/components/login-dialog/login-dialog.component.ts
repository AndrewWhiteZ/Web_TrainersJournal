import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiLabel, TuiTextfield, TuiIcon, TuiError, TuiDialogContext, TuiDataList, TuiDataListComponent, TuiSelect, TuiAlertService, TuiAlert } from '@taiga-ui/core';
import { TuiPassword, TuiFieldErrorPipe, TuiTabs, TuiDataListWrapper } from '@taiga-ui/kit';
import { SignInRequest } from '../../models/requests/sign-in-request';
import { injectContext } from '@taiga-ui/polymorpheus';
import { SignUpRequest } from '../../models/requests/sign-up-request';
import { TuiInputPhoneModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { UserService } from '../../../../modules/users/services/user.service';
import { UserRole } from '../../models/enum/user-role.enum';

export interface UserRoleSpec {
  apiName: string;
  name: string;
}

export function getUserRoleSpec(userRole: UserRole): UserRoleSpec {
  switch (userRole) {
    case UserRole.STUDENT: return { apiName: "STUDENT", name: "Учащийся" };
    case UserRole.COACH: return { apiName: "COACH", name: "Тренер" };
    case UserRole.ADMIN: return { apiName: "ADMIN", name: "Администратор" };
  }
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiTextfield,
    TuiPassword,
    TuiLabel,
    TuiIcon,
    TuiError,
    TuiFieldErrorPipe,
    TuiTabs,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiDataList,
    TuiDataListWrapper,
    TuiInputPhoneModule,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {

  public readonly context = injectContext<TuiDialogContext<null, number>>();
  protected activeTabIndex = 0;
  protected userRoles: UserRole[] = [UserRole.ADMIN, UserRole.COACH, UserRole.STUDENT];

  private readonly alerts = inject(TuiAlertService);
  private readonly userService = inject(UserService);

  protected loginForm = new FormGroup({
    phoneValue: new FormControl('88005553535'),
    loginValue: new FormControl(''),
    passwordValue: new FormControl('', Validators.required),
  });

  protected signUpForm = new FormGroup({
    loginValue: new FormControl('', Validators.required),
    fullNameValue: new FormControl('', Validators.required),
    emailValue: new FormControl('', Validators.required),
    phoneValue: new FormControl('88005553535', Validators.required),
    passwordValue: new FormControl('', Validators.required),
    roleValue: new FormControl('', Validators.required)
  });

  protected submitLogin(): void {
    const request: SignInRequest = {
      username: this.loginForm.controls.loginValue.value ?? "",
      password: this.loginForm.controls.passwordValue.value ?? "",
    };

    this.userService.login(request).subscribe({
      next: (next) => {
        this.alerts.open(`Авторизован под пользователем <b>${next.data.fullName}</b>`, { appearance: "positive", label: "Успех", autoClose: 3000 }).subscribe();
        this.context.completeWith(null);
      },
      error: (error) => 
        this.alerts.open(error.error.message, { appearance: "negative", label: "Ошибка", autoClose: 5000 }).subscribe()
    });
  }

  protected submitSignUp(): void {
    const request: SignUpRequest = {
      login: this.signUpForm.controls.loginValue.value ?? "",
      fullName: this.signUpForm.controls.fullNameValue.value ?? "",
      email: this.signUpForm.controls.emailValue.value ?? "",
      phone: this.signUpForm.controls.phoneValue.value ?? "",
      password: this.signUpForm.controls.passwordValue.value ?? "",
      role: getUserRoleSpec(this.signUpForm.controls.roleValue.value as UserRole).apiName ?? "",
    };

    this.userService.register(request).subscribe({
      next: (next) => {
        this.alerts.open(`Пользователь <b>${next.data.fullName}</b> зарегистрирован`, { appearance: "positive", label: "Успех", autoClose: 3000 }).subscribe();
        this.context.completeWith(null);
      },
      error: (error) => 
        this.alerts.open(error.error.message, { appearance: "negative", label: "Ошибка", autoClose: 5000 }).subscribe()
    });
  }

  protected reset(): void {
    this.context.completeWith(null);  
  }
}
