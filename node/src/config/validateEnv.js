import logger from '../utils/logger.js';

/**
 * Validate required environment variables and alert on unsafe defaults
 */
export const validateEnv = () => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`❌ Missing critical environment variables: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Warn if using default/fallback secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET?.includes('supersecretkey') || process.env.JWT_SECRET?.length < 32) {
      logger.warn('⚠️ JWT_SECRET is weak or using a default value in production!');
    }
    if (process.env.STRIPE_PUBLIC_KEY?.includes('your_key_here')) {
      logger.warn('⚠️ Stripe API keys are using placeholder values.');
    }
  } else {
    logger.info('ℹ️ Environment variables validated for development mode.');
  }
};

export default validateEnv;
