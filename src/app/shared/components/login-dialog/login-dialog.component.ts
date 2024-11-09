import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSlider } from '@taiga-ui/kit';
import { TuiInputPhoneModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TuiAmountPipe,
    TuiAutoFocus,
    TuiButton,
    TuiDataListWrapper,
    TuiSlider,
    TuiTextfield,
    JsonPipe,
    TuiInputPhoneModule
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {

  protected loginForm = new FormGroup({
    phoneValue: new FormControl('88005553535', Validators.required),
    passwordValue: new FormControl('', Validators.required),
  });

}
