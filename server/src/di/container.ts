import { container } from "tsyringe";
import { pool } from "src/common/connection";
import { UserDao } from "src/data/dao/UserDao.ts";
import { AccessTokenBlacklistDao } from "src/data/dao/AccessTokenBlacklistDao.ts";
import { RefreshTokenDao } from "src/data/dao/RefreshTokenDao.ts";
import { AuthRepositoryImpl } from "src/data/repositories/AuthRepositoryImpl.ts";
import { ScheduleDao } from "src/data/dao/ScheduleDao.ts";
import { ScheduleRepositoryImpl } from "src/data/repositories/ScheduleRepositoryImpl.ts";
import { AuthController } from "src/presentation/controllers/AuthController.ts"; 
import { ScheduleController } from "src/presentation/controllers/ScheduleController.ts";

import { CreateScheduleUseCase } from "src/domain/usecases/schedule/CreateScheduleUseCase.ts";
import { UpdateScheduleUseCase } from "src/domain/usecases/schedule/UpdateScheduleUseCase.ts";
import { DeleteScheduleUseCase } from "src/domain/usecases/schedule/DeleteScheduleUseCase.ts";
import { GetScheduleByIdUseCase } from "src/domain/usecases/schedule/GetScheduleByIdUseCase.ts";
import { GetScheduleByGroupUseCase } from "src/domain/usecases/schedule/GetScheduleByGroupUseCase.ts";
import { GetScheduleByTeacherUseCase } from "src/domain/usecases/schedule/GetScheduleByTeacherUseCase.ts";
import { GetScheduleByDateRangeUseCase } from "src/domain/usecases/schedule/GetScheduleByDateRangeUseCase.ts";
import { GetScheduleByGroupAndDateUseCase } from "src/domain/usecases/schedule/GetScheduleByGroupAndDateUseCase.ts";
import { GetSchedulesGroupedByTimeSlotUseCase } from "src/domain/usecases/schedule/GetSchedulesGroupedByTimeSlotUseCase.ts";
import { GetAllSchedulesUseCase } from "src/domain/usecases/schedule/GetAllSchedulesUseCase.ts";

container.registerInstance(UserDao, new UserDao(pool));
container.registerInstance(AccessTokenBlacklistDao, new AccessTokenBlacklistDao(pool));
container.registerInstance(RefreshTokenDao, new RefreshTokenDao(pool));
container.registerInstance(ScheduleDao, new ScheduleDao(pool));

container.registerSingleton("AuthRepository", AuthRepositoryImpl);
container.registerSingleton("ScheduleRepository", ScheduleRepositoryImpl);

container.registerSingleton(AuthController);
container.registerSingleton(ScheduleController);

container.registerSingleton(CreateScheduleUseCase);
container.registerSingleton(UpdateScheduleUseCase);
container.registerSingleton(DeleteScheduleUseCase);
container.registerSingleton(GetScheduleByIdUseCase);
container.registerSingleton(GetScheduleByGroupUseCase);
container.registerSingleton(GetScheduleByTeacherUseCase);
container.registerSingleton(GetScheduleByDateRangeUseCase);
container.registerSingleton(GetScheduleByGroupAndDateUseCase);
container.registerSingleton(GetSchedulesGroupedByTimeSlotUseCase);
container.registerSingleton(GetAllSchedulesUseCase);

export { container };
