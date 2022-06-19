import { Component } from '@angular/core';
import { AppService } from './app.service';
import { PhaseWithTasks, Task } from './types';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions
} from '@angular/material/checkbox';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' }}]
})
export class AppComponent {
  title = 'start-up-progress-client';
  structuredList: PhaseWithTasks[] = [];
  orderNoErrorMessage = 'OrderNo must be empty or a number';
  constructor(private appService: AppService) {
  }
  ngOnInit() {
    this.loadPhasesWithTasks();
  }
  /**
   * 
   * @returns an ordered list of phases each having an ordered list of tasks
   */
  loadPhasesWithTasks() { 
    return this.appService.getStructuredList().subscribe((res) => {
      this.structuredList = res;
    });
  }

  addPhase(name: string, orderNoString: string) {
    if (!AppComponent.validateOrderNoInput(orderNoString)) {
      alert(this.orderNoErrorMessage);
      return;
    }
    const orderNo = parseInt(orderNoString);
    this.appService.addPhase(name, orderNo).subscribe({
      next: () => this.loadPhasesWithTasks(),
      error: (error) => console.log('http error', error),
      complete: () => this.loadPhasesWithTasks(),
    });
  }

  addTask(name: string, orderNoString: string, phaseId: string) {
    if (!AppComponent.validateOrderNoInput(orderNoString)) {
      alert(this.orderNoErrorMessage);
      return;
    }
    const orderNo = parseInt(orderNoString);
    this.appService.addTask(name, orderNo, phaseId).subscribe({
      next: () => this.loadPhasesWithTasks(),
      error: (error) => console.log('http error', error),
      complete: () => this.loadPhasesWithTasks(),
    });
  }

  deletePhase(id: string) {
    this.appService.deletePhase(id).subscribe({
      next: () => this.loadPhasesWithTasks(),
      error: (error) => console.log('http error', error),
      complete: () => this.loadPhasesWithTasks(),
    });
  }

  deleteTask(id: string) {
    this.appService.deleteTask(id).subscribe({
      next: () => this.loadPhasesWithTasks(),
      error: (error) => console.log('http error', error),
      complete: () => this.loadPhasesWithTasks(),
    });
  }

  updateStatus(id: string, status: boolean) {
    this.appService.updateStatus(id, status).subscribe({
      next: () => this.loadPhasesWithTasks(),
      error: (error) => console.log('http error', error),
      complete: () => this.loadPhasesWithTasks(),
    });
  }

  static validateOrderNoInput(orderNo: string) {
    if(!parseInt(orderNo) && orderNo !== '') return false;
    return true;
  }
  /**
   * 
   * @param tasks - an array of tasks associated with a phase
   * @returns the status of the phase
   */
  getPhaseStatus(tasks: Task[]) {
    if (!tasks.length) return false;
    for (const task of tasks) {
      if (!task.status) return false;
    }
    return true;
  }

  testAlert() {
    alert('haha');
  }
}
