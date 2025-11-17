import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export abstract class DateTimeEntity {
    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    public createdAt: Date
    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    public updatedAt: Date
}
