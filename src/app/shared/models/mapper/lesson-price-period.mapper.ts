import { LessonPricePeriodDto } from "../dto/lesson-price-period.dto";
import { LessonPricePeriodEntity } from "../entity/lesson-price-period.entity";

export class LessonPricePeriodMapper {

  public static mapToEntity(dto: LessonPricePeriodDto): LessonPricePeriodEntity {
    return {
      id: dto.id,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      price: dto.price
    }
  }

}
