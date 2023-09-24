import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  config: {
    client: 'mysql',
    useNullAsDefault: true,
    connection: {
      host: process.env.GNG_HOST,
      user: process.env.GNG_ROOT_USER,
      password: process.env.GNG_ROOT_PASSWORD,
      database: process.env.GNG_DATABASE,
      timezone: 'UTC',
      dateStrings: true,
      requestTimeout: 1200000,
    },
  },
};

export default config;
