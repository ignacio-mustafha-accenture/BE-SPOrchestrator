import { RiskEntity, RiskRating } from '../../domain/entities/riesgo.entity';

export class RiskFactorDto {
  riskFactor: string;
  rating: RiskRating;
  observation: string | null;
}

export class RiskSupplierResponseDto {
  supplierId: string;
  supplierName: string;
  factors: RiskFactorDto[];

  static fromEntities(supplierId: string, supplierName: string, risks: RiskEntity[]): RiskSupplierResponseDto {
    const dto = new RiskSupplierResponseDto();
    dto.supplierId = supplierId;
    dto.supplierName = supplierName;
    dto.factors = risks.map((r) => ({
      riskFactor: r.riskFactor,
      rating: r.rating,
      observation: r.observation,
    }));
    return dto;
  }
}

/** @deprecated use RiskSupplierResponseDto */
export { RiskSupplierResponseDto as RiesgoProveedorResponseDto };
