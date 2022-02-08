import { sub, isValid } from "date-fns";
import fetch from "cross-fetch";
import type { Request, Response } from "@sveltejs/kit";
import { CovidData } from "$lib/CovidData";
import { formatDateToApi, getLatestAvailableDate } from "./_helpers";
import type { StrictBody } from "@sveltejs/kit/types/hooks";
import timeoutSignal from "$lib/timeoutSignal";

function getCurrentDate(desiredDate, fallbackDate) {
  if (!desiredDate) return fallbackDate;

  const dateFromQuery = new Date(desiredDate);

  if (!isValid(dateFromQuery)) throw "Invalid Date";

  return dateFromQuery;
}

function getPreviousDate(currentDate) {
  return sub(currentDate, { days: 1 });
}

async function getData(previousDate, currentDate) {
  const [currentRes, prevRes] = await Promise.all([
    fetch(`https://covid19-api.vost.pt/Requests/get_entry/${formatDateToApi(currentDate)}`, {
      headers: { Authorization: process.env["API_AUTH"] },
      signal: timeoutSignal(3500)
    }),
    fetch(`https://covid19-api.vost.pt/Requests/get_entry/${formatDateToApi(previousDate)}`, {
      headers: { Authorization: process.env["API_AUTH"] },
      signal: timeoutSignal(3500)
    })
  ]);

  if (!currentRes.ok || !prevRes.ok) throw "API Error";

  const [prevData, currData] = await Promise.all([prevRes.json(), currentRes.json()]);

  return { prevData, currData };
}

export async function get({ url }: Request): Promise<Response> {
  const latestDate = await getLatestAvailableDate();
  const currentDate = getCurrentDate(url.searchParams.get("date"), latestDate);
  const previousDate = getPreviousDate(currentDate);
  const data = await getData(previousDate, currentDate);

  return {
    status: 200,
    body: new CovidData({
      ...data,
      previousDate,
      currentDate,
      latestDate
    }).toJSON() as unknown as StrictBody,
    headers: {
      "cache-control": "public, s-maxage=3600"
    }
  };
}
