import { PathLocationStrategy } from "@angular/common"

export interface Phase {
    id: string, 
    name: string,
    orderNo: number
  }
export interface Task {

    id: string,
    name: string,
    orderNo: number,
    phaseId: string,
    status: boolean,
   
  }
export interface PhaseWithTasks extends Phase {
    tasks: Task[]
}  