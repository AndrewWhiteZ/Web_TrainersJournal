import { TransactionDto } from "../dto/transaction.dto";
import { TransactionEntity } from "../entity/transaction.entity";
import { TransactionType } from "../enum/transaction-type.enum";

export class TransactionMapper {

  public static mapToEntity(dto: TransactionDto): TransactionEntity {
    return {
      id: dto.id,
      type: TransactionType[dto.type as keyof typeof TransactionType],
      dt: new Date(dto.dt),
      sum: dto.sum
    }
  }

}