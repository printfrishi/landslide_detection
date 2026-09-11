/**
 * Risk level metadata. `variant` maps a risk level to a Badge variant and
 * `rank` orders levels from lowest to highest severity.
 */
export const RISK_LEVELS = {
  LOW: { label: 'Low', variant: 'success', rank: 1 },
  MODERATE: { label: 'Moderate', variant: 'warning', rank: 2 },
  HIGH: { label: 'High', variant: 'danger', rank: 3 },
  CRITICAL: { label: 'Critical', variant: 'critical', rank: 4 },
};

export const RISK_LEVEL_KEYS = Object.keys(RISK_LEVELS);

/** Severity threshold from which a zone counts as "high risk". */
export const HIGH_RISK_THRESHOLD = RISK_LEVELS.HIGH.rank;

/** Returns the most severe risk level from a list of risk levels. */
export function highestRiskLevel(levels) {
  return levels.reduce(
    (top, level) => ((RISK_LEVELS[level]?.rank ?? 0) > (RISK_LEVELS[top]?.rank ?? 0) ? level : top),
    'LOW'
  );
}

export function riskLevelLabel(level) {
  return RISK_LEVELS[level]?.label ?? level;
}
