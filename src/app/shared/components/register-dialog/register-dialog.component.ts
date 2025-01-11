import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDialogContext, TuiError, TuiIcon, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiFieldErrorPipe, TuiPassword, TuiRadio, TuiRadioList, TuiStepper, TuiTabs } from '@taiga-ui/kit';
import { TuiInputDateModule, TuiInputModule, TuiInputNumberModule, TuiInputPhoneModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { SignUpRequest } from '../../models/requests/sign-up.request';
import { UserRole } from '../../models/enum/user-role.enum';
import { FacadeService } from '../../services/facade.service';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface UserRoleSpec {
  apiName: string;
  name: string;
}

export function getUserRoleSpec(userRole: UserRole): UserRoleSpec {
  switch (userRole) {
    case UserRole.STUDENT: return { apiName: "STUDENT", name: "Учащийся" };
    case UserRole.TRAINER: return { apiName: "TRAINER", name: "Тренер" };
    case UserRole.ADMIN: return { apiName: "ADMIN", name: "Администратор" };
  }
}

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TuiButton,
    TuiDataListWrapper,
    TuiError,
    TuiFieldErrorPipe,
    TuiInputDateModule,
    TuiInputModule,
    TuiInputNumberModule,
    TuiInputPhoneModule,
    TuiLabel,
    TuiRadio,
    TuiSelectModule,
    TuiStepper,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiPassword,
    TuiTabs,
    TuiIcon,
    TuiRadioList,
  ],
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDialogComponent {

  public readonly context = injectContext<TuiDialogContext<null, null>>();
  private readonly alerts = inject(TuiAlertService);
  private readonly facadeService = inject(FacadeService);

  protected userRoles: UserRole[] = [UserRole.ADMIN, UserRole.TRAINER];

  protected signUpForm = new FormGroup({
    login: new FormControl('', Validators.required),
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    phone: new FormControl('88005553535', Validators.required),
    password: new FormControl('', Validators.required),
    role: new FormControl(UserRole.ADMIN, Validators.required),
  });

  protected submitSignUp(): void {
    const request: SignUpRequest = {
      login: this.signUpForm.controls.login.value ?? "",
      fullName: this.signUpForm.controls.fullName.value ?? "",
      email: this.signUpForm.controls.email.value ?? "",
      phone: this.signUpForm.controls.phone.value ?? "",
      password: this.signUpForm.controls.password.value ?? "",
      role: getUserRoleSpec(this.signUpForm.controls.role.value as UserRole).apiName ?? "TRAINER",
    };

    this.facadeService.register(request).subscribe({
      next: (response) => {
        this.showAlert('Успех', `Пользователь <b>${response.data.fullName}</b> зарегистрирован`, 'positive', 3000);
        this.context.completeWith(null);
      },
      error: (response) => this.showAlert('Ошибка', response.error.message, 'negative', 5000)
    });
  }

  protected reset(): void {
    this.context.completeWith(null);  
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
