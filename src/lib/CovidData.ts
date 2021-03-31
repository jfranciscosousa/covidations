export class CovidData {
	private prevData: Record<string, string>;
	private data: Record<string, string>;
	date: Date;

	constructor(prevData: Record<string, string>, data: Record<string, string>, date: string) {
		this.data = data;
		this.prevData = prevData;
		this.date = new Date(date);
	}

	private getValue(dataObj, key) {
		const defaultDateKey = Object.keys(dataObj.data)[0];

		return dataObj[key][defaultDateKey];
	}

	get cases(): number {
		return Number(this.getValue(this.data, 'confirmados'));
	}

	get newCases(): number {
		return (
			Number(this.getValue(this.data, 'confirmados')) -
			Number(this.getValue(this.prevData, 'confirmados'))
		);
	}

	get deaths(): number {
		return Number(this.getValue(this.data, 'obitos'));
	}

	get newDeaths(): number {
		return (
			Number(this.getValue(this.data, 'obitos')) - Number(this.getValue(this.prevData, 'obitos'))
		);
	}

	get hospitalized(): number {
		return Number(this.getValue(this.data, 'internados'));
	}

	get newHospitalized(): number {
		return (
			Number(this.getValue(this.data, 'internados')) -
			Number(this.getValue(this.prevData, 'internados'))
		);
	}

	get uci(): number {
		return Number(this.getValue(this.data, 'internados_uci'));
	}

	get newUci(): number {
		return (
			Number(this.getValue(this.data, 'internados_uci')) -
			Number(this.getValue(this.prevData, 'internados_uci'))
		);
	}
}
