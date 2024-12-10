import { StudentDto } from "./student.dto";
import { TransactionDto } from "./transaction.dto";

export interface StudentTransactionsDto {
  student: StudentDto,
  transactions: Array<TransactionDto>,
  balance: number,
}