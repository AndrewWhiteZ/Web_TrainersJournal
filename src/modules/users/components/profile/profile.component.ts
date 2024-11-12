import {AsyncPipe, KeyValuePipe, NgForOf} from '@angular/common';
import {Component, OnInit} from '@angular/core';
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
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserService } from '../../services/user.service';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { Observable } from 'rxjs';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';

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
    TuiCardLarge,
    AsyncPipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.less',
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export default class ProfileComponent extends TuiPortals implements OnInit {
  
  protected currentUser: UserEntity | StudentEntity | null = null;

  constructor(private userService: UserService) {
    super();
  }

  ngOnInit(): void {
    this.userService.me().subscribe({
      next: (next) => { this.currentUser = UserMapper.mapToEntity(next.data) }
    });
  }

  getUserAdditionalProperty(propertyName: string) {
    if (this.currentUser) {
      return (this.currentUser as any)[propertyName];
    } else {
      return '';
    }
  }
}
