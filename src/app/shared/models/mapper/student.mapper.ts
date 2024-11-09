import { StudentDto } from "../dto/student.dto";
import { StudentEntity } from "../entity/student.entity";
import { UserRole } from "../enum/user-role.enum";

export class StudentMapper {

  public static mapToEntity(dto: StudentDto): StudentEntity {
    return {
      id: dto.id,
      fullName: dto.fullName,
      login: dto.login,
      email: dto.email,
      phone: dto.phone,
      role: UserRole[dto.role as keyof typeof UserRole],
      beltLevel: Number(dto.beltLevel),
      birthDate: new Date(dto.birthDate),
      parentFullName: dto.parentFullName,
      parentPhone: dto.parentPhone,
    }
  }

}
