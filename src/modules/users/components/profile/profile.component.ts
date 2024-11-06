import {KeyValuePipe, NgForOf} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {tuiAsPortal, TuiPortals, TuiRepeatTimes} from '@taiga-ui/cdk';
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
import {TuiCardLarge, TuiHeader, TuiNavigation} from '@taiga-ui/layout';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
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
    TuiCardLarge
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.less',
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export default class ProfileComponent extends TuiPortals {
  name: String = "Surname Name Patronymic";
  phone: String = "+7 (123) 456-78-90";
  group: String = "ГД-000001";
  gender: String = "Мужской";
  belt: String = "Желтый";
  parentPhone: String = "8 (800) 555-35-35";
  parentFullName: String = "Surname Name Patronymic";
}
