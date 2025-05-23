const form = document.getElementById("receiptForm");
const tableBody = document.querySelector("#receiptTable tbody");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const file = document.getElementById("receiptFile").files[0];
  const category = document.getElementById("category").value;
  const date = document.getElementById("receiptDate").value;
  const notes = document.getElementById("notes").value;

  if (!file) return;

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

function filterReceipts() {
  const search = searchInput.value.toLowerCase();
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
}

function exportReceipts() {
  const receipts = localStorage.getItem("receipts");
  const blob = new Blob([receipts], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "receipts.json";
  a.click();

  URL.revokeObjectURL(url);
}

searchInput.addEventListener("input", filterReceipts);
exportBtn.addEventListener("click", exportReceipts);

loadReceipts();

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://mywotdmfnuewctbanedi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d290ZG1mbnVld2N0YmFuZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjA5ODIsImV4cCI6MjA2MzU5Njk4Mn0.81yT4CRzXsHvqFh7g_DE3dsXcqRAN-gzai5KEStXPvk';
const supabase = createClient(supabaseUrl, supabaseKey);
