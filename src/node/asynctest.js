var async = require('async');

var arr = ['1','2'];
async.map(arr, (name, callback) => {
    callback(null, name + 'new');
}, function (e, r) {
  console.log(r);
});