import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('variables')
export class VariableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variable_id' })
  variableId: string;

  @Column()
  dimension: string;

  @Column({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'proveedor_id' })
  supplierId: string;

  @Column({ name: 'proveedor_nombre' })
  supplierName: string;

  @Column({ type: 'text', name: 'valor' })
  value: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'confianza' })
  confidence: number;

  @Column({ type: 'boolean', default: false })
  flagged: boolean;
}
