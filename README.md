# My Dead Collection

## Version
Beta 2
## Description
Ce programme récupère sur le site [libramemoria.com/avis] les avis de décès en fonction des critères de recherche spécifiés par l'utilisateur.
## Utilisation
MyDeadCollectionLarge est optimisé pour les recherches retournant plus de 600 résultats (20 pages de résultats sur le site classique). Pour des recherches précises, sans spécification du département ou de la date (notamment les recherches pour un nom précis), MyDeadCollectionLarge n'est pas indiqué.
1. Ouvrir le fichier **searchOptions.js** avec un bloc-notes et renseigner les critères de recherche de la même façon que sur le formulaire de recherche de libramemoria.com/avis. Enregistrer. **Attention :** le fichier searchOptions a un format différent de la version b.0.
3. Exécuter MyDeadCollectionLarge.bat en veillant à ce que searchOptions.js et worker.exe soient dans le même dossier que l'exécutable.
4. Les résultats sont disponibles au format CSV dans **output.csv** dans le même dossier.

⚠ **Attention :** Si un fichier output.csv existe déjà, il sera écrasé par l'exécution du programme.

## Développement
### Build
```shell
pkg --targets win MyDeadCollectionLarge.js -o worker.exe
```
