const https = require('https');
const jsdom = require('jsdom');
const fs = require('fs');

const {JSDOM} = jsdom;

var searchOptions = require(process.cwd()+'/searchOptions.js');

var sourceURL = "https://www.libramemoria.com/avis?";

for (let key in searchOptions) {
	sourceURL += key + "=" + searchOptions[key] + "&";
}

var options = {
	headers: {
		Host: "www.libramemoria.com",
		Connection: 'keep-alive',
		'Cache-Control': "max-age=0",
		'Upgrade-Insecure-Requests': 1,
		DNT: 1,
		'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
		'Sec-Fetch-Dest': "document",
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		'Sec-Fetch-Site': "cross-site",
		'Sec-Fetch-Mode': "navigate",
		'Sec-Fetch-User': "?1",
		'Accept-Language': "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,it;q=0.6,pt;q=0.5"
	}
}

var recordResults = function (doc, page) {
	let output = "";
	doc.querySelectorAll('div.tableau_liste').forEach( (table) => {
		let date = table.querySelector('div.titre').textContent.replace(/[^1-9\/]*/, "");
		table.querySelectorAll('div[class=ligne]').forEach( (line) => {
			try {
				let result = [];
				let nomCellArray = line.querySelector('div.nom').textContent
					.replace(/\t/g, "")
					.replace(/\n[^a-z]*\n/gi, "\n")
					.replace(/ *\n */g, "\n")
					.replace(/\n+$/g, "")
					.replace(/^\n+/, "")
					.replace(/ *\(.*/g, "")
					.split("\n");
				
				result[0] = nomCellArray[0];
				result[1] = nomCellArray[1];
				result[2] = nomCellArray[2] ? nomCellArray[2].replace(/née /,"") : "";
				result[3] = "";
				line.querySelectorAll('div.ville > a').forEach( (commune) => {
					result[3] += (result[3] ? "," : "") + commune.textContent;
				});
				result[4] = line.querySelector('div.age').textContent.replace(/[\t ]+$/, "").replace(/^[\t ]+/, "");
				result[5] = line.querySelector('div.titre_journal').textContent.replace(/[\t ]+$/, "").replace(/^[\t ]+/, "");
				result[6] = date;
				result[7] = line.querySelector('a').href;
				
				output += result.join(";") + "\r\n";
			}
			catch (err) {
				console.log(err);
				console.log(line.outerHTML);
			}
		});
	});

	outputStream.write(output, (err) => {
		if (err) throw err;
		else console.log("Completed page " + page);
	});
}

var outputStream = fs.createWriteStream('output.csv');
outputStream.write("Prenom;Nom;Nom JF;Commune;Age;Journal;Date;Lien\r\n");
		
let k = 0; // Page iterator
let loop = setInterval ( () => { // For each page. Interval is set in order not to send all the HTTP requests at the same time.
	k++;
	let i = k;
	let pageURL = sourceURL + "&page=" + i;
	https.get(pageURL, options, (pageRes) => {
		let pageData = '';
		pageRes.on('data', (chunk) => {
			pageData += chunk;
		});
		pageRes.on('end', () => {
			const pageDoc = (new JSDOM (pageData)).window.document;
			if (pageDoc.querySelector('p.noresults')) { // If page is empty raises the signal (k=0) to stop setInterval
				if (k != 0) {console.log("Last page reached");}
				k=0;
				clearInterval(loop);
			}
			else { recordResults(pageDoc, i); }
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}, 100);