import { User } from "../../domain/models/User";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
