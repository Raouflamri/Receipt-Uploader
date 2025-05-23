import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://mywotdmfnuewctbanedi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d290ZG1mbnVld2N0YmFuZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjA5ODIsImV4cCI6MjA2MzU5Njk4Mn0.81yT4CRzXsHvqFh7g_DE3dsXcqRAN-gzai5KEStXPvk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("receiptForm");
const tableBody = document.querySelector("#receiptTable tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("receiptFile");
  const file = fileInput.files[0];
  const category = document.getElementById("category").value;
  const date = document.getElementById("receiptDate").value;
  const notes = document.getElementById("notes").value;

  if (!file) return alert("Please select a file");

  const filePath = `${Date.now()}_${file.name}`;

  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from('receipts')
    .upload(filePath, file);

  if (storageError) {
    console.error(storageError);
    return alert("Upload failed");
  }

  const publicURL = supabase
    .storage
    .from('receipts')
    .getPublicUrl(filePath).data.publicUrl;

  // Insert into Supabase Table
  const { data: dbData, error: dbError } = await supabase
    .from('receipts')
    .insert([
      { filename: file.name, category, date, notes, url: publicURL }
    ]);

  if (dbError) {
    console.error(dbError);
    return alert("Database insert failed");
  }

  addToTable({ filename: file.name, category, date, notes, dataUrl: publicURL });
  form.reset();
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

async function loadReceipts() {
  const { data, error } = await supabase
    .from('receipts')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(receipt => {
    addToTable({
      filename: receipt.filename,
      category: receipt.category,
      date: receipt.date,
      notes: receipt.notes,
      dataUrl: receipt.url
    });
  });
}

loadReceipts();
