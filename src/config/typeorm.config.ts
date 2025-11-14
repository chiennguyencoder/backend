import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Board } from '../entities/board.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMembers } from '../entities/workspace-member.entity';
import { Card } from '../entities/card.entity';
import { CardMembers } from '../entities/card-member.entity';
import { Comment } from '../entities/comment.entity';
import { Notification } from '../entities/notification.entity';
import { List } from '../entities/list.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Workspace, WorkspaceMembers, Board, Card, CardMembers, Comment, Notification, List, Role, Permission],
  migrationsTableName: 'migrations',
  migrations: [],
  synchronize: true,
});