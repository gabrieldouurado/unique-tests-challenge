import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class chanteTypeEnumInStatements1678810175728 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "statements",
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['deposit', 'withdraw']
            }),
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['deposit', 'withdraw', 'transfer']
            }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "statements",
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['deposit', 'withdraw', 'transfer']
            }),
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['deposit', 'withdraw']
            }))
    }
}
