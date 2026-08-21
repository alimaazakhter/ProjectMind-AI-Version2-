export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  university?: string;
  semester?: string;
  academic_level?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile extends UserProfile {
  role: 'student';
  university?: string;
  semester?: string;
  academic_level?: string;
}

export interface AdminProfile extends UserProfile {
  role: 'admin';
  access_level: string;
}
