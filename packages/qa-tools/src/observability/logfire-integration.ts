/**
 * Logfire Observability Integration
 *
 * Provides OpenTelemetry observability with Logfire integration
 * for production monitoring and local development with Jaeger.
 *
 * Features:
 * - Automatic HTTP request tracing
 * - Error tracking and performance metrics
 * - Custom business event instrumentation
 * - Environment-aware configuration
 *
 * Environment Variables:
 * - LOGFIRE_TOKEN: SaaS Logfire token (production)
 * - LOGFIRE_ENVIRONMENT: Environment label (test/staging/production)
 * - OTEL_EXPORTER_OTLP_ENDPOINT: Local Jaeger endpoint
 */

import logfire from 'logfire';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { trace, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Logger interface for consistent API across Logfire/vanilla OTEL
interface ObservabilityLogger {
  span(name: string, options: { attributes?: any; callback: () => Promise<void> }): Promise<void>;
  info(message: string, attributes?: any): void;
  warning(message: string, attributes?: any): void;
  error(message: string, attributes?: any): void;
  debug(message: string, attributes?: any): void;
  metric(name: string, value: number, attributes?: any): void;
}

// Global state
let otelSDK: NodeSDK | null = null;
let loggerInstance: ObservabilityLogger | null = null;

/**
 * Initialize Logfire observability based on environment
 */
export function setupLogfire(): ObservabilityLogger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const token = process.env.LOGFIRE_TOKEN;
  const environment = process.env.LOGFIRE_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const serviceName = process.env.SERVICE_NAME || 'hugo-site';
  const runId = process.env.GITHUB_RUN_ID || process.env.CI_JOB_ID || 'local';

  // OPTION 1: Logfire Cloud (Production)
  if (token) {
    console.log('🔭 Initializing Logfire Cloud...');

    logfire.configureLogfireApi({
      token: token,
      serviceName: serviceName,
      environment: environment,
      serviceVersion: process.env.npm_package_version || 'unknown',
      tags: [`${environment}:${serviceName}`],
    } as any);

    loggerInstance = createLogfireLogger(logfire);
    console.log('✅ Logfire Cloud initialized');
    return loggerInstance;
  }

  // OPTION 2: Local OpenTelemetry with Jaeger (Development)
  console.log('🔌 Initializing OpenTelemetry with Jaeger...');

  // Enable debug logging for OTEL if needed
  if (process.env.OTEL_DEBUG === 'true') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  });

  otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || 'unknown',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
      'service.instance.id': runId,
      'ci.run.id': runId,
    }),
    spanProcessor: new SimpleSpanProcessor(traceExporter),
    instrumentations: [
      // Auto-instrument HTTP, DNS, and other Node.js modules
      // Add specific instrumentations as needed
    ],
  });

  try {
    otelSDK.start();
    console.log('✅ OpenTelemetry SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry SDK:', error);
  }

  loggerInstance = createOTELLogger(trace.getTracer(serviceName));
  return loggerInstance;
}

/**
 * Create Logfire-based logger
 */
function createLogfireLogger(logfireInstance: any): ObservabilityLogger {
  return {
    async span(name, options) {
      return logfireInstance.span(name, options.attributes, async span => {
        try {
          await options.callback();
        } catch (err: any) {
          span.recordException(err);
          throw err;
        }
      });
    },

    info(message, attributes) {
      logfireInstance.info(message, attributes);
    },

    warning(message, attributes) {
      logfireInstance.warning(message, attributes);
    },

    error(message, attributes) {
      logfireInstance.error(message, attributes);
    },

    debug(message, attributes) {
      logfireInstance.debug(message, attributes);
    },

    metric(name, value, attributes) {
      logfireInstance.metric_counter(name).record(value, attributes);
    },
  };
}

/**
 * Create vanilla OpenTelemetry logger
 */
function createOTELLogger(tracer: any): ObservabilityLogger {
  return {
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

    metric(name, value, attributes) {
      // Note: For full metrics support, you'd need to add @opentelemetry/sdk-metrics
      const span = trace.getActiveSpan();
      span?.addEvent(`metric: ${name}`, { value, ...attributes });
    },
  };
}

/**
 * Business event tracking helpers
 */
export class BusinessEvents {
  constructor(private logger: ObservabilityLogger) {}

  /**
   * Track user interaction events
   */
  trackUserInteraction(action: string, element: string, context?: any) {
    this.logger.info('User interaction', {
      event_type: 'user_interaction',
      action,
      element,
      ...context,
    });
  }

  /**
   * Track page performance metrics
   */
  trackPagePerformance(metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
  }) {
    this.logger.metric('page_load_time', metrics.loadTime, { unit: 'ms' });
    this.logger.metric('dom_content_loaded', metrics.domContentLoaded, { unit: 'ms' });

    if (metrics.firstContentfulPaint) {
      this.logger.metric('first_contentful_paint', metrics.firstContentfulPaint, { unit: 'ms' });
    }
  }

  /**
   * Track business conversions
   */
  trackConversion(type: string, value?: number, context?: any) {
    this.logger.info('Conversion', {
      event_type: 'conversion',
      conversion_type: type,
      value,
      ...context,
    });
  }

  /**
   * Track errors with context
   */
  trackError(error: Error, context?: any) {
    this.logger.error('Application error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor(private logger: ObservabilityLogger) {}

  /**
   * Measure async operation duration
   */
  async measureAsync<T>(operation: string, fn: () => Promise<T>, attributes?: any): Promise<T> {
    return this.logger.span(`operation: ${operation}`, {
      attributes: { operation, ...attributes },
      callback: async () => {
        const start = Date.now();
        try {
          const result = await fn();
          const duration = Date.now() - start;
          this.logger.metric('operation_duration', duration, {
            operation,
            unit: 'ms',
            ...attributes,
          });
          return result;
        } catch (error) {
          const duration = Date.now() - start;
          this.logger.metric('operation_error_duration', duration, {
            operation,
            unit: 'ms',
            ...attributes,
          });
          throw error;
        }
      },
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(context?: any) {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.logger.metric('memory_usage', memUsage.heapUsed, {
        unit: 'bytes',
        type: 'heap_used',
        ...context,
      });
      this.logger.metric('memory_total', memUsage.heapTotal, {
        unit: 'bytes',
        type: 'heap_total',
        ...context,
      });
    }
  }
}

/**
 * Initialize and export the logger
 */
export const logger = setupLogfire();

/**
 * Export convenience classes
 */
export const businessEvents = new BusinessEvents(logger);
export const performanceMonitor = new PerformanceMonitor(logger);

/**
 * Graceful shutdown
 */
export function shutdown() {
  if (otelSDK) {
    console.log('🔄 Shutting down OpenTelemetry SDK...');
    otelSDK
      .shutdown()
      .then(() => console.log('✅ OpenTelemetry SDK shut down'))
      .catch(error => console.error('❌ Error shutting down OTEL SDK:', error));
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
