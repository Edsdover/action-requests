import { FirebaseAbstract } from '../../shared';

export class ActionRequest extends FirebaseAbstract {
  assignee: string;
  category: string;
  ecn: number;
  humanReadableCode: string;
  attachmentHashes: string[] = [];
  attachmentUrls: string[] = [];
  reporter: string;
  salesOrderNumber: number;
  status = 'new'; // new, approved, resolved
  isUrgent: boolean;

  approvedActionPlan: string;
  discrepancy: string;
  suggestedRemedy: string;
  resolution: string;
}
