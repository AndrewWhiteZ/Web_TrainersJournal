import { SignUpRequest } from "./sign-up-request";

export interface StudentSignUpRequest extends SignUpRequest {
  birthDate: String,
  parentFullName: String,
  parentPhone: String
}
