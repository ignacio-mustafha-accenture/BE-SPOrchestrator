import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { GateStatus } from '../../domain/entities/gate.entity';

export class DecideGateDto {
  @IsEnum([GateStatus.APPROVED, GateStatus.REJECTED], {
    message: 'status must be approved or rejected',
  })
  status: GateStatus.APPROVED | GateStatus.REJECTED;

  @IsString()
  @MinLength(2)
  decidedBy: string;

  @IsString()
  @IsOptional()
  rationale?: string;
}
