module.exports = function (outputStream, doc, reqOpts, reqQueue) {
	let dpt = reqOpts.dpt;
	let year = reqOpts.year;
	let month = reqOpts.month; // 0-11
	let firstDayOfMonth = reqOpts.firstDayOfMonth;
	let lastDayOfMonth = reqOpts.lastDayOfMonth;
	let page = reqOpts.page;
	let name = reqOpts.name;
	let additional = reqOpts.additional;
	let recording = (name == "");
	let numOfLines = doc.querySelectorAll('div.tableau_liste div[class=ligne]').length;
	let precPrenom = reqOpts.precPrenom;
	let precNom = reqOpts.precNom;
	doc.querySelectorAll('div[class=tableau_liste]').forEach( (table, tIndex, tables) => {
		let date = table.querySelector('div.titre').textContent.replace(/[^0-9\/]*/g, "");
		table.querySelectorAll('div[class=ligne]').forEach( (line, index, lines) => {
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
				
				result[0] = nomCellArray[0]; // Prénom
				result[1] = nomCellArray[1]; // Nom
								
				if (recording && result[0] != precPrenom && result[1] != precNom) {
					result[2] = nomCellArray[2] ? nomCellArray[2].replace(/née /,"") : ""; // Nom de jeune fille
					result[3] = ""; // Ville(s)
					line.querySelectorAll('div.ville > a').forEach( (commune) => {
						result[3] += (result[3] ? "," : "") + commune.textContent;
					});
					result[4] = line.querySelector('div.age').textContent.replace(/[\t ]+$/, "").replace(/^[\t ]+/, ""); // Age
					result[5] = line.querySelector('div.titre_journal > a').textContent.replace(/[\t ]+$/, "").replace(/^[\t ]+/, ""); // Journal
					result[6] = date; // Date de publication
					result[7] = line.querySelector('a').href; // Lien
				
					outputStream.write(result.join(";") + "\r\n");
				}
				
				precPrenom = result[0];
				precNom = result[1];
				
				if (tIndex == tables.length-1 && index == lines.length-1) { // end of page
					reqQueue.counter--;
					console.log("Completed " + (reqOpts.additional ? "additional " : "")
						+ "dpt " + dpt
						+ ", year " + year
						+ ", month " + (month+1)
						+ ", page " + page
						+ (recording ? "" : " without new results"));
					if (reqOpts.page < 20 || numOfLines < 30) {
						reqQueue.unshift({
							dpt: dpt,
							year: year,
							month: month,
							firstDayOfMonth: firstDayOfMonth,
							lastDayOfMonth: lastDayOfMonth,
							page: page+1,
							name: recording ? "" : name,
							additional: additional,
							precPrenom: precPrenom,
							precNom: precNom
						});
					} else if (!recording) {
						let warningStr = "Warning: results for dpt " + dpt + ", day " + date + " [French format] are more than 600.\r\nYou should request these parameters again and by prenom's first letter, letter by letter, on the remaining letters.";
						console.log(warningStr);
						console.error(warningStr);
					} else {
						reqQueue.unshift({
							dpt: dpt,
							year: year,
							month: month,
							firstDayOfMonth: firstDayOfMonth,
							lastDayOfMonth: date.substr(0,2),
							page: 1,
							name: result[1]+result[0],
							additional: true
						});
					}
				}

				if (result[1]+result[0] == name) recording = true;
			}
			catch (err) {
				console.log(err);
				console.log(line.outerHTML);
			}
		});
	});
};