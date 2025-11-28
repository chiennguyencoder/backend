export class BoardDTO {
    id: string
    title: string
    description?: string
    background?: string
    isArchived: boolean
    workspaceId: string
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<BoardDTO>) {
        Object.assign(this, partial)
    }
}
