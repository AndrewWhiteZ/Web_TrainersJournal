import { LessonDto } from "../dto/lesson.dto";
import { LessonEntity } from "../entity/lesson.entity";

export class LessonMapper {

  public static mapToEntity(dto: LessonDto): LessonEntity {
    return {
      id: dto.id,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    }
  }

}
