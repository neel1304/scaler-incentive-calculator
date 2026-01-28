// Role Types
export type Role = 'MANAGER' | 'IC'

export type EmploymentStatus = 'Probation' | 'Non-Probation'

// Manager Input Types
export interface ManagerInput {
  frozenTeamSize: number
  cohortWeeks: number
  grossSales: number
  netSales: number
  nonDiscountedNetSales: number
  managerCouponNetSales: number
  referralNetSales: number
}

// IC Input Types
export interface ICInput {
  employmentStatus: EmploymentStatus
  cohortWeeks: number
  netSales: number
  nonDiscountedNetSales: number
  referralSalesCount: number
  managerCouponSalesCount: number
}

// Manager Output Types
export type TeamCategory = '5-8' | '9-12' | '13+'

export interface ManagerResult {
  eligible: boolean
  netProductivity: number
  teamCategory: TeamCategory
  slabLabel: string
  incentivePerSale: number
  breakdownA: number  // Non-discounted
  breakdownB: number  // Manager coupon
  breakdownC: number  // Referral
  grossIncentive: number
  gtnPercent: number
  penaltyApplied: boolean
  penaltyAmount: number
  finalIncentive: number
  message?: string
}

// IC Output Types
export interface ICResult {
  eligible: boolean
  netSales: number
  slabLabel: string
  incentivePerNonDiscountedSale: number
  nonDiscountedIncentive: number
  referralIncentive: number
  managerCouponIncentive: number
  totalIncentive: number
  message?: string
}

// Validation Error Types
export interface ValidationError {
  field: string
  message: string
}
