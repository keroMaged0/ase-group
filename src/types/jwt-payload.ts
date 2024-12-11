import { UserType } from '../models/user-auth.model';
export interface IjwtPayload {
  id: string;
  is_verified: boolean;
  profile_id: string;
  role_id: string;
  permissions: string[];
  user_type: UserType;
  provider_id: string;
// <<<<<<< HEAD
//   permissions: string[];
//   // provider_id: string;
// =======
// >>>>>>> d8532491b6ee001de4c8a7aab2742b620dc9aecb

}
