import { Routes } from '@angular/router';
import ProfileComponent from '../modules/users/components/profile/profile.component';
import { GroupListComponent } from '../modules/groups/components/group-list/group-list.component';
import { UserListComponent } from '../modules/users/components/user-list/user-list.component';
import { GroupComponent } from '../modules/groups/components/group/group.component';
import { ScheduleComponent } from '../modules/schedule/components/schedule/schedule.component';
import { UserComponent } from '../modules/users/components/user/user.component';
import { MutualSettlementsReportComponent } from '../modules/mutual-settlements-report/components/mutual-settlements-report/mutual-settlements-report.component';
import { BillComponent } from '../modules/bill/components/bill/bill.component';
import { BillListComponent } from '../modules/bill/components/bill-list/bill-list.component';
import { AttendanceReportComponent } from '../modules/attendance-report/components/attendance-report/attendance-report.component';

export const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'groups', component: GroupListComponent },
  { path: 'users', component: UserListComponent },
  { path: 'bills', component: BillListComponent },
  { path: 'user/:id', component: UserComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'group/:id', component: GroupComponent },
  { path: 'bill/:id', component: BillComponent },
  { path: 'reports/mutual-settlements', component: MutualSettlementsReportComponent },
  { path: 'reports/attendance', component: AttendanceReportComponent },
  { path: '**', redirectTo: '', }
];
