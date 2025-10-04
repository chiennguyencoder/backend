import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class GenerateDate {
    @CreateDateColumn()
    createAt : Date

    @UpdateDateColumn()
    updatedAt: Date


}