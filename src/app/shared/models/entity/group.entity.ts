import { CoachEntity } from "./coach.entity";
import { StudentEntity } from "./student.entity";

export interface GroupEntity {
  id: string;
  name: string;
  coach: CoachEntity | null;
  students: Array<StudentEntity>;
}
