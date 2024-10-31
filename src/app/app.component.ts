import { TUI_DIALOGS_CLOSE, tuiDialog, TuiDialogService, TuiRoot } from '@taiga-ui/core';
import { KeyValuePipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import ProfileComponent from '../modules/users/components/profile/profile.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  tuiAsPortal,
  TuiPortals,
  TuiRepeatTimes,
  TuiThemeColorService,
} from '@taiga-ui/cdk';
import {
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiDropdownService,
  TuiIcon,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiAvatar,
  TuiBadge,
  TuiBadgeNotification,
  TuiChevron,
  TuiDataListDropdownManager,
  TuiFade,
  TuiSwitch,
  TuiTabs,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { LoginDialogComponent } from './shared/components/login-dialog/login-dialog.component';
import {PolymorpheusComponent} from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    ProfileComponent,
    FormsModule,
    KeyValuePipe,
    NgForOf,
    RouterLink,
    RouterLinkActive,
    TuiAppearance,
    TuiAvatar,
    TuiBadge,
    TuiBadgeNotification,
    TuiButton,
    TuiCardLarge,
    TuiChevron,
    TuiDataList,
    TuiDataListDropdownManager,
    TuiDropdown,
    TuiFade,
    TuiHeader,
    TuiIcon,
    TuiNavigation,
    TuiRepeatTimes,
    TuiSwitch,
    TuiTabs,
    TuiTitle,
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly theme = inject(TuiThemeColorService);
  private readonly dialogs = inject(TuiDialogService);
  protected color = false;

  protected onColor(color: boolean): void {
    this.theme.color = color ? 'gray' : 'black';
  }

  private readonly dialog = tuiDialog(LoginDialogComponent, {
    dismissible: true,
    label: 'Heading',
  });

  protected showDialog(): void {
    this.dialogs.open('Hello!').subscribe();
  }

  // protected showDialog(): void {
  //   console.log(21);
  //   this.dialog(21).subscribe({
  //     next: (data) => {
  //       console.info(`Dialog emitted data = ${data}`);
  //     },
  //     complete: () => {
  //       console.info('Dialog closed');
  //     },
  //   });
  // }
}
