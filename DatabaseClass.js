
class Database {
  constructor(name) {
    this.Name = name;
  }

  connect(callback) {
    var db = this;
    MongoClient.connect("mongodb://localhost:27017/" + this.Name, function(err, mdb) {
      if(!err) {
        console.log('Connected to ' + db.Name);
        db.Connection = mdb;
        console.log('mdb', db.Connection);
      } else {
        console.log(err);
      }

      if (callback) {
        callback();
      } else {
        (function(){})()
      }
    });
  }

  collection(name) {
    console.log('collection print out', this.Connection);
    //this.Collection = {[name]: this.Connection.collection('fbodata')};
    //console.log(this.Collection.fbodata);
    
    return this;
  }

  insert() {
    fbodataCollection.insert(row);
  }

}