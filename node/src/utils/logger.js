// Logger utility
// Provides detailed console logging with colors and formatting

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  grey: '\x1b[90m',
  brightRed: '\x1b[91m',
};

const logger = {
  // Error logging
  error: (title, error, additionalInfo = null) => {
    console.log(`\n${colors.brightRed}❌ ERROR: ${title}${colors.reset}`);
    console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    if (error instanceof Error) {
      console.log(`${colors.red}Name:${colors.reset}`, error.name);
      console.log(`${colors.red}Message:${colors.reset}`, error.message);
      console.log(`${colors.red}Status Code:${colors.reset}`, error.statusCode || 500);
      
      if (error.code) {
        console.log(`${colors.red}Code:${colors.reset}`, error.code);
      }
      
      if (error.keyPattern) {
        console.log(`${colors.red}Key Pattern:${colors.reset}`, error.keyPattern);
      }

      if (error.errors) {
        console.log(`${colors.red}Validation Errors:${colors.reset}`);
        Object.entries(error.errors).forEach(([key, value]) => {
          console.log(`  ${colors.red}├─${colors.reset} ${key}: ${value.message}`);
        });
      }
    } else {
      console.log(`${colors.red}Error:${colors.reset}`, error);
    }

    if (additionalInfo) {
      console.log(`${colors.red}Additional Info:${colors.reset}`);
      console.log(additionalInfo);
    }

    if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
      console.log(`${colors.grey}Stack Trace:${colors.reset}`);
      console.log(error.stack);
    }
    console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  },

  // Success logging
  success: (title, data = null) => {
    console.log(`${colors.green}✓ SUCCESS: ${title}${colors.reset}`);
    if (data) {
      console.log(data);
    }
  },

  // Warning logging
  warn: (title, message = '') => {
    console.log(`${colors.yellow}⚠ WARNING: ${title}${colors.reset}`);
    if (message) {
      console.log(`${colors.yellow}${message}${colors.reset}`);
    }
  },

  // Info logging
  info: (title, message = '') => {
    console.log(`${colors.blue}ℹ INFO: ${title}${colors.reset}`);
    if (message) {
      console.log(`${colors.blue}${message}${colors.reset}`);
    }
  },

  // Request logging
  request: (method, path, status = null) => {
    const statusColor = status >= 400 ? colors.red : status >= 300 ? colors.yellow : colors.green;
    const statusText = status ? ` ${statusColor}[${status}]${colors.reset}` : '';
    console.log(`${colors.cyan}📨 ${method.toUpperCase()} ${path}${statusText}${colors.reset}`);
  },

  // Database logging
  db: (title, message = '') => {
    console.log(`${colors.magenta}🗄️  DB: ${title}${colors.reset}`);
    if (message) {
      console.log(`${colors.magenta}${message}${colors.reset}`);
    }
  },

  // Custom color logging
  log: (message, color = 'reset') => {
    console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
  }
};

export default logger;
