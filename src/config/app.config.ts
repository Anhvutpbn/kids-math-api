export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET ?? 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  dataDir: process.env.DATA_DIR ?? './data',
  assetsDir: process.env.ASSETS_DIR ?? './assets',
});
