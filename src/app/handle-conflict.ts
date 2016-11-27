import { Handle } from './handle';

export type ConflictPriority = 'low' | 'medium' | 'high';

export class HandleConflict {
  constructor(
    public candidateName: string,
    public description: string,
    public priority: ConflictPriority,
    public ruleId: string,
    public conflict?: Handle) {
  }
}
