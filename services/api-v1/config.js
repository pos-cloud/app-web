module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  DEFAULT: 'DEMO_DB',
  DEMO_DB: 'demo',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'P05R35T@',
  API_CONNECTION_PASSWORD: process.env.TOKEN_SECRET || 'P05R35T@2017',
  LIC_PASSWORD: process.env.TOKEN_SECRET || 'P05R35T@L1C',
  BASE_URL_V8: process.env.BASE_URL_V8 || 'https://api-v2.poscloud.ar',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/',
  PORT: process.env.PORT || 300,
}
