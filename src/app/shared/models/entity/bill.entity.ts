import { BillStatus } from "../enum/bill-status.enum";
import { StudentEntity } from "./student.entity";

export interface BillEntity {
  id: string;
  filename: string;
  contentType: string;
  url: string;
  student: StudentEntity;
  status: BillStatus;
  amount: number;
  createdDt: Date;
}
