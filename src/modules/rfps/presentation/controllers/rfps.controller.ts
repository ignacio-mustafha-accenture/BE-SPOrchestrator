import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { DecideGateUseCase } from '../../application/use-cases/decide-gate.use-case';
import { GetRfpByIdUseCase } from '../../application/use-cases/get-rfp-by-id.use-case';
import { GetRfpGatesUseCase } from '../../application/use-cases/get-rfp-gates.use-case';
import { GetRfpPropuestasUseCase } from '../../application/use-cases/get-rfp-propuestas.use-case';
import { GetRfpProveedoresUseCase } from '../../application/use-cases/get-rfp-proveedores.use-case';
import { GetRfpRiesgoUseCase } from '../../application/use-cases/get-rfp-riesgo.use-case';
import { GetRfpScoresUseCase } from '../../application/use-cases/get-rfp-scores.use-case';
import { GetRfpVariablesUseCase } from '../../application/use-cases/get-rfp-variables.use-case';
import { GetRfpsUseCase } from '../../application/use-cases/get-rfps.use-case';
import { ScoreEntity } from '../../domain/entities/score.entity';
import { RiskEntity } from '../../domain/entities/riesgo.entity';
import { DecideGateDto } from '../dto/decide-gate.dto';
import { GateResponseDto } from '../dto/gate-response.dto';
import { ProposalResponseDto } from '../dto/propuesta-response.dto';
import { SupplierResponseDto } from '../dto/proveedor-response.dto';
import { RfpResponseDto } from '../dto/rfp-response.dto';
import { RiskSupplierResponseDto } from '../dto/riesgo-response.dto';
import { ScoreSupplierResponseDto } from '../dto/score-response.dto';
import { VariableResponseDto } from '../dto/variable-response.dto';

@Controller('rfps')
@UseGuards(JwtAuthGuard)
export class RfpsController {
  constructor(
    private readonly getRfpsUseCase: GetRfpsUseCase,
    private readonly getRfpByIdUseCase: GetRfpByIdUseCase,
    private readonly getProveedoresUseCase: GetRfpProveedoresUseCase,
    private readonly getPropuestasUseCase: GetRfpPropuestasUseCase,
    private readonly getScoresUseCase: GetRfpScoresUseCase,
    private readonly getVariablesUseCase: GetRfpVariablesUseCase,
    private readonly getRiesgoUseCase: GetRfpRiesgoUseCase,
    private readonly getGatesUseCase: GetRfpGatesUseCase,
    private readonly decideGateUseCase: DecideGateUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<RfpResponseDto[]> {
    const rfps = await this.getRfpsUseCase.execute();
    return rfps.map(RfpResponseDto.fromEntity);
  }

  @Get(':rfpId')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('rfpId') rfpId: string): Promise<RfpResponseDto> {
    const rfp = await this.getRfpByIdUseCase.execute(rfpId);
    return RfpResponseDto.fromEntity(rfp);
  }

  @Get(':rfpId/proveedores')
  @HttpCode(HttpStatus.OK)
  async findProveedores(@Param('rfpId') rfpId: string): Promise<SupplierResponseDto[]> {
    const suppliers = await this.getProveedoresUseCase.execute(rfpId);
    return suppliers.map(SupplierResponseDto.fromEntity);
  }

  @Get(':rfpId/propuestas')
  @HttpCode(HttpStatus.OK)
  async findPropuestas(@Param('rfpId') rfpId: string): Promise<ProposalResponseDto[]> {
    const proposals = await this.getPropuestasUseCase.execute(rfpId);
    return proposals.map(ProposalResponseDto.fromEntity);
  }

  @Get(':rfpId/scores')
  @HttpCode(HttpStatus.OK)
  async findScores(@Param('rfpId') rfpId: string): Promise<ScoreSupplierResponseDto[]> {
    const scores = await this.getScoresUseCase.execute(rfpId);
    return this.groupBySupplier(scores, (supplierId, supplierName, items) =>
      ScoreSupplierResponseDto.fromEntities(supplierId, supplierName, items as ScoreEntity[]),
    );
  }

  @Get(':rfpId/variables')
  @HttpCode(HttpStatus.OK)
  async findVariables(
    @Param('rfpId') rfpId: string,
    @Query('supplierId') supplierId?: string,
  ): Promise<VariableResponseDto[]> {
    const variables = await this.getVariablesUseCase.execute(rfpId, supplierId);
    return variables.map(VariableResponseDto.fromEntity);
  }

  @Get(':rfpId/riesgo')
  @HttpCode(HttpStatus.OK)
  async findRiesgo(@Param('rfpId') rfpId: string): Promise<RiskSupplierResponseDto[]> {
    const risks = await this.getRiesgoUseCase.execute(rfpId);
    return this.groupBySupplier(risks, (supplierId, supplierName, items) =>
      RiskSupplierResponseDto.fromEntities(supplierId, supplierName, items as RiskEntity[]),
    );
  }

  @Get(':rfpId/gates')
  @HttpCode(HttpStatus.OK)
  async findGates(@Param('rfpId') rfpId: string): Promise<GateResponseDto[]> {
    const gates = await this.getGatesUseCase.execute(rfpId);
    return gates.map(GateResponseDto.fromEntity);
  }

  @Patch(':rfpId/gates/:gateId')
  @HttpCode(HttpStatus.OK)
  async decideGate(
    @Param('rfpId') rfpId: string,
    @Param('gateId') gateId: string,
    @Body() dto: DecideGateDto,
  ): Promise<GateResponseDto> {
    const gate = await this.decideGateUseCase.execute({
      rfpId,
      gateId,
      status: dto.status,
      decidedBy: dto.decidedBy,
      rationale: dto.rationale,
    });
    return GateResponseDto.fromEntity(gate);
  }

  private groupBySupplier<T extends { supplierId: string; supplierName: string }, R>(
    items: T[],
    factory: (supplierId: string, supplierName: string, items: T[]) => R,
  ): R[] {
    const map = new Map<string, { supplierName: string; items: T[] }>();
    for (const item of items) {
      if (!map.has(item.supplierId)) {
        map.set(item.supplierId, { supplierName: item.supplierName, items: [] });
      }
      map.get(item.supplierId)!.items.push(item);
    }
    return Array.from(map.entries()).map(([supplierId, { supplierName, items: grouped }]) =>
      factory(supplierId, supplierName, grouped),
    );
  }
}
