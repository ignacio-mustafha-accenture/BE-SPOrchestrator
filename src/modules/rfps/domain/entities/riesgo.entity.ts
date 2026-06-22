import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum RiskRating {
  BAJO = 'Bajo',
  MEDIO = 'Medio',
  ALTO = 'Alto',
  CRITICO = 'Crítico',
}

/** @deprecated use RiskRating */
export { RiskRating as RiesgoRating };

@Entity('riesgos')
export class RiskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'proveedor_id' })
  supplierId: string;

  @Column({ name: 'proveedor_nombre' })
  supplierName: string;

  @Column({ name: 'factor_riesgo' })
  riskFactor: string;

  @Column({ type: 'enum', enum: RiskRating })
  rating: RiskRating;

  @Column({ type: 'text', nullable: true, name: 'observacion' })
  observation: string | null;
}

/** @deprecated use RiskEntity */
export { RiskEntity as RiesgoEntity };
