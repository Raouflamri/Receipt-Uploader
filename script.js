// 👇 Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://mywotdmfnuewctbanedi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d290ZG1mbnVld2N0YmFuZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjA5ODIsImV4cCI6MjA2MzU5Njk4Mn0.81yT4CRzXsHvqFh7g_DE3dsXcqRAN-gzai5KEStXPvk';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("receiptForm");
const tableBody = document.querySelector("#receiptTable tbody");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("receiptFile").files[0];
  const category = document.getElementById("category").value;
  const date = document.getElementById("receiptDate").value;
  const notes = document.getElementById("notes").value;

  if (!file) return;

  await uploadAndSaveReceipt(file, category, date, notes);
  form.reset();
});

// Upload file to Supabase Storage and save metadata
async function uploadAndSaveReceipt(file, category, date, notes) {
  try {
    const filePath = `${Date.now()}_${file.name}`;

    // Upload to Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from("receipts")
      .upload(filePath, file);

    if (storageError) throw storageError;

    const { data: publicUrlData } = supabase
      .storage
      .from("receipts")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Save metadata to Database
    const { data: insertData, error: insertError } = await supabase
      .from("receipts")
      .insert([
        { filename: file.name, category, date, notes, file_url: fileUrl }
      ]);

    if (insertError) throw insertError;

    addToTable({ filename: file.name, category, date, notes, dataUrl: fileUrl });

  } catch (err) {
    console.error("Upload failed:", err.message);
    alert("Upload failed: " + err.message);
  }
}

// Load receipts from Supabase
async function loadReceipts() {
  const { data: receipts, error } = await supabase
    .from("receipts")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Load error:", error.message);
    return;
  }

  receipts.forEach(r => {
    addToTable({
      filename: r.filename,
      category: r.category,
      date: r.date,
      notes: r.notes,
      dataUrl: r.file_url
    });
  });
}

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

function filterReceipts() {
  const search = searchInput.value.toLowerCase();
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
}

function exportReceipts() {
  const rows = [...tableBody.querySelectorAll("tr")].map(row => {
    const cells = row.querySelectorAll("td");
    return {
      file: cells[0].innerText,
      category: cells[1].innerText,
      date: cells[2].innerText,
      notes: cells[3].innerText
    };
  });

  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "receipts.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Bind UI events
searchInput.addEventListener("input", filterReceipts);
exportBtn.addEventListener("click", exportReceipts);

// Load receipts at startup
loadReceipts();
