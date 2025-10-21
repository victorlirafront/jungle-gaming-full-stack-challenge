import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTasksTable1697000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
      CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'task_status',
            default: "'TODO'",
          },
          {
            name: 'priority',
            type: 'task_priority',
            default: "'MEDIUM'",
          },
          {
            name: 'creator_id',
            type: 'uuid',
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: true,
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
      CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
      CREATE INDEX idx_tasks_status ON tasks(status);
      CREATE INDEX idx_tasks_priority ON tasks(priority);
      CREATE INDEX idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX idx_tasks_creator_id_status ON tasks(creator_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_creator_id_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_priority;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_creator_id;`);
    await queryRunner.dropTable('tasks');
    await queryRunner.query(`
      DROP TYPE task_status;
      DROP TYPE task_priority;
    `);
  }
}

