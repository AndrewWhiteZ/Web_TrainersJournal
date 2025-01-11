import { StudentDto } from "./student.dto";

export interface BillDto {
  id: string;
  filename: string;
  contentType: string;
  url: string;
  student: StudentDto;
  status: string;
  amount: number;
  createdDt: string;
}