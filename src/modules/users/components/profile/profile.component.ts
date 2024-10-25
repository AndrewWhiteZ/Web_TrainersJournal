import {KeyValuePipe, NgForOf} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {tuiAsPortal, TuiPortals, TuiRepeatTimes, TuiThemeColorService} from '@taiga-ui/cdk';
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
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.less',
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export default class ProfileComponent extends TuiPortals {
}
