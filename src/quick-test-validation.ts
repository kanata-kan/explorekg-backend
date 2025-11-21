/**
 * 🧪 Quick Test - Real-Time Validation API
 * 
 * This script automatically tests the Validation API endpoints
 * and verifies all responses match expected behavior.
 * 
 * Usage:
 *   1. Start the server: pnpm dev
 *   2. Run this script: node --import tsx src/quick-test-validation.ts
 */

import { createApp } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';

const BASE_URL = `http://localhost:${ENV.PORT}`;
const VALIDATION_API = `${BASE_URL}/api/v1/validation`;

// Test data
const REAL_TRAVEL_PACK_ID = '6915f842f00d1ff29a1af765'; // Cultural Heritage Tour
const REAL_TRAVEL_PACK_ID_2 = '6915f842f00d1ff29a1af764'; // Mountain Explorer
const INVALID_GUEST_ID = '507f1f77bcf86cd799439011';
const INVALID_ITEM_ID = '507f191e810c19729de860ea';

// Test results
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
  duration?: number;
}

const results: TestResult[] = [];

// Helper function to make HTTP requests
async function makeRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<{ status: number; data: any; duration: number }> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${VALIDATION_API}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    return {
      status: response.status,
      data,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw {
      status: 0,
      error: error.message,
      duration,
    };
  }
}

// Test runner
async function runTest(
  name: string,
  testFn: () => Promise<{ passed: boolean; error?: string; response?: any; duration?: number }>
): Promise<void> {
  console.log(`\n🧪 Testing: ${name}`);
  console.log('─'.repeat(60));

  try {
    const result = await testFn();
    results.push({
      name,
      passed: result.passed,
      error: result.error,
      response: result.response,
      duration: result.duration,
    });

    if (result.passed) {
      console.log(`✅ PASSED: ${name}`);
      if (result.duration) {
        console.log(`   ⏱️  Duration: ${result.duration}ms`);
      }
    } else {
      console.log(`❌ FAILED: ${name}`);
      if (result.error) {
        console.log(`   🔴 Error: ${result.error}`);
      }
    }
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      error: error.message || String(error),
    });
    console.log(`❌ FAILED: ${name}`);
    console.log(`   🔴 Error: ${error.message || String(error)}`);
  }
}

// Test: Server Health Check
async function testServerHealth(): Promise<{ passed: boolean; duration?: number }> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const duration = Date.now() - startTime;
    return {
      passed: response.status === 200,
      duration,
    };
  } catch {
    return { passed: false };
  }
}

