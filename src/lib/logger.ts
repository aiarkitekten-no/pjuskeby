/**
 * Simple Structured Logging
 * Provides consistent logging across the application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  service: string;
  [key: string]: any;
}

class SimpleLogger {
  private service = 'pjuskeby-web';
  
  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      service: this.service,
      ...metadata
    };
    
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logFn(JSON.stringify(entry));
  }
  
  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }
  
  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }
  
  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }
  
  debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, metadata);
    }
  }
}

export const logger = new SimpleLogger();

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    error: error.name,
    stack: error.stack,
    ...context
  });
};

export const logRequest = (method: string, url: string, statusCode: number, duration: number) => {
  logger.info(`${method} ${url} ${statusCode} ${duration}ms`, {
    method,
    url,
    statusCode,
    duration,
    type: 'request'
  });
};

export const logPerformance = (operation: string, duration: number, metadata?: Record<string, any>) => {
  logger.info(`${operation} took ${duration}ms`, {
    operation,
    duration,
    type: 'performance',
    ...metadata
  });
};

export default logger;
