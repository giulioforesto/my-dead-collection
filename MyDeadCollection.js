const https = require('https');
const jsdom = require('jsdom');
const fs = require('fs');

const {JSDOM} = jsdom;

const searchOptions = require(process.cwd()+'/searchOptions.js');
const recordResults = require(process.cwd()+'/recordResults.js');
const options = require(process.cwd()+'/connectOptions.js');

const sourceURL = "https://www.libramemoria.com/avis?";

const outputStream = fs.createWriteStream('output.csv');
outputStream.write("Prenom;Nom;Nom JF;Commune;Age;Journal;Date;Lien\r\n");

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


let dptIterator = 0;
let dptLoop = setInterval( () => {
	let dpt = searchOptions.options.departement || searchOptions.data.departements[dptIterator];
	if (searchOptions.options.departement || searchOptions.options.commune || dptIterator == searchOptions.data.departements.length-1) {
		clearInterval(dptLoop);
		dptLoop = false;
	} else {
		dptIterator++
	}
	let dateLoop = setInterval ( () => { // Interval is set in order not to send all the HTTP requests at the same time
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
			clearInterval(dateLoop);
			dateLoop = false;
		}
					
		let dateURL = searchURL
			+ "&departement=" + dpt
			+ "&debut=1/" + (month+1) + "/" + year
			+ "&fin=" + lastDayOfMonth + "/" + (month+1) + "/" + year;
			
		let page = 0; // Page iterator
		let pageLoop = setInterval ( () => { // For each page
			page++;
			let localPage = page;
			let pageURL = dateURL + "&page=" + localPage;
			let cb = (pageRes) => {
				let pageData = '';
				pageRes.on('data', (chunk) => {
					pageData += chunk;
				});
				pageRes.on('end', () => {
					const pageDoc = (new JSDOM (pageData)).window.document;
					if (pageDoc.querySelector('p.noresults')) { // If page is empty stop setInterval
						if (page < 1000) {
							page = 1000; // Raise the signal for log
							console.log("Completed dpt " + dpt + ", year " + year + ", month " + (month+1));
							if (!dateLoop) {
								console.log("Completed dpt " + dpt);
							}
							if (!dptLoop) {
								console.log("Completed")
							}
						}
						clearInterval(pageLoop);
					}
					else { recordResults(
						outputStream,
						pageDoc,
						dpt,
						year,
						month+1,
						localPage); }
				});
			};
			let onError = (err) => {
				console.log("HTTP Error on URL: " + pageURL);
				if (err.code == "ECONNRESET") {
					console.log("Rertrying...");
					https.get(pageURL, options, cb).on("error", onError);
				} else {
					console.log(err);
				}
			};
			https.get(pageURL, options, cb).on("error", onError);
		}, 50);
	}, 1000);
}, 20000);