import { UserRole } from "../enum/user-role.enum";

export interface UserEntity {
  id: string;
  fullName: string;
  login: string;
  email: string;
  phone: string;
  role: UserRole;
}
