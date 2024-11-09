import { UserEntity } from "./user.entity";

export interface StudentEntity extends UserEntity {
  beltLevel: number,
  birthDate: Date,
  parentFullName: string,
  parentPhone: string,
}
