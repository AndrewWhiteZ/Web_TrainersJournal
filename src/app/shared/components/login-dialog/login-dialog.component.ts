import { AsyncPipe } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import type { TuiDialogContext } from '@taiga-ui/core';
import { TuiButton, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSlider } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    TuiAmountPipe,
    TuiAutoFocus,
    TuiButton,
    TuiDataListWrapper,
    TuiSlider,
    TuiTextfield,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
  private readonly dialogs = inject(TuiDialogService);

  protected value: number | null = null;
  protected name = '';
  protected items = [10, 50, 100];

  public readonly context = injectContext<TuiDialogContext<number, number>>();

  protected get hasValue(): boolean {
    return this.value !== null;
  }

  protected get data(): number {
    return this.context.data;
  }

  protected submit(): void {
    if (this.value !== null) {
      this.context.completeWith(this.value);
    }
  }

  protected showDialog(content: TemplateRef<TuiDialogContext>): void {
    this.dialogs.open(content, { dismissible: true }).subscribe();
  }
}
