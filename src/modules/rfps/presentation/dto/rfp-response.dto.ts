import { RfpEntity, RfpStatus } from '../../domain/entities/rfp.entity';

export class RfpResponseDto {
  rfpId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  estimatedValueUsd: number;
  deadline: string;
  status: RfpStatus;
  progressPct: number;
  invitedSuppliers: number;
  stage: string | null;
  activeAgent: string | null;
  stageStatus: string | null;
  globalConfidence: number | null;
  architecture: string | null;

  static fromEntity(e: RfpEntity): RfpResponseDto {
    const dto = new RfpResponseDto();
    dto.rfpId = e.rfpId;
    dto.name = e.name;
    dto.categoryId = e.categoryId;
    dto.categoryName = e.categoryName;
    dto.estimatedValueUsd = Number(e.estimatedValueUsd);
    dto.deadline = e.deadline;
    dto.status = e.status;
    dto.progressPct = e.progressPct;
    dto.invitedSuppliers = e.invitedSuppliers;
    dto.stage = e.stage ?? null;
    dto.activeAgent = e.activeAgent ?? null;
    dto.stageStatus = e.stageStatus ?? null;
    dto.globalConfidence = e.globalConfidence != null ? Number(e.globalConfidence) : null;
    dto.architecture = e.architecture ?? null;
    return dto;
  }
}
