# Change log of My Dead Collection

## Coming next
* Adding resume after failure feature.
* Feel free to make suggestions!

## vb.2
06/04/2020
* Added automatic recording after "maximum pages" warning
* Corrected a few minor bugs : department handling when specified in searchOptions, last month handling when reaching endDate, process exiting after queue is empty, first day handling if specified in searchOptions, ignoring duplicate values.

## vb.1.2
01/03/2020
* Added "maximum pages" warning to error log (in file)

## vb.1.1
30/03/2020
* [Tech] Fixed "log is undefined" bug in recordResults method.
* Run logs are in console and fatal error logs are in log.log.

## vb.1
27/03/2020
* Added unlimited search in new executable : MyDeadCollectionLarge. Old classic search, limited to 600 results (20 pages) is still available.
* Deprecated : searchOptions.js. The file has a new format, old format is deprecated and will generate an error. See new format by opening searchOptions.js. The vb.0 executable still requires the old format.

## vb.0
19/03/2020