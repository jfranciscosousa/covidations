import csv from "csvtojson";
import LRU from "lru-cache";

const cache = new LRU({
  max: 1,
  // 5 minutes
  ttl: 300_000
});

export async function getCovidDataset(): Promise<any[]> {
  const cachedData = cache.get("COVID_DATASET") as any[];

  if (cachedData) return cachedData;

  const response = await fetch(
    "https://raw.githubusercontent.com/dssg-pt/covid19pt-data/master/data.csv"
  );
  const text = await response.text();
  const parsedCsv = await csv().fromString(text);

  cache.set("COVID_DATASET", parsedCsv);

  return parsedCsv;
}
