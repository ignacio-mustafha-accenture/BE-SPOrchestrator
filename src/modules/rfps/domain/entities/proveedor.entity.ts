import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('proveedores')
export class SupplierEntity {
  @PrimaryColumn({ name: 'proveedor_id' })
  supplierId: string;

  @PrimaryColumn({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'nombre' })
  name: string;

  @Column()
  email: string;

  @Column({ name: 'pais' })
  country: string;

  @Column({ name: 'score_compuesto', type: 'decimal', precision: 5, scale: 2 })
  compositeScore: number;
}

/** @deprecated use SupplierEntity */
export { SupplierEntity as ProveedorEntity };
