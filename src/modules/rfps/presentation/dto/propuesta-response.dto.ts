import { ProposalEntity, ProposalStatus } from '../../domain/entities/propuesta.entity';

export class ProposalResponseDto {
  proposalId: string;
  rfpId: string;
  supplierId: string;
  supplierName: string;
  submissionDate: string;
  status: ProposalStatus;
  globalConfidence: number;

  static fromEntity(e: ProposalEntity): ProposalResponseDto {
    const dto = new ProposalResponseDto();
    dto.proposalId = e.proposalId;
    dto.rfpId = e.rfpId;
    dto.supplierId = e.supplierId;
    dto.supplierName = e.supplierName;
    dto.submissionDate = e.submissionDate;
    dto.status = e.status;
    dto.globalConfidence = Number(e.globalConfidence);
    return dto;
  }
}

/** @deprecated use ProposalResponseDto */
export { ProposalResponseDto as PropuestaResponseDto };
