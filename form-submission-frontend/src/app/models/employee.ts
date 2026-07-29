export type WorkTeam = 'DEV' | 'DEVOPS' | 'TESTING' | 'MARKETING';

export interface Employee {
  id?: string;
  name: string;
  workTeam: WorkTeam;
  annualCredit: number;
  usedCredit?: number;
  remainingCredit?: number;
}
