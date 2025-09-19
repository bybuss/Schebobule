import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { GetScheduleUseCase } from "../../domain/usecases/GetScheduleUseCase.ts";

@injectable()
class ScheduleController {
    constructor(
        @inject(GetScheduleUseCase) private getScheduleUseCase: GetScheduleUseCase
    ) {}

    async getSchedue(req: Request, res: Response) {
        const groupName = req.params.groupName?.toString() ?? "Группа отсутствует :(";

        try {
            const schedule = await this.getScheduleUseCase.execute(groupName);
            res.json(schedule);
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    }
}

export default ScheduleController;
