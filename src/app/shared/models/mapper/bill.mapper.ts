import { BillDto } from "../dto/bill.dto";
import { BillEntity } from "../entity/bill.entity";
import { BillStatus } from "../enum/bill-status.enum";
import { StudentMapper } from "./student.mapper";

export class BillMapper {

  public static mapToEntity(dto: BillDto): BillEntity {
    return {
      id: dto.id,
      filename: dto.filename,
      contentType: dto.contentType,
      createdDt: new Date(dto.createdDt),
      status: BillStatus[dto.status as keyof typeof BillStatus],
      student: StudentMapper.mapToEntity(dto.student),
      amount: dto.amount,
      url: dto.url
    }
  }

}