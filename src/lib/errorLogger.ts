/**
 * SAYAYIN SYSTEM ERROR LOGGER
 * Centralized error logging, recording in localStorage and console with telemetry diagnostics.
 */

export interface SystemErrorEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  url: string;
}

const STORAGE_KEY = 'sayayin_error_logs_v1';
const MAX_LOGS = 50;

class ErrorLogger {
  private logs: SystemErrorEntry[] = [];

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(event.reason || 'Unhandled Promise Rejection', { type: 'unhandledrejection' });
      });
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      this.logs = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
    } catch {
      // Storage might be full or restricted
    }
  }

  public logError(error: unknown, context?: Record<string, any>): SystemErrorEntry {
    let message = 'Error desconocido';
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      message = JSON.stringify(error);
    }

    const entry: SystemErrorEntry = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      message,
      stack,
      context,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    console.error('🛡️ [Sayayin Error Logger]', entry);
    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs.shift();
    }
    this.saveToStorage();

    return entry;
  }

  public getLoggedErrors(): SystemErrorEntry[] {
    return [...this.logs];
  }

  public clearLoggedErrors(): void {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  public exportErrorLog(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
