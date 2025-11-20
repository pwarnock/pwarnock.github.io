import logfire from 'logfire';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { trace, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Wrapper interface to support both Logfire and vanilla OTEL
interface Logger {
  span(name: string, options: { attributes?: any; callback: () => Promise<void> }): Promise<void>;
  info(message: string, attributes?: any): void;
  warning(message: string, attributes?: any): void;
  error(message: string, attributes?: any): void;
  debug(message: string, attributes?: any): void;
}

let otelSDK: NodeSDK | null = null;

export function setupLogfire() {
  const token = process.env.LOGFIRE_TOKEN;
  const runId = process.env.GITHUB_RUN_ID;

  // --- OPTION 1: Use Logfire (SaaS) ---
  if (token) {
    console.log('🔭 Initializing Logfire (Cloud)...');
    logfire.configureLogfireApi({
      token: token,
      serviceName: 'playwright-e2e',
      environment: process.env.LOGFIRE_ENVIRONMENT || 'test',
      tags: runId ? [`run:${runId}`] : ['run:local'],
    } as any);
    return logfire;
  }

  // --- OPTION 2: Use Jaeger (Local) ---
  console.log('🔌 No LOGFIRE_TOKEN found. Initializing OpenTelemetry -> Jaeger (HTTP/4318)...');

  // Enable debug logging for OTEL to diagnose connection issues
  // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  });

  otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
      'service.name': 'playwright-e2e',
      'service.instance.id': runId ? `run:${runId}` : 'run:local',
      environment: process.env.LOGFIRE_ENVIRONMENT || 'test',
    }),
    spanProcessor: new SimpleSpanProcessor(traceExporter),
  });

  try {
    otelSDK.start();
    console.log('✅ OTEL SDK started.');
  } catch (error) {
    console.error('❌ Failed to start OTEL SDK:', error);
  }

  // Create a compatibility shim that mimics Logfire API using standard OTEL
  const tracer = trace.getTracer('playwright-e2e');

  const shim: Logger = {
    async span(name, options) {
      return tracer.startActiveSpan(name, { attributes: options.attributes }, async span => {
        try {
          await options.callback();
        } catch (err: any) {
          span.recordException(err);
          span.setStatus({ code: 2, message: err.message }); // 2 = Error
          throw err;
        } finally {
          span.end();
        }
      });
    },
    info(message, attributes) {
      const span = trace.getActiveSpan();
      span?.addEvent(message, { ...attributes, level: 'info' });
    },
    warning(message, attributes) {
      const span = trace.getActiveSpan();
      span?.addEvent(message, { ...attributes, level: 'warning' });
    },
    error(message, attributes) {
      const span = trace.getActiveSpan();
      span?.addEvent(message, { ...attributes, level: 'error' });
    },
    debug(message, attributes) {
      const span = trace.getActiveSpan();
      span?.addEvent(message, { ...attributes, level: 'debug' });
    },
  };

  return shim;
}

export const logger = setupLogfire();
