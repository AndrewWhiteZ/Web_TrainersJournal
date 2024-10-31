import { Routes } from '@angular/router';
import ProfileComponent from '../modules/users/components/profile/profile.component';
import { LoginComponent } from './shared/components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent }  
];
