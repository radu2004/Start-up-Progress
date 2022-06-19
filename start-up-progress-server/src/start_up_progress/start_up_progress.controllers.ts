import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreatePhaseDto, CreateTaskDto, UpdateTaskDto } from './dtos';
import { StartUpProgressService } from './start_up_progress.service';

@Controller('startUpProgress')
export class StartUpProgressController {
  constructor(private readonly startUpProgressSevice: StartUpProgressService) {}
  /**
   *
   * @returns a ranked lists of phase each containing a ranked list of tasks
   */
  @Get()
  getAllPhasesWithTasks(): any {
    return this.startUpProgressSevice.getStructuredList();
  }
  @Post('/phase')
  addPhase(@Body() body: CreatePhaseDto): any {
    return this.startUpProgressSevice.createPhase(body.name, body.orderNo);
  }

  @Post('/task')
  addTask(@Body() body: CreateTaskDto): any {
    return this.startUpProgressSevice.createTask(
      body.name,
      body.orderNo,
      body.phaseId,
    );
  }

  @Delete('/phase/:id')
  deletePhaseById(@Param('id') phaseId: string) {
    return this.startUpProgressSevice.deletePhaseById(phaseId);
  }

  @Delete('/task/:id')
  deleteTaskById(@Param('id') taskId: string) {
    return this.startUpProgressSevice.deleteTaskById(taskId);
  }

  @Patch('/task/:id')
  updateTaslById(
    @Param('id') taskId: string,
    @Body('') body: UpdateTaskDto,
  ): any {
    // TODO: could allow for name updates as well as orderNo's updates. The logic for updating the orderNos to be in sync is already in place
    return this.startUpProgressSevice.updateTaskStatus(taskId, body.status);
  }
}
