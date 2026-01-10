# Pricing Plans Setup Guide

## Overview

The application now supports **3 pricing tiers** that are synchronized between the frontend (React) and backend (Database):

1. **Starter Plan** - ₹299 / 1 Month
2. **Pro Automation Plan** - ₹499 / 2 Months (Most Popular)
3. **Advanced Automation** - ₹999 / Coming Soon

## Database Schema

### Tables

#### 1. `plans` Table
```sql
CREATE TABLE plans (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subtitle VARCHAR(255),           -- NEW: Plan tagline
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_popular TINYINT(1) DEFAULT 0, -- NEW: Mark as recommended
    coming_soon TINYINT(1) DEFAULT 0,-- NEW: Mark as unavailable
    sort_order INT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);
```

#### 2. `plan_features` Table
```sql
CREATE TABLE plan_features (
    id CHAR(36) PRIMARY KEY,
    plan_id CHAR(36) NOT NULL,
    feature_key VARCHAR(100),
    feature_value VARCHAR(200),
    feature_label VARCHAR(200),
    created_at DATETIME,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
```

## Setup Instructions

### Step 1: Run Migration

First, update the database schema to add the new columns:

```bash
cd /Users/rohan/Documents/old/job_automate
mysql -u root -p < server/db/migrations/006_update_plans_schema.sql
```

**Expected Output:**
```
✅ Column is_popular added
✅ Column coming_soon added
✅ Column subtitle added
✅ Plans schema updated successfully
```

### Step 2: Seed Pricing Plans

Populate the plans table with the pricing data:

```bash
node server/db/seedPlans.js
```

**Expected Output:**
```
========================================================================
                    SEEDING PRICING PLANS
========================================================================

✅ Database connection established

📦 Processing plan: Starter Plan...
   ✅ Plan created: Starter Plan
   ✅ Added 4 features

📦 Processing plan: Pro Automation Plan...
   ✅ Plan created: Pro Automation Plan
   ✅ Added 5 features

📦 Processing plan: Advanced Automation...
   ✅ Plan created: Advanced Automation
   ✅ Added 6 features

========================================================================
✅ SEEDING COMPLETE
   Plans created: 3
   Plans updated: 0
   Features created: 15
========================================================================
```

### Step 3: Verify Data

Check that plans were created correctly:

```sql
USE jobautomate;

-- View all plans
SELECT id, name, price, duration_days, is_popular, coming_soon, is_active
FROM plans
ORDER BY sort_order;

-- View plan features
SELECT p.name, pf.feature_label
FROM plans p
JOIN plan_features pf ON p.id = pf.plan_id
ORDER BY p.sort_order, pf.id;
```

## Plan Details

### 1. Starter Plan (₹299)

```javascript
{
  id: 'basic',
  name: 'Starter Plan',
  price: 299.00,
  durationDays: 30, // 1 month
  isPopular: false,
  comingSoon: false,
  isActive: true,
  features: [
    'Unlimited Job Applications',
    'Basic Match Score Algorithm',
    'Daily Excel Report',
    'Standard Support'
  ]
}
```

### 2. Pro Automation Plan (₹499) ⭐

```javascript
{
  id: 'pro',
  name: 'Pro Automation Plan',
  price: 499.00,
  durationDays: 60, // 2 months
  isPopular: true,  // ⭐ Most Popular
  comingSoon: false,
  isActive: true,
  features: [
    'Unlimited Job Applications',
    'Advanced Match Score Algorithm',
    'Advanced Keyword Matching',
    'Daily Excel Report',
    '24/7 Priority Support'
  ]
}
```

### 3. Advanced Automation (₹999) 🔒

```javascript
{
  id: 'advanced',
  name: 'Advanced Automation',
  subtitle: 'For serious job seekers who want unfair advantage',
  price: 999.00,
  durationDays: 90, // 3 months
  isPopular: false,
  comingSoon: true, // 🔒 Coming Soon
  isActive: false,  // Not purchasable yet
  features: [
    '✔ Everything in Pro Automation',
    '✔ Interview Prep Automation',
    '✔ HR Outreach on Autopilot',
    '✔ Email + Profile Auto Updates',
    '✔ Deep Automation Insights (Locked)',
    '🔒 Advanced Controls (Unlock on Upgrade)'
  ]
}
```

## Frontend Integration

### Constants Definition

The pricing plans are defined in [constants.ts](../../constants.ts):

```typescript
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Starter Plan',
    price: '₹299',
    duration: '1 Month',
    features: [...]
  },
  {
    id: 'pro',
    name: 'Pro Automation Plan',
    price: '₹499',
    duration: '2 Months',
    isPopular: true,
    features: [...]
  },
  {
    id: 'advanced',
    name: 'Advanced Automation',
    price: '₹999',
    duration: 'Coming Soon',
    comingSoon: true,
    subtitle: 'For serious job seekers who want unfair advantage',
    features: [...]
  }
];
```

### Display Components

#### 1. Pricing Section ([components/Pricing.tsx](../../components/Pricing.tsx))

Displays all 3 plans in a grid with special styling:

- **Starter Plan**: Standard styling
- **Pro Automation**: Blue glow, "Most Popular" badge, scale effect
- **Advanced Automation**: Purple glow, "Coming Soon" badge, sparkle effects

#### 2. Advanced Plan Teaser ([components/AdvancedPlanTeaser.tsx](../../components/AdvancedPlanTeaser.tsx))

