/**
 * Digital Twin models. The campus shell (perimeter, gate, roads, grounds)
 * and the major buildings both live under ./campus; building interiors
 * will compose on top of these in a later phase.
 */
export { default as PrisonCampus } from './campus/PrisonCampus';
export { default as PrisonBuildings } from './campus/PrisonBuildings';
export { default as PrisonSecurity } from './campus/security/PrisonSecurity';
export { default as PrisonActivity } from './campus/activity/PrisonActivity';

export { default as MaximumSecurityWing } from './campus/buildings/MaximumSecurityWing';
export { default as CellBlockA } from './campus/buildings/CellBlockA';
export { default as CellBlockB } from './campus/buildings/CellBlockB';
export { default as CellBlockC } from './campus/buildings/CellBlockC';
export { default as RecreationYard } from './campus/buildings/RecreationYard';
export { default as MedicalWing } from './campus/buildings/MedicalWing';
export { default as IntakeProcessing } from './campus/buildings/IntakeProcessing';
export { default as VisitorProcessing } from './campus/buildings/VisitorProcessing';
