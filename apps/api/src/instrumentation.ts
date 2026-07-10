/**
 * Langfuse OpenTelemetry instrumentation.
 * This file MUST be imported before any other modules in main.ts
 * so the OTel SDK is registered before LLM clients are initialized.
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
// @ts-expect-error -- @langfuse/otel is ESM-only; the require call works at runtime
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { resourceFromAttributes } from "@opentelemetry/resources";

export const langfuseSpanProcessor = new LangfuseSpanProcessor();

export const SERVICE_NAME = "@studybuddy/api";

const sdk = new NodeSDK({
  // Disable host/process/env auto-detection so only explicit resource attributes
  // are exported to Langfuse.
  autoDetectResources: false,
  resource: resourceFromAttributes({
    "service.name": SERVICE_NAME,
  }),
  spanProcessors: [langfuseSpanProcessor],
});

sdk.start();
