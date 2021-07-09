import type { Response, Request } from "@sveltejs/kit";
import type { StrictBody } from "@sveltejs/kit/types/hooks";
import { parse } from "date-fns";
import fetch from "node-fetch";
import { formatDateToApi, getLatestAvailableDate } from "./_helpers";

function extractDates(data: any): Date[] {
  return Object.values(data.data).map((unparsedDate) =>
    parse(unparsedDate as string, "dd-MM-yyyy", new Date())
  );
}

function getValue(data, key, index) {
  return Number(Object.values(data[key])[index]) - Number(Object.values(data[key])[index - 1]) || 0;
}

async function getStartDate(startDateString) {
  const startDate = new Date(startDateString || "02/26/2020");
  const earliestDate = new Date("02/26/2020");

  if (startDate < earliestDate) return earliestDate;

  return startDate;
}

async function getEndDate(endDateString) {
  const endDate = new Date(endDateString || new Date());
  const latestDate = await getLatestAvailableDate();

  if (latestDate < endDate) return latestDate;

  return endDate;
}

export async function get({ query }: Request): Promise<Response> {
  const startDate = formatDateToApi(await getStartDate(query.get("start")));
  const endDate = formatDateToApi(await getEndDate(query.get("end")));
  const res = await fetch(
    `https://covid19-api.vost.pt/Requests/get_entry/${startDate}_until_${endDate}`
  );
  const json = await res.json();
  const dates = extractDates(json);

  return {
    status: 200,
    body: {
      dates,
      cases: dates.map((date, index) => getValue(json, "confirmados", index))
    } as unknown as StrictBody,
    headers: {
      "cache-control": "public, s-maxage=3600"
    }
  };
}
