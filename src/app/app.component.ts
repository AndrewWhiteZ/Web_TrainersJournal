import { tuiDialog, TuiDialogService, TuiRoot } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import {
  TuiThemeColorService,
} from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiDataList,
  TuiDropdown,
} from '@taiga-ui/core';
import {
  TuiAvatar,
  TuiSwitch,
  TuiTabs,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { LoginDialogComponent } from './shared/components/login-dialog/login-dialog.component';
import { UserService } from '../modules/users/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    FormsModule,
    RouterLink,
    TuiAvatar,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiSwitch,
    TuiTabs,
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  
  private readonly theme = inject(TuiThemeColorService);
  private readonly dialogs = inject(TuiDialogService);
  protected color = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.authorize();
  }

  protected onColor(color: boolean): void {
    this.theme.color = color ? 'gray' : 'black';
  }

  private readonly dialog = tuiDialog(LoginDialogComponent, {
    dismissible: true,
  });

  protected showDialog(): void {
    this.dialog(0).subscribe();
  }
}
