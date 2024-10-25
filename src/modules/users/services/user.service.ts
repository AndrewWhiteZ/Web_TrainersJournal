import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignUpRequest } from '../../../app/shared/models/requests/sign-up-request';
import { SignInRequest } from '../../../app/shared/models/requests/sign-in-request';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

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
    return this.http.get("/me");
  }

}
