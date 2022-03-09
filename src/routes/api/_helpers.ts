import { format } from "date-fns";

export function formatDateToApi(date: Date): string {
  return format(date.setHours(0), "dd-MM-yyyy");
}
