const isProduction = process.env.NODE_ENV === 'production';
const DEV_JWT_SECRET = 'tourhub-dev-secret-change-me';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (isProduction) {
    throw new Error('JWT_SECRET is required in production');
  }

  return DEV_JWT_SECRET;
};

module.exports = { getJwtSecret };
