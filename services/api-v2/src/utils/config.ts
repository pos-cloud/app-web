export default {
  DEFAULT: 'demo',
  NODE_ENV: process.env.NODE_ENV || 'production',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'P05R35T@',
  API_CONNECTION_PASSWORD: process.env.TOKEN_SECRET || 'P05R35T@2017',
  LIC_PASSWORD: process.env.TOKEN_SECRET || 'P05R35T@L1C',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/',
  URL_SERVER: 'http://vps-1883265-x.dattaweb.com',
  API_URL: process.env.API_URL || 'https://api-v1.poscloud.ar',
  FORGOT_PASSWORD_EXPIRATION_TIME: 120,
  SESSION_EXPIRATION_TIME: 30,
  API_URL_FE_AR: 'http://vps-1883265-x.dattaweb.com/libs/fe/ar/index.php',
  PORT: process.env.PORT || 308,
  API_STORAGE: process.env.API_STORAGE || 'https://api-storage.us-3.evennode.com'
}
