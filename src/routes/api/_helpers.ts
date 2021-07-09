import { parse, format } from "date-fns";

export async function getLatestAvailableDate(): Promise<Date> {
  const latestDateRes = await fetch("https://covid19-api.vost.pt/Requests/get_last_update");

  if (!latestDateRes.ok) throw "API Error";

  const latestDate = (await latestDateRes.json()).data;
  const parsedLatestDate = parse(latestDate, "dd-MM-yyyy", new Date());

  return parsedLatestDate;
}

export function formatDateToApi(date: Date): string {
  return format(date, "dd-MM-yyyy");
}
