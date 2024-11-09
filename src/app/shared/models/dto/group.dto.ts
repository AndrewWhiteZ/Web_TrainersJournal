import { CoachDto } from "./coach.dto";

export interface GroupDto {
  id: string;
  name: string;
  trainer: CoachDto;
}
