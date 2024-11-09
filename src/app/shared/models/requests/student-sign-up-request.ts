import { SignUpRequest } from "./sign-up-request";

export interface StudentSignUpRequest extends SignUpRequest {
  birthDate: string,
  parentFullName: string,
  parentPhone: string,
}
