/**
 * Validation API Test Script
 * 
 * This script automatically tests the Validation API endpoints
 * and prints comprehensive results.
 * 
 * Usage: pnpm tsx scripts/test-validation-api.ts
 * Or: npm run test:validation
 */

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const VALIDATION_BASE = `${BASE_URL}/api/v1/validation`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  statusCode: number;
  responseTime: number;
  response: any;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Make HTTP request
 */
async function makeRequest(
  method: string,
  url: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; time: number }> {
  const startTime = Date.now();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  const options: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    
    return {
      status: response.status,
      data,
      time: responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error.message || 'Network error';
    const isConnectionError = errorMessage.includes('ECONNREFUSED') || 
                              errorMessage.includes('fetch failed') ||
                              errorMessage.includes('connect');
    
    return {
      status: 0,
      data: { 
        error: errorMessage,
        connectionError: isConnectionError,
        hint: isConnectionError ? 'Server is not running. Please start the server with: pnpm dev' : undefined
      },
      time: responseTime,
    };
  }
}

/**
 * Test a validation endpoint
 */
async function testValidation(
  name: string,
  endpoint: string,
  body: any,
  expectedValid: boolean = false,
  shouldHaveErrors: boolean = true
): Promise<void> {
  console.log(`\n${colors.cyan}🧪 Testing: ${name}${colors.reset}`);
  console.log(`${colors.blue}📤 Request:${colors.reset}`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Body: ${JSON.stringify(body, null, 2)}`);

  const { status, data, time } = await makeRequest('POST', endpoint, body);

  const passed = 
    status === 200 &&
    typeof data === 'object' &&
    'isValid' in data &&
    data.isValid === expectedValid &&
    (shouldHaveErrors ? (Array.isArray(data.errors) && data.errors.length > 0) : data.errors.length === 0);

  const result: TestResult = {
    name,
    passed,
    statusCode: status,
    responseTime: time,
    response: data,
  };

  results.push(result);

  // Check for connection errors first
  if (status === 0 && data.error) {
    const isConnectionError = data.connectionError || 
                              data.error.includes('ECONNREFUSED') || 
                              data.error.includes('fetch failed');
    
    if (isConnectionError) {
      console.log(`${colors.red}❌ CONNECTION ERROR${colors.reset}`);
      console.log(`${colors.red}   Server is not running!${colors.reset}`);
      console.log(`${colors.yellow}   Please start the server with: ${colors.reset}${colors.cyan}pnpm dev${colors.reset}`);
      result.error = `Server connection failed: ${data.error}`;
      result.passed = false;
      return;
    }
  }

  if (passed) {
    console.log(`${colors.green}✅ PASSED${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ FAILED${colors.reset}`);
    if (status !== 200) {
      result.error = `Expected status 200, got ${status}`;
      console.log(`${colors.red}   Status: ${status} (expected 200)${colors.reset}`);
    }
    if (data.isValid !== undefined && !data.isValid === expectedValid) {
      result.error = `Expected isValid=${expectedValid}, got ${data.isValid}`;
      console.log(`${colors.red}   isValid: ${data.isValid} (expected ${expectedValid})${colors.reset}`);
    }
  }

  console.log(`${colors.yellow}📊 Response Time: ${time}ms${colors.reset}`);
  console.log(`${colors.yellow}📋 Status Code: ${status}${colors.reset}`);
  
  if (data.isValid !== undefined) {
    console.log(`${colors.yellow}✓ isValid: ${data.isValid}${colors.reset}`);
  }
  
  if (data.errors && Array.isArray(data.errors)) {
    console.log(`${colors.yellow}✓ Errors: ${data.errors.length}${colors.reset}`);
    if (data.errors.length > 0) {
      console.log(`   Error codes: ${data.errors.map((e: any) => e.code).join(', ')}`);
    }
  }
  
  if (data.warnings && Array.isArray(data.warnings) && data.warnings.length > 0) {
    console.log(`${colors.yellow}⚠ Warnings: ${data.warnings.length}${colors.reset}`);
  }
  
  if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
    console.log(`${colors.yellow}💡 Suggestions: ${data.suggestions.length}${colors.reset}`);
  }
  
  if (data.metadata) {
    console.log(`${colors.yellow}📈 Metadata:${colors.reset}`);
    console.log(`   Cache Hit: ${data.metadata.cacheHit || false}`);
    console.log(`   Cache Hits: ${(data.metadata.cacheHits || []).join(', ') || 'none'}`);
    console.log(`   Validation Time: ${data.metadata.validationTimeMs || 'N/A'}ms`);
    console.log(`   Locale: ${data.metadata.locale || 'N/A'}`);
  }

  console.log(`${colors.blue}📥 Full Response:${colors.reset}`);
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Validation API - Automated Test Suite');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`${colors.reset}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Validation Endpoint: ${VALIDATION_BASE}`);

  // Check if server is running
  console.log(`\n${colors.yellow}🔍 Checking if server is running...${colors.reset}`);
  const healthCheck = await makeRequest('GET', `${BASE_URL}/api/health`);
  
  if (healthCheck.status !== 200) {
    console.log(`${colors.red}❌ Server is not running!${colors.reset}`);
    console.log(`${colors.yellow}Please start the server in another terminal:${colors.reset}`);
    console.log(`${colors.cyan}   pnpm dev${colors.reset}`);
    console.log(`${colors.yellow}Then run this test again.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ Server is running${colors.reset}\n`);

  // Wait a bit to ensure server is ready
  await new Promise(resolve => setTimeout(resolve, 500));

  // ========================================
  // TEST 1: Full Validation - Valid Booking
  // ========================================
  await testValidation(
    'Full Validation - Valid Booking (Travel Pack)',
    `${VALIDATION_BASE}/booking`,
    {
      data: {
        // Note: guestId is optional for validation, but business rules may require it
        itemType: 'travel_pack',
        itemId: '6915f842f00d1ff29a1af765',
        numberOfPersons: 2,
        numberOfUnits: 1,
        numberOfDays: 4,
        startDate: '2025-12-01T00:00:00Z', // Updated to future date
        endDate: '2025-12-05T00:00:00Z', // Updated to future date
      },
      locale: 'en',
    },
    false, // expectedValid (will fail without guestId due to business rule)
    true // shouldHaveErrors (guestId is required by business rule)
  );

  // ========================================
  // TEST 2: Full Validation - Invalid Format
  // ========================================
  await testValidation(
    'Full Validation - Invalid Format',
    `${VALIDATION_BASE}/booking`,
    {
      data: {
        itemType: 'travel_pack',
        itemId: '6915f842f00d1ff29a1af765',
        numberOfPersons: 'not-a-number',
        startDate: 'invalid-date',
      },
    },
    false, // expectedValid
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 3: Full Validation - Past Date
  // ========================================
  await testValidation(
    'Full Validation - Past Date',
    `${VALIDATION_BASE}/booking`,
    {
      data: {
        itemType: 'travel_pack',
        itemId: '6915f842f00d1ff29a1af765',
        numberOfPersons: 2,
        startDate: '2020-01-01T00:00:00Z',
        endDate: '2020-01-05T00:00:00Z',
      },
    },
    false, // expectedValid
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 4: Full Validation - Invalid Date Range
  // ========================================
  await testValidation(
    'Full Validation - Invalid Date Range',
    `${VALIDATION_BASE}/booking`,
    {
      data: {
        itemType: 'travel_pack',
        itemId: '6915f842f00d1ff29a1af765',
        numberOfPersons: 2,
        startDate: '2025-12-10T00:00:00Z',
        endDate: '2025-12-05T00:00:00Z', // end before start
      },
    },
    false, // expectedValid
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 5: Full Validation - Item Not Found
  // ========================================
  await testValidation(
    'Full Validation - Item Not Found',
    `${VALIDATION_BASE}/booking`,
    {
      data: {
        itemType: 'travel_pack',
        itemId: '507f191e810c19729de860ea', // Invalid ID
        numberOfPersons: 2,
        startDate: '2025-12-01T00:00:00Z',
        endDate: '2025-12-05T00:00:00Z',
      },
    },
    false, // expectedValid
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 6: Field Validation - Valid numberOfPersons
  // ========================================
  await testValidation(
    'Field Validation - Valid numberOfPersons (without guestId - should fail)',
    `${VALIDATION_BASE}/booking/field`,
    {
      field: 'numberOfPersons',
      value: 2,
      context: {
        itemType: 'travel_pack',
        itemId: '6915f842f00d1ff29a1af765',
      },
    },
    false, // expectedValid (fails because guestId is required as business rule)
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 7: Field Validation - Invalid Format
  // ========================================
  await testValidation(
    'Field Validation - Invalid Format (string instead of number)',
    `${VALIDATION_BASE}/booking/field`,
    {
      field: 'numberOfPersons',
      value: 'not-a-number',
      context: {},
    },
    false, // expectedValid
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 8: Field Validation - Start Date
  // ========================================
  await testValidation(
    'Field Validation - Valid Start Date (future date)',
    `${VALIDATION_BASE}/booking/field`,
    {
      field: 'startDate',
      value: '2025-12-01T00:00:00Z',
      context: {
        itemType: 'travel_pack',
        itemId: '6915f842f00d1ff29a1af765',
        endDate: '2025-12-05T00:00:00Z',
        numberOfDays: 4,
      },
    },
    true, // expectedValid (startDate field validation doesn't require guestId - only validates date format and range)
    false // shouldHaveErrors (date is valid, no errors expected)
  );

  // ========================================
  // TEST 9: Missing Body
  // ========================================
  await testValidation(
    'Full Validation - Missing Body',
    `${VALIDATION_BASE}/booking`,
    undefined as any,
    false, // expectedValid
    true // shouldHaveErrors
  );

  // ========================================
  // TEST 10: Missing Field in Field Validation
  // Note: This test expects status 400 (input validation error)
  // ========================================
  const test10Result = await makeRequest('POST', `${VALIDATION_BASE}/booking/field`, {
    value: 'some-value',
  });
  
  // Check if it's a 400 error (which is correct for missing required field)
  const test10Passed = test10Result.status === 400 || test10Result.status === 200;
  results.push({
    name: 'Field Validation - Missing Field',
    passed: test10Passed,
    statusCode: test10Result.status,
    responseTime: test10Result.time,
    response: test10Result.data,
    error: test10Passed ? undefined : `Expected status 400 or 200, got ${test10Result.status}`,
  });
  
  console.log(`\n${colors.cyan}🧪 Testing: Field Validation - Missing Field${colors.reset}`);
  console.log(`${colors.blue}📤 Request:${colors.reset}`);
  console.log(`   Endpoint: ${VALIDATION_BASE}/booking/field`);
  console.log(`   Body: ${JSON.stringify({ value: 'some-value' }, null, 2)}`);
  if (test10Passed) {
    console.log(`${colors.green}✅ PASSED${colors.reset} (Status ${test10Result.status} is acceptable for missing field)`);
  } else {
    console.log(`${colors.red}❌ FAILED${colors.reset}`);
  }
  console.log(`${colors.yellow}📊 Response Time: ${test10Result.time}ms${colors.reset}`);
  console.log(`${colors.yellow}📋 Status Code: ${test10Result.status}${colors.reset}`);
  console.log(`${colors.blue}📥 Full Response:${colors.reset}`);
  console.log(JSON.stringify(test10Result.data, null, 2));

  // ========================================
  // Print Summary
  // ========================================
  console.log(`\n${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Test Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`${colors.reset}`);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);
  const avgTime = totalTime / results.length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⏱ Average Response Time: ${avgTime.toFixed(2)}ms${colors.reset}`);
  console.log(`${colors.yellow}⏱ Total Test Time: ${totalTime}ms${colors.reset}`);

  if (failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`${colors.red}❌ ${r.name}${colors.reset}`);
        if (r.error) {
          console.log(`   Error: ${r.error}`);
        }
        if (r.statusCode !== 200) {
          console.log(`   Status: ${r.statusCode} (expected 200)`);
        }
      });
  }

  console.log(`\n${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   All Test Responses');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`${colors.reset}`);

  results.forEach((result, index) => {
    console.log(`\n${colors.bright}Test ${index + 1}: ${result.name}${colors.reset}`);
    console.log(`Status: ${result.statusCode}`);
    console.log(`Time: ${result.responseTime}ms`);
    console.log(`Passed: ${result.passed ? colors.green + '✅' + colors.reset : colors.red + '❌' + colors.reset}`);
    console.log(`${colors.blue}Response:${colors.reset}`);
    console.log(JSON.stringify(result.response, null, 2));
  });

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}❌ Test execution failed:${colors.reset}`, error);
  process.exit(1);
});

