import csv from "csvtojson";

export async function getCovidDataset(): Promise<any[]> {
  const response = await fetch(
    "https://raw.githubusercontent.com/dssg-pt/covid19pt-data/master/data.csv"
  );
  const text = await response.text();
  const parsedCsv = await csv().fromString(text);

  return parsedCsv;
}
