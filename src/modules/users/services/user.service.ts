import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignUpRequest } from '../../../app/shared/models/requests/sign-up-request';
import { SignInRequest } from '../../../app/shared/models/requests/sign-in-request';
import { UserEntity } from '../../../app/shared/models/entity/user.entity';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { UserDto } from '../../../app/shared/models/dto/user.dto';
import { UserMapper } from '../../../app/shared/models/mapper/user.mapper';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  currentUser: UserEntity | null = null;

  public authorize() {
    this.me().subscribe({
      next: (next) => {
        this.currentUser = UserMapper.mapToEntity(next.data)
      },
    })
  }  
  public register(body: SignUpRequest) {
    return this.http.post("/register", body);
  }

  public login(body: SignInRequest) {
    return this.http.post("/login", body);
  }

  public logout() {
    return this.http.post("/logout", null);
  }

  public me() {
    return this.http.get<ApiResponse<UserDto>>("/me");
  }

}
