import { Handle } from './handle';

export type ConflictPriority = 'low' | 'medium' | 'high';

export const PRIORITY_ORDER = {'high': 1, 'medium': 2, 'low': 3};

/** Represents a potential conflict with a proposed handle. */
export class HandleConflict {
  constructor(
    /** The name being checked. */
    public candidateName: string,
    /** A description of why it might conflict. */
    public description: string,
    /** The importance of this conflict. */
    public priority: ConflictPriority,
    /** The ID of the rule which generated this conflict. */
    public ruleId: string,
    /** Optionally, which existing {@link Handle} the name conflicts with. */
    public conflict?: Handle
  ) { }
}
