import "reflect-metadata";
import { container } from "tsyringe";
import { TokenService } from "../common/data/TokenService";
import { NetworkService } from "../common/data/NetworkService";
import { AuthRepository } from "../auth/domain/repositories/AuthRepository";
import { AuthRepositoryImpl } from "../auth/data/AuthRepositoryImpl";
import { ScheduleRepository } from "../schedule/domain/repositories/ScheduleRepository";
import { ScheduleRepositoryImpl } from "../schedule/data/ScheduleRepositoryImpl";
import { LoginUseCase } from "../auth/domain/usecases/LoginUseCase";
import { RegisterUseCase } from "../auth/domain/usecases/RegisterUseCase";
import { RefreshTokenUseCase } from "../auth/domain/usecases/RefreshTokenUseCase";
import { LogoutUseCase } from "../auth/domain/usecases/LogoutUseCase";
import { GetSchedulesUseCase } from "../schedule/domain/usecases/GetSchedulesUseCase";
import { CreateScheduleUseCase } from "../schedule/domain/usecases/CreateScheduleUseCase";
import { UpdateScheduleUseCase } from "../schedule/domain/usecases/UpdateScheduleUseCase";
import { DeleteScheduleUseCase } from "../schedule/domain/usecases/DeleteScheduleUseCase";
import { JwtService } from "../common/data/JwtService";

const tokenService = new TokenService();
const networkService = new NetworkService(tokenService);
const jwtService = new JwtService();

const authRepository = new AuthRepositoryImpl(networkService, jwtService);
const scheduleRepository = new ScheduleRepositoryImpl(networkService);

const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);

const getSchedulesUseCase = new GetSchedulesUseCase(scheduleRepository);
const createScheduleUseCase = new CreateScheduleUseCase(scheduleRepository);
const updateScheduleUseCase = new UpdateScheduleUseCase(scheduleRepository);
const deleteScheduleUseCase = new DeleteScheduleUseCase(scheduleRepository);

container.registerInstance(TokenService, tokenService);
container.registerInstance(JwtService, jwtService);
container.registerInstance(NetworkService, networkService);
container.registerInstance("AuthRepository", authRepository);
container.registerInstance("ScheduleRepository", scheduleRepository);
container.registerInstance(LoginUseCase, loginUseCase);
container.registerInstance(RegisterUseCase, registerUseCase);
container.registerInstance(RefreshTokenUseCase, refreshTokenUseCase);
container.registerInstance(LogoutUseCase, logoutUseCase);
container.registerInstance(GetSchedulesUseCase, getSchedulesUseCase);
container.registerInstance(CreateScheduleUseCase, createScheduleUseCase);
container.registerInstance(UpdateScheduleUseCase, updateScheduleUseCase);
container.registerInstance(DeleteScheduleUseCase, deleteScheduleUseCase);

export { container };
