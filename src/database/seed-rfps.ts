import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import { GateEntity, GateStatus } from '../modules/rfps/domain/entities/gate.entity';
import { ProposalEntity, ProposalStatus } from '../modules/rfps/domain/entities/propuesta.entity';
import { SupplierEntity } from '../modules/rfps/domain/entities/proveedor.entity';
import { RfpEntity, RfpStatus } from '../modules/rfps/domain/entities/rfp.entity';
import { RiskEntity, RiskRating } from '../modules/rfps/domain/entities/riesgo.entity';
import { ScoreEntity } from '../modules/rfps/domain/entities/score.entity';
import { VariableEntity } from '../modules/rfps/domain/entities/variable.entity';
import { User } from '../modules/users/domain/entities/user.entity';

const EXCEL_PATH = process.argv[2] ?? path.resolve(
  'C:/Users/ignacio.mustafha/Desktop/BidIQ_Data_Template.xlsx',
);

function getRows(wb: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  const sheet = wb.Sheets[sheetName];
  // Row 1 = title, Row 2 = description, Row 3 = actual headers (0-indexed: range starts at 2)
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, range: 2 });
  return raw;
}

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: [User, RfpEntity, SupplierEntity, ProposalEntity, VariableEntity, ScoreEntity, RiskEntity, GateEntity],
    synchronize: true,
  });

  await ds.initialize();
  console.log('Connected to DB');

  const wb = XLSX.readFile(EXCEL_PATH);
  console.log(`Reading Excel from: ${EXCEL_PATH}`);

  // ── Sheet 1: RFPs ──────────────────────────────────────────────────────────
  const rfpRows = getRows(wb, '1_RFPs').filter((r) => String(r['rfp_id']).startsWith('RFP-'));
  const rfps = rfpRows.map((r) => {
    const e = new RfpEntity();
    e.rfpId = String(r['rfp_id']);
    e.name = String(r['nombre']);
    e.categoryId = String(r['categoria_id']);
    e.categoryName = String(r['categoria_nombre']);
    e.estimatedValueUsd = Number(r['valor_estimado_usd']);
    e.deadline = String(r['deadline']);
    e.status = String(r['status']) as RfpStatus;
    e.progressPct = Number(r['progreso_%']);
    e.invitedSuppliers = Number(r['proveedores_invitados']);
    return e;
  });
  await ds.getRepository(RfpEntity).save(rfps);
  console.log(`Seeded ${rfps.length} RFPs`);

  // ── Sheet 2: Suppliers ─────────────────────────────────────────────────────
  const supplierRows = getRows(wb, '2_Proveedores').filter((r) => String(r['proveedor_id']).startsWith('S-'));
  const suppliers = supplierRows.map((r) => {
    const e = new SupplierEntity();
    e.supplierId = String(r['proveedor_id']);
    e.rfpId = String(r['rfp_id']);
    e.name = String(r['nombre']);
    e.email = String(r['email']);
    e.country = String(r['pais']);
    e.compositeScore = Number(r['score_compuesto']);
    return e;
  });
  await ds.getRepository(SupplierEntity).save(suppliers);
  console.log(`Seeded ${suppliers.length} Suppliers`);

  // ── Sheet 3: Proposals ─────────────────────────────────────────────────────
  const proposalRows = getRows(wb, '3_Propuestas').filter((r) => String(r['propuesta_id']).startsWith('P-'));
  const proposals = proposalRows.map((r) => {
    const e = new ProposalEntity();
    e.proposalId = String(r['propuesta_id']);
    e.rfpId = String(r['rfp_id']);
    e.supplierId = String(r['proveedor_id']);
    e.supplierName = String(r['proveedor_nombre']);
    e.submissionDate = String(r['fecha_envio']);
    e.status = String(r['status']) as ProposalStatus;
    e.globalConfidence = Number(r['confianza_global_%']);
    return e;
  });
  await ds.getRepository(ProposalEntity).save(proposals);
  console.log(`Seeded ${proposals.length} Proposals`);

  // ── Sheet 4: Variables ─────────────────────────────────────────────────────
  const varRows = getRows(wb, '4_Variables').filter((r) => r['variable_id'] && String(r['rfp_id']).startsWith('RFP-'));
  const variables = varRows.map((r) => {
    const e = new VariableEntity();
    e.variableId = String(r['variable_id']);
    e.dimension = String(r['dimension']);
    e.rfpId = String(r['rfp_id']);
    e.supplierId = String(r['proveedor_id']);
    e.supplierName = String(r['proveedor_nombre']);
    e.value = r['valor'] !== null ? String(r['valor']) : '';
    e.confidence = Number(r['confianza']);
    e.flagged = String(r['flagged']).toUpperCase() === 'SI';
    return e;
  });
  await ds.getRepository(VariableEntity).save(variables);
  console.log(`Seeded ${variables.length} Variables`);

  // ── Sheet 5: Scores ────────────────────────────────────────────────────────
  const scoreRows = getRows(wb, '5_Scores').filter((r) => String(r['rfp_id']).startsWith('RFP-') && r['proveedor_id']);
  const scores = scoreRows.map((r) => {
    const e = new ScoreEntity();
    e.rfpId = String(r['rfp_id']);
    e.supplierId = String(r['proveedor_id']);
    e.supplierName = String(r['proveedor_nombre']);
    e.dimensionId = String(r['dimension_id']);
    e.dimensionName = String(r['dimension_nombre']);
    e.score = Number(r['score']);
    const weightRaw = r['peso_%'];
    e.weight = weightRaw !== null && weightRaw !== '—' ? Number(weightRaw) : null;
    return e;
  });
  await ds.getRepository(ScoreEntity).save(scores);
  console.log(`Seeded ${scores.length} Scores`);

  // ── Sheet 6: Risks ─────────────────────────────────────────────────────────
  const riskRows = getRows(wb, '6_Riesgo').filter((r) => String(r['rfp_id']).startsWith('RFP-') && String(r['proveedor_id']).startsWith('S-'));
  const risks = riskRows.map((r) => {
    const e = new RiskEntity();
    e.rfpId = String(r['rfp_id']);
    e.supplierId = String(r['proveedor_id']);
    e.supplierName = String(r['proveedor_nombre']);
    e.riskFactor = String(r['factor_riesgo']);
    e.rating = String(r['rating']) as RiskRating;
    e.observation = r['observacion'] ? String(r['observacion']) : null;
    return e;
  });
  await ds.getRepository(RiskEntity).save(risks);
  console.log(`Seeded ${risks.length} Risks`);

  // ── Sheet 7: Gates ─────────────────────────────────────────────────────────
  const gateRows = getRows(wb, '7_Gates_HITL').filter((r) => String(r['gate_id']).startsWith('G-'));
  const gates = gateRows.map((r) => {
    const e = new GateEntity();
    e.gateId = String(r['gate_id']);
    e.rfpId = String(r['rfp_id']);
    e.gateNumber = Number(r['gate_numero']);
    e.label = String(r['etiqueta']);
    e.status = String(r['status']) as GateStatus;
    e.decidedBy = r['decidido_por'] && r['decidido_por'] !== '—' ? String(r['decidido_por']) : null;
    e.rationale = r['rationale'] && r['rationale'] !== '—' ? String(r['rationale']) : null;
    e.decisionDate = r['fecha_decision'] && r['fecha_decision'] !== '—' ? String(r['fecha_decision']) : null;
    return e;
  });
  await ds.getRepository(GateEntity).save(gates);
  console.log(`Seeded ${gates.length} Gates`);

  await ds.destroy();
  console.log('Seed complete ✓');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
