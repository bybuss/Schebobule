import { User } from "../domain/models/User";  

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
