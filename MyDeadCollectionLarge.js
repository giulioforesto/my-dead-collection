const https = require('https');
const jsdom = require('jsdom');
const fs = require('fs');

const {JSDOM} = jsdom;

const searchOptions = require(process.cwd()+'/searchOptions.js');
const recordResults = require('./recordResults.js');
const options = require('./connectOptions.js');

const sourceURL = "https://www.libramemoria.com/avis?";

const outputStream = fs.createWriteStream('output.csv');
outputStream.write("Prenom;Nom;Nom JF;Commune;Age;Journal;Date;Lien\r\n");

let logStream;

const MODE = searchOptions.data.mode;

if (MODE == 'pkg') {
	logStream = fs.createWriteStream('log.log');
	logStream.write("Started at " + new Date() + "\r\n");
}

const log = (strToLog, exit) => {
	console.log(strToLog);
	if (MODE == 'pkg') {
		logStream.write(strToLog + "\r\n", (err) => {
			if (err) throw err;
			if (exit) process.exit(1);
		});
	}
};

const DEFAULT_INTERVAL = searchOptions.data.defaultInterval; // ms
const MAXIMUM_INTERVAL = 100; // ms
const INTERVAL_DELTA = 5; // ms
const ERR_SAMPLE_LENGTH = 50;
const ERR_TOLERANCE = 0.2; // out of 1

let searchURL = sourceURL
	+ "&prenom=" + searchOptions.options.prenom
	+ "&nom=" + searchOptions.options.nom
	+ "&commune=" + searchOptions.options.commune;

let searchDate = new Date(searchOptions.options.debut || searchOptions.data.startDate);
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
	let dpt = searchOptions.data.departements[dptIterator];
	reqQueue["d"+dpt] = [];
	reqQueue["d"+dpt].yearSum = 0
	while (true) {
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
			searchDate = new Date(searchOptions.options.debut || searchOptions.data.startDate);
			break;
		}
		reqQueue.push({
			dpt: dpt,
			year: year,
			month: month,
			lastDayOfMonth: lastDayOfMonth,
			page: 1
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

let loopFct = () => {
	let reqOpts = reqQueue.shift();
	if (reqOpts) {
		let pageURL = searchURL
			+ "&departement=" + reqOpts.dpt
			+ "&debut=1/" + (reqOpts.month+1) + "/" + reqOpts.year
			+ "&fin=" + reqOpts.lastDayOfMonth + "/" + (reqOpts.month+1) + "/" + reqOpts.year
			+ "&page=" + reqOpts.page;
		https.get(pageURL, options, (pageRes) => {
			let pageData = '';
			pageRes.on('data', (chunk) => {
				pageData += chunk;
			});
			pageRes.on('end', () => {
				const pageDoc = (new JSDOM (pageData)).window.document;
				if (pageDoc.querySelector('p.noresults')) { // If page is empty 
					log("Completed dpt " + reqOpts.dpt + ", year " + reqOpts.year + ", month " + (reqOpts.month+1));
					if (--reqQueue["d"+reqOpts.dpt][reqOpts.year] <= 0) {
						log("Completed dpt " + reqOpts.dpt + ", year " + reqOpts.year);
						if (--reqQueue["d"+reqOpts.dpt].yearSum <= 0) {
							log("Completed dpt " + reqOpts.dpt);
						}
					}
				}
				else {
					recordResults(
						outputStream,
						logStream,
						pageDoc,
						reqOpts.dpt,
						reqOpts.year,
						reqOpts.month+1, // 1-12
						reqOpts.page
					);
					reqQueue.unshift({
						dpt: reqOpts.dpt,
						year: reqOpts.year,
						month: reqOpts.month,
						lastDayOfMonth: reqOpts.lastDayOfMonth,
						page: reqOpts.page+1
					});
				}
				errCounter.shift();
				errCounter.push(0);
			});
		}).on('error', (err) => {
			log("HTTP Error on URL: " + pageURL);
			switch (err.code) {
				case "ECONNRESET":
					if (interval > MAXIMUM_INTERVAL) {
						log("Your internet connection is probably too slow.\r\nShutting down...", true);
					}
					log("Rertrying...");
					reqQueue.unshift(reqOpts);
					errCounter.shift();
					errCounter.push(1);
					if (errCounter.reduce((sum, val) => {
						return sum += val;
					}) > ERR_TOLERANCE*ERR_SAMPLE_LENGTH) {
						clearInterval(qLoop);
						qLoop = setInterval(loopFct, interval += 5);
						log("Slowed down!");
					}
					break;
				case "ENOTFOUND":
					log(err.message);
					log("You may not have an internet connection.\r\nShutting down...", true);
					break;
				default:
					log(err);
			}
		});
	}
}

qLoop = setInterval(loopFct,interval);