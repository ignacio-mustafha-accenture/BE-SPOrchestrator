import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GateEntity, GateStatus, IRREVERSIBLE_GATES } from '../../domain/entities/gate.entity';
import type { IRfpRepository } from '../../domain/ports/rfp.repository.port';
import { RFP_REPOSITORY } from '../../domain/ports/rfp.repository.port';

const DECIDED_STATUSES = [GateStatus.APPROVED, GateStatus.REJECTED, GateStatus.DECIDED];

export interface DecideGateInput {
  rfpId: string;
  gateId: string;
  status: GateStatus.APPROVED | GateStatus.REJECTED;
  decidedBy: string;
  rationale?: string;
}

@Injectable()
export class DecideGateUseCase {
  constructor(@Inject(RFP_REPOSITORY) private readonly rfpRepository: IRfpRepository) {}

  async execute(input: DecideGateInput): Promise<GateEntity> {
    const gate = await this.rfpRepository.findGateById(input.gateId);
    if (!gate) throw new NotFoundException(`Gate ${input.gateId} not found`);
    if (gate.rfpId !== input.rfpId) throw new NotFoundException(`Gate ${input.gateId} not found`);

    const isIrreversible = IRREVERSIBLE_GATES.includes(gate.gateNumber);

    if (isIrreversible && DECIDED_STATUSES.includes(gate.status)) {
      throw new ConflictException(
        `Gate ${input.gateId} is irreversible and has already been decided`,
      );
    }

    if (isIrreversible && !input.rationale?.trim()) {
      throw new BadRequestException(
        `Gate ${gate.gateNumber} is irreversible and requires a rationale`,
      );
    }

    return this.rfpRepository.updateGate(input.gateId, {
      status: input.status,
      decidedBy: input.decidedBy,
      rationale: input.rationale ?? null,
      decisionDate: new Date().toISOString(),
    });
  }
}
