import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Phase, Task } from './dtos';
import { generate } from 'shortid';
import { FakeDb } from './fakeDb';
@Injectable()
export class StartUpProgressService {
  private fakeDb: FakeDb = new FakeDb();
  // will use an already ordered data structure to serve data instead of the fakeDb for simplicity
  private structuredList = [];
  getStructuredList(): any {
    return this.structuredList;
  }
  /**
   *
   * @param name - string name for the new phase about to be inserted
   * @param orderNo - order number that will be used to rank the phases
   * @returns - the new phase object created
   */
  createPhase(name: string, orderNo: number): any {
    const id = generate();
    // check if orderNo was defined if not add phase to the end
    const orderNoUpdated = orderNo ? orderNo : this.fakeDb.phases.length + 1;
    // error out if order no is not in range
    if (
      !StartUpProgressService.validateOrderNo(
        orderNoUpdated,
        this.structuredList.length,
      )
    ) {
      throw new BadRequestException('OrderNo out of range');
    }
    const newPhase = new Phase(id, name, orderNoUpdated);
    const newStructuredPhase = { tasks: [], ...newPhase };
    this.fakeDb.phases.push(newPhase);
    let insertedAt = -1;
    for (let i = 0; i < this.structuredList.length; i++) {
      if (orderNoUpdated === i + 1) {
        this.structuredList.splice(i, 0, newStructuredPhase);
        insertedAt = i;
      }
    }
    if (insertedAt === -1) {
      this.structuredList.push(newStructuredPhase);
    } else {
      this.updatePhasesOrderNo(insertedAt + 1, 1);
    }
    return newPhase;
  }
  /**
   *
   * @param name - string name for the new task about to be inserted
   * @param orderNo - order number that will be used to rank the tasks
   * @param phaseId - id of the phase that the task belongs to
   * @returns - the new task created
   */
  createTask(name: string, orderNo: number, phaseId: string): any {
    const phaseIndex = this.structuredList.findIndex(
      (phase) => phase.id === phaseId,
    );
    if (phaseIndex < 0) {
      throw new BadRequestException('Phase Id does not exist');
    }
    const id = generate();
    const orderNoUpdated = orderNo
      ? orderNo
      : this.structuredList[phaseIndex].tasks.length + 1;
    // error out if order no is not in range
    if (
      !StartUpProgressService.validateOrderNo(
        orderNoUpdated,
        this.structuredList[phaseIndex].tasks.length,
      )
    ) {
      throw new BadRequestException('OrderNo out of range');
    }
    const newTask = new Task(id, name, orderNoUpdated, phaseId);
    this.fakeDb.tasks.push(newTask);
    let insertedAt = -1;
    for (let i = 0; i < this.structuredList[phaseIndex].tasks.length; i++) {
      if (orderNoUpdated === i + 1) {
        this.structuredList[phaseIndex].tasks.splice(i, 0, newTask);
        insertedAt = i;
      }
    }
    if (insertedAt === -1) {
      this.structuredList[phaseIndex].tasks.push(newTask);
    } else {
      this.updateTasksOrderNo(phaseIndex, insertedAt + 1, 1);
    }
    return newTask;
  }
  /**
   * Deletes the phase and all associated tasks
   * @param id - phase id
   * @returns
   */
  deletePhaseById(id: string): any {
    const index = this.fakeDb.phases.findIndex((phase) => phase.id === id);
    const indexSS = this.structuredList.findIndex((phase) => phase.id === id);
    if (index === -1) {
      throw new NotFoundException();
    }
    //delete tasks associated with this phase (in our model there is a 1-1 relationship between phases and tasks)
    const associatedTaskIds = this.fakeDb.tasks.filter(
      (task) => task.phaseId === id,
    );
    associatedTaskIds.forEach((task) => this.deleteTaskById(task.id));
    this.fakeDb.phases.splice(index, 1);
    this.structuredList.splice(indexSS, 1);
    // decrement succesor phases order number
    this.updatePhasesOrderNo(indexSS, -1);
    return { message: 'Phase and associated tasks deleted' };
  }

