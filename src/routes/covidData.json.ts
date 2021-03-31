import { format, parse, sub } from 'date-fns';
import fetch from 'node-fetch';
import type { Response } from '@sveltejs/kit';

export async function get(): Promise<Response> {
	const latestDateRes = await fetch('https://covid19-api.vost.pt/Requests/get_last_update');
	const latestDate = (await latestDateRes.json()).data;
	const parsedLatestDate = parse(latestDate, 'dd-MM-yyyy', new Date());
	const previousDate = format(sub(parsedLatestDate, { days: 1 }), 'dd-MM-yyy');
	const currentRes = await fetch(`https://covid19-api.vost.pt/Requests/get_entry/${latestDate}`);
	const prevRes = await fetch(`https://covid19-api.vost.pt/Requests/get_entry/${previousDate}`);
	const prevData = await prevRes.json();
	const currData = await currentRes.json();

	return {
		body: { prevData, currData, date: parsedLatestDate },
		headers: {
			'cache-control': 'public, max-age=3600'
		}
	};
}
