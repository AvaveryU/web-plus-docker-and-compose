import * as dotenv from 'dotenv'
dotenv.config()

export default () => ({
  jwt_secret: process.env.JWT_SECRET || 'jwt_secret',
});
