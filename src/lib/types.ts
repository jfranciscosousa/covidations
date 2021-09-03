export interface DailyCovidData {
  currentDate: string;
  previousDate: string;
  latestDate: string;
  cases: number;
  newCases: number;
  deaths: number;
  newDeaths: number;
  hospitalized: number;
  newHospitalized: number;
  uci: number;
  newUci: number;
  previousLink: string;
  nextLink: string;
}
