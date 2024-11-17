import { LocalTimeDto } from "./local-time.dto";

export interface ScheduledLessonDto {
  day: number;
  startTime: LocalTimeDto;
  endTime: LocalTimeDto;
}
