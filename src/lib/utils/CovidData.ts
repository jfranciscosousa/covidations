import { format } from "date-fns";

export interface DailyCovidDataType {
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

export class DailyCovidData {
  private prevData: Record<string, string>;
  private currData: Record<string, string>;
  currentDate: Date;
  previousDate: Date;
  latestDate: Date;

  constructor(data: any) {
    this.currData = data.currData;
    this.prevData = data.prevData;
    this.currentDate = new Date(data.currentDate);
    this.previousDate = new Date(data.previousDate);
    this.latestDate = new Date(data.latestDate);
  }

  get cases(): number {
    return Number(this.currData.confirmados);
  }

  get newCases(): number {
    return Number(this.currData.confirmados) - Number(this.prevData.confirmados);
  }

  get deaths(): number {
    return Number(this.currData.obitos);
  }

  get newDeaths(): number {
    return Number(this.currData.obitos) - Number(this.prevData.obitos);
  }

  get hospitalized(): number {
    return Number(this.currData.internados);
  }

  get newHospitalized(): number {
    return Number(this.currData.internados) - Number(this.prevData.internados);
  }

  get uci(): number {
    return Number(this.currData.internados_uci);
  }

  get newUci(): number {
    return Number(this.currData.internados_uci) - Number(this.prevData.internados_uci);
  }

  get previousLink(): string {
    return `/?date=${format(this.previousDate, "yyyy-MM-dd")}`;
  }

  get nextLink(): string | null {
    const nextDay = new Date(this.currentDate);
    nextDay.setDate(this.currentDate.getDate() + 1);

    if (this.latestDate.toLocaleDateString() === this.currentDate.toLocaleDateString()) return null;

    return `/?date=${format(nextDay, "yyyy-MM-dd")}`;
  }

  toJSON(): DailyCovidDataType {
    return {
      currentDate: this.currentDate.toISOString(),
      previousDate: this.previousDate.toISOString(),
      latestDate: this.latestDate.toISOString(),
      cases: this.cases,
      newCases: this.newCases,
      deaths: this.deaths,
      newDeaths: this.newDeaths,
      hospitalized: this.hospitalized,
      newHospitalized: this.newHospitalized,
      uci: this.uci,
      newUci: this.newUci,
      previousLink: this.previousLink,
      nextLink: this.nextLink
    };
  }
}
