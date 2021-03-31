export class CovidData {
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

	private getValue(dataObj, key) {
		const defaultDateKey = Object.keys(dataObj.data)[0];

		return dataObj[key][defaultDateKey];
	}

	get cases(): number {
		return Number(this.getValue(this.currData, "confirmados"));
	}

	get newCases(): number {
		return (
			Number(this.getValue(this.currData, "confirmados")) -
			Number(this.getValue(this.prevData, "confirmados"))
		);
	}

	get deaths(): number {
		return Number(this.getValue(this.currData, "obitos"));
	}

	get newDeaths(): number {
		return (
			Number(this.getValue(this.currData, "obitos")) -
			Number(this.getValue(this.prevData, "obitos"))
		);
	}

	get hospitalized(): number {
		return Number(this.getValue(this.currData, "internados"));
	}

	get newHospitalized(): number {
		return (
			Number(this.getValue(this.currData, "internados")) -
			Number(this.getValue(this.prevData, "internados"))
		);
	}

	get uci(): number {
		return Number(this.getValue(this.currData, "internados_uci"));
	}

	get newUci(): number {
		return (
			Number(this.getValue(this.currData, "internados_uci")) -
			Number(this.getValue(this.prevData, "internados_uci"))
		);
	}

	get previousLink(): string {
		return `/?date=${this.previousDate.toLocaleDateString()}`;
	}

	get nextLink(): string | null {
		const nextDay = new Date(this.currentDate);
		nextDay.setDate(this.currentDate.getDate() + 1);

		if (this.latestDate.toLocaleDateString() === this.currentDate.toLocaleDateString()) return null;

		return `/?date=${nextDay.toLocaleDateString()}`;
	}
}
