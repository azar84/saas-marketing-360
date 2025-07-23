// Custom logger utility to control logging levels
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors in both development and production
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    // Only log debug messages if explicitly enabled
    if (process.env.DEBUG === 'true' && isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  api: (method: string, path: string, status: number, duration: number) => {
    // Only log API calls if they're errors or take too long
    if (status >= 400 || duration > 1000) {
      console.log(`[API] ${method} ${path} - ${status} (${duration}ms)`);
    }
  }
}; 