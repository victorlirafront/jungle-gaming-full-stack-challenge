import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTaskHistoryTable1697000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'task_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'task_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'task_history',
      new TableForeignKey({
        columnNames: ['task_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.query(`
      CREATE INDEX idx_task_history_task_id ON task_history(task_id);
      CREATE INDEX idx_task_history_user_id ON task_history(user_id);
      CREATE INDEX idx_task_history_task_id_created_at ON task_history(task_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_history_task_id_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_history_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_history_task_id;`);
    await queryRunner.dropTable('task_history');
  }
}

