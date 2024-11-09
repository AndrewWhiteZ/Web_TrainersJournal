import { GroupDto } from "../dto/group.dto";
import { GroupEntity } from "../entity/group.entity";
import { CoachMapper } from "./coach.mapper";

export class GroupMapper {

  public static mapToEntity(dto: GroupDto): GroupEntity {
    return {
      id: dto.id,
      name: dto.name,
      coach: CoachMapper.mapToEntity(dto.trainer),
      students: new Array,
    }
  }

}
