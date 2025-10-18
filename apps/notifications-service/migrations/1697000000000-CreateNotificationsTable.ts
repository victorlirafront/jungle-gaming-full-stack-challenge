import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1697000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    await queryRunner.query(`
      CREATE TYPE notification_type AS ENUM (
        'TASK_CREATED',
        'TASK_ASSIGNED',
        'TASK_UPDATED',
        'TASK_STATUS_CHANGED',
        'TASK_COMMENTED',
        'TASK_DELETED'
      );
    `);

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'notification_type',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    await queryRunner.query(`
      CREATE INDEX idx_notifications_userId ON notifications(userId);
      CREATE INDEX idx_notifications_read ON notifications(read);
      CREATE INDEX idx_notifications_createdAt ON notifications(createdAt DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query(`DROP TYPE notification_type;`);
  }
}

