import { format, parse, sub, isValid } from "date-fns";
import fetch from "node-fetch";
import type { Request, Response } from "@sveltejs/kit";
import { CovidData } from "$lib/CovidData";

async function getLatestAvailableDate() {
  const latestDateRes = await fetch("https://covid19-api.vost.pt/Requests/get_last_update");

  if (!latestDateRes.ok) throw "API Error";

  const latestDate = (await latestDateRes.json()).data;
  const parsedLatestDate = parse(latestDate, "dd-MM-yyyy", new Date());

  return parsedLatestDate;
}

function getCurrentDate(desiredDate, fallbackDate) {
  if (!desiredDate) return fallbackDate;

  const dateFromQuery = new Date(desiredDate);

  if (!isValid(dateFromQuery)) throw "Invalid Date";

  return dateFromQuery;
}

function getPreviousDate(currentDate) {
  return sub(currentDate, { days: 1 });
}

function formatDateToApi(date) {
  return format(date, "dd-MM-yyyy");
}

async function getData(previousDate, currentDate) {
  const [currentRes, prevRes] = await Promise.all([
    fetch(`https://covid19-api.vost.pt/Requests/get_entry/${formatDateToApi(currentDate)}`),
    fetch(`https://covid19-api.vost.pt/Requests/get_entry/${formatDateToApi(previousDate)}`)
  ]);

  if (!currentRes.ok || !prevRes.ok) throw "API Error";

  const [prevData, currData] = await Promise.all([prevRes.json(), currentRes.json()]);

  return { prevData, currData };
}

export async function get({ query }: Request): Promise<Response> {
  const latestDate = await getLatestAvailableDate();
  const currentDate = getCurrentDate(query.get("date"), latestDate);
  const previousDate = getPreviousDate(currentDate);
  const data = await getData(previousDate, currentDate);

  return {
    body: new CovidData({ ...data, previousDate, currentDate, latestDate }).toJSON(),
    headers: {
      "cache-control": "public, max-age=3600"
    }
  };
}
