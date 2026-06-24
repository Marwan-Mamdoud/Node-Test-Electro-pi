import { MigrationInterface, QueryRunner } from "typeorm";

export class EnablePgCrypto1719079999999 implements MigrationInterface {
  name = "EnablePgCrypto1719079999999";

  public async up(): Promise<void> {
    // pgcrypto installed manually by superuser
  }

  public async down(): Promise<void> {}
}
