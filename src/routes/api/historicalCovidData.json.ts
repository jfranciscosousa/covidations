import type { Response, Request } from "@sveltejs/kit";
import type { StrictBody } from "@sveltejs/kit/types/hooks";
import { parse, sub } from "date-fns";
import fetch from "cross-fetch";
import { formatDateToApi, getLatestAvailableDate } from "./_helpers";
import timeoutSignal from "$lib/timeoutSignal";

function extractDates(data: any): Date[] {
  const dates = Object.values(data.data).map((unparsedDate, index) =>
    parse(unparsedDate as string, "dd-MM-yyyy", new Date(0, 0, 0, 12))
  );

  dates.shift();

  return dates;
}

function getValue(data, key, index) {
  return Number(Object.values(data[key])[index]) - Number(Object.values(data[key])[index - 1]) || 0;
}

async function getStartDate(startDateString) {
  const earliestDate = new Date("02/26/2020");

  if (!startDateString) return earliestDate;

  const startDate = new Date(startDateString);

  if (startDate <= earliestDate) {
    return earliestDate;
  }

  return sub(startDate, { days: 1 });
}

async function getEndDate(endDateString) {
  const endDate = new Date(endDateString || new Date());
  const latestDate = await getLatestAvailableDate();

  if (latestDate < endDate) return latestDate;

  return endDate;
}

export async function get({ url }: Request): Promise<Response> {
  const startDate = formatDateToApi(await getStartDate(url.searchParams.get("start")));
  const endDate = formatDateToApi(await getEndDate(url.searchParams.get("end")));
  const res = await fetch(
    `https://covid19-api.vost.pt/Requests/get_entry/${startDate}_until_${endDate}`,
    {
      headers: { Authorization: process.env["API_AUTH"] },
      signal: timeoutSignal(3500)
    }
  );
  const json = await res.json();
  const dates = extractDates(json);

  return {
    status: 200,
    body: {
      dates,
      cases: dates.map((date, index) => getValue(json, "confirmados", index + 1))
    } as unknown as StrictBody,
    headers: {
      "cache-control": "public, s-maxage=3600"
    }
  };
}
