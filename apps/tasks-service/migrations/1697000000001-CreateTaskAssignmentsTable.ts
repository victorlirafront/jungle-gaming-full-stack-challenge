import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTaskAssignmentsTable1697000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'task_assignments',
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
            name: 'assigned_by',
            type: 'uuid',
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'task_assignments',
      new TableForeignKey({
        columnNames: ['task_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.query(`
      CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
      CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
      CREATE INDEX idx_task_assignments_task_id_user_id ON task_assignments(task_id, user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_assignments_task_id_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_assignments_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_assignments_task_id;`);
    await queryRunner.dropTable('task_assignments');
  }
}

