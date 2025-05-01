import { CompanyModel } from "src/company/entity/company.entity";
import { PostgresBaseModel } from "src/shared/database/PostgresModel";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('contact_us')
export class ContactUsModel extends PostgresBaseModel {
    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    first_name: string;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    last_name: string;

    @Column({
        name: 'email',
        type: 'varchar',
        length: 100,
        nullable: false,
    })
    email: string;

    @Column({
        name: 'phone',
        type: 'varchar',
        length: 15,
        nullable: true,
    })
    phone: string;

    @Column({
        name: 'message',
        type: 'text',
        nullable: false,
    })
    message: string;

    @Column({
        name: 'company_id',
        type: 'bigint',
        nullable: true,
    })
    company_id: number;

    @ManyToOne(() => CompanyModel, (company) => company.contactUs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' }) // Join column to link the foreign key
    company: CompanyModel;
}