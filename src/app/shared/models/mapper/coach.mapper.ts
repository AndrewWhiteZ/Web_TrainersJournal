import { CoachDto } from "../dto/coach.dto";
import { CoachEntity } from "../entity/coach.entity";
import { UserRole } from "../enum/user-role.enum";

export class CoachMapper {

  public static mapToEntity(dto: CoachDto): CoachEntity {
    return {
      id: dto.id,
      fullName: dto.fullName,
      login: dto.login,
      email: dto.email,
      phone: dto.phone,
      role: UserRole[dto.role as keyof typeof UserRole]
    }
  }

}
