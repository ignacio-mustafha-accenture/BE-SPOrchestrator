import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VariableEntity } from '../../domain/entities/variable.entity';
import type { IRfpRepository } from '../../domain/ports/rfp.repository.port';
import { RFP_REPOSITORY } from '../../domain/ports/rfp.repository.port';

@Injectable()
export class GetRfpVariablesUseCase {
  constructor(@Inject(RFP_REPOSITORY) private readonly rfpRepository: IRfpRepository) {}

  async execute(rfpId: string, supplierId?: string): Promise<VariableEntity[]> {
    const rfp = await this.rfpRepository.findRfpById(rfpId);
    if (!rfp) throw new NotFoundException(`RFP ${rfpId} not found`);
    return this.rfpRepository.findVariablesByRfpId(rfpId, supplierId);
  }
}
