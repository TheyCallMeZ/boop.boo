<template>
  <div class="nelnet-converter">
    <div class="converter-card">
      <h1 class="converter-title">Nelnet to Monarch Money Converter</h1>
      <p class="converter-subtitle">
        Transform your Nelnet payment history for Monarch Money import
      </p>

      <!-- Account Mapping Section -->
      <div class="mapping-section">
        <h2 class="section-title">Step 1: Configure Account Mappings</h2>
        <p class="section-description">
          Map your Nelnet group codes to Monarch Money account names
        </p>

        <div class="mappings-grid">
          <div
            v-for="(mapping, index) in accountMappings"
            :key="index"
            class="mapping-row"
          >
            <input
              v-model="mapping.group"
              placeholder="Group (e.g., AA)"
              class="input-group"
            />
            <input
              v-model="mapping.account"
              placeholder="Monarch Account Name"
              class="input-account"
            />
            <button @click="removeMapping(index)" class="btn-remove">✕</button>
          </div>
        </div>

        <div class="mapping-actions">
          <button @click="addMapping" class="btn btn-primary">
            + Add Mapping
          </button>

          <button @click="saveToLocalStorage" class="btn btn-success">
            💾 Save Mappings
          </button>

          <button @click="exportMappings" class="btn btn-export">
            📤 Export Preset
          </button>

          <button @click="triggerImport" class="btn btn-import">
            📥 Import Preset
          </button>

          <input
            ref="importInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="importMappings"
          />
        </div>
      </div>

      <!-- Input Section -->
      <div class="input-section">
        <h2 class="section-title">Step 2: Paste Nelnet Payment Data</h2>
        <textarea
          v-model="inputData"
          @paste="handlePaste"
          placeholder="Paste your Nelnet payment history here..."
          class="data-input"
        ></textarea>
      </div>

      <!-- Process Button -->
      <div class="process-section">
        <button @click="processData" class="btn btn-process">
          🔄 Transform Data
        </button>

        <select v-model="outputFormat" class="format-select">
          <option value="csv">CSV Format</option>
          <option value="json">JSON Format</option>
        </select>
      </div>

      <!-- Output Section -->
      <div v-if="outputData" class="output-section">
        <div class="output-header">
          <h2 class="section-title">Step 3: Copy Transformed Data</h2>
          <div class="output-actions">
            <button @click="copyToClipboard" class="btn btn-copy">
              📋 Copy to Clipboard
            </button>
            <button @click="downloadFile" class="btn btn-download">
              💾 Download File
            </button>
          </div>
        </div>

        <div class="output-display">
          <pre>{{ outputData }}</pre>
        </div>
      </div>

      <!-- Summary Section -->
      <div v-if="summary" class="summary-section">
        <h3 class="summary-title">Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Payment Date:</span> {{ summary.date }}
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Payment:</span> ${{
              summary.total
            }}
          </div>
          <div class="summary-item">
            <span class="summary-label">Principal:</span> ${{
              summary.principal
            }}
          </div>
          <div class="summary-item">
            <span class="summary-label">Interest:</span> ${{ summary.interest }}
          </div>
        </div>
        <div class="summary-count">
          <span class="summary-label">Transactions Created:</span>
          {{ summary.transactionCount }}
        </div>
      </div>

      <!-- Status Messages -->
      <div
        v-if="statusMessage"
        :class="[
          'status-message',
          statusType === 'success' ? 'status-success' : 'status-error',
        ]"
      >
        {{ statusMessage }}
      </div>
    </div>

    <!-- Instructions (optional - can be toggled) -->
    <div v-if="showInstructions" class="instructions-card">
      <h2 class="instructions-title">Instructions</h2>
      <ol class="instructions-list">
        <li>
          <strong>Configure Mappings:</strong> Set up the mapping between Nelnet
          group codes (AA, AB, etc.) and your Monarch Money account names
        </li>
        <li>
          <strong>Paste Data:</strong> Copy the payment history from Nelnet and
          paste it into the input area
        </li>
        <li>
          <strong>Transform:</strong> Click Transform Data to convert to Monarch
          Money format
        </li>
        <li>
          <strong>Import:</strong> Copy the transformed data and import it into
          Monarch Money as transactions
        </li>
      </ol>

      <div class="notes-section">
        <h3 class="notes-title">📝 Notes:</h3>
        <ul class="notes-list">
          <li>
            The CSV format includes separate transactions for principal and
            interest payments
          </li>
          <li>Account mappings are saved locally in your browser</li>
          <li>Date format is MM/DD/YYYY for Monarch Money compatibility</li>
          <li>
            Negative amounts indicate money leaving your account (payments)
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NelnetMonarchConverter",

  props: {
    showInstructions: {
      type: Boolean,
      default: true,
    },
    storageKey: {
      type: String,
      default: "nelnetMappings",
    },
    defaultMappings: {
      type: Array,
      default: () => [
        { group: "AA", account: "6.800% - E******6206-AA-1" },
        { group: "AB", account: "5.600% - E******6206-AB-2" },
        { group: "AC", account: "6.800% - E******6206-AC-3" },
        { group: "AD", account: "4.500% - E******6206-AD-4" },
        { group: "AE", account: "6.800% - E******6206-AE-5" },
        { group: "AF", account: "4.500% - E******6206-AF-6" },
        { group: "AG", account: "6.800% - E******6206-AG-7" },
        { group: "AH", account: "3.400% - E******6206-AH-8" },
      ],
    },
  },

  data() {
    return {
      inputData: "",
      outputData: "",
      outputFormat: "csv",
      accountMappings: [],
      summary: null,
      statusMessage: "",
      statusType: "success",
    };
  },

  mounted() {
    this.loadMappings();
  },

  methods: {
    loadMappings() {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          this.accountMappings = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load mappings:", e);
          this.accountMappings = [...this.defaultMappings];
        }
      } else {
        this.accountMappings = [...this.defaultMappings];
      }
    },

    handlePaste() {
      setTimeout(() => {
        this.processData();
      }, 100);
    },

    addMapping() {
      this.accountMappings.push({ group: "", account: "" });
    },

    removeMapping(index) {
      this.accountMappings.splice(index, 1);
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.accountMappings)
        );
        this.showStatus("Mappings saved successfully!", "success");
        this.$emit("mappings-saved", this.accountMappings);
      } catch (e) {
        console.error("Failed to save mappings:", e);
        this.showStatus("Failed to save mappings", "error");
      }
    },

    exportMappings() {
      try {
        const dataStr = JSON.stringify(this.accountMappings, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nelnet-mappings-${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showStatus("Mappings exported successfully!", "success");
        this.$emit("mappings-exported", this.accountMappings);
      } catch (e) {
        console.error("Failed to export mappings:", e);
        this.showStatus("Failed to export mappings", "error");
      }
    },

    triggerImport() {
      this.$refs.importInput.click();
    },

    importMappings(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedMappings = JSON.parse(e.target.result);

          // Validate the imported data
          if (!Array.isArray(importedMappings)) {
            throw new Error("Invalid format: Expected an array of mappings");
          }

          // Validate each mapping has required fields
          const isValid = importedMappings.every(
            (mapping) =>
              mapping &&
              typeof mapping === "object" &&
              "group" in mapping &&
              "account" in mapping
          );

          if (!isValid) {
            throw new Error(
              "Invalid format: Each mapping must have 'group' and 'account' fields"
            );
          }

          this.accountMappings = importedMappings;
          this.showStatus(
            `Successfully imported ${importedMappings.length} mappings!`,
            "success"
          );
          this.$emit("mappings-imported", this.accountMappings);

          // Optionally auto-save to localStorage
          this.saveToLocalStorage();
        } catch (error) {
          console.error("Failed to import mappings:", error);
          this.showStatus(`Failed to import: ${error.message}`, "error");
        } finally {
          // Reset the input so the same file can be imported again
          event.target.value = "";
        }
      };

      reader.onerror = () => {
        this.showStatus("Failed to read file", "error");
        event.target.value = "";
      };

      reader.readAsText(file);
    },

    processData() {
      try {
        if (!this.inputData.trim()) {
          this.showStatus("Please paste Nelnet payment data first", "error");
          return;
        }

        const lines = this.inputData.trim().split("\n");
        let paymentDate = "";
        let paymentAmount = "";
        const transactions = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith("Payment Date:")) {
            paymentDate = line.split(":")[1].trim();
          } else if (line.startsWith("Payment Amount:")) {
            paymentAmount = line.split("$")[1].trim();
          } else if (
            line &&
            !line.startsWith("Group") &&
            !line.startsWith("Total") &&
            !line.includes("Applied to") &&
            !line.includes("Payment History") &&
            !line.startsWith("Account:")
          ) {
            const parts = line.split("\t");
            if (parts.length >= 5) {
              const group = parts[0].trim();
              const principal = parts[2].replace("$", "").trim();
              const interest = parts[3].replace("$", "").trim();

              const mapping = this.accountMappings.find(
                (m) => m.group === group
              );
              const accountName = mapping
                ? mapping.account
                : `Nelnet - ${group}`;

              if (parseFloat(principal) > 0) {
                transactions.push({
                  date: paymentDate,
                  account: accountName,
                  category: "Loan Principal",
                  description: `Nelnet ${group} - Principal Payment`,
                  amount: -parseFloat(principal),
                  type: "Principal",
                });
              }

              if (parseFloat(interest) > 0) {
                transactions.push({
                  date: paymentDate,
                  account: accountName,
                  category: "Interest",
                  description: `Nelnet ${group} - Interest Payment`,
                  amount: -parseFloat(interest),
                  type: "Interest",
                });
              }
            }
          }
        }

        if (transactions.length === 0) {
          this.showStatus(
            "No valid transactions found. Please check the input format.",
            "error"
          );
          return;
        }

        if (this.outputFormat === "csv") {
          this.outputData = this.generateCSV(transactions);
        } else {
          this.outputData = JSON.stringify(transactions, null, 2);
        }

        const totalPrincipal = transactions
          .filter((t) => t.type === "Principal")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalInterest = transactions
          .filter((t) => t.type === "Interest")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        this.summary = {
          date: paymentDate,
          total: paymentAmount,
          principal: totalPrincipal.toFixed(2),
          interest: totalInterest.toFixed(2),
          transactionCount: transactions.length,
        };

        this.showStatus("Data transformed successfully!", "success");

        this.$emit("data-processed", {
          transactions,
          summary: this.summary,
          format: this.outputFormat,
          output: this.outputData,
        });
      } catch (error) {
        this.showStatus("Error processing data: " + error.message, "error");
        this.$emit("processing-error", error);
      }
    },

    generateCSV(transactions) {
      const headers = ["Date", "Account", "Category", "Description", "Amount"];
      const rows = transactions.map((t) => [
        t.date,
        t.account,
        t.category,
        t.description,
        t.amount.toFixed(2),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return csvContent;
    },

    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.outputData);
        this.showStatus("Copied to clipboard!", "success");
        this.$emit("data-copied", this.outputData);
      } catch (error) {
        console.error("Failed to copy:", error);
        this.showStatus("Failed to copy to clipboard", "error");
      }
    },

    downloadFile() {
      const extension = this.outputFormat === "csv" ? "csv" : "json";
      const mimeType =
        this.outputFormat === "csv" ? "text/csv" : "application/json";
      const blob = new Blob([this.outputData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nelnet_payment_${
        new Date().toISOString().split("T")[0]
      }.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      this.showStatus("File downloaded!", "success");
      this.$emit("file-downloaded", { extension, data: this.outputData });
    },

    showStatus(message, type) {
      this.statusMessage = message;
      this.statusType = type;
      setTimeout(() => {
        this.statusMessage = "";
      }, 3000);
    },

    clearData() {
      this.inputData = "";
      this.outputData = "";
      this.summary = null;
    },

    setInputData(data) {
      this.inputData = data;
    },

    getMappings() {
      return this.accountMappings;
    },

    setMappings(mappings) {
      this.accountMappings = mappings;
    },
  },
};
</script>

