import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds Orchestrate to the delivery phases, between Automate and Operate.
 *
 * Services and case studies share the DeliveryPhase enum, so both columns
 * change, although only services are given the new value.
 *
 * `down()` moves any Orchestrate service back to Automate before narrowing the
 * enum. MySQL would otherwise refuse the ALTER, or in non-strict mode blank
 * the value.
 */
export class AddOrchestratePhase1790600000000 implements MigrationInterface {
    name = 'AddOrchestratePhase1790600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`services\` MODIFY \`phase\` enum ('Build', 'Automate', 'Orchestrate', 'Operate') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`case_studies\` MODIFY \`phase\` enum ('Build', 'Automate', 'Orchestrate', 'Operate') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE \`services\` SET \`phase\` = 'Automate' WHERE \`phase\` = 'Orchestrate'`);
        await queryRunner.query(`UPDATE \`case_studies\` SET \`phase\` = 'Automate' WHERE \`phase\` = 'Orchestrate'`);
        await queryRunner.query(`ALTER TABLE \`case_studies\` MODIFY \`phase\` enum ('Build', 'Automate', 'Operate') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`services\` MODIFY \`phase\` enum ('Build', 'Automate', 'Operate') NOT NULL`);
    }
}
