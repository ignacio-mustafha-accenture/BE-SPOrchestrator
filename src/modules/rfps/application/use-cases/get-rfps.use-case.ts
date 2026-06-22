import { Inject, Injectable } from '@nestjs/common';
import { RfpEntity } from '../../domain/entities/rfp.entity';
import type { IRfpRepository } from '../../domain/ports/rfp.repository.port';
import { RFP_REPOSITORY } from '../../domain/ports/rfp.repository.port';

@Injectable()
export class GetRfpsUseCase {
  constructor(@Inject(RFP_REPOSITORY) private readonly rfpRepository: IRfpRepository) {}

  execute(): Promise<RfpEntity[]> {
    return this.rfpRepository.findAllRfps();
  }
}
