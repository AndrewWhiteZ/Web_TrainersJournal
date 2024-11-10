import { UserDto } from "../dto/user.dto";
import { UserEntity } from "../entity/user.entity";
import { UserRole } from "../enum/user-role.enum";

export class UserMapper {

  public static mapToEntity(dto: UserDto): UserEntity {
    return {
      id: dto.id,
      fullName: dto.fullName,
      login: dto.login,
      email: dto.email,
      phone: dto.phone,
      role: UserRole[dto.role as keyof typeof UserRole],
      beltLevel: null,
      birthDate: null,
      parentFullName: null,
      parentPhone: null,
    }
  }

}
