import { sub, isValid, parse } from "date-fns";
import type { Request, Response } from "@sveltejs/kit";
import { CovidData } from "$lib/CovidData";
import { formatDateToApi } from "./_helpers";
import type { StrictBody } from "@sveltejs/kit/types/hooks";
import { getCovidDataset } from "$lib/api/data";

function getCurrentDate(desiredDate, fallbackDate) {
  if (!desiredDate) return fallbackDate;

  const dateFromQuery = new Date(desiredDate);

  if (!isValid(dateFromQuery)) throw "Invalid Date";

  return dateFromQuery;
}

function getPreviousDate(currentDate) {
  return sub(currentDate, { days: 1 });
}

async function getDataInternal(data, previousDate, currentDate) {
  const prevData = data.find((item) => item.data === formatDateToApi(previousDate));
  const currData = data.find((item) => item.data === formatDateToApi(currentDate));

  return { prevData, currData };
}

export async function get({ url }: Request): Promise<Response> {
  const covidDataset = await getCovidDataset();
  const latestDate = parse(covidDataset[covidDataset.length - 1].data, "dd-MM-yyyy", new Date());
  const currentDate = getCurrentDate(url.searchParams.get("date"), latestDate);
  const previousDate = getPreviousDate(currentDate);
  const data = await getDataInternal(covidDataset, previousDate, currentDate);

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
