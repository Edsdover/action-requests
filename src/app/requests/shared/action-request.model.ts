import { FirebaseAbstract } from '../../shared';

export class ActionRequest extends FirebaseAbstract {
  assignee = 'bill';
  category: string;
  ecn: number;
  humanReadableCode: string;
  attachments: Attachment[] = [];
  reporter = '';
  salesOrderNumber: number;
  status = 'new'; // new, approved, resolved
  watchers: string[] = [];
  isUrgent: boolean;

  approvedActionPlan: string;
  discrepancy: string;
  suggestedRemedy: string;
  resolution: string;
}

export class Attachment {
  filename: string;
  attachmentUrl: string;
  thumbUrl: string;
}