// Test 1: Full Validation - Valid Booking (without guest)
async function testFullValidationValid(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
      numberOfDays: 4,
      startDate: '2024-12-01T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
    locale: 'en',
  });

  const passed = 
    status === 200 &&
    typeof data.isValid === 'boolean' &&
    Array.isArray(data.errors) &&
    data.metadata &&
    typeof data.metadata.validationTimeMs === 'number';

  return {
    passed,
    error: passed ? undefined : `Expected valid response, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 2: Full Validation - Invalid Format
async function testFullValidationInvalidFormat(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'invalid_type',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 'not-a-number',
      startDate: 'invalid-date',
    },
  });

  const passed = 
    status === 200 &&
    data.isValid === false &&
    Array.isArray(data.errors) &&
    data.errors.length > 0 &&
    data.errors.some((e: any) => e.code === 'INVALID_FORMAT');

  return {
    passed,
    error: passed ? undefined : `Expected format errors, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 3: Full Validation - Missing Item
async function testFullValidationMissingItem(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: INVALID_ITEM_ID,
      numberOfPersons: 2,
      startDate: '2024-12-01T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
  });

  const passed = 
    status === 200 &&
    data.isValid === false &&
    Array.isArray(data.errors) &&
    data.errors.some((e: any) => e.code === 'ITEM_NOT_FOUND');

  return {
    passed,
    error: passed ? undefined : `Expected ITEM_NOT_FOUND error, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 4: Full Validation - Past Date
async function testFullValidationPastDate(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
      startDate: '2020-01-01T00:00:00Z',
      endDate: '2020-01-05T00:00:00Z',
    },
  });

  const passed = 
    status === 200 &&
    data.isValid === false &&
    Array.isArray(data.errors) &&
    data.errors.some((e: any) => e.code === 'PAST_DATE');

  return {
    passed,
    error: passed ? undefined : `Expected PAST_DATE error, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 5: Full Validation - Invalid Date Range
async function testFullValidationInvalidDateRange(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
      startDate: '2024-12-10T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
  });

  const passed = 
    status === 200 &&
    data.isValid === false &&
    Array.isArray(data.errors) &&
    data.errors.some((e: any) => e.code === 'INVALID_DATE_RANGE');

  return {
    passed,
    error: passed ? undefined : `Expected INVALID_DATE_RANGE error, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 6: Field Validation - Valid Field
async function testFieldValidationValid(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking/field', {
    field: 'numberOfPersons',
    value: 2,
    context: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
    },
  });

  const passed = 
    status === 200 &&
    typeof data.isValid === 'boolean' &&
    Array.isArray(data.errors) &&
    data.metadata;

  return {
    passed,
    error: passed ? undefined : `Expected valid field validation, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 7: Field Validation - Invalid Format
async function testFieldValidationInvalidFormat(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking/field', {
    field: 'numberOfPersons',
    value: 'not-a-number',
    context: {},
  });

  const passed = 
    status === 200 &&
    data.isValid === false &&
    Array.isArray(data.errors) &&
    data.errors.some((e: any) => e.code === 'INVALID_FORMAT' && e.field === 'numberOfPersons');

  return {
    passed,
    error: passed ? undefined : `Expected INVALID_FORMAT error, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 8: Field Validation - Missing Field
async function testFieldValidationMissingField(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking/field', {
    value: 'some-value',
  });

  const passed = 
    status === 400 &&
    data.error === 'MISSING_FIELD';

  return {
    passed,
    error: passed ? undefined : `Expected MISSING_FIELD error, got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 9: Full Validation - Duplicate Error Check (should not duplicate)
async function testDuplicateErrorCheck(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: INVALID_ITEM_ID,
      numberOfPersons: 2,
      startDate: '2024-12-01T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
  });

  // Count ITEM_NOT_FOUND errors
  const itemNotFoundErrors = data.errors?.filter((e: any) => e.code === 'ITEM_NOT_FOUND') || [];
  
  const passed = 
    status === 200 &&
    itemNotFoundErrors.length === 1; // Should appear only once (deduplication working)

  return {
    passed,
    error: passed ? undefined : `Expected 1 ITEM_NOT_FOUND error (got ${itemNotFoundErrors.length}), got: ${JSON.stringify(data)}`,
    response: data,
    duration,
  };
}

// Test 10: Full Validation - Cache Hit Test
async function testCacheHit(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  // First request (cache miss)
  const { data: data1, duration: duration1 } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
      startDate: '2024-12-01T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
  });

  // Small delay to ensure cache is set
  await new Promise(resolve => setTimeout(resolve, 100));

  // Second request (should have cache hit)
  const { data: data2, duration: duration2 } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
      startDate: '2024-12-01T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
  });

  const passed = 
    data2.metadata &&
    (data2.metadata.cacheHit === true || 
     (Array.isArray(data2.metadata.cacheHits) && data2.metadata.cacheHits.length > 0));

  return {
    passed,
    error: passed ? undefined : `Expected cache hit in second request, got: ${JSON.stringify(data2.metadata)}`,
    response: { first: data1, second: data2, durations: { first: duration1, second: duration2 } },
    duration: duration2,
  };
}

