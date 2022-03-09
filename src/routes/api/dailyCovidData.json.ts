import { sub, isValid, parse } from "date-fns";
import { DailyCovidData } from "$lib/utils/CovidData";
import { formatDateToApi } from "$lib/utils/dates";
import { getCovidDataset } from "$lib/utils/covidDataSource";
import type { RequestHandler } from "@sveltejs/kit";

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

export const get: RequestHandler = async ({ url }) => {
  const covidDataset = await getCovidDataset();
  const latestDate = parse(covidDataset[covidDataset.length - 1].data, "dd-MM-yyyy", new Date());
  const currentDate = getCurrentDate(url.searchParams.get("date"), latestDate);
  const previousDate = getPreviousDate(currentDate);
  const data = await getDataInternal(covidDataset, previousDate, currentDate);

  return {
    status: 200,
    body: JSON.stringify(
      new DailyCovidData({
        ...data,
        previousDate,
        currentDate,
        latestDate
      }).toJSON()
    ),
    headers: new Headers({
      "cache-control": "public, s-maxage=3600",
      "content-type": "application/json"
    })
  };
};
