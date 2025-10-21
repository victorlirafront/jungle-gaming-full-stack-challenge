import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCommentsTable1697000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'task_id',
            type: 'uuid',
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
      'comments',
      new TableForeignKey({
        columnNames: ['task_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.query(`
      CREATE INDEX idx_comments_task_id ON comments(task_id);
      CREATE INDEX idx_comments_author_id ON comments(author_id);
      CREATE INDEX idx_comments_task_id_created_at ON comments(task_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comments_task_id_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comments_author_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comments_task_id;`);
    await queryRunner.dropTable('comments');
  }
}

