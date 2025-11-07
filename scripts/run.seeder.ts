import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { seedAuthorization } from './authorization.seeder';
import AppDataSource from '../src/config/typeorm.config'; 

async function runSeeder() {
  try {
    const dataSource: DataSource = await AppDataSource.initialize();
    const seeder = new seedAuthorization(dataSource);

    await seeder.init();
    console.log('🌱 Seeding completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
