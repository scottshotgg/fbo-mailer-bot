var fs = require('fs');
var cheerio = require('cheerio');

//var thing = fs.readFileSync('FBOFeed20170514', 'utf8');

var thing = `<PRESOL>
<DATE>0514
<YEAR>17
<AGENCY>Department of Agriculture
<OFFICE>Forest Service
<LOCATION>R-4 SW Idaho/Nevada Acquisition Center
<ZIP>83709
<CLASSCOD>Y
<NAICS>237990
<OFFADD>1249 S. Vinnell Way, SUITE 200 Boise ID 83709
<SUBJECT>Redfish Lake Road Phase 2 Project 2017 - Amended
<SOLNBR>AG-0261-S-17-0091
<ARCHDATE>11012017
<CONTACT>KAREN L. MORTHLAND, Phone 2083734115, Email KMORTHLAND@FS.FED.US - BRAIDY RICHINS, ENGINEER, Email BKRICHINS@FS.FED.US
<DESC><p style="text-align: center;"><br /><strong>Redfish Lake Road Phase 2 Project 2017 - Amended<br />AG-0261-S-17-0091</strong></p>
<p style="text-align: center;"><br /><strong>IN APPROXIMATELY 15 DAY'S, THE SOLICITATION FOR THIS CONSTRUCTION PROJECT WILL BE AVAILABLE TO VIEW AND PRINT</strong></p>
<p><br />The intent of the contract is to provide for the complete construction of the project described in the contract. Unless otherwise provided, the Contractor shall furnish all labor, materials, equipment, tools, transportation, and supplies and perform all work required to complete the project in accordance with drawings, specifications, and provisions of the contract.</p>
<p>This project proposes to construct a new roadway that connects the recreation facilities located along the southeast side of Redfish Lake to the main access road into the Redfish Lake Recreation Complex (Forest Road 70214). Construction will consist of approximately one (1) mile of new asphalt roadway including but not limited to construction survey and staking, grubbing and minor clearing, extensive earthwork including excavation &amp; embankment, rock/boulder removal, potential rock crushing, installation of drainage facilities consisting of culverts and roadside ditches, signing, striping, and construction of other miscellaneous improvements as required. This project also consists of decommissioning an existing asphalt roadway including re-contouring to render the roadway in its preconstruction condition; constructing a new asphalt Outlet Day Use parking lot including but not limited to ingress/egress roadways, clearing and grubbing, excavation and embankment, signing, striping, furnishing/installing new precast colored concrete wheel stops, drainage improvements, and removal of the existing asphalt parking lot; constructing an asphalt trail that will connect the Outlet Day Use area to an existing bridge that crosses Redfish Lake Creek along with provide a future trail connection to the entire Redfish Lake Recreational Complex, and repairing the existing asphalt roadway at the Visitor Center road approach. Depending upon available funding, some of the above referenced project elements may be eliminated or be broken out into separate Option Work Items.</p>
<p><strong>LOCATION AND DESCRIPTION</strong><br /><br />From Stanley, Idaho proceed south approximately four (4) miles on Idaho State Highway #75 to the junction with Forest Road 70214. Turn right onto Forest Road 70214 and proceed approximately 1.20 miles to the roundabout intersection that represents the point of beginning of the new road; from there proceed approximately 1.50 miles along the existing Forest Road 70214 in the vicinity of the Outlet Campground to the point of ending of the new road segment.</p>
<p style="text-align: center;"><strong>A prebid project site visit will be scheduled and noted in the upcoming solicitation</strong><br /><br /><strong>Contact Braidy Richins bkrichins@fs.fed.us For More Information.<br /></strong><br />Estimated Price Range - Between $1,000,000 to $5,000,000</p>
<p><strong>The anticipated Project Start Date is August 15, 2017.</strong></p>
<p><strong>The Project End Dates will be September 21, 2018</strong></p>
<p>NAICS Code: 237990 Size Standard: $36.5 <br /><br />This proposed procurement is a TOTAL SMALL BUSINESS set aside.</p>
<p>&nbsp;</p>
<LINK>
<URL>https://www.fbo.gov/spg/USDA/FS/261/AG-0261-S-17-0091/listing.html
<DESC>Link To Document
<SETASIDE>Total Small Business
<POPCOUNTRY>US
<POPADDRESS>
STANLEY, ID
</PRESOL>`


console.log('\n\n\n---------------------------------------\n\n\n');

//console.log(thing.split('<'));


//console.log(thing.match(/(<[A-Z]+>[A-Z]*[a-z]*[0-9]*[' ']*)+/g));
// thing.split(/(<[A-Z]+>.*)/g).map((item, index) => {
// 	if(item != '\n' && item != '')
// 		console.log(index, item);
// });

//console.log(thing.split(/(<[A-Z]+>.*)/g));
// var array = [];
// thing.split(/(<[A-Z]+>)/g).map((item, index) => {
// 	if(item != '' && item != '\n')
// 		array.push(item.replace('</PRESOL>', ''));
// });
// console.log(array);

// for(var i = 1; i < array.length; i+=2)
// 	console.log(array[i], array[i+1])

// var array = [];
// thing.split(/(<[A-Z]>)+/g).map((item, index) => {
// 	if(item != '' && item != '\n')
// 		array.push(item.replace('</PRESOL>', ''));
// });
// console.log(array);

var array = thing.split(/(<[A-Z]+>)/g);

var object = {};

for(var i = 3; i < array.length; i+=2)
{
	var key = array[i].trim().replace('<', '').replace('>', '');
	if(object[key] == undefined) {
		object[key] = array[i+1].trim();
	} else {
		object[key] = [object[key]].concat(array[i+1].trim())
	}
}
console.log(object);


console.log('\n\n\n');