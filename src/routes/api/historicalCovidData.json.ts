import { getCovidDataset } from "$lib/utils/covidDataSource";
import type { RequestHandler } from "@sveltejs/kit";
import { parse, sub } from "date-fns";

async function getStartDate(startDateString) {
  const earliestDate = new Date("02/26/2020");

  if (!startDateString) return earliestDate;

  const startDate = new Date(startDateString);

  if (startDate <= earliestDate) {
    return earliestDate;
  }

  return sub(startDate, { days: 1 });
}

async function getEndDate(endDateString, latestDate) {
  const endDate = new Date(endDateString || new Date());

  if (latestDate < endDate) return latestDate;

  return endDate;
}

export const get: RequestHandler = async ({ url }) => {
  const covidDataset = await getCovidDataset();
  const startDate = await getStartDate(url.searchParams.get("start"));
  const latestDate = parse(covidDataset[covidDataset.length - 1].data, "dd-MM-yyyy", new Date());
  const endDate = await getEndDate(url.searchParams.get("end"), latestDate);

  const filteredCovidDataset = covidDataset
    .filter(({ data }) => {
      const date = parse(data, "dd-MM-yyyy", new Date());

      // This, due to reasons I don't want to delve deep, makes an inclusive filter
      return date > startDate && date <= endDate;
    })
    .map(({ data, confirmados_novos }) => ({
      date: parse(data, "dd-MM-yyyy", new Date()),
      newCases: confirmados_novos
    }));

  return {
    status: 200,
    body: JSON.stringify(filteredCovidDataset),
    headers: {
      "cache-control": "public, s-maxage=3600",
      "content-type": "application/json"
    }
  };
}
