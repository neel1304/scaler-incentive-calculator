import { z } from 'zod'

// Manager Validation Schema
export const managerInputSchema = z.object({
  frozenTeamSize: z.number().int().min(0, 'Team size must be non-negative'),
  cohortWeeks: z.number().int().positive('Cohort weeks must be positive'),
  grossSales: z.number().int().min(0, 'Gross sales must be non-negative'),
  netSales: z.number().int().min(0, 'Net sales must be non-negative'),
  nonDiscountedNetSales: z.number().int().min(0, 'Non-discounted net sales must be non-negative'),
  managerCouponNetSales: z.number().int().min(0, 'Manager coupon net sales must be non-negative'),
  referralNetSales: z.number().int().min(0, 'Referral net sales must be non-negative'),
}).refine(
  (data) => data.netSales <= data.grossSales,
  {
    message: 'Net sales cannot exceed gross sales',
    path: ['netSales'],
  }
).refine(
  (data) => data.nonDiscountedNetSales + data.managerCouponNetSales + data.referralNetSales <= data.netSales,
  {
    message: 'Sum of non-discounted, manager coupon, and referral sales cannot exceed net sales',
    path: ['nonDiscountedNetSales'],
  }
).refine(
  (data) => data.netSales === 0 || data.grossSales > 0,
  {
    message: 'Gross sales must be greater than 0 if net sales is greater than 0',
    path: ['grossSales'],
  }
)

// IC Validation Schema
export const icInputSchema = z.object({
  employmentStatus: z.enum(['Probation', 'Non-Probation']),
  cohortWeeks: z.number().int().positive('Cohort weeks must be positive'),
  netSales: z.number().int().min(0, 'Net sales must be non-negative'),
  nonDiscountedNetSales: z.number().int().min(0, 'Non-discounted net sales must be non-negative'),
  referralSalesCount: z.number().int().min(0, 'Referral sales count must be non-negative'),
  managerCouponSalesCount: z.number().int().min(0, 'Manager coupon sales count must be non-negative'),
}).refine(
  (data) => data.nonDiscountedNetSales + data.referralSalesCount + data.managerCouponSalesCount <= data.netSales,
  {
    message: 'Sum of non-discounted, referral, and manager coupon sales cannot exceed net sales',
    path: ['nonDiscountedNetSales'],
  }
)