Interactive teaser section below Hero with:
- Animated gradients
- Hover effects
- Waitlist button
- Social proof counter
- Feature showcase

## API Endpoints

### GET /api/plans

Fetch all active plans:

```javascript
router.get('/api/plans', async (req, res) => {
  const plans = await Plan.findAll({
    where: { isActive: true },
    include: [{ model: PlanFeature, as: 'features' }],
    order: [['sortOrder', 'ASC']]
  });

  res.json(plans);
});
```

### GET /api/plans/:id

Fetch a specific plan with features:

```javascript
router.get('/api/plans/:id', async (req, res) => {
  const plan = await Plan.findOne({
    where: { id: req.params.id },
    include: [{ model: PlanFeature, as: 'features' }]
  });

  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  res.json(plan);
});
```

## Updating Plans

### Modify Plan Data

Edit [seedPlans.js](seedPlans.js) and update the `plansData` array:

```javascript
const plansData = [
  {
    id: 'basic',
    name: 'Starter Plan',
    price: 299.00,  // Change price
    durationDays: 30,
    features: [
      'Unlimited Job Applications',
      'New Feature Here'  // Add/remove features
    ]
  }
];
```

### Re-seed Database

Run the seeder again (idempotent - safe to run multiple times):

```bash
node server/db/seedPlans.js
```

This will:
- Update existing plans
- Replace all features
- Preserve plan IDs

## Common Operations

### Add a New Plan

1. Add to `plansData` in [seedPlans.js](seedPlans.js):

```javascript
{
  id: 'enterprise',
  name: 'Enterprise Plan',
  price: 1999.00,
  durationDays: 365,
  isActive: true,
  isPopular: false,
  comingSoon: false,
  sortOrder: 4,
  features: [...]
}
```

2. Add to frontend [constants.ts](../../constants.ts)
3. Run seeder: `node server/db/seedPlans.js`

### Mark Plan as Coming Soon

```javascript
{
  id: 'advanced',
  comingSoon: true,
  isActive: false  // Disable purchases
}
```

### Set Popular Plan

```javascript
{
  id: 'pro',
  isPopular: true  // Shows "Most Popular" badge
}
```

### Deactivate Plan

```javascript
{
  id: 'basic',
  isActive: false  // Won't appear in API results
}
```

## Database Queries

### Get Active Plans

```sql
SELECT * FROM plans
WHERE is_active = 1
ORDER BY sort_order;
```

### Get Popular Plan

```sql
SELECT * FROM plans
WHERE is_popular = 1;
```

### Get Coming Soon Plans

```sql
SELECT * FROM plans
WHERE coming_soon = 1;
```

### Get Plan with Features

```sql
SELECT
  p.name,
  p.price,
  p.duration_days,
  pf.feature_label
FROM plans p
LEFT JOIN plan_features pf ON p.id = pf.plan_id
WHERE p.id = 'pro'
ORDER BY pf.id;
```

## Testing

### Manual Testing

1. **Check Database:**
```bash
mysql -u root -p jobautomate -e "SELECT * FROM plans"
```

2. **Test Seeder:**
```bash
node server/db/seedPlans.js
```

3. **Verify Frontend:**
- Visit `/` to see pricing section
- Check "Advanced Plan Teaser" below hero
- Verify "Coming Soon" badge on ₹999 plan

### Expected Results

✅ Database contains 3 plans
✅ Plan features are correctly linked
✅ Frontend displays all 3 plans
✅ Pro plan shows "Most Popular" badge
✅ Advanced plan shows "Coming Soon" badge
✅ Advanced plan button is disabled
✅ Teaser section appears below hero

## Troubleshooting

### Issue: Migration Fails

**Solution:**
```bash
# Check if columns already exist
mysql -u root -p jobautomate -e "DESCRIBE plans"

# If migration already ran, it's safe to re-run (idempotent)
```

### Issue: Seeder Fails with "Column doesn't exist"

**Cause:** Migration not run yet

**Solution:**
```bash
mysql -u root -p < server/db/migrations/006_update_plans_schema.sql
node server/db/seedPlans.js
```

### Issue: Frontend shows old plans

**Cause:** Frontend constants not updated

**Solution:** Update [constants.ts](../../constants.ts) to match database

### Issue: Plan button not disabled for Coming Soon

**Cause:** Frontend component not checking `comingSoon` flag

**Solution:** Verify [Pricing.tsx](../../components/Pricing.tsx) has:
```typescript
<button disabled={plan.comingSoon}>
```

## Related Files

- **Migration:** [006_update_plans_schema.sql](migrations/006_update_plans_schema.sql)
- **Seeder:** [seedPlans.js](seedPlans.js)
- **Models:**
  - [Plan.js](../models/Plan.js)
  - [PlanFeature.js](../models/PlanFeature.js)
- **Frontend:**
  - [constants.ts](../../constants.ts)
  - [types.ts](../../types.ts)
  - [Pricing.tsx](../../components/Pricing.tsx)
  - [AdvancedPlanTeaser.tsx](../../components/AdvancedPlanTeaser.tsx)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-20 | Initial pricing plans setup with 3 tiers |
| 1.1.0 | 2025-12-20 | Added is_popular, coming_soon, subtitle fields |

---

**Last Updated:** 2025-12-20
**Status:** ✅ Production Ready
