import { describe, it, expect } from 'vitest'
import { calculateICIncentive } from '../lib/icCalculator'
import { ICInput } from '../lib/types'

describe('IC Incentive Calculator', () => {
  describe('Probation Status', () => {
    it('should only pay for non-discounted sales in probation', () => {
      const input: ICInput = {
        employmentStatus: 'Probation',
        cohortWeeks: 4,
        netSales: 10,
        nonDiscountedNetSales: 6,
        referralSalesCount: 2,
        managerCouponSalesCount: 2,
      }

      const result = calculateICIncentive(input)
      
      expect(result.eligible).toBe(true)
      expect(result.slabLabel).toBe('Probation')
      expect(result.incentivePerNonDiscountedSale).toBe(5000)
      
      // Only non-discounted: 6 * 5000 = 30000
      expect(result.nonDiscountedIncentive).toBe(30000)
      
      // Referral and manager coupon should be 0 in probation
      expect(result.referralIncentive).toBe(0)
      expect(result.managerCouponIncentive).toBe(0)
      expect(result.totalIncentive).toBe(30000)
    })

    it('should work with zero non-discounted sales in probation', () => {
      const input: ICInput = {
        employmentStatus: 'Probation',
        cohortWeeks: 4,
        netSales: 5,
        nonDiscountedNetSales: 0,
        referralSalesCount: 3,
        managerCouponSalesCount: 2,
      }

      const result = calculateICIncentive(input)
      
      expect(result.eligible).toBe(true)
      expect(result.totalIncentive).toBe(0)
    })
  })

  describe('Non-Probation Eligibility', () => {
    it('should return not eligible when net sales < 4', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 3,
        nonDiscountedNetSales: 2,
        referralSalesCount: 1,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.eligible).toBe(false)
      expect(result.message).toContain('Net sales must be at least 4')
    })

    it('should be eligible at exactly 4 net sales', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 4,
        nonDiscountedNetSales: 4,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.eligible).toBe(true)
      expect(result.slabLabel).toBe('4-5')
    })
  })

  describe('Slab Matching', () => {
    it('should match 4-5 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 5,
        nonDiscountedNetSales: 5,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('4-5')
      expect(result.incentivePerNonDiscountedSale).toBe(12500)
    })

    it('should match 6-7 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 7,
        nonDiscountedNetSales: 7,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('6-7')
      expect(result.incentivePerNonDiscountedSale).toBe(15000)
    })

    it('should match 8-9 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 9,
        nonDiscountedNetSales: 9,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('8-9')
      expect(result.incentivePerNonDiscountedSale).toBe(17500)
    })

    it('should match 10-11 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 11,
        nonDiscountedNetSales: 11,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('10-11')
      expect(result.incentivePerNonDiscountedSale).toBe(20000)
    })

    it('should match 12-13 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 13,
        nonDiscountedNetSales: 13,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('12-13')
      expect(result.incentivePerNonDiscountedSale).toBe(22500)
    })

    it('should match 14-15 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 15,
        nonDiscountedNetSales: 15,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('14-15')
      expect(result.incentivePerNonDiscountedSale).toBe(25000)
    })

    it('should match 16-17 slab correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 17,
        nonDiscountedNetSales: 17,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('16-17')
      expect(result.incentivePerNonDiscountedSale).toBe(27500)
    })

    it('should match 18+ slab for 18 and above', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 20,
        nonDiscountedNetSales: 20,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('18+')
      expect(result.incentivePerNonDiscountedSale).toBe(30000)
    })
  })

  describe('Incentive Breakdown', () => {
    it('should calculate non-discounted sales correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 10,
        nonDiscountedNetSales: 10,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      
      // 10-11 slab → 20000 per sale
      expect(result.incentivePerNonDiscountedSale).toBe(20000)
      
      // 10 * 20000 = 200000
      expect(result.nonDiscountedIncentive).toBe(200000)
      expect(result.totalIncentive).toBe(200000)
    })

    it('should calculate referral incentive correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 10,
        nonDiscountedNetSales: 5,
        referralSalesCount: 3,
        managerCouponSalesCount: 2,
      }

      const result = calculateICIncentive(input)
      
      // 10-11 slab → 20000 per non-discounted sale
      // Non-discounted: 5 * 20000 = 100000
      expect(result.nonDiscountedIncentive).toBe(100000)
      
      // Referral: 3 * 5000 = 15000
      expect(result.referralIncentive).toBe(15000)
      
      // Manager coupon: 2 * 10000 = 20000
      expect(result.managerCouponIncentive).toBe(20000)
      
      // Total: 100000 + 15000 + 20000 = 135000
      expect(result.totalIncentive).toBe(135000)
    })

    it('should handle mixed sale types correctly', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 15,
        nonDiscountedNetSales: 8,
        referralSalesCount: 4,
        managerCouponSalesCount: 3,
      }

      const result = calculateICIncentive(input)
      
      // 14-15 slab → 25000 per non-discounted sale
      expect(result.incentivePerNonDiscountedSale).toBe(25000)
      
      // Non-discounted: 8 * 25000 = 200000
      expect(result.nonDiscountedIncentive).toBe(200000)
      
      // Referral: 4 * 5000 = 20000
      expect(result.referralIncentive).toBe(20000)
      
      // Manager coupon: 3 * 10000 = 30000
      expect(result.managerCouponIncentive).toBe(30000)
      
      // Total: 200000 + 20000 + 30000 = 250000
      expect(result.totalIncentive).toBe(250000)
    })

    it('should handle only referral and manager coupon sales', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 10,
        nonDiscountedNetSales: 0,
        referralSalesCount: 5,
        managerCouponSalesCount: 5,
      }

      const result = calculateICIncentive(input)
      
      // Non-discounted: 0
      expect(result.nonDiscountedIncentive).toBe(0)
      
      // Referral: 5 * 5000 = 25000
      expect(result.referralIncentive).toBe(25000)
      
      // Manager coupon: 5 * 10000 = 50000
      expect(result.managerCouponIncentive).toBe(50000)
      
      // Total: 75000
      expect(result.totalIncentive).toBe(75000)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero sales correctly in non-probation', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 0,
        nonDiscountedNetSales: 0,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.eligible).toBe(false)
      expect(result.totalIncentive).toBe(0)
    })

    it('should handle exact slab boundaries', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 6,
        nonDiscountedNetSales: 6,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('6-7')
      
      // Test upper boundary
      const input2: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 8,
        nonDiscountedNetSales: 8,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result2 = calculateICIncentive(input2)
      expect(result2.slabLabel).toBe('8-9')
    })

    it('should handle very high net sales (18+)', () => {
      const input: ICInput = {
        employmentStatus: 'Non-Probation',
        cohortWeeks: 4,
        netSales: 100,
        nonDiscountedNetSales: 100,
        referralSalesCount: 0,
        managerCouponSalesCount: 0,
      }

      const result = calculateICIncentive(input)
      expect(result.slabLabel).toBe('18+')
      expect(result.incentivePerNonDiscountedSale).toBe(30000)
      expect(result.totalIncentive).toBe(3000000)
    })
  })
})
