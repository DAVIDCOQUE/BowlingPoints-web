export interface IRole {
  roleId: number;
  description: string;
  permissions?: IPermission[];
}
export interface IPermission {
  permissionId: number;
  name: string;
  description?: string;
}
