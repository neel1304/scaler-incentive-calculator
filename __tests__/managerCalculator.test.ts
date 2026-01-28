import { describe, it, expect } from 'vitest'
import { calculateManagerIncentive } from '../lib/managerCalculator'
import { ManagerInput } from '../lib/types'

describe('Manager Incentive Calculator', () => {
  describe('Eligibility', () => {
    it('should return not eligible when team size < 5', () => {
      const input: ManagerInput = {
        frozenTeamSize: 4,
        cohortWeeks: 4,
        grossSales: 40,
        netSales: 35,
        nonDiscountedNetSales: 20,
        managerCouponNetSales: 10,
        referralNetSales: 5,
      }

      const result = calculateManagerIncentive(input)
      expect(result.eligible).toBe(false)
      expect(result.message).toContain('Team size must be at least 5')
    })

    it('should return not eligible when productivity < 0.8', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 20,
        netSales: 20,
        nonDiscountedNetSales: 20,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 20/10/4 = 0.5 (below 0.8)
      expect(result.eligible).toBe(false)
      expect(result.netProductivity).toBe(0.5)
      expect(result.message).toContain('Net productivity must be at least 0.80')
    })
  })

  describe('Productivity Calculation', () => {
    it('should calculate and floor productivity correctly', () => {
      const input: ManagerInput = {
        frozenTeamSize: 9,
        cohortWeeks: 4,
        grossSales: 42,
        netSales: 37,
        nonDiscountedNetSales: 18,
        managerCouponNetSales: 12,
        referralNetSales: 7,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 37/9/4 = 1.027777... → floor to 1.02
      expect(result.netProductivity).toBe(1.02)
    })

    it('should floor productivity to 2 decimals, not round', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 50,
        netSales: 37,
        nonDiscountedNetSales: 37,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 37/10/4 = 0.925 → floor to 0.92
      expect(result.netProductivity).toBe(0.92)
    })
  })

  describe('Team Category', () => {
    it('should categorize team size 5-8 correctly', () => {
      const input: ManagerInput = {
        frozenTeamSize: 7,
        cohortWeeks: 4,
        grossSales: 30,
        netSales: 28,
        nonDiscountedNetSales: 28,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      expect(result.teamCategory).toBe('5-8')
    })

    it('should categorize team size 9-12 correctly', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 50,
        netSales: 40,
        nonDiscountedNetSales: 40,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      expect(result.teamCategory).toBe('9-12')
    })

    it('should categorize team size 13+ correctly', () => {
      const input: ManagerInput = {
        frozenTeamSize: 15,
        cohortWeeks: 4,
        grossSales: 80,
        netSales: 72,
        nonDiscountedNetSales: 72,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      expect(result.teamCategory).toBe('13+')
    })
  })

  describe('Slab Matching', () => {
    it('should match correct slab for productivity 1.01-1.10', () => {
      const input: ManagerInput = {
        frozenTeamSize: 9,
        cohortWeeks: 4,
        grossSales: 42,
        netSales: 37,
        nonDiscountedNetSales: 37,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 1.02, team 9-12 → 11000 per sale
      expect(result.slabLabel).toBe('1.01-1.10')
      expect(result.incentivePerSale).toBe(11000)
    })

    it('should use top slab for productivity >= 1.21', () => {
      const input: ManagerInput = {
        frozenTeamSize: 8,
        cohortWeeks: 4,
        grossSales: 50,
        netSales: 48,
        nonDiscountedNetSales: 48,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 48/8/4 = 1.5, team 5-8 → 12000 per sale (top slab)
      expect(result.slabLabel).toBe('1.21-1.30')
      expect(result.incentivePerSale).toBe(12000)
    })
  })

  describe('Incentive Breakdown', () => {
    it('should calculate breakdown correctly (Scenario 1 from policy)', () => {
      const input: ManagerInput = {
        frozenTeamSize: 9,
        cohortWeeks: 4,
        grossSales: 42,
        netSales: 37,
        nonDiscountedNetSales: 18,
        managerCouponNetSales: 12,
        referralNetSales: 7,
      }

      const result = calculateManagerIncentive(input)
      
      // Expected: productivity 1.02, slab 1.01-1.10, team 9-12 → 11000/sale
      expect(result.incentivePerSale).toBe(11000)
      
      // A = 18 * 11000 = 198000
      expect(result.breakdownA).toBe(198000)
      
      // B = 12 * 11000 = 132000
      expect(result.breakdownB).toBe(132000)
      
      // C = 7 * (11000 * 0.5) = 38500
      expect(result.breakdownC).toBe(38500)
      
      // Gross = 198000 + 132000 + 38500 = 368500
      expect(result.grossIncentive).toBe(368500)
      
      // GTN = 37/42 * 100 = 88.09 (no penalty)
      expect(result.gtnPercent).toBe(88.09)
      expect(result.penaltyApplied).toBe(false)
      expect(result.finalIncentive).toBe(368500)
    })

    it('should calculate breakdown with GTN penalty (Scenario 2 from policy)', () => {
      const input: ManagerInput = {
        frozenTeamSize: 8,
        cohortWeeks: 4,
        grossSales: 38,
        netSales: 30,
        nonDiscountedNetSales: 7,
        managerCouponNetSales: 20,
        referralNetSales: 3,
      }

      const result = calculateManagerIncentive(input)
      
      // Productivity = 30/8/4 = 0.9375 → floor to 0.93
      expect(result.netProductivity).toBe(0.93)
      
      // Slab 0.91-0.95, team 5-8 → 6000/sale
      expect(result.slabLabel).toBe('0.91-0.95')
      expect(result.incentivePerSale).toBe(6000)
      
      // A = 7 * 6000 = 42000
      expect(result.breakdownA).toBe(42000)
      
      // B = 20 * 6000 = 120000
      expect(result.breakdownB).toBe(120000)
      
      // C = 3 * (6000 * 0.5) = 9000
      expect(result.breakdownC).toBe(9000)
      
      // Gross = 171000
      expect(result.grossIncentive).toBe(171000)
      
      // GTN = 30/38 * 100 = 78.94 (below 80, penalty applies)
      expect(result.gtnPercent).toBe(78.94)
      expect(result.penaltyApplied).toBe(true)
      
      // Penalty = 0.2 * 171000 = 34200
      expect(result.penaltyAmount).toBe(34200)
      
      // Final = 171000 - 34200 = 136800
      expect(result.finalIncentive).toBe(136800)
    })

    it('should handle referral multiplier correctly', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 50,
        netSales: 40,
        nonDiscountedNetSales: 0,
        managerCouponNetSales: 0,
        referralNetSales: 40,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 40/10/4 = 1.0
      // Slab 0.96-1.00, team 9-12 → 9500/sale
      expect(result.incentivePerSale).toBe(9500)
      
      // C = 40 * (9500 * 0.5) = 190000
      expect(result.breakdownC).toBe(190000)
      expect(result.grossIncentive).toBe(190000)
    })
  })

  describe('GTN Penalty', () => {
    it('should not apply penalty when GTN >= 80%', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 100,
        netSales: 80,
        nonDiscountedNetSales: 80,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      expect(result.gtnPercent).toBe(80)
      expect(result.penaltyApplied).toBe(false)
      expect(result.penaltyAmount).toBe(0)
    })

    it('should apply 20% penalty when GTN < 80%', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 100,
        netSales: 75,
        nonDiscountedNetSales: 75,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      expect(result.gtnPercent).toBe(75)
      expect(result.penaltyApplied).toBe(true)
      // 20% of gross incentive
      expect(result.penaltyAmount).toBeGreaterThan(0)
      expect(result.finalIncentive).toBeLessThan(result.grossIncentive)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero sales correctly', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 0,
        netSales: 0,
        nonDiscountedNetSales: 0,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      expect(result.netProductivity).toBe(0)
      expect(result.eligible).toBe(false)
    })

    it('should handle exact productivity boundaries', () => {
      const input: ManagerInput = {
        frozenTeamSize: 10,
        cohortWeeks: 4,
        grossSales: 32,
        netSales: 32,
        nonDiscountedNetSales: 32,
        managerCouponNetSales: 0,
        referralNetSales: 0,
      }

      const result = calculateManagerIncentive(input)
      // Productivity = 32/10/4 = 0.8 exactly
      expect(result.netProductivity).toBe(0.8)
      expect(result.eligible).toBe(true)
      expect(result.slabLabel).toBe('0.80-0.85')
    })
  })
})
