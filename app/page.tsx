'use client'

import { useState } from 'react'
import { Role, ManagerInput, ICInput, ManagerResult, ICResult, EmploymentStatus } from '@/lib/types'
import { calculateManagerIncentive } from '@/lib/managerCalculator'
import { calculateICIncentive } from '@/lib/icCalculator'
import { managerInputSchema, icInputSchema } from '@/lib/validation'
import { formatINR, formatDecimal } from '@/lib/utils'
import { ZodError } from 'zod'

export default function Home() {
  const [role, setRole] = useState<Role>('MANAGER')
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  // Manager State
  const [managerData, setManagerData] = useState<ManagerInput>({
    frozenTeamSize: 9,
    cohortWeeks: 4,
    grossSales: 42,
    netSales: 37,
    nonDiscountedNetSales: 18,
    managerCouponNetSales: 12,
    referralNetSales: 7,
  })
  const [managerErrors, setManagerErrors] = useState<Record<string, string>>({})
  
  // IC State
  const [icData, setICData] = useState<ICInput>({
    employmentStatus: 'Non-Probation',
    cohortWeeks: 4,
    netSales: 10,
    nonDiscountedNetSales: 6,
    referralSalesCount: 2,
    managerCouponSalesCount: 2,
  })
  const [icErrors, setICErrors] = useState<Record<string, string>>({})

  // Results
  const [managerResult, setManagerResult] = useState<ManagerResult | null>(null)
  const [icResult, setICResult] = useState<ICResult | null>(null)

  // Calculate Manager
  const calculateManager = () => {
    try {
      const validated = managerInputSchema.parse(managerData)
      const result = calculateManagerIncentive(validated)
      setManagerResult(result)
      setManagerErrors({})
      setShowBreakdown(true)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message
          }
        })
        setManagerErrors(errors)
      }
    }
  }

  // Calculate IC
  const calculateIC = () => {
    try {
      const validated = icInputSchema.parse(icData)
      const result = calculateICIncentive(validated)
      setICResult(result)
      setICErrors({})
      setShowBreakdown(true)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message
          }
        })
        setICErrors(errors)
      }
    }
  }

  // Auto-calculate on input change
  const handleManagerChange = (field: keyof ManagerInput, value: number) => {
    const newData = { ...managerData, [field]: value }
    setManagerData(newData)
    // Auto-recalculate
    setTimeout(() => {
      try {
        const validated = managerInputSchema.parse(newData)
        const result = calculateManagerIncentive(validated)
        setManagerResult(result)
        setManagerErrors({})
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {}
          error.errors.forEach((err) => {
            if (err.path.length > 0) {
              errors[err.path[0] as string] = err.message
            }
          })
          setManagerErrors(errors)
        }
      }
    }, 300)
  }

  const handleICChange = (field: keyof ICInput, value: number | EmploymentStatus) => {
    const newData = { ...icData, [field]: value }
    setICData(newData)
    // Auto-recalculate
    setTimeout(() => {
      try {
        const validated = icInputSchema.parse(newData)
        const result = calculateICIncentive(validated)
        setICResult(result)
        setICErrors({})
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {}
          error.errors.forEach((err) => {
            if (err.path.length > 0) {
              errors[err.path[0] as string] = err.message
            }
          })
          setICErrors(errors)
        }
      }
    }, 300)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-scaler-blue to-scaler-orange bg-clip-text text-transparent mb-3">
            Scaler Incentive Calculator
          </h1>
          <p className="text-slate-600 text-lg">
            Calculate BD incentives for February 2026 Cohort
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2 border-2 border-slate-200">
            <button
              onClick={() => {
                setRole('MANAGER')
                setShowBreakdown(false)
              }}
              className={`toggle-button ${role === 'MANAGER' ? 'toggle-active' : 'toggle-inactive'}`}
            >
              Manager
            </button>
            <button
              onClick={() => {
                setRole('IC')
                setShowBreakdown(false)
              }}
              className={`toggle-button ${role === 'IC' ? 'toggle-active' : 'toggle-inactive'}`}
            >
              IC (Individual Contributor)
            </button>
          </div>
        </div>

        {/* Manager Form */}
        {role === 'MANAGER' && (
          <div className="space-y-6">
            <div className="result-card">
              <h2 className="text-2xl font-bold font-display text-scaler-blue mb-6">
                Manager Inputs
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    Frozen Team Size
                    <span className="text-slate-400 text-xs ml-1">(non-probation only)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={managerData.frozenTeamSize}
                    onChange={(e) => handleManagerChange('frozenTeamSize', parseInt(e.target.value) || 0)}
                    className={`input-field ${managerErrors.frozenTeamSize ? 'input-error' : ''}`}
                  />
                  {managerErrors.frozenTeamSize && (
                    <p className="error-text">{managerErrors.frozenTeamSize}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Cohort Weeks
                    <span className="text-slate-400 text-xs ml-1">(locked to 4)</span>
                  </label>
                  <input
                    type="number"
                    value={4}
                    disabled
                    className="input-field bg-slate-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label">Gross Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={managerData.grossSales}
                    onChange={(e) => handleManagerChange('grossSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${managerErrors.grossSales ? 'input-error' : ''}`}
                  />
                  {managerErrors.grossSales && (
                    <p className="error-text">{managerErrors.grossSales}</p>
                  )}
                </div>

                <div>
                  <label className="label">Net Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={managerData.netSales}
                    onChange={(e) => handleManagerChange('netSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${managerErrors.netSales ? 'input-error' : ''}`}
                  />
                  {managerErrors.netSales && (
                    <p className="error-text">{managerErrors.netSales}</p>
                  )}
                </div>

                <div>
                  <label className="label">Non-Discounted Net Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={managerData.nonDiscountedNetSales}
                    onChange={(e) => handleManagerChange('nonDiscountedNetSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${managerErrors.nonDiscountedNetSales ? 'input-error' : ''}`}
                  />
                  {managerErrors.nonDiscountedNetSales && (
                    <p className="error-text">{managerErrors.nonDiscountedNetSales}</p>
                  )}
                </div>

                <div>
                  <label className="label">Manager Coupon Net Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={managerData.managerCouponNetSales}
                    onChange={(e) => handleManagerChange('managerCouponNetSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${managerErrors.managerCouponNetSales ? 'input-error' : ''}`}
                  />
                  {managerErrors.managerCouponNetSales && (
                    <p className="error-text">{managerErrors.managerCouponNetSales}</p>
                  )}
                </div>

                <div>
                  <label className="label">Referral Net Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={managerData.referralNetSales}
                    onChange={(e) => handleManagerChange('referralNetSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${managerErrors.referralNetSales ? 'input-error' : ''}`}
                  />
                  {managerErrors.referralNetSales && (
                    <p className="error-text">{managerErrors.referralNetSales}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Manager Results */}
            {managerResult && (
              <div className="result-card">
                {!managerResult.eligible ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-600 mb-2">Not Eligible</h3>
                    <p className="text-slate-600">{managerResult.message}</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-scaler-blue mb-2">Eligible!</h3>
                      <p className="text-5xl font-bold font-display bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                        {formatINR(managerResult.finalIncentive)}
                      </p>
                      <p className="text-slate-600 mt-2">Final Incentive Amount</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-slate-600 mb-1">Net Productivity</p>
                        <p className="text-2xl font-bold text-scaler-blue">
                          {formatDecimal(managerResult.netProductivity)}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-sm text-slate-600 mb-1">Team Category</p>
                        <p className="text-2xl font-bold text-scaler-orange">{managerResult.teamCategory}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600 mb-1">Slab</p>
                        <p className="text-2xl font-bold text-purple-600">{managerResult.slabLabel}</p>
                      </div>
                    </div>

                    {/* Breakdown Toggle */}
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-colors duration-200 flex items-center justify-between"
                    >
                      <span>How this was calculated</span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Breakdown Details */}
                    {showBreakdown && (
                      <div className="mt-6 space-y-4 pt-6 border-t-2 border-slate-200">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Incentive per sale:</span>
                            <span className="font-semibold">{formatINR(managerResult.incentivePerSale)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">
                              A. Non-discounted ({managerData.nonDiscountedNetSales} × {formatINR(managerResult.incentivePerSale)}):
                            </span>
                            <span className="font-semibold text-green-600">{formatINR(managerResult.breakdownA)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">
                              B. Manager coupon ({managerData.managerCouponNetSales} × {formatINR(managerResult.incentivePerSale)}):
                            </span>
                            <span className="font-semibold text-blue-600">{formatINR(managerResult.breakdownB)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">
                              C. Referral ({managerData.referralNetSales} × {formatINR(managerResult.incentivePerSale * 0.5)}):
                            </span>
                            <span className="font-semibold text-purple-600">{formatINR(managerResult.breakdownC)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                            <span className="font-semibold">Gross Incentive (A + B + C):</span>
                            <span className="font-bold text-lg">{formatINR(managerResult.grossIncentive)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">GTN%:</span>
                            <span className={`font-semibold ${managerResult.gtnPercent < 80 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatDecimal(managerResult.gtnPercent)}%
                            </span>
                          </div>
                          {managerResult.penaltyApplied && (
                            <div className="flex justify-between items-center">
                              <span className="text-red-600">Penalty (20% for GTN &lt; 80%):</span>
                              <span className="font-semibold text-red-600">- {formatINR(managerResult.penaltyAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t-2 border-scaler-orange">
                            <span className="font-bold text-lg">Final Incentive:</span>
                            <span className="font-bold text-2xl text-green-600">{formatINR(managerResult.finalIncentive)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* IC Form */}
        {role === 'IC' && (
          <div className="space-y-6">
            <div className="result-card">
              <h2 className="text-2xl font-bold font-display text-scaler-blue mb-6">
                IC Inputs
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Employment Status</label>
                  <select
                    value={icData.employmentStatus}
                    onChange={(e) => handleICChange('employmentStatus', e.target.value as EmploymentStatus)}
                    className="input-field"
                  >
                    <option value="Non-Probation">Non-Probation</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Cohort Weeks
                    <span className="text-slate-400 text-xs ml-1">(locked to 4)</span>
                  </label>
                  <input
                    type="number"
                    value={4}
                    disabled
                    className="input-field bg-slate-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label">Net Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={icData.netSales}
                    onChange={(e) => handleICChange('netSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${icErrors.netSales ? 'input-error' : ''}`}
                  />
                  {icErrors.netSales && (
                    <p className="error-text">{icErrors.netSales}</p>
                  )}
                </div>

                <div>
                  <label className="label">Non-Discounted Net Sales</label>
                  <input
                    type="number"
                    min="0"
                    value={icData.nonDiscountedNetSales}
                    onChange={(e) => handleICChange('nonDiscountedNetSales', parseInt(e.target.value) || 0)}
                    className={`input-field ${icErrors.nonDiscountedNetSales ? 'input-error' : ''}`}
                  />
                  {icErrors.nonDiscountedNetSales && (
                    <p className="error-text">{icErrors.nonDiscountedNetSales}</p>
                  )}
                </div>

                <div>
                  <label className="label">Referral Sales Count</label>
                  <input
                    type="number"
                    min="0"
                    value={icData.referralSalesCount}
                    onChange={(e) => handleICChange('referralSalesCount', parseInt(e.target.value) || 0)}
                    className={`input-field ${icErrors.referralSalesCount ? 'input-error' : ''}`}
                  />
                  {icErrors.referralSalesCount && (
                    <p className="error-text">{icErrors.referralSalesCount}</p>
                  )}
                </div>

                <div>
                  <label className="label">Manager Coupon Sales Count</label>
                  <input
                    type="number"
                    min="0"
                    value={icData.managerCouponSalesCount}
                    onChange={(e) => handleICChange('managerCouponSalesCount', parseInt(e.target.value) || 0)}
                    className={`input-field ${icErrors.managerCouponSalesCount ? 'input-error' : ''}`}
                  />
                  {icErrors.managerCouponSalesCount && (
                    <p className="error-text">{icErrors.managerCouponSalesCount}</p>
                  )}
                </div>
              </div>

              {icData.employmentStatus === 'Probation' && (
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Probation incentive applies only to non-discounted net sales. 
                    Referral and manager coupon sales are not paid during probation.
                  </p>
                </div>
              )}
            </div>

            {/* IC Results */}
            {icResult && (
              <div className="result-card">
                {!icResult.eligible ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-600 mb-2">Not Eligible</h3>
                    <p className="text-slate-600">{icResult.message}</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-scaler-blue mb-2">Eligible!</h3>
                      <p className="text-5xl font-bold font-display bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                        {formatINR(icResult.totalIncentive)}
                      </p>
                      <p className="text-slate-600 mt-2">Total Incentive Amount</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-slate-600 mb-1">Net Sales</p>
                        <p className="text-2xl font-bold text-scaler-blue">{icResult.netSales}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600 mb-1">Slab</p>
                        <p className="text-2xl font-bold text-purple-600">{icResult.slabLabel}</p>
                      </div>
                    </div>

                    {/* Breakdown Toggle */}
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-colors duration-200 flex items-center justify-between"
                    >
                      <span>How this was calculated</span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Breakdown Details */}
                    {showBreakdown && (
                      <div className="mt-6 space-y-4 pt-6 border-t-2 border-slate-200">
                        <div className="space-y-3">
                          {icData.employmentStatus === 'Non-Probation' && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Incentive per non-discounted sale:</span>
                              <span className="font-semibold">{formatINR(icResult.incentivePerNonDiscountedSale)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">
                              Non-discounted sales ({icData.nonDiscountedNetSales} × {formatINR(icResult.incentivePerNonDiscountedSale)}):
                            </span>
                            <span className="font-semibold text-green-600">{formatINR(icResult.nonDiscountedIncentive)}</span>
                          </div>
                          {icData.employmentStatus === 'Non-Probation' && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">
                                  Referral sales ({icData.referralSalesCount} × ₹5,000):
                                </span>
                                <span className="font-semibold text-blue-600">{formatINR(icResult.referralIncentive)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">
                                  Manager coupon sales ({icData.managerCouponSalesCount} × ₹10,000):
                                </span>
                                <span className="font-semibold text-purple-600">{formatINR(icResult.managerCouponIncentive)}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t-2 border-scaler-orange">
                            <span className="font-bold text-lg">Total Incentive:</span>
                            <span className="font-bold text-2xl text-green-600">{formatINR(icResult.totalIncentive)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {icResult.message && (
                      <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-sm text-blue-700">{icResult.message}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Scaler BD Incentive Calculator · February 2026 Cohort</p>
          <p className="mt-1">This is a calculation tool only. Official payouts are subject to policy terms and conditions.</p>
        </div>
      </div>
    </div>
  )
}
