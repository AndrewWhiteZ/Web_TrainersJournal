import { Injectable } from '@angular/core';
import { UserService } from '../../../modules/users/services/user.service';
import { SignUpRequest } from '../models/requests/sign-up-request';
import { SignInRequest } from '../models/requests/sign-in-request';

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  constructor(private userService: UserService) {}

  public register(body: SignUpRequest) {
    return this.userService.register(body);
  }

  public login(body: SignInRequest) {
    return this.userService.login(body);
  }

  public logout() {
    return this.userService.logout();
  }

  public me() {
    return this.userService.me();
  }

}
