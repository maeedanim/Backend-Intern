export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  database: {
    uri: process.env.DB_URI,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  app: {
    host: process.env.HOST,
    portL: process.env.PORT,
  },
});
