import { inject, injectable, singleton } from "tsyringe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthRepository } from "../../domain/repositories/AuthRepository.ts";
import { UserDao } from "../../data/dao/UserDao.ts";

@singleton()
@injectable()
export class AuthRepositoryImpl implements AuthRepository {
    constructor(
        @inject(UserDao) private userDao: UserDao
    ) {}

    async authenticate(email: string, password: string): Promise<string | null> {
        const user = await this.userDao.findByEmail(email);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        const token = jwt.sign({ userId: user.id, email: user.email }, "secretKey", { expiresIn: "1h" });
        return token;
    }

    async register(email: string, password: string): Promise<string | null> {
        const existingUser = await this.userDao.findByEmail(email);
        if (existingUser) return null;

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await this.userDao.create(email, passwordHash);

        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, "secretKey", { expiresIn: "1h" });
        return token;
    }
}
