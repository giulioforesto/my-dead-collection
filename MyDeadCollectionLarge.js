const https = require('https');
const jsdom = require('jsdom');
const fs = require('fs');

const {JSDOM} = jsdom;

const searchOptions = require(process.cwd()+'/searchOptions.js');
const options = require('./connectOptions.js');
const recordResults = require('./recordResults.js');

const sourceURL = "https://www.libramemoria.com/avis?";

const outputStream = fs.createWriteStream('output.csv');
outputStream.write("Prenom;Nom;Nom JF;Commune;Age;Journal;Date;Lien\r\n");

const DEFAULT_INTERVAL = searchOptions.data.defaultInterval; // ms
const MAXIMUM_INTERVAL = 100; // ms
const INTERVAL_DELTA = 5; // ms
const ERR_SAMPLE_LENGTH = 50;
const ERR_TOLERANCE = 0.2; // out of 1
const DELAY_WITH_EMPTY_QUEUE = 4000 // ms

let searchURL = sourceURL
	+ "&prenom=" + searchOptions.options.prenom
	+ "&nom=" + searchOptions.options.nom
	+ "&commune=" + searchOptions.options.commune;

let startDate = new Date(searchOptions.options.debut || searchOptions.data.startDate);
let endDate;
if (searchOptions.options.fin) {
	endDate = new Date(searchOptions.options.fin);
	let today = new Date();
	if (endDate > today) {endDate = today;}
} else {
	endDate = new Date();
}

let reqQueue = [];

for (let dptIterator = 0;
	dptIterator <= (searchOptions.options.departement || searchOptions.options.commune ? 0 : searchOptions.data.departements.length-1);
	dptIterator++) {
	let dpt = searchOptions.options.departement || searchOptions.data.departements[dptIterator];
	reqQueue["d"+dpt] = [];
	reqQueue["d"+dpt].yearSum = 0
	let searchDate = new Date(startDate);
	let loop = true;
	while (loop) {
		let firstDayOfMonth = searchDate.getDate(); // In case it is not 1 for the first month
		let month = searchDate.getMonth(); // 0-11
		let year = searchDate.getFullYear();
		
		// Get the last day of the month
		searchDate.setMonth(month+1);
		searchDate.setDate(0);
		let lastDayOfMonth;
		if (searchDate < endDate) {
			lastDayOfMonth = searchDate.getDate();
			//Increment the date iterator
			searchDate.setDate(1);
			searchDate.setMonth(month+1);
		} else {
			lastDayOfMonth = endDate.getDate();
			loop = false;
		}
		reqQueue.push({
			dpt: dpt,
			year: year,
			month: month,
			firstDayOfMonth: firstDayOfMonth,
			lastDayOfMonth: lastDayOfMonth,
			page: 1,
			name: ""
		});
		if (!reqQueue["d"+dpt][year]) {
			reqQueue["d"+dpt][year] = 1;
			reqQueue["d"+dpt].yearSum++
		} else {
			reqQueue["d"+dpt][year]++
		}
	}
}

let interval = DEFAULT_INTERVAL;
let errCounter = [];
for (let i = 0; i < ERR_SAMPLE_LENGTH; i++) {
	errCounter[i] = 0;
}
let qLoop;

let terminate = false;
let delayCounter = 0;
reqQueue.counter = 0;

let loopFct = () => {
	let reqOpts = reqQueue.shift();
	if (reqOpts) {
		delayCounter = 0;
		let pageURL = searchURL
			+ "&departement=" + reqOpts.dpt
			+ "&debut=" + reqOpts.firstDayOfMonth + "/" + (reqOpts.month+1) + "/" + reqOpts.year
			+ "&fin=" + reqOpts.lastDayOfMonth + "/" + (reqOpts.month+1) + "/" + reqOpts.year
			+ "&page=" + reqOpts.page;
		reqQueue.counter++;
		https.get(pageURL, options, (pageRes) => {
			let pageData = '';
			pageRes.on('data', (chunk) => {
				pageData += chunk;
			});
			pageRes.on('end', () => {
				const pageDoc = (new JSDOM (pageData)).window.document;
				if (pageDoc.querySelector('p.noresults')) { // If page is empty
					reqQueue.counter--;
					console.log("Completed dpt " + reqOpts.dpt + ", year " + reqOpts.year + ", month " + (reqOpts.month+1));
					if (--reqQueue["d"+reqOpts.dpt][reqOpts.year] <= 0) {
						console.log("Completed dpt " + reqOpts.dpt + ", year " + reqOpts.year);
						if (--reqQueue["d"+reqOpts.dpt].yearSum <= 0) {
							console.log("Completed dpt " + reqOpts.dpt);
						}
					}
				}
				else {
					recordResults(
						outputStream,
						pageDoc,
						reqOpts,
						reqQueue
					);
				}
				errCounter.shift();
				errCounter.push(0);
			});
		}).on('error', (err) => {
			reqQueue.counter--;
			switch (err.code) {
				case "ECONNRESET":
					if (interval > MAXIMUM_INTERVAL) {
						console.error("HTTP Error on URL: " + pageURL);
						console.error("Your internet connection is probably too slow.\r\nShutting down...");
						process.exit(1);
					}
					console.log("HTTP Error on URL: " + pageURL);
					console.log("Rertrying...");
					reqQueue.unshift(reqOpts);
					errCounter.shift();
					errCounter.push(1);
					if (errCounter.reduce((sum, val) => {
						return sum += val;
					}) > ERR_TOLERANCE*ERR_SAMPLE_LENGTH) {
						clearInterval(qLoop);
						qLoop = setInterval(loopFct, interval += 5);
						console.log("Slowed down!");
					}
					break;
				case "ENOTFOUND":
					console.error("HTTP Error on URL: " + pageURL);
					console.error(err.message);
					console.error("You may not have an internet connection.\r\nShutting down...");
					process.exit(1);
					break;
				default:
					console.log(err);
					console.error(err);
			}
		});
	} else {
		delayCounter++;
		if (delayCounter*interval > DELAY_WITH_EMPTY_QUEUE && reqQueue.counter <= 0) {
			clearInterval(qLoop);
		}
	}
}

qLoop = setInterval(loopFct, interval);