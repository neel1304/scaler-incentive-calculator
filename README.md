# Scaler Incentive Calculator

A production-quality web application for calculating BD incentives at Scaler for both Middle Management (Managers) and Individual Contributors (ICs) based on the February 2026 Cohort policy.

## Features

- **Dual Role Support**: Calculate incentives for both Manager and IC roles with a single toggle
- **Real-time Validation**: Instant input validation with clear error messages using Zod
- **Auto-calculation**: Results update automatically as you type
- **Detailed Breakdown**: Expandable section showing step-by-step calculation
- **Policy-compliant**: Implements exact rules from official Scaler BD incentive policies
- **Beautiful UI**: Clean, modern interface with Tailwind CSS
- **Fully Tested**: Comprehensive unit test coverage for all business logic

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Testing**: Vitest
- **State Management**: React Hooks

## Project Structure

```
scaler-incentive-calculator/
├── app/
│   ├── globals.css          # Global styles and Tailwind setup
│   ├── layout.tsx            # Root layout with fonts
│   └── page.tsx              # Main calculator UI (single-page app)
├── lib/
│   ├── types.ts              # TypeScript interfaces and types
│   ├── validation.ts         # Zod schemas for input validation
│   ├── managerCalculator.ts  # Manager incentive calculation engine
│   ├── icCalculator.ts       # IC incentive calculation engine
│   └── utils.ts              # Utility functions (formatting)
├── __tests__/
│   ├── managerCalculator.test.ts  # Manager calculator tests
│   └── icCalculator.test.ts       # IC calculator tests
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── vitest.config.ts
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Navigate to the project directory**:
   ```bash
   cd scaler-incentive-calculator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Usage Guide

### Manager Calculation

1. Click the **Manager** toggle at the top
2. Enter the following inputs:
   - **Frozen Team Size**: Number of non-probation team members (minimum 5 required)
   - **Gross Sales**: Total sales including refunds
   - **Net Sales**: Completed sales after refunds
   - **Non-Discounted Net Sales**: Sales without any discount codes
   - **Manager Coupon Net Sales**: Sales with manager discount codes
   - **Referral Net Sales**: Sales with referral codes

3. The calculator will automatically:
   - Validate all inputs
   - Calculate net productivity
   - Determine team category (5-8, 9-12, 13+)
   - Match the appropriate slab
   - Calculate incentive breakdown (A, B, C components)
   - Apply GTN penalty if applicable
   - Show final incentive amount

### IC Calculation

1. Click the **IC** toggle at the top
2. Select **Employment Status** (Probation or Non-Probation)
3. Enter the following inputs:
   - **Net Sales**: Total completed sales
   - **Non-Discounted Net Sales**: Count of sales without discounts
   - **Referral Sales Count**: Number of referral sales
   - **Manager Coupon Sales Count**: Number of manager coupon sales

4. The calculator will automatically:
   - Validate all inputs
   - Determine the appropriate slab based on net sales
   - Calculate incentives for each sale type
   - Apply probation rules (if applicable)
   - Show total incentive amount

### Probation Rules (IC Only)

- **Probation employees** receive ₹5,000 per non-discounted sale only
- Referral and manager coupon sales are **not paid** during probation
- Once probation ends, the standard slab-based policy applies

## Policy Implementation Details

### Manager Policy

**Eligibility**:
- Team size ≥ 5 (non-probation members only)
- Net productivity ≥ 0.80

**Productivity Calculation**:
```
Net Productivity = Net Sales / Frozen Team Size / Cohort Weeks
(Rounded DOWN to 2 decimals)
```

**Team Categories**:
- **5-8**: Small teams
- **9-12**: Medium teams  
- **13+**: Large teams

**Incentive Breakdown**:
- **A**: Non-discounted sales × Incentive per sale
- **B**: Manager coupon sales × Incentive per sale
- **C**: Referral sales × (0.5 × Incentive per sale)
- **Gross Incentive**: A + B + C

**GTN Penalty**:
- If GTN% < 80%: Penalty = 20% of gross incentive
- Final Incentive = Gross Incentive - Penalty

### IC Policy

**Non-Probation Slabs** (4-week cohort):
| Net Sales | Incentive per Non-Discounted Sale |
|-----------|-----------------------------------|
| 4-5       | ₹12,500                          |
| 6-7       | ₹15,000                          |
| 8-9       | ₹17,500                          |
| 10-11     | ₹20,000                          |
| 12-13     | ₹22,500                          |
| 14-15     | ₹25,000                          |
| 16-17     | ₹27,500                          |
| 18+       | ₹30,000                          |

**Additional Incentives**:
- Referral Sale: Flat ₹5,000 per sale
- Manager Coupon Sale: Flat ₹10,000 per sale

**Probation**:
- Flat ₹5,000 per non-discounted sale
- No incentive for referral or manager coupon sales

## Validation Rules

### Manager Validations
- All sales counts must be ≥ 0
- Net sales ≤ Gross sales
- Non-discounted + Manager coupon + Referral ≤ Net sales
- If net sales > 0, then gross sales must be > 0
- Team size ≥ 5 for eligibility
- Productivity ≥ 0.80 for eligibility

### IC Validations
- All counts must be ≥ 0
- Non-discounted + Referral + Manager coupon ≤ Net sales
- Net sales ≥ 4 for non-probation eligibility

## Testing

The project includes comprehensive unit tests covering:

- **Eligibility checks** (team size, productivity thresholds)
- **Productivity calculations** (floor rounding, boundary cases)
- **Team categorization** (5-8, 9-12, 13+)
- **Slab matching** (all productivity ranges)
- **Incentive breakdown** (A, B, C components)
- **GTN penalty application** (< 80% threshold)
- **IC slab matching** (all net sales ranges)
- **Probation rules** (payment restrictions)
- **Edge cases** (zero sales, boundary values)

All tests validate against the exact scenarios from the official policy documents.

## Business Logic Separation

All calculation logic is isolated in pure functions within the `lib/` directory:
- **managerCalculator.ts**: Manager incentive calculations
- **icCalculator.ts**: IC incentive calculations
- **validation.ts**: Input validation schemas

This separation makes it easy to:
- Update policy rules without touching UI code
- Write comprehensive unit tests
- Reuse calculation logic in other contexts
- Maintain and audit business rules

## Production Considerations

This calculator is designed for:
- ✅ Client-side calculation (no backend needed)
- ✅ Deterministic results (same inputs = same outputs)
- ✅ Policy compliance (exact implementation of official rules)
- ✅ Error handling (clear validation messages)
- ✅ Accessibility (semantic HTML, keyboard navigation)

**NOT included** (as per requirements):
- ❌ ESOP payouts and streak tracking
- ❌ Appraisal calculations
- ❌ Payroll integration
- ❌ Authentication/authorization
- ❌ Fraud detection

## Contributing

When updating policies:

1. Update the calculation logic in `lib/managerCalculator.ts` or `lib/icCalculator.ts`
2. Update validation schemas in `lib/validation.ts` if needed
3. Update types in `lib/types.ts` if needed
4. Add/update tests in `__tests__/`
5. Run tests to ensure nothing breaks: `npm test`

## License

Internal use only - Scaler Academy

## Support

For questions or issues related to incentive calculations, please refer to the official Scaler BD Incentive Policy documents or contact your manager.

---

**Version**: 1.0.0  
**Policy Date**: February 2026 Cohort  
**Last Updated**: January 2026
