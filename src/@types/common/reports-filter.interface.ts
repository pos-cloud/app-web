export default interface ReportsFilter {
  startDate?: string;
  endDate?: string;
  branch?: string;
  dateSelect?: string;
  status?: string[];
  transactionTypes?: string[];
  type?: string;
}
