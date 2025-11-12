export enum Permissions {
    // user
    CREATE_USER = 'user:create',
    READ_USER = 'user:read',
    UPDATE_USER = 'user:update',
    DELETE_USER = 'user:delete',

    // workspace
    CREATE_WORKSPACE = 'workspace:create',
    READ_WORKSPACE = 'workspace:read',
    UPDATE_WORKSPACE = 'workspace:update',
    DELETE_WORKSPACE = 'workspace:delete',
    ADD_MEMBER_TO_WORKSPACE = 'workspace:add_member',
    REMOVE_MEMBER_FROM_WORKSPACE = 'workspace:remove_member',
    CHANGE_MEMBER_ROLE = 'workspace:change_member_role',
    READ_WORKSPACE_MEMBERS = 'workspace:read_members',

}