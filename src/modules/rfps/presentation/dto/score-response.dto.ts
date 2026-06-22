import { ScoreEntity } from '../../domain/entities/score.entity';

export class ScoreDimensionDto {
  dimensionId: string;
  dimensionName: string;
  score: number;
  weight: number | null;
}

export class ScoreSupplierResponseDto {
  supplierId: string;
  supplierName: string;
  dimensions: ScoreDimensionDto[];

  static fromEntities(supplierId: string, supplierName: string, scores: ScoreEntity[]): ScoreSupplierResponseDto {
    const dto = new ScoreSupplierResponseDto();
    dto.supplierId = supplierId;
    dto.supplierName = supplierName;
    dto.dimensions = scores.map((s) => ({
      dimensionId: s.dimensionId,
      dimensionName: s.dimensionName,
      score: Number(s.score),
      weight: s.weight !== null ? Number(s.weight) : null,
    }));
    return dto;
  }
}

/** @deprecated use ScoreSupplierResponseDto */
export { ScoreSupplierResponseDto as ScoreProveedorResponseDto };
