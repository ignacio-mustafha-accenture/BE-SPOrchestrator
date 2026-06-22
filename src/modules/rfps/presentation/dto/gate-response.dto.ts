import { GateEntity, GateStatus } from '../../domain/entities/gate.entity';

export class GateResponseDto {
  gateId: string;
  rfpId: string;
  gateNumber: number;
  label: string;
  status: GateStatus;
  decidedBy: string | null;
  rationale: string | null;
  decisionDate: string | null;
  isIrreversible: boolean;

  static fromEntity(e: GateEntity): GateResponseDto {
    const dto = new GateResponseDto();
    dto.gateId = e.gateId;
    dto.rfpId = e.rfpId;
    dto.gateNumber = e.gateNumber;
    dto.label = e.label;
    dto.status = e.status;
    dto.decidedBy = e.decidedBy;
    dto.rationale = e.rationale;
    dto.decisionDate = e.decisionDate;
    dto.isIrreversible = [1, 2, 4].includes(e.gateNumber);
    return dto;
  }
}
