# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: **http://localhost:3000**

---

## What You'll See

1. **Role Toggle**: Switch between Manager and IC calculations
2. **Input Form**: Enter your sales data
3. **Live Results**: See incentive calculations update in real-time
4. **Breakdown**: Click to see detailed calculation steps

---

## Example Scenarios

### Manager Example (from policy doc)
- Frozen Team Size: **9**
- Gross Sales: **42**
- Net Sales: **37**
- Non-Discounted: **18**
- Manager Coupon: **12**
- Referral: **7**

**Expected Result**: ₹3,68,500

### IC Example (Non-Probation)
- Employment Status: **Non-Probation**
- Net Sales: **10**
- Non-Discounted: **6**
- Referral Count: **2**
- Manager Coupon Count: **2**

**Expected Result**: ₹1,60,000

---

## Run Tests

```bash
# Run all tests
npm test

# Watch mode (recommended for development)
npm test -- --watch
```

---

## Build for Production

```bash
npm run build
npm start
```

---

## Common Issues

### Port 3000 already in use?
```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Then run again:
npm run dev
```

### Dependencies not installing?
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check out the policy implementation in `lib/` directory
- Review test cases in `__tests__/` directory
- Modify inputs to test different scenarios

Enjoy calculating incentives! 🎉
