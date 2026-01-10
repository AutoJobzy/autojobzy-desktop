/**
 * ========================================================================
 * SEED PRICING PLANS
 * ========================================================================
 * Populates the plans and plan_features tables with pricing data
 * Matches the pricing structure in constants.ts
 *
 * Usage: node server/db/seedPlans.js
 * ========================================================================
 */

import sequelize from './config.js';
import Plan from '../models/Plan.js';
import PlanFeature from '../models/PlanFeature.js';

// Pricing plans data matching constants.ts
const plansData = [
    {
        id: 'basic',
        name: 'Starter Plan',
        description: 'Perfect for job seekers starting their automation journey',
        subtitle: null,
        price: 299.00,
        durationDays: 30, // 1 month
        isActive: true,
        isPopular: false,
        comingSoon: false,
        sortOrder: 1,
        features: [
            'Unlimited Job Applications',
            'Basic Match Score Algorithm',
            'Daily Excel Report',
            'Standard Support'
        ]
    },
    {
        id: 'pro',
        name: 'Pro Automation Plan',
        description: 'Most popular plan for serious job seekers',
        subtitle: null,
        price: 499.00,
        durationDays: 60, // 2 months
        isActive: true,
        isPopular: true,
        comingSoon: false,
        sortOrder: 2,
        features: [
            'Unlimited Job Applications',
            'Advanced Match Score Algorithm',
            'Advanced Keyword Matching',
            'Daily Excel Report',
            '24/7 Priority Support'
        ]
    },
    {
        id: 'advanced',
        name: 'Advanced Automation',
        description: 'Next-generation automation for maximum career acceleration',
        subtitle: 'For serious job seekers who want unfair advantage',
        price: 999.00,
        durationDays: 90, // 3 months (estimated)
        isActive: false, // Not available for purchase yet
        isPopular: false,
        comingSoon: true,
        sortOrder: 3,
        features: [
            '✔ Everything in Pro Automation',
            '✔ Interview Prep Automation',
            '✔ HR Outreach on Autopilot',
            '✔ Email + Profile Auto Updates',
            '✔ Deep Automation Insights (Locked)',
            '🔒 Advanced Controls (Unlock on Upgrade)'
        ]
    }
];

async function seedPlans() {
    console.log('\n========================================================================');
    console.log('                    SEEDING PRICING PLANS                              ');
    console.log('========================================================================\n');

    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        let totalPlansCreated = 0;
        let totalPlansUpdated = 0;
        let totalFeaturesCreated = 0;

        // Process each plan
        for (const planData of plansData) {
            console.log(`📦 Processing plan: ${planData.name}...`);

            const { features, ...planFields } = planData;

            try {
                // Find or create the plan
                const [plan, planCreated] = await Plan.findOrCreate({
                    where: { id: planData.id },
                    defaults: planFields
                });

                if (planCreated) {
                    totalPlansCreated++;
                    console.log(`   ✅ Plan created: ${planData.name}`);
                } else {
                    // Update existing plan
                    await plan.update(planFields);
                    totalPlansUpdated++;
                    console.log(`   ↻ Plan updated: ${planData.name}`);
                }

                // Delete existing features for this plan to ensure clean slate
                await PlanFeature.destroy({
                    where: { planId: plan.id }
                });

                // Insert features
                let featureOrder = 0;
                for (const featureText of features) {
                    featureOrder++;

                    await PlanFeature.create({
                        planId: plan.id,
                        featureKey: `feature_${featureOrder}`,
                        featureValue: featureText,
                        featureLabel: featureText,
                    });

                    totalFeaturesCreated++;
                }

                console.log(`   ✅ Added ${features.length} features\n`);

            } catch (error) {
                console.error(`   ❌ Failed to process plan ${planData.name}: ${error.message}\n`);
            }
        }

        console.log('========================================================================');
        console.log(`✅ SEEDING COMPLETE`);
        console.log(`   Plans created: ${totalPlansCreated}`);
        console.log(`   Plans updated: ${totalPlansUpdated}`);
        console.log(`   Features created: ${totalFeaturesCreated}`);
        console.log('========================================================================\n');

        // Display final plan summary
        const allPlans = await Plan.findAll({
            include: [{ model: PlanFeature, as: 'features' }],
            order: [['sortOrder', 'ASC']]
        });

        console.log('📊 PLANS SUMMARY:\n');
        for (const plan of allPlans) {
            console.log(`   ${plan.sortOrder}. ${plan.name}`);
            console.log(`      Price: ₹${plan.price} / ${plan.durationDays} days`);
            if (plan.subtitle) {
                console.log(`      Subtitle: ${plan.subtitle}`);
            }
            console.log(`      Features: ${plan.features.length}`);
            console.log(`      Popular: ${plan.isPopular ? '⭐ Yes' : 'No'}`);
            console.log(`      Coming Soon: ${plan.comingSoon ? '🔒 Yes' : 'No'}`);
            console.log(`      Active: ${plan.isActive ? '✅ Yes' : '❌ No'}`);
            console.log('      Feature List:');
            for (const feature of plan.features) {
                console.log(`        - ${feature.featureLabel}`);
            }
            console.log('');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ SEEDING FAILED');
        console.error(`Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

seedPlans();
