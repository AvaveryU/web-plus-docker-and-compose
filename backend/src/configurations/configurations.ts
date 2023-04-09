export default () => ({
  jwt_secret: process.env.JWT_SECRET || 'secret-key',
});
