import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRefreshTokensTable1697000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(
      'CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_refresh_tokens_user_id_revoked ON refresh_tokens(user_id, revoked)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_refresh_tokens_user_id_revoked');
    await queryRunner.query('DROP INDEX IF EXISTS idx_refresh_tokens_expires_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_refresh_tokens_token');
    await queryRunner.query('DROP INDEX IF EXISTS idx_refresh_tokens_user_id');

    const table = await queryRunner.getTable('refresh_tokens');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('user_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('refresh_tokens', foreignKey);
    }

    await queryRunner.dropTable('refresh_tokens');
  }
}

