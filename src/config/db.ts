import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '@/entities/user.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User],
  migrationsTableName: 'migrations',
  migrations: [],
  synchronize: true,
});