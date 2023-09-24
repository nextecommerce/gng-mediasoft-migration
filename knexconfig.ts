import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  config: {
    client: 'mysql',
    useNullAsDefault: true,
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_ROOT_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      timezone: 'UTC',
      dateStrings: true,
      requestTimeout: 1200000,
    },
  },
};

export default config;
