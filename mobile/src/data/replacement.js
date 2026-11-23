// Replacement ID rules, as confirmed by the Registrar.
export const REPLACEMENT_FEE = 100; // pesos, paid at the Registrar's Office when the new ID is picked up
export const REPLACEMENT_FEE_TEXT = `₱${REPLACEMENT_FEE}`;

// The affidavit of loss is only needed when the old ID was lost or stolen.
export const AFFIDAVIT_REASONS = ['Lost', 'Stolen'];
export const needsAffidavit = (reason) => AFFIDAVIT_REASONS.includes(reason);
