import client from './client';

export type ReportType = 'BUG' | 'SUGGESTION' | 'WRONG_CONTENT' | 'OTHER';

export interface CreateReportPayload {
  type: ReportType;
  description: string;
}

export const createReport = (data: CreateReportPayload) =>
  client.post('/reports', data);
