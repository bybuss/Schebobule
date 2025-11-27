export interface JwtPayload {
  userId: number;
  email: string;
  is_admin: boolean;
  type: string;
}
