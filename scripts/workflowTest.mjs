import { getNextWorkflowStep, getWorkflowStatuses, WORKFLOW_STEP_KEYS } from '../src/utils/workflow.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
  }
}

function baseData() {
  return {
    basicInfo: {
      factory: '', productNo: '', productDesc: '', stage: {}, ecnChange: {},
      qualityLevel: {}, ipcStandard: {}, qrCode: {}, snControl: {}, aoi: {},
      processItems: {}, tooling: {}, documents: {}, signOff: {},
    },
    processControl: {},
    trialReport: {},
  };
}

console.log('\n── Ten-step workflow status tests ──');

const empty = getWorkflowStatuses(baseData());
assert(WORKFLOW_STEP_KEYS.length === 10, 'workflow contains exactly 10 ordered steps');
assert(empty.basicInfo.state === 'pending', 'empty basic information is pending');
assert(empty.smtControl.state === 'done' && empty.smtControl.applicable === false, 'SMT is done/not-applicable when SMT is not selected');
assert(empty.dipSpecialProcess.state === 'done' && empty.dipSpecialProcess.applicable === false, 'DIP/special is done/not-applicable when neither process is selected');
const untouchedThermal = baseData();
untouchedThermal.processControl.tempPoints = Array.from({ length: 6 }, (_, index) => ({ id: index + 1, pos: '' }));
assert(getWorkflowStatuses(untouchedThermal).thermalProfile.state === 'pending', 'generated temperature-point IDs do not mark the step in progress');
assert(getNextWorkflowStep('basicInfo') === 'qualityProcess', 'next-step routing starts with quality/process');
assert(getNextWorkflowStep('documents') === 'signOff', 'documents route to sign-off');

const partial = baseData();
partial.basicInfo.productNo = 'PARTIAL-001';
assert(getWorkflowStatuses(partial).basicInfo.state === 'inProgress', 'partially filled basic information is in progress');

const complete = baseData();
complete.basicInfo = {
  ...complete.basicInfo,
  factory: '測試工廠',
  productNo: 'FULL-001',
  productDesc: '完整流程測試',
  stage: { evt: true },
  ecnChange: { has: false, no: true },
  processItems: { smt: true, dip: true, underfillGlue: true },
  tooling: {
    stencil: { thickness: '0.12', style: 'general' },
    routingFixture: { need: false, noNeed: true },
    glueFixture: { need: false, noNeed: true },
    testFixture: { need: false, noNeed: true },
    assemblyFixture: { need: false, noNeed: true },
    smtCarrier: { need: false, noNeed: true },
    otherFixture: { need: false, noNeed: true },
  },
  documents: {
    bom: true, gerber: true, coordinate: true, placement: true,
    materialSpec: true, reflowProfile: true, assemblyPackingSop: true, testSop: true,
  },
  signOff: {
    rdSignature: 'data:image/png;base64,rd',
    engineeringReviewSignature: 'data:image/png;base64,eng',
    qaSignature: 'data:image/png;base64,qa',
  },
};
complete.processControl = {
  sampleProvided: { trialBoard: true },
  bakeRequired: { need: false, noNeed: true },
  packagingType: 'pcba',
  pcbaPackaging: { staticBag: true },
  keyParts: { has: false, none: true },
  tempPoints: Array.from({ length: 6 }, (_, index) => ({ id: index + 1, pos: '' })),
  smtFirstPiece: { polarity: true, ledTest: 'no', stencilApertureRatio: '100' },
  smtOrder: { bToT: true, tToB: false },
  dipFirstPiece: { cutLead: true, memo: '' },
  dipOrder: { bToT: true, tToB: false },
  underfill: { bakeTemp: '100', bakeTime: '30', glueModel: 'UF-TEST' },
};
complete.trialReport = {
  printRecords: [{ id: 1, checked: true }],
  inspectRecords: [{ id: 1, checked: true }],
  yieldReport: { ready: true },
  photoRecords: [{ id: 1, checked: true }],
};

const completeStatuses = getWorkflowStatuses(complete);
assert(WORKFLOW_STEP_KEYS.every((key) => completeStatuses[key].state === 'done'), 'fully completed fixture marks every workflow step done');
assert(completeStatuses.smtControl.applicable === true, 'selected SMT step is applicable');
assert(completeStatuses.dipSpecialProcess.applicable === true, 'selected DIP/Underfill step is applicable');

const conditional = structuredClone(complete);
conditional.basicInfo.processItems = { assembly: true };
const conditionalStatuses = getWorkflowStatuses(conditional);
assert(conditionalStatuses.smtControl.applicable === false, 'removing SMT changes SMT to not applicable');
assert(conditionalStatuses.dipSpecialProcess.applicable === false, 'removing DIP/Underfill changes special process to not applicable');

const rejected = structuredClone(complete);
rejected.basicInfo.signOff.rejection = { reason: '測試退件' };
assert(getWorkflowStatuses(rejected).signOff.state === 'inProgress', 'active rejection prevents sign-off completion');

console.log(`\nWorkflow status results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
