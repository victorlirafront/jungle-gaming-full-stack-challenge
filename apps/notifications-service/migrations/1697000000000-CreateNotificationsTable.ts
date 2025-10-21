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
            name: 'user_id',
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
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    await queryRunner.query(`
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, read);
      CREATE INDEX idx_notifications_user_id_created_at ON notifications(user_id, created_at);
      CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user_id_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user_id_read;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user_id;`);
    await queryRunner.dropTable('notifications');
    await queryRunner.query(`DROP TYPE notification_type;`);
  }
}

