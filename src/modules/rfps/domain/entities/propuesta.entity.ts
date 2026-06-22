import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum ProposalStatus {
  CONFIRMED = 'confirmed',
  REVIEW = 'review',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

/** @deprecated use ProposalStatus */
export { ProposalStatus as PropuestaStatus };

@Entity('propuestas')
export class ProposalEntity {
  @PrimaryColumn({ name: 'propuesta_id' })
  proposalId: string;

  @Column({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'proveedor_id' })
  supplierId: string;

  @Column({ name: 'proveedor_nombre' })
  supplierName: string;

  @Column({ name: 'fecha_envio' })
  submissionDate: string;

  @Column({ type: 'enum', enum: ProposalStatus })
  status: ProposalStatus;

  @Column({ name: 'confianza_global', type: 'decimal', precision: 4, scale: 2 })
  globalConfidence: number;
}

/** @deprecated use ProposalEntity */
export { ProposalEntity as PropuestaEntity };
