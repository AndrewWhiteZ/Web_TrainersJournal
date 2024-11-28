import { TuiAlertService, tuiDateFormatProvider, tuiDialog, TuiRoot } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { registerLocaleData } from '@angular/common';
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
import localeRu from '@angular/common/locales/ru';
registerLocaleData(localeRu);

@Component({
  selector: 'app-root',
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
  providers: [
    tuiDateFormatProvider({ mode: 'DMY', separator: '.' }),
    { provide: LOCALE_ID, useValue: 'ru-RU' },
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  private readonly alerts = inject(TuiAlertService);

  protected color = false;
  protected currentUser: UserEntity | null = null;
  protected profileDropdownState = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.me();
  }

  private me() {
    this.userService.me().subscribe({
      next: (next) => {
        this.currentUser = UserMapper.mapToEntity(next.data);
        this.cdr.detectChanges();
      }
    });
  }

  private readonly dialog = tuiDialog(LoginDialogComponent, {
    dismissible: true,
  });

  protected showLoginDialog(): void {
    this.dialog(0).subscribe({
      complete: () => this.me()
    });
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.alerts.open(`Выполнен выход из аккаунта`, { appearance: "positive", label: "Успех", autoClose: 3000 }).subscribe();
        this.profileDropdownState = false;
        this.currentUser = null;
        this.router.navigate(['/']);
        this.cdr.detectChanges();
      },
      error: (error) => this.alerts.open(error.error.message, { appearance: "negative", label: "Ошибка", autoClose: 5000 }).subscribe()
    });
  }
}
