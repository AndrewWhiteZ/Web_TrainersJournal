import { LessonDto } from "./lesson.dto";
import { StudentAttendanceDTO } from "./student-attendance.dto";

export interface LessonWithAttendanceDto {
  lesson: LessonDto,
  attendance: Array<StudentAttendanceDTO>
}