<style scoped>
.nelnet-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.converter-card,
.instructions-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.converter-title {
  font-size: 28px;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 8px;
}

.converter-subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.mapping-section {
  background: #eff6ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.mapping-section .section-title {
  color: #1e40af;
}

.mappings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.mapping-row {
  display: flex;
  gap: 8px;
}

.input-group {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.input-account {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.input-group:focus,
.input-account:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-remove {
  padding: 8px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-remove:hover {
  background: #dc2626;
}

.mapping-actions {
  display: flex;
  gap: 8px;
}

.input-section {
  margin-bottom: 24px;
}

.data-input {
  width: 100%;
  min-height: 250px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
}

.data-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.process-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.format-select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.format-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.output-section {
  margin-bottom: 24px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.output-actions {
  display: flex;
  gap: 8px;
}

.output-display {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow: auto;
}

.output-display pre {
  margin: 0;
  font-size: 13px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.summary-section {
  background: #f0fdf4;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}

.summary-item,
.summary-count {
  font-size: 14px;
}

.summary-label {
  font-weight: 600;
  color: #166534;
}

.status-message {
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
}

.status-success {
  background: #f0fdf4;
  color: #166534;
}

.status-error {
  background: #fef2f2;
  color: #991b1b;
}

.instructions-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
}

.instructions-list {
  list-style-type: decimal;
  padding-left: 20px;
  color: #4b5563;
  line-height: 1.8;
}

.instructions-list li {
  margin-bottom: 8px;
}

.notes-section {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
}

.notes-title {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.notes-list {
  list-style-type: disc;
  padding-left: 20px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.notes-list li {
  margin-bottom: 4px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-export {
  background: #f59e0b;
  color: white;
}

.btn-export:hover {
  background: #d97706;
}

.btn-import {
  background: #06b6d4;
  color: white;
}

.btn-import:hover {
  background: #0891b2;
}

.btn-process {
  background: #4f46e5;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
}

.btn-process:hover {
  background: #4338ca;
}

.btn-copy {
  background: #10b981;
  color: white;
}

.btn-copy:hover {
  background: #059669;
}

.btn-download {
  background: #8b5cf6;
  color: white;
}

.btn-download:hover {
  background: #7c3aed;
}

@media (max-width: 768px) {
  .mappings-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .output-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .output-actions {
    width: 100%;
  }

  .output-actions .btn {
    flex: 1;
  }
}
</style>
