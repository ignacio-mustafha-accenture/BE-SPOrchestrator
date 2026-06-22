import { VariableEntity } from '../../domain/entities/variable.entity';

export class VariableResponseDto {
  id: string;
  variableId: string;
  dimension: string;
  rfpId: string;
  supplierId: string;
  supplierName: string;
  value: string;
  confidence: number;
  flagged: boolean;

  static fromEntity(e: VariableEntity): VariableResponseDto {
    const dto = new VariableResponseDto();
    dto.id = e.id;
    dto.variableId = e.variableId;
    dto.dimension = e.dimension;
    dto.rfpId = e.rfpId;
    dto.supplierId = e.supplierId;
    dto.supplierName = e.supplierName;
    dto.value = e.value;
    dto.confidence = Number(e.confidence);
    dto.flagged = e.flagged;
    return dto;
  }
}
