import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Board } from '@/entities/board.entity';
import { Project } from '@/entities/project.entity';
import { ProjectMembers } from '@/entities/project-member.entity';
import { Card } from '@/entities/card.entity';
import { CardMembers } from '@/entities/card-member.entity';
import { Comment } from '@/entities/comment.entity';
import { Notification } from '@/entities/notification.entity';
import { List } from '@/entities/list.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Project, ProjectMembers, Board, Card, CardMembers, Comment, Notification, List],
  migrationsTableName: 'migrations',
  migrations: [],
  synchronize: true,
});