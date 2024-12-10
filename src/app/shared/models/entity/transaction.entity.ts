import { TransactionType } from "../enum/transaction-type.enum";

export interface TransactionEntity {
  id: string;
  type: TransactionType;
  dt: Date;
  sum: number;
}