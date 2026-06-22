import { MigrationInterface, QueryRunner } from "typeorm";

export class EnablePgCrypto1719079999999 implements MigrationInterface {
  name = "EnablePgCrypto1719079999999";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
  }

  public async down(): Promise<void> {}
}
