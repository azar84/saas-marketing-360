const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing new pricing API with UUID system...\n');

  try {
    // Test 1: Fetch all plans
    console.log('1. Testing GET /api/admin/plans');
    const plansRes = await fetch(`${API_BASE}/api/admin/plans`);
    const plans = await plansRes.json();
    console.log(`✅ Fetched ${plans.length} plans`);
    
    if (plans.length > 0) {
      const plan = plans[0];
      console.log(`   - Plan ID: ${plan.id} (${typeof plan.id})`);
      console.log(`   - Plan name: ${plan.name}`);
      console.log(`   - Pricing entries: ${plan.pricing?.length || 0}`);
      console.log(`   - Features: ${plan.features?.length || 0}`);
    }

    // Test 2: Fetch billing cycles
    console.log('\n2. Testing GET /api/admin/billing-cycles');
    const cyclesRes = await fetch(`${API_BASE}/api/admin/billing-cycles`);
    const cycles = await cyclesRes.json();
    console.log(`✅ Fetched ${cycles.length} billing cycles`);
    
    if (cycles.length > 0) {
      const cycle = cycles[0];
      console.log(`   - Cycle ID: ${cycle.id} (${typeof cycle.id})`);
      console.log(`   - Label: ${cycle.label}`);
      console.log(`   - Multiplier: ${cycle.multiplier}`);
    }

    // Test 3: Fetch shared features
    console.log('\n3. Testing GET /api/admin/shared-features');
    const sharedRes = await fetch(`${API_BASE}/api/admin/shared-features`);
    const sharedFeatures = await sharedRes.json();
    console.log(`✅ Fetched ${sharedFeatures.length} shared features`);
    
    if (sharedFeatures.length > 0) {
      const feature = sharedFeatures[0];
      console.log(`   - Feature ID: ${feature.id} (${typeof feature.id})`);
      console.log(`   - Name: ${feature.name}`);
      console.log(`   - Category: ${feature.category || 'N/A'}`);
    }

    // Test 4: Fetch plan features
    console.log('\n4. Testing GET /api/admin/plan-features');
    const planFeaturesRes = await fetch(`${API_BASE}/api/admin/plan-features`);
    const planFeatures = await planFeaturesRes.json();
    console.log(`✅ Fetched ${planFeatures.length} plan features`);
    
    if (planFeatures.length > 0) {
      const planFeature = planFeatures[0];
      console.log(`   - Plan Feature ID: ${planFeature.id} (${typeof planFeature.id})`);
      console.log(`   - Plan ID: ${planFeature.planId}`);
      console.log(`   - Feature ID: ${planFeature.featureId || 'null (custom feature)'}`);
      console.log(`   - Available: ${planFeature.available}`);
      console.log(`   - Label: ${planFeature.label || 'N/A'}`);
      console.log(`   - Type: ${planFeature.featureId ? 'Shared' : 'Custom'}`);
    }

    // Test 5: Fetch plan pricing
    console.log('\n5. Testing GET /api/admin/plan-pricing');
    const pricingRes = await fetch(`${API_BASE}/api/admin/plan-pricing`);
    const pricing = await pricingRes.json();
    console.log(`✅ Fetched ${pricing.length} pricing entries`);
    
    if (pricing.length > 0) {
      const pricingEntry = pricing[0];
      console.log(`   - Pricing ID: ${pricingEntry.id} (${typeof pricingEntry.id})`);
      console.log(`   - Plan ID: ${pricingEntry.planId}`);
      console.log(`   - Billing Cycle ID: ${pricingEntry.billingCycleId}`);
      console.log(`   - Price: $${(pricingEntry.priceCents / 100).toFixed(2)}`);
      console.log(`   - Limits: ${pricingEntry.assistants} assistants, ${pricingEntry.tokens} tokens`);
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Plans: ${plans.length}`);
    console.log(`   - Billing Cycles: ${cycles.length}`);
    console.log(`   - Shared Features: ${sharedFeatures.length}`);
    console.log(`   - Plan Features: ${planFeatures.length} (${planFeatures.filter(f => f.featureId).length} shared, ${planFeatures.filter(f => !f.featureId).length} custom)`);
    console.log(`   - Pricing Entries: ${pricing.length}`);

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      const text = await error.response.text();
      console.error('Response body:', text);
    }
  }
}

// Run the test
testAPI(); 