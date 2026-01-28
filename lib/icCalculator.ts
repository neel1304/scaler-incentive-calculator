import { ICInput, ICResult } from './types'

// IC Slab Table (Non-Probation)
const IC_SLAB_TABLE: Record<string, number> = {
  '4-5': 12500,
  '6-7': 15000,
  '8-9': 17500,
  '10-11': 20000,
  '12-13': 22500,
  '14-15': 25000,
  '16-17': 27500,
  '18+': 30000,
}

const PROBATION_INCENTIVE_PER_SALE = 5000
const REFERRAL_FLAT_INCENTIVE = 5000
const MANAGER_COUPON_FLAT_INCENTIVE = 10000

/**
 * Get slab label and incentive per sale for IC (Non-Probation)
 */
function getICSlabInfo(netSales: number): { slabLabel: string; incentivePerSale: number } | null {
  if (netSales >= 18) {
    return { slabLabel: '18+', incentivePerSale: IC_SLAB_TABLE['18+'] }
  } else if (netSales >= 16) {
    return { slabLabel: '16-17', incentivePerSale: IC_SLAB_TABLE['16-17'] }
  } else if (netSales >= 14) {
    return { slabLabel: '14-15', incentivePerSale: IC_SLAB_TABLE['14-15'] }
  } else if (netSales >= 12) {
    return { slabLabel: '12-13', incentivePerSale: IC_SLAB_TABLE['12-13'] }
  } else if (netSales >= 10) {
    return { slabLabel: '10-11', incentivePerSale: IC_SLAB_TABLE['10-11'] }
  } else if (netSales >= 8) {
    return { slabLabel: '8-9', incentivePerSale: IC_SLAB_TABLE['8-9'] }
  } else if (netSales >= 6) {
    return { slabLabel: '6-7', incentivePerSale: IC_SLAB_TABLE['6-7'] }
  } else if (netSales >= 4) {
    return { slabLabel: '4-5', incentivePerSale: IC_SLAB_TABLE['4-5'] }
  }
  
  return null // Below minimum threshold
}

/**
 * Calculate IC Incentive
 */
export function calculateICIncentive(input: ICInput): ICResult {
  // Probation Logic
  if (input.employmentStatus === 'Probation') {
    // Probation: Only non-discounted sales are incentivized at flat 5000
    // Referral and manager coupon are NOT paid in probation
    const nonDiscountedIncentive = input.nonDiscountedNetSales * PROBATION_INCENTIVE_PER_SALE
    
    return {
      eligible: true,
      netSales: input.netSales,
      slabLabel: 'Probation',
      incentivePerNonDiscountedSale: PROBATION_INCENTIVE_PER_SALE,
      nonDiscountedIncentive,
      referralIncentive: 0,
      managerCouponIncentive: 0,
      totalIncentive: nonDiscountedIncentive,
      message: 'Probation: Only non-discounted net sales are incentivized',
    }
  }

  // Non-Probation Logic
  const slabInfo = getICSlabInfo(input.netSales)

  if (!slabInfo) {
    return {
      eligible: false,
      netSales: input.netSales,
      slabLabel: '',
      incentivePerNonDiscountedSale: 0,
      nonDiscountedIncentive: 0,
      referralIncentive: 0,
      managerCouponIncentive: 0,
      totalIncentive: 0,
      message: 'Not eligible: Net sales must be at least 4 for the 4-week cohort',
    }
  }

  const { slabLabel, incentivePerSale } = slabInfo

  // Calculate incentives
  const nonDiscountedIncentive = input.nonDiscountedNetSales * incentivePerSale
  const referralIncentive = input.referralSalesCount * REFERRAL_FLAT_INCENTIVE
  const managerCouponIncentive = input.managerCouponSalesCount * MANAGER_COUPON_FLAT_INCENTIVE

  const totalIncentive = nonDiscountedIncentive + referralIncentive + managerCouponIncentive

  return {
    eligible: true,
    netSales: input.netSales,
    slabLabel,
    incentivePerNonDiscountedSale: incentivePerSale,
    nonDiscountedIncentive,
    referralIncentive,
    managerCouponIncentive,
    totalIncentive,
  }
}
