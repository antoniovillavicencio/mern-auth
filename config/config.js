const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_HOST || `mongodb://${process.env.IP || 'localhost'}:${process.env.MONGO_PORT || '27017'}/mernstarter`,
  jwtSecret: process.env.JWT_SECRET || "my_secret_key"
}

export default config;