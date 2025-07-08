/**
 * TRINITI Diagnostic Utility
 * Helps debug and verify TRINITI components and API connectivity
 */

import { UnifiedTaskRunnerDemo } from "../examples/UnifiedTaskRunnerDemo";
import { isApiAvailable, checkApiHealth } from "../api/taskRunner";

console.log('🔧 TRINITI Diagnostic Starting...');

// Test environment variables
console.log('✅ Environment Check:');
console.log('  - import.meta.env.DEV:', import.meta.env.DEV);
console.log('  - import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  - process.env available:', typeof process !== 'undefined');
if (typeof process !== 'undefined') {
  console.log('  - process.env.NODE_ENV:', process.env?.NODE_ENV);
}

// Test API client imports
console.log('✅ API Client Import Test:');
try {
  console.log('✅ isApiAvailable function:', typeof isApiAvailable);
  console.log('✅ checkApiHealth function:', typeof checkApiHealth);
} catch (error) {
  console.error('❌ Error importing API functions:', error);
}

// Check if UnifiedTaskRunnerDemo is importable
console.log('✅ Component Import Test:');
try {
  console.log('✅ UnifiedTaskRunnerDemo Import:', typeof UnifiedTaskRunnerDemo);
  console.log('✅ Component name:', UnifiedTaskRunnerDemo.name);
} catch (error) {
  console.error('❌ Error importing UnifiedTaskRunnerDemo:', error);
}

// Test task result rendering fix
console.log('✅ Task Result Rendering Test:');
const testTaskResult = {
  success: true,
  output: {
    type: "greeting",
    message: "Hello! I processed your greeting: 'test'",
    timestamp: new Date().toISOString(),
    status: "completed"
  },
  error: undefined
};

const formatOutput = (output: any) => {
  if (typeof output === 'object' && output !== null) {
    return JSON.stringify(output, null, 2);
  }
  return String(output || 'No output');
};

console.log('✅ Test task result:', testTaskResult);
console.log('✅ Formatted output:', formatOutput(testTaskResult.output));

// Test API connectivity
console.log('✅ API Connectivity Test:');
isApiAvailable()
  .then(available => {
    console.log('✅ API Available:', available);
    if (available) {
      return checkApiHealth();
    }
  })
  .then(health => {
    if (health) {
      console.log('✅ API Health:', health);
    }
  })
  .catch(error => {
    console.error('❌ API Test Failed:', error);
  });

console.log('🔧 TRINITI Diagnostic Complete');
