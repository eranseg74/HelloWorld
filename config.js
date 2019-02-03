/*
 * Create and export configuration variables
 *
 */

// General container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'envName' : 'staging'
};

// Production environment
environments.production = {
  'httpPort' : 4000,
  'envName' : 'production'
};

// Development environment
environments.development = {
  'httpPort' : 5000,
  'envName' : 'development'
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'staging' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above. If not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
