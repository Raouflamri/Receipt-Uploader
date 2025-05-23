const form = document.getElementById("receiptForm");
const tableBody = document.querySelector("#receiptTable tbody");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("receiptFile");
  const file = fileInput.files[0];
  const category = document.getElementById("category").value;
  const date = document.getElementById("receiptDate").value;
  const notes = document.getElementById("notes").value;

  if (!file) {
    alert("Please select a file");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const receipt = {
      filename: file.name,
      dataUrl: reader.result,
      category,
      date,
      notes
    };

    let receipts = JSON.parse(localStorage.getItem("receipts") || "[]");
    receipts.push(receipt);
    localStorage.setItem("receipts", JSON.stringify(receipts));

    addToTable(receipt);
    form.reset();
  };

  reader.readAsDataURL(file);
});

function addToTable(receipt) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><a href="${receipt.dataUrl}" target="_blank">${receipt.filename}</a></td>
    <td>${receipt.category}</td>
    <td>${receipt.date}</td>
    <td>${receipt.notes}</td>
  `;
  tableBody.appendChild(row);
}

function loadReceipts() {
  const receipts = JSON.parse(localStorage.getItem("receipts") || "[]");
  receipts.forEach(addToTable);
}

loadReceipts();
