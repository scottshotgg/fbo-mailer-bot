function padStart(string, length, char) {
	var returnString = "";

	for(var i = 0; i < length - string.length; i++) {
		returnString += char;
	}

	return returnString += string;
}

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var date1 = "Mar 31, 2017";
var date2 = "Dec 05, 2016";
var date3 = "Jan 09, 2017";

parseInt(["Jan 09, 2017".split(' ')].map((datesplited) => datesplited[2].concat([(months.indexOf(datesplited[0]) + 1).toString()].map((monthInt) => monthInt.length > 1 ? monthInt : '0' + monthInt)).concat(datesplited[1]).replace(',', '')));


var datesplit = date1.split(' ');

console.log(parseInt([date1.split(' ')].map((datesplit) => datesplit[2].concat([(months.indexOf(datesplit[0]) + 1).toString()].map((monthInt) => monthInt.length > 1 ? monthInt : '0' + monthInt)).concat(datesplit[1].replace(',', '')))));
