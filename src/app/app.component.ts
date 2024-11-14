import { TuiAlertService, tuiDialog, TuiRoot } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDataList,
  TuiDropdown,
} from '@taiga-ui/core';
import {
  TuiTabs,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { LoginDialogComponent } from './shared/components/login-dialog/login-dialog.component';
import { UserService } from '../modules/users/services/user.service';
import { UserEntity } from './shared/models/entity/user.entity';
import { UserMapper } from './shared/models/mapper/user.mapper';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    FormsModule,
    RouterLink,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiTabs,
      TuiRoot
],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  private readonly alerts = inject(TuiAlertService);

  protected color = false;
  protected currentUser: UserEntity | null = null;
  protected profileDropdownState = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.me().subscribe({
      next: (next) => { this.currentUser = UserMapper.mapToEntity(next.data) }
    });
  }

  private readonly dialog = tuiDialog(LoginDialogComponent, {
    dismissible: true,
  });

  protected showLoginDialog(): void {
    this.dialog(0).subscribe();
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.alerts.open(`Выполнен выход из аккаунта`, { appearance: "positive", label: "Успех", autoClose: 3000 }).subscribe();
        this.profileDropdownState = false;
        this.currentUser = null;
        this.router.navigate(['/']);
      },
      error: (error) => this.alerts.open(error.error.message, { appearance: "negative", label: "Ошибка", autoClose: 5000 }).subscribe()
    });
  }
}
