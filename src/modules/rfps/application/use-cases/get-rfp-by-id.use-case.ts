import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RfpEntity } from '../../domain/entities/rfp.entity';
import type { IRfpRepository } from '../../domain/ports/rfp.repository.port';
import { RFP_REPOSITORY } from '../../domain/ports/rfp.repository.port';

@Injectable()
export class GetRfpByIdUseCase {
  constructor(@Inject(RFP_REPOSITORY) private readonly rfpRepository: IRfpRepository) {}

  async execute(rfpId: string): Promise<RfpEntity> {
    const rfp = await this.rfpRepository.findRfpById(rfpId);
    if (!rfp) throw new NotFoundException(`RFP ${rfpId} not found`);
    return rfp;
  }
}