// Test 11: Response Structure Validation
async function testResponseStructure(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
      startDate: '2024-12-01T00:00:00Z',
      endDate: '2024-12-05T00:00:00Z',
    },
  });

  const hasRequiredFields =
    typeof data.isValid === 'boolean' &&
    Array.isArray(data.errors) &&
    data.errors.every((e: any) =>
      typeof e.field === 'string' &&
      typeof e.code === 'string' &&
      typeof e.uiKey === 'string' &&
      typeof e.message === 'string' &&
      typeof e.severity === 'string'
    ) &&
    data.metadata &&
    typeof data.metadata.validatedAt === 'string' &&
    typeof data.metadata.locale === 'string' &&
    typeof data.metadata.cacheHit === 'boolean' &&
    Array.isArray(data.metadata.cacheHits) &&
    typeof data.metadata.validationTimeMs === 'number';

  const passed = status === 200 && hasRequiredFields;

  return {
    passed,
    error: passed ? undefined : `Response structure invalid, got: ${JSON.stringify(data, null, 2)}`,
    response: data,
    duration,
  };
}

// Test 12: Locale Detection Test
async function testLocaleDetection(): Promise<{ passed: boolean; error?: string; response?: any; duration?: number }> {
  // Test with French locale
  const { status, data, duration } = await makeRequest('POST', '/booking', {
    data: {
      itemType: 'travel_pack',
      itemId: REAL_TRAVEL_PACK_ID,
      numberOfPersons: 2,
    },
    locale: 'fr',
  });

  const passed = 
    status === 200 &&
    data.metadata &&
    data.metadata.locale === 'fr';

  return {
    passed,
    error: passed ? undefined : `Expected locale 'fr', got: ${data.metadata?.locale}`,
    response: data,
    duration,
  };
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 Real-Time Validation API - Automated Test Suite       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📍 Base URL: ${BASE_URL}`);
  console.log(`📍 Validation API: ${VALIDATION_API}\n`);

  // Check if server is running
  console.log('🔍 Checking if server is running...');
  const healthCheck = await testServerHealth();
  if (!healthCheck.passed) {
    console.log('❌ Server is not running or not accessible!');
    console.log('   Please start the server first: pnpm dev');
    process.exit(1);
  }
  console.log('✅ Server is running\n');

  // Run all tests
  await runTest('1. Full Validation - Valid Booking', testFullValidationValid);
  await runTest('2. Full Validation - Invalid Format', testFullValidationInvalidFormat);
  await runTest('3. Full Validation - Missing Item', testFullValidationMissingItem);
  await runTest('4. Full Validation - Past Date', testFullValidationPastDate);
  await runTest('5. Full Validation - Invalid Date Range', testFullValidationInvalidDateRange);
  await runTest('6. Field Validation - Valid Field', testFieldValidationValid);
  await runTest('7. Field Validation - Invalid Format', testFieldValidationInvalidFormat);
  await runTest('8. Field Validation - Missing Field', testFieldValidationMissingField);
  await runTest('9. Duplicate Error Check (Deduplication)', testDuplicateErrorCheck);
  await runTest('10. Cache Hit Test', testCacheHit);
  await runTest('11. Response Structure Validation', testResponseStructure);
  await runTest('12. Locale Detection Test', testLocaleDetection);

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 TEST SUMMARY                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  // Show failed tests
  if (failed > 0) {
    console.log('❌ Failed Tests:\n');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   • ${r.name}`);
        if (r.error) {
          console.log(`     Error: ${r.error}`);
        }
      });
    console.log('');
  }

  // Performance summary
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + (r.duration || 0), 0) / results.filter(r => r.duration).length;

  if (avgDuration > 0) {
    console.log('⏱️  Performance:\n');
    console.log(`   Average Response Time: ${avgDuration.toFixed(2)}ms`);
    const slowTests = results.filter(r => r.duration && r.duration > 200);
    if (slowTests.length > 0) {
      console.log(`   ⚠️  Slow Tests (>200ms): ${slowTests.length}`);
      slowTests.forEach(t => {
        console.log(`      • ${t.name}: ${t.duration}ms`);
      });
    }
    console.log('');
  }

  // Final status
  if (failed === 0) {
    console.log('🎉 All tests passed! Validation API is working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});

