import { UserDto } from "./user.dto";

export interface StudentDto extends UserDto {
  beltLevel: string;
  birthDate: string;
  parentFullName: string;
  parentPhone: string;
}
