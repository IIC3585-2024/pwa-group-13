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

  var bills = []
  window.obtenerBills(function (billsDB) {
    // console.log("bills desde IndexDB");
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
    const inputName = document.getElementById("inputName");
    const name = inputName.value;
    const newParticipant = document.createElement("div");
    newParticipant.className = "participant";
    newParticipant.innerHTML = `
          <p>${name}</p>
          <button type="button" class="delete">X</button>
      `;
    inputName.value = "";
    participantsContainer.appendChild(newParticipant);
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

  function pay(amount, bill, reason) {
    bill.participants[0].paid += amount;
    bill.participants.map(p => {
      if (p.name !== bill.participants[0].name) {
        p.debt += Math.ceil(amount / (bill.participants.length - 1));
        const newTransaction = {
          from: p.name,
          to: bill.participants[0].name,
          amount: Math.ceil(amount / (bill.participants.length - 1)),
          reason: reason
        };
        bill.transactions.push(newTransaction);
      }
    }
    );
    bill.amount += amount;
    calculateBalance(bill);
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
    renderBills();
    renderNewPayment();
  });

  eventForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (eventForm.eventName.value === "") {
      alert("Ingresa un nombre válido");
      // console.log("Ingresa un nombre válido");
      return;
    }
    const participants = document.querySelectorAll(".participant p");
    if (participants.length < 2) {
      alert("Ingresa al menos dos participantes");
      // console.log("Ingresa al menos dos participantes");
      return;
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
        name: participant.textContent,
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
    renderNewPayment();
  });

  function renderBills() {

    // console.log(bills);
    eventForm.reset();
    participantsContainer.innerHTML = ""

    document.getElementById("primaryContainer").innerHTML = `
    <div class="billsContainer" id="billsContainer">
          <h2>Bills</h2>
          <div id="bills">
          </div>
          <button class="goBack" onClick="reloadHomePage()">Volver</button>
          <button class="newPayment" id="newPayment">
          +
          </button>
    </div>`;
    const billsContainer = document.getElementById("bills");
    billsContainer.innerHTML = "";

    // console.log("selectedBill", selectedBill);
    const selectBill = document.createElement("select");
    selectBill.value = selectedBill;
    selectBill.innerHTML = `
          <option value="">Select bill</option>
          ${bills.map((bill, index) => `<option value="${index}" ${index == selectedBill ? 'selected' : ''}>${bill.name}</option>`).join("")}
      `;
    // console.log("selectedBill", selectedBill);

    billsContainer.appendChild(selectBill);

    selectBill.addEventListener("change", function () {
      const bill = bills[selectBill.value];
      bills.map(bill => {
        if (bill !== bills[selectBill.value]) {
          bill.current = false;
        }
        else {
          bill.current = true;
        }
      });
      selectedBill = selectBill.value;

      const billContainer = document.getElementById("bills");

      billContainer.innerHTML = `
          <h3>${bill.name}</h3>
          <p>Amount: $${bill.amount}</p>
          <div class="balance">
            <h5>Balance</h5>
            ${bill.participants.map(participant =>
        `<div class="participantBalance">
                <div>
                  ${participant.name}
                </div>
                ${participant.balance >= 0 ? "<div class='amount-green'>" : "<div class='amount negative'>"}
                  $${participant.balance}
                </div>
              </div>
              `).join("")
        }
          </div>

          <div class="transactions">
            <h5>Transactions</h5>
            ${bill.transactions.map((transaction, index) =>
          `<div class="transaction">
        <p>${transaction.from} debe ${transaction.amount} a ${transaction.to} por ${transaction.reason}</p>
        <button class="completeTransaction" data-bill-index="${selectBill.value}" data-transaction-index="${index}">Pagar</button>
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
          renderBills();
          renderNewPayment();
        });
      });
    });
    if (selectedBill != -1) {
      selectBill.dispatchEvent(new Event('change'));
    }
  }

  function renderNewPayment() {

    const newPaymentButton = document.getElementById("newPayment");

    newPaymentButton.addEventListener("click", function () {
      document.getElementById("primaryContainer").innerHTML = `
    <div class="billsContainer" id="newPaymentContainer">
          <h2>Nuevo Pago</h2>
          <p>Pagado por: ${bills[selectedBill].participants[0].name}</p>
          <input type="text" placeholder="Cantidad" id="amount">
          <input type="text" placeholder="Motivo" id="reason">
          <button type="submit">Confirmar Pago</button>
    </div>`;

      const amountInput = document.getElementById("amount");
      const confirmPaymentButton = document.querySelector("#newPaymentContainer button");
      const reasonInput = document.getElementById("reason");
      confirmPaymentButton.addEventListener("click", function () {
        bills[selectedBill] = pay(parseInt(amountInput.value), bills[selectedBill], reasonInput.value);
        // console.log('Acaaa')
        renderBills();
        renderNewPayment();
      });
    }
    );
  }

});
