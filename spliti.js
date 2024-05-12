function reloadHomePage() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.open('static-cache').then(cache => {
      cache.match('./').then(response => {
        if (response) {
          window.location.href = './';
        } else {
          window.location.reload();
        }
      });
    });
  } else {
    window.location.reload();
  }
}


document.addEventListener("DOMContentLoaded", function () {

  // Mostrar y copiar el token para notificaciones push
  const requestPermissionButton = document.getElementById("requestPermission");
  const tokenP = document.getElementById("token");

  requestPermissionButton.addEventListener("click", function () {
    if (Notification.permission === "granted") {
      window.obtenerToken(async (token) => {
        tokenP.textContent = `Tu token es: ${token?.token}`;
        navigator.clipboard.writeText(token?.token);
      });
    } else {
      navigator.clipboard.writeText("No hay token");
      Notification.requestPermission().then(function (result) {
        console.log(result);
      });
    }
  });

  var bills = []
  window.obtenerBills(function (billsDB) {
    bills = billsDB;
  });
  var selectedBill = -1;
  bills.map(bill => {
    if (bill.current) {
      selectedBill = bills.indexOf(bill);
    }
  });

  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones de escritorio");
  } else if (Notification.permission === "granted") {
    console.log("Permiso para recibir notificaciones concedido");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (result) {
      console.log(result);
    });
  }
  // Añadir el formulario al contenedor

  // const addParticipantButton = document.getElementById("addParticipant");
  const participantsContainer = document.getElementById("participants-list");
  const eventForm = document.getElementById("formEvent");
  const addParticipantButton = document.getElementById("addParticipant");
  const enterEventButton = document.getElementById("enterEvent");

  addParticipantButton.addEventListener("click", function () {
    const newParticipant = document.createElement("div");
    newParticipant.className = "participant";
    newParticipant.innerHTML = `
      <input class="w-full px-3 mr-2 rounded-md" type="text" id="friendName" placeholder="Nombre de tu amigo" >
      <button type="button" class="delete">X</button>
      `;
    participantsContainer.appendChild(newParticipant)
    // Añadir un manejador de eventos para el botón de eliminación
    newParticipant.querySelector('.delete').addEventListener('click', function() {
      newParticipant.remove();
    });
  }
  );


  // for (let i = 0; i < participants.length; i++) {

  //   const newParticipant = document.createElement("div");
  //   newParticipant.className = "participant";
  //   newParticipant.innerHTML = `
  //         <p id="participant${i}">${participants[i].name}</p>
  //         <button type="button" class="delete">X</button>
  //     `;
  //   participantsContainer.appendChild(newParticipant);
  // }

  participantsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete")) {
      event.target.parentElement.remove();
    }
  });

  function calculateBalance(bill) {
    bill.participants.map(participant => {
      participant.balance = participant.paid - participant.debt
    }
    );
  }

  function pay(participantIndex, amount, bill) {
    console.log("Paying", amount);
    bill.participants[participantIndex].paid += amount;
    bill.participants.map(p => {
      if (p.name !== bill.participants[participantIndex].name) {
        p.debt += amount / (bill.participants.length - 1);
        // const newTransaction = {
        //   from: p.name,
        //   to: bill.participants[participantIndex].name,
        //   amount: amount / (bill.participants.length - 1),
        //   reason: reason
        // };
        // bill.transactions.push(newTransaction);
      }
    });
    calculateBalance(bill);
    const newTransaction = [];
    const participant = bill.participants.map(p => {
      return {"name": p.name, "balance": p.balance}
    });
    participant.sort((a, b) => a.balance - b.balance);
    console.log(participant)
    let i = 0;
    let j = participant.length - 1;
    while (i < j) {
      if (participant[i].balance < 0 && participant[j].balance > 0) {
        const amountToPay = Math.min(-participant[i].balance, participant[j].balance);
        participant[i].balance += amountToPay;
        participant[j].balance -= amountToPay;
        newTransaction.push({
          to: participant[j].name,
          from: participant[i].name,
          amount: amountToPay
        });
      }
      if (participant[i].balance === 0) {
        i++;
      }
      if (participant[j].balance === 0) {
        j--;
      }
    }
    bill.transactions = newTransaction;

    bill.amount += amount;
    window.guardarBill(bill, function () {
      // console.log("Bill guardado");
    }
    );
    return bill;
  }

  function eliminarBill(bill, transaction) {
    bill.transactions = bill.transactions.filter(t => t !== transaction);
    bill.participants.map(p => {
      if (p.name === transaction.from) {
        p.debt -= transaction.amount;
      }
      if (p.name === transaction.to) {
        p.paid -= transaction.amount;
      }
    }
    );
    bill.amount -= transaction.amount;
    if(Notification.permission === "granted"){
      new Notification("Transacción completada", {
        body: `${transaction.from} pagó ${transaction.amount} a ${transaction.to} por ${transaction.reason}`
      });
    }
    calculateBalance(bill);
    window.guardarBill(bill, function () {
      // console.log("Bill guardado");
    }
    );
  }

  enterEventButton.addEventListener("click", function () {
    console.log("Enter event");
    renderBills();
    renderNewPayment();
  });

  eventForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (eventForm.eventName.value === "") {
      alert("Dale un nombre al evento");
      return;
    }
    const participants = document.querySelectorAll(".participant input");

    for (let i = 0; i < participants.length; i++) {
      if (participants[i].value === "") {
        alert("No puedes dejar nombres vacíos");
        return;
      }
    }
    const newBill = {
      name: eventForm.eventName.value,
      amount: 0,
      participants: [],
      transactions: [],
      current: false
    };
    participants.forEach(participant => {
      newBill.participants.push({
        name: participant.value,
        paid: 0,
        debt: 0,
        balance: 0
      });
    });
    window.agregarBill(newBill, function () {
      // console.log("Bill guardado");
    });
    bills.push(newBill);

    renderBills();
    console.log("Creating new event")
    renderNewPayment();
  });
  function renderBillsBalance(selectedBill = null) {
    if (selectedBill === null) return;
    const bill = bills[selectedBill];
    const billContainer = document.getElementById("bills");
    billContainer.innerHTML = `
      <h3 class="font-bold text-center text-xl">${bill.name}</h3>
      <div class="balance">
        <h5>Balance</h5>
        ${bill.participants.map(participant =>
          `<div class="participantBalance">
            <div>
              ${participant.name}
            </div>
            ${participant.balance >= 0 ? "<div class='amount-green'>" : "<div class='amount negative'>"}
              $${participant.balance.toFixed(2)}
            </div>
          </div>
          `).join("")
        }
      </div>

      <div class="transactions">
        <h5 class="font-semibold text-center my-4">
          Transactions
        </h5>
        ${bill.transactions.map((transaction, index) =>
          `<div class="transaction">
            <p class="font-normal">${transaction.from} debe ${transaction.amount.toFixed(2)} a ${transaction.to}</p>
            <button class="completeTransaction bg-blue-300 rounded-md p-1" data-bill-index="${selectedBill}" data-transaction-index="${index}">Pagar</button>
          </div>
          `).join("")
        }
      </div>
      `;

      document.querySelectorAll(".completeTransaction").forEach(button => {
        button.addEventListener("click", function () {
          const billIndex = this.getAttribute("data-bill-index");
          const transactionIndex = this.getAttribute("data-transaction-index");
          eliminarBill(bills[billIndex], bills[billIndex].transactions[transactionIndex]);
          renderBillsBalance(selectedBill);
          renderNewPayment(selectedBill);
        });
      });
  }


  function renderBills(selectedBill = null) {

    eventForm.reset();
    participantsContainer.innerHTML = ""

    document.getElementById("primaryContainer").innerHTML = `
    <div class="billsContainer" id="billsContainer">
          <h1 class="text-center text-4xl">Bills</h2>
          <div id="bills">
          </div>
          <button class="goBack" id="goBack">Volver</button>
          <button class="newPayment bg-blue-300 text-center rounded-full" id="newPayment">
          +
          </button>
    </div>`;

    const goBackButton = document.getElementById("goBack");
    goBackButton.addEventListener("click", function () {
      reloadHomePage()
    });

    if (selectedBill !== null) {
      renderBillsBalance(selectedBill);
      return;
    }
    
    const billsContainer = document.getElementById("bills");
    if (bills.length === 0) {
      billsContainer.innerHTML = "<p>No hay eventos</p>";
      return;
    }
    billsContainer.innerHTML = "";

    // Create a list of bills with buttons to redirect to each bill
    const billList = document.createElement("ol");
    billList.className = "billList list-decimal";
    bills.map((bill, index) => {
      const billItem = document.createElement("li");
      billItem.className = "font-semibold text-center my-4 text-blue-500";
      billItem.innerHTML = `
          <button class="billButton" data-bill-index="${index}">${bill.name}</button>
      `;
      billList.appendChild(billItem);
    });
    billsContainer.appendChild(billList);

    // Add event listeners to each bill button

    document.querySelectorAll(".billButton").forEach(button => {
      button.addEventListener("click", function () {
        selectedBill = this.getAttribute("data-bill-index");
        renderBillsBalance(selectedBill);
        renderNewPayment(selectedBill);
      });
    });
  }

  function renderNewPayment(selectedBill) {
    console.log(bills, selectedBill)
    console.log(bills[selectedBill])
    if (selectedBill === undefined || selectedBill === null) return;
    const newPaymentButton = document.getElementById("newPayment");

    newPaymentButton.addEventListener("click", function () {
      const Select = '<select id="selectParticipant" class="py-2 w-full">' + bills[selectedBill].participants.map((participant, index) => `<option value="${index}">${participant.name}</option>`).join("") + '</select>';
      document.getElementById("primaryContainer").innerHTML = `
    <div class="billsContainer" id="newPaymentContainer">
          <h2 class="font-bold text-2xl">Nuevo Pago</h2>
          <div class="flex flex-row align-center mb-2 rounded-md">
            <p class="pr-2 my-auto">Paga</p>
            ${Select}
          </div>
          <input class="rounded-md py-2 px-1 mb-2" type="text" placeholder="Cantidad" id="amount">
          <button type="button" class="button bg-green-300 rounded-md py-2" id="confirmButton">Confirmar Pago</button>
          <button type="button" id="volver" class="text-blue-500">Volver</button>
    </div>`;

      const amountInput = document.getElementById("amount");
      const confirmPaymentButton = document.getElementById("confirmButton");
      const participantSelect = document.getElementById("selectParticipant");
      const volverButton = document.getElementById("volver");
      volverButton.addEventListener("click", function () {
        renderBills(selectedBill);
        renderNewPayment(selectedBill);
      });
      confirmPaymentButton.addEventListener("click", function () {
        const amount = parseInt(amountInput.value);
        bills[selectedBill] = pay(participantSelect.value, amount - (amount/bills[selectedBill].participants.length), bills[selectedBill]);
        // console.log('Acaaa')
        renderBills(selectedBill);
        renderNewPayment(selectedBill);
      });
    }
    );
  }

});
