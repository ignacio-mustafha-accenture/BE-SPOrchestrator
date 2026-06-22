import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ScoreEntity } from '../../domain/entities/score.entity';
import type { IRfpRepository } from '../../domain/ports/rfp.repository.port';
import { RFP_REPOSITORY } from '../../domain/ports/rfp.repository.port';

@Injectable()
export class GetRfpScoresUseCase {
  constructor(@Inject(RFP_REPOSITORY) private readonly rfpRepository: IRfpRepository) {}

  async execute(rfpId: string): Promise<ScoreEntity[]> {
    const rfp = await this.rfpRepository.findRfpById(rfpId);
    if (!rfp) throw new NotFoundException(`RFP ${rfpId} not found`);
    return this.rfpRepository.findScoresByRfpId(rfpId);
  }
}
