module.exports = function (outputStream, doc, dpt, year, month, page) {
	let lineIterator = 0;
	doc.querySelectorAll('div.tableau_liste').forEach( (table, tIndex, tables) => {
		let date = table.querySelector('div.titre').textContent.replace(/[^1-9\/]*/, "");
		table.querySelectorAll('div[class=ligne]').forEach( (line, index, lines) => {
			try {
				var lineNumber = ++lineIterator;
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
				result[2] = nomCellArray[2] ? nomCellArray[2].replace(/née /,"") : ""; // Date de naissance
				result[3] = ""; // Ville(s)
				line.querySelectorAll('div.ville > a').forEach( (commune) => {
					result[3] += (result[3] ? "," : "") + commune.textContent;
				});
				result[4] = line.querySelector('div.age').textContent.replace(/[\t ]+$/, "").replace(/^[\t ]+/, ""); // Age
				result[5] = line.querySelector('div.titre_journal > a').textContent.replace(/[\t ]+$/, "").replace(/^[\t ]+/, ""); // Journal
				result[6] = date; // Date de publication
				result[7] = line.querySelector('a').href; // Lien
				
				outputStream.write(result.join(";") + "\r\n", (err) => {
					if (err) throw err;
					else {
						if (index == lines.length-1 && tIndex == tables.length-1) {
							console.log("Completed dpt " + dpt + ", year " + year + ", month " + month + ", page " + page);
						}
						if (page == 20 && lineNumber == 30) {
							console.log("Warning: Reached maximum results number on dpt " + dpt + ", year " + year + ", month " + month + ". You will probably need to request this combination again, week by week, starting from " + date + ".");
						}
					}
				});
			}
			catch (err) {
				console.log(err);
				console.log(line.outerHTML);
			}
		});
	});
};