  deleteTaskById(id: string): any {
    const index = this.fakeDb.tasks.findIndex((task) => task.id === id);
    const phaseIndexSS = this.structuredList.findIndex(
      (phase) => phase.id === this.fakeDb.tasks[index].phaseId,
    );
    const taskIndexSS = this.structuredList[phaseIndexSS].tasks.findIndex(
      (task) => task.id === id,
    );
    if (index === -1) {
      throw new NotFoundException();
    }
    this.fakeDb.tasks.splice(index, 1);
    this.structuredList[phaseIndexSS].tasks.splice(taskIndexSS, 1);
    this.updateTasksOrderNo(phaseIndexSS, taskIndexSS, -1);
    return { message: 'Task Deleted' };
  }
  /**
   * Updates the status of a task based on the following rules:
   * 1. If the status should be set to true, it checks if the previouse task (not neccessarely from the same phaze)
   * is set to true
   * 2. If the status should be set to false, it also sets all the tasks that follow to current one in the ranking to false
   * @param id - task id
   * @param status - new status
   */
  updateTaskStatus(id: string, status: boolean): any {
    const taskIndex = this.fakeDb.tasks.findIndex((task) => task.id === id);
    const phaseIndexSS = this.structuredList.findIndex(
      (phase) => phase.id === this.fakeDb.tasks[taskIndex].phaseId,
    );
    const taskIndexSS = this.structuredList[phaseIndexSS].tasks.findIndex(
      (task) => task.id === id,
    );
    let updatedTask;
    if (status) {
      if (
        (taskIndexSS === 0 && phaseIndexSS === 0) ||
        (taskIndexSS === 0 &&
          this.structuredList[phaseIndexSS - 1].tasks[
            this.structuredList[phaseIndexSS - 1].tasks.length - 1
          ].status) ||
        (taskIndexSS > 0 &&
          this.structuredList[phaseIndexSS].tasks[taskIndexSS - 1].status)
      ) {
        updatedTask = {
          ...this.fakeDb.tasks.find((task) => task.id === id),
          status,
        };
        this.fakeDb.tasks.splice(taskIndex, 1, updatedTask);
        this.structuredList[phaseIndexSS].tasks.splice(
          taskIndexSS,
          1,
          updatedTask,
        );
      }
    } else {
      updatedTask = {
        ...this.fakeDb.tasks.find((task) => task.id === id),
        status,
      };
      this.fakeDb.tasks.splice(taskIndex, 1, updatedTask);
      this.structuredList[phaseIndexSS].tasks.splice(
        taskIndexSS,
        1,
        updatedTask,
      );
      this.setSuccesorTasksToFalse(phaseIndexSS, taskIndexSS);
    }
  }
  /**
   * Given a task it sets all the other tasks that follow in the ranking to false
   * @param phaseIndex the index at which we can find the parent phase in the strcturedList
   * @param taskIndex the index at which we can find the task in the tasks array of the parrent phase
   * @returns
   */
  setSuccesorTasksToFalse(phaseIndex: number, taskIndex: number) {
    let currentPhaseIndex = phaseIndex;
    let currentTaskIndex = taskIndex + 1;
    while (currentPhaseIndex < this.structuredList.length) {
      if (
        currentTaskIndex >= this.structuredList[currentPhaseIndex].tasks.length
      ) {
        currentTaskIndex = 0;
        currentPhaseIndex++;
        continue;
      }
      if (
        !this.structuredList[currentPhaseIndex].tasks[currentTaskIndex].status
      ) {
        return;
      }
      this.structuredList[currentPhaseIndex].tasks[currentTaskIndex].status =
        false;
      this.fakeDb.tasks.find(
        (task) =>
          task.id ===
          this.structuredList[currentPhaseIndex].tasks[currentTaskIndex].id,
      ).status = false;
      currentTaskIndex++;
    }
  }
  /**
   * Used to keep the orderNo's for the ranking in sync
   * @param start - the index from which we want to alter the orderNo's
   * @param value - the amount we want to add to the orderNo's (-1 when deleting, 1 when adding a phase)
   */
  updatePhasesOrderNo(start: number, value: number) {
    for (let i = start; i < this.structuredList.length; i++) {
      this.structuredList[i].orderNo += value;
      this.fakeDb.phases.find(
        (phase) => phase.id === this.structuredList[i].id,
      ).orderNo += value;
    }
  }

  updateTasksOrderNo(phaseIndex: number, start: number, value: number) {
    for (let i = start; i < this.structuredList[phaseIndex].tasks.length; i++) {
      // no need to update the fakeDb since they share the object
      this.structuredList[phaseIndex].tasks[i].orderNo += value;
    }
  }
  /**
   * Used to validate a new task. If a custom orderNo is provided for a new task that is about to be inserted, we need to check
   * it falls in the [existing_range_lower_limit, existing_range_upper_limit + 1] interval
   * @param orderNo - orderNo about to be set
   * @param upperLimit - the upper limit of the current orderNo's range.
   * @returns
   */
  static validateOrderNo(orderNo: number, upperLimit: number): boolean {
    if (orderNo < 1 || orderNo > upperLimit + 1) {
      return false;
    }
    return true;
  }
}
