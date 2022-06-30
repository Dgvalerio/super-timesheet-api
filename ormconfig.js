const common = {
  type: 'postgres',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNC,
};

module.exports = process.env.DATABASE_URL
  ? {
      ...common,
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      ...common,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    };
