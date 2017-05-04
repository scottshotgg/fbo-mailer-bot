// make event loop - check
// define mapping of the event functions
// make event functions
// make determinators

// NightmareJS for the spider construction
var Nightmare = require('nightmare');       
//var nightmare = Nightmare({ show: true });

// Event loop extension
const EventEmitter = require('events');




// Small client class
class Client {
  constructor(name, email, searchCriteriaObj) {
    this.Name = name;
    this.Email = email;
    this.SearchCriteria = searchCriteriaObj;
    // this should probably reference a root dir 
    (name == '') ? (this.Path = '') : (this.Path = 'clients/' + name + '/');
  }
}


var attributeList = ['Title', 'BAA', 'Classification', 'Agency', 'Office', 'Location', 'Type', 'Date', 'Link', 'File'];


class EventLoop extends EventEmitter {}
const mainEventLoop = new EventLoop();

const databaseEventLoop = new EventLoop();

const clientEventLoop = new EventLoop();






databaseEventLoop.on('create', (data) => {
  console.log('create', data);
});

databaseEventLoop.on('success', (data) => {
  console.log('create', data);
});


clientEventLoop.on('success', (data) => {
  console.log('create', data);
});








// Event loop functions mapping
eventLoopFunctions = {

  'database':  (packet) => {
    databaseEventLoop.emit(packet.type, packet.data);
  },

  'client': (client) => {
    console.log('client', client);
    mainEventLoop.emit('nightmare', client);
  },

  'nightmare' : (client) => {
    console.log('nightmare launched for:', client.Name);
    var nn = new Nightmare({show: true})
      .goto('http://www.google.com/')
      .wait('#gs_taif0')
      .evaluate((client) => {
        document.getElementById('gs_taif0').value = client.Name;
      }, client)
      .wait(2000)

    .goto('https://www.fbo.gov/index?s=opportunity&tab=search&mode=list')
    .evaluate(function(client) {
      parentElements = Object.assign(...[].slice.call(document.getElementsByClassName('input-checkbox')).map(element => {
        return {[element.labels[0].innerText]: element};
      }));
      Object.values(client.SearchCriteria).forEach(function(attrValues) {
        attrValues.forEach(function(attr) {
          parentElements[attr].checked = true;
        });
      });

      document.getElementsByName('dnf_opt_submit')[1].click();
    }, client)
    .wait('.list')
    .evaluate(function(attributeList) {
      return Array.prototype.slice.call(document.getElementsByClassName('lst-rw')).map(
        function(row) {
          return Object.assign(...(row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href).map(
            function(item, index) {
              return {[attributeList[index]]: item};
            }
          )));
          //return row.innerText.split(/[\n\t]/).concat(row.cells[0].firstElementChild.href);
        }
      )
    }, attributeList)
    .end()
    .then(function(data) {
      //mongoDBEmitter.emit('insert', data.reverse(), client);
      console.log(data);
    })


      //.end()
    .catch() 
  },

  'notdatabase':  () => {
    console.log('bye');
  }

};

// Function to seperate function loading from main
function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, eventLoopFunctions[item]);
  });
}

clients = ['scott', 'jensen'];
emails = ['scg104020@utdallas.edu', 'anotheremail@anotherdomain.com'];

var searchCriterias = [
{
  'Classification Code': ['A -- Research & Development'],
  'Opportunity/Procurement Type': ['Combined Synopsis/Solicitation', 'Presolicitation'],
  'NAICS Code': ['541712 -- Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)']
}
];

// Make the clientMap using the stuff from the DB
var clientMap = clients.map(function(client, index) {
  // searchCriteriaObject needs to be associated per person
  return new Client(client, emails[index], searchCriterias[0]);
});

// Main start
loadEventLoopFunction();

//mainEventLoop.emit('database', {type: 'create', data: 'fbodata'});
clientMap.map((client, index) => {
  mainEventLoop.emit('client', client);
});

