import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DecideGateUseCase } from './application/use-cases/decide-gate.use-case';
import { GetRfpByIdUseCase } from './application/use-cases/get-rfp-by-id.use-case';
import { GetRfpGatesUseCase } from './application/use-cases/get-rfp-gates.use-case';
import { GetRfpPropuestasUseCase } from './application/use-cases/get-rfp-propuestas.use-case';
import { GetRfpProveedoresUseCase } from './application/use-cases/get-rfp-proveedores.use-case';
import { GetRfpRiesgoUseCase } from './application/use-cases/get-rfp-riesgo.use-case';
import { GetRfpScoresUseCase } from './application/use-cases/get-rfp-scores.use-case';
import { GetRfpVariablesUseCase } from './application/use-cases/get-rfp-variables.use-case';
import { GetRfpsUseCase } from './application/use-cases/get-rfps.use-case';
import { GateEntity } from './domain/entities/gate.entity';
import { ProposalEntity } from './domain/entities/propuesta.entity';
import { SupplierEntity } from './domain/entities/proveedor.entity';
import { RfpEntity } from './domain/entities/rfp.entity';
import { RiskEntity } from './domain/entities/riesgo.entity';
import { ScoreEntity } from './domain/entities/score.entity';
import { VariableEntity } from './domain/entities/variable.entity';
import { RFP_REPOSITORY } from './domain/ports/rfp.repository.port';
import { GoogleSheetsRfpRepository } from './infrastructure/adapters/google-sheets-rfp.repository';
import { TypeOrmRfpRepository } from './infrastructure/adapters/typeorm-rfp.repository';
import { RfpsController } from './presentation/controllers/rfps.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RfpEntity,
      SupplierEntity,
      ProposalEntity,
      VariableEntity,
      ScoreEntity,
      RiskEntity,
      GateEntity,
    ]),
    AuthModule,
  ],
  controllers: [RfpsController],
  providers: [
    { provide: RFP_REPOSITORY, useClass: GoogleSheetsRfpRepository }, // demo: swap to TypeOrmRfpRepository for production
    GetRfpsUseCase,
    GetRfpByIdUseCase,
    GetRfpProveedoresUseCase,
    GetRfpPropuestasUseCase,
    GetRfpScoresUseCase,
    GetRfpVariablesUseCase,
    GetRfpRiesgoUseCase,
    GetRfpGatesUseCase,
    DecideGateUseCase,
  ],
})
export class RfpsModule {}
