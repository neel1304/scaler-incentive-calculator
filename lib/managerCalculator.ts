import { ManagerInput, ManagerResult, TeamCategory } from './types'

// Manager Slab Table
const MANAGER_SLAB_TABLE: Record<TeamCategory, Record<string, number>> = {
  '5-8': {
    '0.80-0.85': 4000,
    '0.86-0.90': 5000,
    '0.91-0.95': 6000,
    '0.96-1.00': 7000,
    '1.01-1.10': 8000,
    '1.11-1.20': 10000,
    '1.21-1.30': 12000,
  },
  '9-12': {
    '0.80-0.85': 5000,
    '0.86-0.90': 6500,
    '0.91-0.95': 8000,
    '0.96-1.00': 9500,
    '1.01-1.10': 11000,
    '1.11-1.20': 13000,
    '1.21-1.30': 15000,
  },
  '13+': {
    '0.80-0.85': 7000,
    '0.86-0.90': 8500,
    '0.91-0.95': 10000,
    '0.96-1.00': 11500,
    '1.01-1.10': 13000,
    '1.11-1.20': 15000,
    '1.21-1.30': 20000,
  },
}

const GTN_PENALTY_THRESHOLD = 80
const PENALTY_RATE = 0.2
const REFERRAL_MULTIPLIER = 0.5

/**
 * Round down to 2 decimal places
 */
function floorToTwoDecimals(value: number): number {
  return Math.floor(value * 100) / 100
}

/**
 * Determine team size category
 */
function getTeamCategory(teamSize: number): TeamCategory {
  if (teamSize >= 13) return '13+'
  if (teamSize >= 9) return '9-12'
  return '5-8'
}

/**
 * Get slab label and incentive per sale based on productivity
 */
function getSlabInfo(
  productivity: number,
  teamCategory: TeamCategory
): { slabLabel: string; incentivePerSale: number } | null {
  // Below minimum threshold
  if (productivity < 0.8) {
    return null
  }

  // Determine slab
  let slabLabel: string
  if (productivity >= 1.21) {
    slabLabel = '1.21-1.30' // Top slab for productivity >= 1.21
  } else if (productivity >= 1.11) {
    slabLabel = '1.11-1.20'
  } else if (productivity >= 1.01) {
    slabLabel = '1.01-1.10'
  } else if (productivity >= 0.96) {
    slabLabel = '0.96-1.00'
  } else if (productivity >= 0.91) {
    slabLabel = '0.91-0.95'
  } else if (productivity >= 0.86) {
    slabLabel = '0.86-0.90'
  } else {
    slabLabel = '0.80-0.85'
  }

  const incentivePerSale = MANAGER_SLAB_TABLE[teamCategory][slabLabel]
  return { slabLabel, incentivePerSale }
}

/**
 * Calculate Manager Incentive
 */
export function calculateManagerIncentive(input: ManagerInput): ManagerResult {
  // Check eligibility: team size must be >= 5
  if (input.frozenTeamSize < 5) {
    return {
      eligible: false,
      netProductivity: 0,
      teamCategory: '5-8',
      slabLabel: '',
      incentivePerSale: 0,
      breakdownA: 0,
      breakdownB: 0,
      breakdownC: 0,
      grossIncentive: 0,
      gtnPercent: 0,
      penaltyApplied: false,
      penaltyAmount: 0,
      finalIncentive: 0,
      message: 'Not eligible: Team size must be at least 5 (non-probation members)',
    }
  }

  // Calculate net productivity
  const rawProductivity = input.netSales / input.frozenTeamSize / input.cohortWeeks
  const netProductivity = floorToTwoDecimals(rawProductivity)

  // Get team category
  const teamCategory = getTeamCategory(input.frozenTeamSize)

  // Get slab info
  const slabInfo = getSlabInfo(netProductivity, teamCategory)

  // Check productivity eligibility
  if (!slabInfo) {
    return {
      eligible: false,
      netProductivity,
      teamCategory,
      slabLabel: '',
      incentivePerSale: 0,
      breakdownA: 0,
      breakdownB: 0,
      breakdownC: 0,
      grossIncentive: 0,
      gtnPercent: 0,
      penaltyApplied: false,
      penaltyAmount: 0,
      finalIncentive: 0,
      message: 'Not eligible: Net productivity must be at least 0.80',
    }
  }

  const { slabLabel, incentivePerSale } = slabInfo

  // Calculate incentive breakdown
  const breakdownA = input.nonDiscountedNetSales * incentivePerSale
  const breakdownB = input.managerCouponNetSales * incentivePerSale
  const breakdownC = input.referralNetSales * (REFERRAL_MULTIPLIER * incentivePerSale)
  const grossIncentive = breakdownA + breakdownB + breakdownC

  // Calculate GTN percentage
  const gtnPercent = input.grossSales > 0 
    ? floorToTwoDecimals((input.netSales / input.grossSales) * 100)
    : 0

  // Apply penalty if GTN < 80%
  let penaltyApplied = false
  let penaltyAmount = 0
  let finalIncentive = grossIncentive

  if (gtnPercent < GTN_PENALTY_THRESHOLD) {
    penaltyApplied = true
    penaltyAmount = floorToTwoDecimals(PENALTY_RATE * grossIncentive)
    finalIncentive = grossIncentive - penaltyAmount
  }

  return {
    eligible: true,
    netProductivity,
    teamCategory,
    slabLabel,
    incentivePerSale,
    breakdownA: floorToTwoDecimals(breakdownA),
    breakdownB: floorToTwoDecimals(breakdownB),
    breakdownC: floorToTwoDecimals(breakdownC),
    grossIncentive: floorToTwoDecimals(grossIncentive),
    gtnPercent,
    penaltyApplied,
    penaltyAmount,
    finalIncentive: floorToTwoDecimals(finalIncentive),
  }
}
