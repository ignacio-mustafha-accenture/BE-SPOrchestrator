import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum GateStatus {
  PENDING = 'pending',
  OPEN = 'open',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DECIDED = 'decided',
  EXPIRED = 'expired',
}

export const IRREVERSIBLE_GATES = [1, 2, 4];

@Entity('gates')
export class GateEntity {
  @PrimaryColumn({ name: 'gate_id' })
  gateId: string;

  @Column({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'gate_numero', type: 'int' })
  gateNumber: number;

  @Column({ name: 'etiqueta' })
  label: string;

  @Column({ type: 'enum', enum: GateStatus, default: GateStatus.PENDING })
  status: GateStatus;

  @Column({ name: 'decidido_por', nullable: true, type: 'text' })
  decidedBy: string | null;

  @Column({ nullable: true, type: 'text' })
  rationale: string | null;

  @Column({ name: 'fecha_decision', nullable: true, type: 'text' })
  decisionDate: string | null;
}
