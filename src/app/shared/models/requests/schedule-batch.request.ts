import { ScheduledLessonDto } from "../dto/scheduled-lesson.dto";

export interface ScheduleBatchRequest {
  startTime: string;
  endTime: string;
  scheduledLessons: Array<ScheduledLessonDto>;
}
