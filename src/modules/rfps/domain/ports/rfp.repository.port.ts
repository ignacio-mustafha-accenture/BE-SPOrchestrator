import type { GateEntity } from '../entities/gate.entity';
import type { ProposalEntity } from '../entities/propuesta.entity';
import type { SupplierEntity } from '../entities/proveedor.entity';
import type { RfpEntity } from '../entities/rfp.entity';
import type { RiskEntity } from '../entities/riesgo.entity';
import type { ScoreEntity } from '../entities/score.entity';
import type { VariableEntity } from '../entities/variable.entity';

export interface IRfpRepository {
  findAllRfps(): Promise<RfpEntity[]>;
  findRfpById(rfpId: string): Promise<RfpEntity | null>;
  findProveedoresByRfpId(rfpId: string): Promise<SupplierEntity[]>;
  findPropuestasByRfpId(rfpId: string): Promise<ProposalEntity[]>;
  findScoresByRfpId(rfpId: string): Promise<ScoreEntity[]>;
  findVariablesByRfpId(rfpId: string, supplierId?: string): Promise<VariableEntity[]>;
  findRiesgosByRfpId(rfpId: string): Promise<RiskEntity[]>;
  findGatesByRfpId(rfpId: string): Promise<GateEntity[]>;
  findGateById(gateId: string): Promise<GateEntity | null>;
  updateGate(gateId: string, patch: Partial<GateEntity>): Promise<GateEntity>;
}

export const RFP_REPOSITORY = Symbol('IRfpRepository');
