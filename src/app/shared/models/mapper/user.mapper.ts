import { StudentDto } from "../dto/student.dto";
import { UserDto } from "../dto/user.dto";
import { StudentEntity } from "../entity/student.entity";
import { UserEntity } from "../entity/user.entity";
import { UserRole } from "../enum/user-role.enum";

export class UserMapper {

  public static mapToEntity(dto: UserDto | StudentDto): UserEntity | StudentEntity {

    const common: UserEntity = {
      id: dto.id,
      fullName: dto.fullName,
      login: dto.login,
      email: dto.email,
      phone: dto.phone,
      role: UserRole[dto.role as keyof typeof UserRole],
    }

    switch (common.role) {
      case UserRole.ADMIN:
        return common;
      case UserRole.TRAINER:
        return common;
      case UserRole.STUDENT:
        return this.mapToStudentEntity(common, dto as StudentDto);
      default:
        return common;
    }
  }

  public static mapToStudentEntity(userEntity: UserEntity, dto: StudentDto): StudentEntity {
    return {
      ...userEntity,
      beltLevel: Number(dto.beltLevel),
      birthDate: new Date(dto.birthDate),
      parentFullName: dto.parentFullName,
      parentPhone: dto.parentPhone,
    }
  }
}
