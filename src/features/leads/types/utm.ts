export interface LeadUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  ref?: string;
}

export interface CapturedUtm extends LeadUtm {
  capturedAt: string;
}