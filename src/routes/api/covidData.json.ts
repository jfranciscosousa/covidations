import { format, parse, sub, isValid } from "date-fns";
import fetch from "node-fetch";
import type { Request, Response } from "@sveltejs/kit";

async function getLatestAvailableDate(){
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
	const currentRes = await fetch(
		`https://covid19-api.vost.pt/Requests/get_entry/${formatDateToApi(currentDate)}`
	);
	const prevRes = await fetch(
		`https://covid19-api.vost.pt/Requests/get_entry/${formatDateToApi(previousDate)}`
	);

	if (!currentRes.ok || !prevRes.ok) throw "API Error";

	const prevData = await prevRes.json();
	const currData = await currentRes.json();

	return { prevData, currData };
}

export async function get({ query }: Request): Promise<Response> {
	const latestDate = await getLatestAvailableDate();
	const currentDate = getCurrentDate(query.get("date"), latestDate);
	const previousDate = getPreviousDate(currentDate);
	const data = await getData(previousDate, currentDate);

	return {
		body: { ...data, previousDate, currentDate, latestDate },
		headers: {
			"cache-control": "public, max-age=3600"
		}
	};
}
