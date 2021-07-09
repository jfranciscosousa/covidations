import { format } from "date-fns";

export function formatDateToApi(date: Date): string {
  return format(date, "dd-MM-yyyy");
}
