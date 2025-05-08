//
// // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
// var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
//
// // Open (or create) the database
// var open = indexedDB.open("MyDatabase", 1);
//
// // Create the schema
// open.onupgradeneeded = function() {
//   var db = open.result;
//   var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
//   var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
// };
//
// open.onsuccess = function() {
//   // Start a new transaction
//   var db = open.result;
//   var tx = db.transaction("MyObjectStore", "readwrite");
//   var store = tx.objectStore("MyObjectStore");
//   var index = store.index("NameIndex");
//
//   // Add some data
//   store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
//   store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
//
//   // Query the data
//   var getJohn = store.get(12345);
//   var getBob = index.get(["Smith", "Bob"]);
//
//   getJohn.onsuccess = function() {
//     console.log(getJohn.result.name.first);  // => "John"
//   };
//
//   getBob.onsuccess = function() {
//     console.log(getBob.result.name.first);   // => "Bob"
//   };
//
//   // Close the db when the transaction is done
//   tx.oncomplete = function() {
//     db.close();
//   };
// }

let indexedDB = self.indexedDB
let openDBRequest = indexedDB.open('shrek', 1)
let db: IDBDatabase = null

openDBRequest.onsuccess = function () {
  db = openDBRequest.result
}

openDBRequest.onupgradeneeded = function () {
  let db = openDBRequest.result
  let store = db.createObjectStore('ObjectStore', { keyPath: 'id' })
  store.createIndex('NameIndex', ['name.first'])
}

export function add(data) {
  let tx = db!.transaction('SomeObject', 'readwrite')
  let store = tx.objectStore('SomeObject')
  store.put(data)
}
