import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum RfpStatus {
  PARSING = 'parsing',
  EVALUACION = 'evaluacion',
  APROBACION = 'aprobacion',
  COMPLETO = 'completo',
}

@Entity('rfps')
export class RfpEntity {
  @PrimaryColumn({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'categoria_id' })
  categoryId: string;

  @Column({ name: 'categoria_nombre' })
  categoryName: string;

  @Column({ name: 'valor_estimado_usd', type: 'decimal', precision: 15, scale: 2 })
  estimatedValueUsd: number;

  @Column()
  deadline: string;

  @Column({ type: 'enum', enum: RfpStatus })
  status: RfpStatus;

  @Column({ name: 'progreso_pct', type: 'int' })
  progressPct: number;

  @Column({ name: 'proveedores_invitados', type: 'int' })
  invitedSuppliers: number;

  @Column({ type: 'varchar', nullable: true })
  stage: string | null;

  @Column({ name: 'agente_activo', type: 'varchar', nullable: true })
  activeAgent: string | null;

  @Column({ name: 'status_etapa', type: 'varchar', nullable: true })
  stageStatus: string | null;

  @Column({ name: 'confianza_global', type: 'decimal', precision: 5, scale: 2, nullable: true })
  globalConfidence: number | null;

  @Column({ type: 'varchar', nullable: true })
  architecture: string | null;
}
