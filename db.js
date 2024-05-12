const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

const request = indexedDB.open("SplitDB", 1);

request.onerror = function (event) {
  console.log("Error opening database");
  console.log(event);
}

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Database opened successfully");
}

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  const store = db.createObjectStore("bills", { keyPath: "name" });
  store.createIndex("name", "name", { unique: true });
  store.createIndex("amount", "amount", { unique: false });
  store.createIndex("participants", "participants", { unique: false });
  store.createIndex("transactions", "transactions", { unique: false });
  store.createIndex("current", "current", { unique: false });

  const tokens = db.createObjectStore("tokens", { keyPath: "id" });
  tokens.createIndex("id", "id", { unique: true });
  tokens.createIndex("token", "token", { unique: false });

}

request.onsuccess = function () {
  const db = request.result;
  const tx = db.transaction("bills", "readwrite");


  tx.oncomplete = function () {
    db.close();
  }
}

window.obtenerBills = function obtenerBills(callback) {
  const request = indexedDB.open("SplitDB", 1);

  request.onerror = function(event) {
    console.log("Error opening database", event);
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("bills", "readonly");
    const store = tx.objectStore("bills");
    const getAllRequest = store.getAll();

    getAllRequest.onerror = function(event) {
      console.log("Error getting bills", event);
    };

    getAllRequest.onsuccess = function(event) {
      let bills = event.target.result;
      callback(bills);
    };
  };
};

window.guardarBill = function guardarBill(bill, callback) {
  const request = indexedDB.open("SplitDB", 1);

  request.onerror = function(event) {
    console.log("Error opening database", event);
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("bills", "readwrite");
    const store = tx.objectStore("bills");

    store.put(bill);

    tx.oncomplete = function() {
      db.close();
      callback();
    };
  };
};

window.agregarBill = function agregarBill(bill, callback) {
  const request = indexedDB.open("SplitDB", 1);

  request.onerror = function(event) {
    console.log("Error opening database", event);
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("bills", "readwrite");
    const store = tx.objectStore("bills");

    store.add(bill);

    tx.oncomplete = function() {
      db.close();
      callback();
    };
  };
}

window.agregarParticipante = function agregarParticipante(bill, participant, callback){
  const request = indexedDB.open("SplitDB", 1);

  request.onerror = function(event) {
    console.log("Error opening database", event);
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("bills", "readwrite");
    const store = tx.objectStore("bills");

    const getBillRequest = store.get(bill.name);

    getBillRequest.onerror = function(event) {
      console.log("Error getting bill", event);
    };

    getBillRequest.onsuccess = function(event) {
      let bill = event.target.result;
      bill.participants.push(participant);
      store.put(bill);

      tx.oncomplete = function() {
        db.close();
        callback();
      };
    };
  }
}

window.agregarTransaccion = function agregarTransaccion(bill, transaction, callback){
  const request = indexedDB.open("SplitDB", 1);

  request.onerror = function(event) {
    console.log("Error opening database", event);
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("bills", "readwrite");
    const store = tx.objectStore("bills");

    const getBillRequest = store.get(bill.name);

    getBillRequest.onerror = function(event) {
      console.log("Error getting bill", event);
    };

    getBillRequest.onsuccess = function(event) {
      let bill = event.target.result;
      bill.transactions.push(transaction);
      store.put(bill);

      tx.oncomplete = function() {
        db.close();
        callback();
      };
    };
  }
}

window.obtenerToken = function obtenerToken(callback){
  const request = indexedDB.open("SplitDB", 1);

  request.onerror = function(event) {
    console.log("Error opening database", event);
  };

  request.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("tokens", "readonly");
    const store = tx.objectStore("tokens");

    const getTokenRequest = store.get("userToken");

    getTokenRequest.onerror = function(event) {
      console.log("Error getting token", event);
    };

    getTokenRequest.onsuccess = function(event) {
      let token = event.target.result;
      callback(token);
      db.close();
    };
  };
}
