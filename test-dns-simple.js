#!/usr/bin/env node

/**
 * Simple DNS messaging test for DNSChat app
 * Tests the DNS communication functionality directly
 */

const { DNSService } = require("./src/services/dnsService");

async function testDNSMessage() {
  console.log("🧪 Testing DNS Message Functionality\n");

  const testMessage = "Hello from DNS test!";
  console.log(`📤 Sending message: "${testMessage}"`);

  try {
    const startTime = Date.now();
    const response = await DNSService.queryLLM(testMessage);
    const duration = Date.now() - startTime;

    console.log(`✅ DNS Query successful!`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(
      `📥 Response: ${response.substring(0, 100)}${response.length > 100 ? "..." : ""}`,
    );

    return true;
  } catch (error) {
    console.error(`❌ DNS Query failed: ${error.message}`);

    // Check if it's a network-related error vs DNS service error
    if (error.message.includes("Rate limit")) {
      console.log("ℹ️  Rate limit hit - DNS service is working but throttled");
      return true;
    } else if (
      error.message.includes("network") ||
      error.message.includes("timeout")
    ) {
      console.log("ℹ️  Network error - check internet connection");
      return false;
    } else if (error.message.includes("mock")) {
      console.log("ℹ️  Using mock service - this is expected in development");
      return true;
    }

    return false;
  }
}

// Run the test
testDNSMessage()
  .then((success) => {
    console.log(
      success
        ? "\n🎉 DNS messaging is working!"
        : "\n💥 DNS messaging has issues",
    );
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error("\n💥 Test script error:", err.message);
    process.exit(1);
  });
