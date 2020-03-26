/*
	Critères de recherche.
	Ce fichier est nécessaire à l'exécution du programme et doit être dans le même dossier que l'exécutable.
	Ne pas modifier la structure.
	Renseigner les champs "options" comme sur le formulaire de recherche de libramemoria.com/avis, en modifiant uniquement le texte entre guillements (").
	Si un champ n'est pas renseigné, la valeur doit être : "".
	Ne pas modifier les champs "data".
	
	Format prenom : "Commence par". Ex. : "N" va trouver tous les prénoms débutant par N.
	Format nom : "Commence par" sur Nom et Nom de jeune fille. Ex. : "N" va trouver tous les noms et noms de jeune fille débutant par N.
	Format date : "MM/JJ/AAAA" (format anglais).
	Format departement : "X" où X est le code du département à 2 ou 3 chiffres (pour les départements à 1 chiffre, précéder d'un 0).
	Format commune : "X" où X est le code INSEE à 5 chiffres. S'il est renseigné, departement est ignoré.
	Codes départements et communes disponibles ci-après.
	
	Exemple :
	
	module.exports = {
		prenom: "",
		nom: "meier",
		debut: "17/03/2020",
		fin: "",
		departement: "02",
		commune: ""
	};
*/

module.exports = {
	options: {
		prenom: "",
		nom: "",
		debut: "",
		fin: "",
		departement: "",
		commune: ""
	},
	data: {
		departements: ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","21","22","23","24","25","26","27","28","29","2A","2B","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80","81","82","83","84","85","86","87","88","89","90","91","92","93","94","95","971","972","973","974","976"],
		startDate: "1/1/2010"
	}
};

/*
	Liste des départements :
		01-Ain
		02-Aisne
		03-Allier
		04-Alpes-de-Haute-Provence
		05-Hautes-Alpes
		06-Alpes-Maritimes
		07-Ardèche
		08-Ardennes
		09-Ariège
		10-Aube
		11-Aude
		12-Aveyron
		13-Bouches-du-Rhône
		14-Calvados
		15-Cantal
		16-Charente
		17-Charente-Maritime
		18-Cher
		19-Corrèze
		21-Côte-d'Or
		22-Côtes-d'Armor
		23-Creuse
		24-Dordogne
		25-Doubs
		26-Drôme
		27-Eure
		28-Eure-et-Loir
		29-Finistère
		2A-Corse-du-Sud
		2B-Haute-Corse
		30-Gard
		31-Haute-Garonne
		32-Gers
		33-Gironde
		34-Hérault
		35-Ille-et-Vilaine
		36-Indre
		37-Indre-et-Loire
		38-Isère
		39-Jura
		40-Landes
		41-Loir-et-Cher
		42-Loire
		43-Haute-Loire
		44-Loire-Atlantique
		45-Loiret
		46-Lot
		47-Lot-et-Garonne
		48-Lozère
		49-Maine-et-Loire
		50-Manche
		51-Marne
		52-Haute-Marne
		53-Mayenne
		54-Meurthe-et-Moselle
		55-Meuse
		56-Morbihan
		57-Moselle
		58-Nièvre
		59-Nord
		60-Oise
		61-Orne
		62-Pas-de-Calais
		63-Puy-de-Dôme
		64-Pyrénées-Atlantiques
		65-Hautes-Pyrénées
		66-Pyrénées-Orientales
		67-Bas-Rhin
		68-Haut-Rhin
		69-Rhône
		70-Haute-Saône
		71-Saône-et-Loire
		72-Sarthe
		73-Savoie
		74-Haute-Savoie
		75-Paris
		76-Seine-Maritime
		77-Seine-et-Marne
		78-Yvelines
		79-Deux-Sèvres
		80-Somme
		81-Tarn
		82-Tarn-et-Garonne
		83-Var
		84-Vaucluse
		85-Vendée
		86-Vienne
		87-Haute-Vienne
		88-Vosges
		89-Yonne
		90-TerritoiredeBelfort
		91-Essonne
		92-Hauts-de-Seine
		93-Seine-Saint-Denis
		94-Val-de-Marne
		95-Val-d'Oise
		971-Guadeloupe
		972-Martinique
		973-Guyane
		974-LaRéunion
		976-Mayotte
*/