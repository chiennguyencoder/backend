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
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: '123456',
  database: 'trello',
  entities: [User, Project, ProjectMembers, Board, Card, CardMembers, Comment, Notification, List, Role, Permission],
  migrationsTableName: 'migrations',
  migrations: [],
  synchronize: true,
});