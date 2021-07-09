import type { Response, Request } from "@sveltejs/kit";
import type { StrictBody } from "@sveltejs/kit/types/hooks";
import { parse } from "date-fns";
import fetch from "node-fetch";
import { formatDateToApi } from "./_helpers";

function extractDates(data: any): Date[] {
  return Object.values(data.data).map((unparsedDate) =>
    parse(unparsedDate as string, "dd-MM-yyyy", new Date())
  );
}

function getValue(data, key, index) {
  return Number(Object.values(data[key])[index]) - Number(Object.values(data[key])[index - 1]) || 0;
}

export async function get({ query }: Request): Promise<Response> {
  const startdate = formatDateToApi(new Date(query.get("start") || "02/26/2020"));
  const endDate = formatDateToApi(new Date(query.get("end") || new Date()));
  const res = await fetch(
    `https://covid19-api.vost.pt/Requests/get_entry/${startdate}_until_${endDate}`
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
