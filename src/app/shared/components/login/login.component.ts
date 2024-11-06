import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TuiDialogContext, TuiDialogService, TuiError, TuiIcons, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiCopy, TuiPassword } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiError,
    TuiTextfield,
    TuiIcon,
    TuiPassword,
    TuiHeader
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected loginForm = new FormGroup({
    loginValue: new FormControl('', Validators.required),
    passwordValue: new FormControl('', Validators.required),
  });
}
