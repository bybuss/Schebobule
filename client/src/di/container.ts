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

container.registerSingleton(TokenService);
container.registerSingleton(NetworkService);

container.register<AuthRepository>("AuthRepository", AuthRepositoryImpl);
container.register<ScheduleRepository>("ScheduleRepository", ScheduleRepositoryImpl);

container.registerSingleton(LoginUseCase);
container.registerSingleton(RegisterUseCase);
container.registerSingleton(RefreshTokenUseCase);
container.registerSingleton(LogoutUseCase);
container.registerSingleton(GetSchedulesUseCase);
container.registerSingleton(CreateScheduleUseCase);
container.registerSingleton(UpdateScheduleUseCase);
container.registerSingleton(DeleteScheduleUseCase);

export { container };
