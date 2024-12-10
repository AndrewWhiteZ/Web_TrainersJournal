import { SignUpRequest } from "./sign-up.request";

export interface StudentSignUpRequest extends SignUpRequest {
  beltLevel: number,
  birthDate: string,
  parentFullName: string,
  parentPhone: string,
}
