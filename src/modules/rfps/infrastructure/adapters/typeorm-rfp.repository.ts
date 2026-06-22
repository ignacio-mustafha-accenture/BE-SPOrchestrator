import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GateEntity } from '../../domain/entities/gate.entity';
import { ProposalEntity } from '../../domain/entities/propuesta.entity';
import { SupplierEntity } from '../../domain/entities/proveedor.entity';
import { RfpEntity } from '../../domain/entities/rfp.entity';
import { RiskEntity } from '../../domain/entities/riesgo.entity';
import { ScoreEntity } from '../../domain/entities/score.entity';
import { VariableEntity } from '../../domain/entities/variable.entity';
import { IRfpRepository } from '../../domain/ports/rfp.repository.port';

@Injectable()
export class TypeOrmRfpRepository implements IRfpRepository {
  constructor(
    @InjectRepository(RfpEntity) private readonly rfpRepo: Repository<RfpEntity>,
    @InjectRepository(SupplierEntity) private readonly supplierRepo: Repository<SupplierEntity>,
    @InjectRepository(ProposalEntity) private readonly proposalRepo: Repository<ProposalEntity>,
    @InjectRepository(ScoreEntity) private readonly scoreRepo: Repository<ScoreEntity>,
    @InjectRepository(VariableEntity) private readonly variableRepo: Repository<VariableEntity>,
    @InjectRepository(RiskEntity) private readonly riskRepo: Repository<RiskEntity>,
    @InjectRepository(GateEntity) private readonly gateRepo: Repository<GateEntity>,
  ) {}

  findAllRfps(): Promise<RfpEntity[]> {
    return this.rfpRepo.find();
  }

  findRfpById(rfpId: string): Promise<RfpEntity | null> {
    return this.rfpRepo.findOneBy({ rfpId });
  }

  findProveedoresByRfpId(rfpId: string): Promise<SupplierEntity[]> {
    return this.supplierRepo.findBy({ rfpId });
  }

  findPropuestasByRfpId(rfpId: string): Promise<ProposalEntity[]> {
    return this.proposalRepo.findBy({ rfpId });
  }

  findScoresByRfpId(rfpId: string): Promise<ScoreEntity[]> {
    return this.scoreRepo.findBy({ rfpId });
  }

  findVariablesByRfpId(rfpId: string, supplierId?: string): Promise<VariableEntity[]> {
    const where = supplierId ? { rfpId, supplierId } : { rfpId };
    return this.variableRepo.findBy(where);
  }

  findRiesgosByRfpId(rfpId: string): Promise<RiskEntity[]> {
    return this.riskRepo.findBy({ rfpId });
  }

  findGatesByRfpId(rfpId: string): Promise<GateEntity[]> {
    return this.gateRepo.findBy({ rfpId });
  }

  findGateById(gateId: string): Promise<GateEntity | null> {
    return this.gateRepo.findOneBy({ gateId });
  }

  async updateGate(gateId: string, patch: Partial<GateEntity>): Promise<GateEntity> {
    const gate = await this.gateRepo.findOneBy({ gateId });
    if (!gate) throw new NotFoundException(`Gate ${gateId} not found`);
    Object.assign(gate, patch);
    return this.gateRepo.save(gate);
  }
}
