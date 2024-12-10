import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { tuiAsPortal, TuiPortals } from '@taiga-ui/cdk';
import {
    TuiAppearance,
    TuiAutoColorPipe,
    TuiDataList,
    TuiDropdown,
    TuiDropdownService,
    TuiInitialsPipe,
    TuiTitle,
} from '@taiga-ui/core';
import {
    TuiAvatar,
    TuiTabs,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserService } from '../../services/user.service';
import { UserMapper } from '../../../../app/shared/models/mapper/user.mapper';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    TuiAppearance,
    TuiAvatar,
    TuiCardLarge,
    TuiDataList,
    TuiDropdown,
    TuiHeader,
    TuiNavigation,
    TuiTabs,
    TuiTitle,
    TuiCardLarge,
    TuiInitialsPipe,
    TuiAutoColorPipe,
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
      next: (next) => {
        this.currentUser = UserMapper.mapToEntity(next.data);
      }
    });
  }

  getUserAdditionalProperty(propertyName: string) {
    if (this.currentUser) {
      console.log(this.currentUser);
      return (this.currentUser as any)[propertyName];
    } else {
      return '';
    }
  }
}
