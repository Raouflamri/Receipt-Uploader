// Initialize Supabase
const SUPABASE_URL = 'https://your-project-id.supabase.co'; // Replace this
const SUPABASE_KEY = 'your-anon-key'; // Replace this
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("receiptForm");
const tableBody = document.querySelector("#receiptTable tbody");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");

// Load existing receipts from Supabase
async function loadReceipts() {
  const { data, error } = await supabase.from('receipts').select('*');
  if (error) {
    console.error("Error loading receipts:", error);
    return;
  }
  data.forEach(addToTable);
}

// Upload receipt
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("receiptFile");
  const file = fileInput.files[0];
  if (!file) return;

  const category = document.getElementById("category").value;
  const date = document.getElementById("receiptDate").value;
  const notes = document.getElementById("notes").value;

  const filePath = `${Date.now()}_${file.name}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from("receipts")
    .upload(filePath, file);

  if (storageError) {
    console.error("Upload failed:", storageError);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(filePath);

  const { error: dbError } = await supabase.from('receipts').insert([
    {
      filename: file.name,
      category,
      date,
      notes,
      file_url: publicUrlData.publicUrl,
    },
  ]);

  if (dbError) {
    console.error("Error saving to DB:", dbError);
    return;
  }

  addToTable({
    filename: file.name,
    category,
    date,
    notes,
    file_url: publicUrlData.publicUrl,
  });

  form.reset();
});

// Append row to table
function addToTable(receipt) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><a href="${receipt.file_url}" target="_blank">${receipt.filename}</a></td>
    <td>${receipt.category}</td>
    <td>${receipt.date}</td>
    <td>${receipt.notes}</td>
  `;
  tableBody.appendChild(row);
}

// Search filter
function filterReceipts() {
  const search = searchInput.value.toLowerCase();
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
}

// Export (still local since Supabase doesn’t expose JSON downloads directly)
function exportReceipts() {
  const rows = tableBody.querySelectorAll("tr");
  const receipts = Array.from(rows).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      filename: cells[0].innerText,
      category: cells[1].innerText,
      date: cells[2].innerText,
      notes: cells[3].innerText,
    };
  });

  const blob = new Blob([JSON.stringify(receipts, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "receipts.json";
  a.click();

  URL.revokeObjectURL(url);
}

searchInput.addEventListener("input", filterReceipts);
exportBtn.addEventListener("click", exportReceipts);

// Load existing receipts on page load
loadReceipts();
