<template>
  <div class="qr-generator">
    <div class="qr-generator__header">
      <h2 class="qr-generator__title">QR Code Generator</h2>
      <p class="qr-generator__subtitle">Create QR codes with custom logos</p>
    </div>

    <div class="qr-generator__form">
      <div class="qr-generator__input-group">
        <label for="url-input" class="qr-generator__label">Enter URL:</label>
        <input
          id="url-input"
          v-model="url"
          type="url"
          class="qr-generator__input"
          placeholder="https://example.com"
          required
        />
      </div>

      <div class="qr-generator__input-group">
        <label for="logo-input" class="qr-generator__label"
          >Upload Logo/Image (optional):</label
        >
        <div class="qr-generator__file-wrapper">
          <input
            id="logo-input"
            ref="logoInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="qr-generator__file-input"
          />
          <label
            for="logo-input"
            class="qr-generator__file-label"
            :class="{ 'qr-generator__file-label--has-file': selectedFile }"
          >
            {{
              selectedFile ? selectedFile.name : "Click to select an image file"
            }}
          </label>
        </div>
      </div>

      <!-- Output format selector -->
      <div class="qr-generator__input-group">
        <label for="format-input" class="qr-generator__label"
          >Output format:</label
        >
        <select
          id="format-input"
          v-model="outputFormat"
          class="qr-generator__input"
        >
          <option value="PNG">PNG</option>
          <option value="SVG">SVG</option>
        </select>
      </div>

      <button
        @click="generateQR"
        :disabled="!url || isGenerating"
        class="qr-generator__button"
        :class="{ 'qr-generator__button--loading': isGenerating }"
      >
        {{ isGenerating ? "Generating..." : "Generate QR Code" }}
      </button>
    </div>

    <div v-if="error" class="qr-generator__error">
      {{ error }}
    </div>

    <!-- Render the result while generating or after generated so $refs is available -->
    <div v-show="qrGenerated || isGenerating" class="qr-generator__result">
      <h3 class="qr-generator__result-title">Your QR Code:</h3>
      <!-- PNG canvas -->
      <canvas
        v-show="outputFormat === 'PNG'"
        ref="qrCanvas"
        class="qr-generator__canvas"
        width="400"
        height="400"
      ></canvas>
      <!-- SVG container -->
      <div v-show="outputFormat === 'SVG'">
        <div
          class="qr-generator__canvas"
          v-html="svgMarkup"
          aria-label="QR Code SVG"
        ></div>
      </div>
      <button @click="downloadQR" class="qr-generator__download-button">
        Download QR Code
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "QRGenerator",
  data() {
    return {
      url: "",
      selectedFile: null,
      isGenerating: false,
      qrGenerated: false,
      error: null,
      outputFormat: "PNG",
      svgMarkup: "",
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      this.selectedFile = file || null;
      this.error = null;
    },

    async generateQR() {
      if (!this.url) {
        this.showError("Please enter a URL");
        return;
      }

      try {
        this.isGenerating = true;
        this.error = null;

        // Ensure the canvas is in the DOM before drawing (for PNG)
        if (!this.qrGenerated) {
          this.qrGenerated = true;
          await this.$nextTick();
        }

        await this.generateQRWithLogo(this.url, this.selectedFile);

        this.$emit("qr-generated", {
          url: this.url,
          fileName: this.selectedFile ? this.selectedFile.name : null,
        });
      } catch (err) {
        console.error("Error generating QR code:", err);
        this.showError("Error generating QR code. Please try again.");
      } finally {
        this.isGenerating = false;
      }
    },

    async generateQRWithLogo(url, logoFile) {
      return new Promise((resolve, reject) => {
        try {
          // Load QR code library if not already loaded
          if (!window.qrcode) {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
            script.onload = () => {
              if (this.outputFormat === "SVG") {
                this.drawQRCodeSVG(url, logoFile, resolve, reject);
              } else {
                this.drawQRCodePNG(url, logoFile, resolve, reject);
              }
            };
            script.onerror = reject;
            document.head.appendChild(script);
          } else {
            if (this.outputFormat === "SVG") {
              this.drawQRCodeSVG(url, logoFile, resolve, reject);
            } else {
              this.drawQRCodePNG(url, logoFile, resolve, reject);
            }
          }
        } catch (err) {
          reject(err);
        }
      });
    },

    // PNG path (existing logic moved here)
    drawQRCodePNG(url, logoFile, resolve, reject) {
      const canvas = this.$refs.qrCanvas;
      if (!canvas) {
        reject(new Error("Canvas not available"));
        return;
      }
      const ctx = canvas.getContext("2d");

      // Set canvas size
      canvas.width = 400;
      canvas.height = 400;

      // Generate QR code using qrcode-generator
      const qr = window.qrcode(0, "M");
      qr.addData(url);
      qr.make();

      // Get the module count (size of QR code grid)
      const moduleCount = qr.getModuleCount();
      const cellSize = canvas.width / moduleCount;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000000";
      // Use Math.ceil to ensure no gaps between squares
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              Math.floor(col * cellSize),
              Math.floor(row * cellSize),
              Math.ceil(cellSize),
              Math.ceil(cellSize)
            );
          }
        }
      }

      // If no logo provided, we're done
      if (!logoFile) {
        // Clear any prior SVG
        this.svgMarkup = "";
        resolve();
        return;
      }

      // Load and draw the logo
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate logo size maintaining aspect ratio
          const maxLogoSize = canvas.width * 0.2;
          const imgAspectRatio = img.width / img.height;

          let logoWidth, logoHeight;
          if (imgAspectRatio > 1) {
            // Image is wider than tall
            logoWidth = maxLogoSize;
            logoHeight = maxLogoSize / imgAspectRatio;
          } else {
            // Image is taller than wide or square
            logoHeight = maxLogoSize;
            logoWidth = maxLogoSize * imgAspectRatio;
          }

          const logoX = (canvas.width - logoWidth) / 2;
          const logoY = (canvas.height - logoHeight) / 2;

          // Create a white background for the logo
          const padding = 10;
          ctx.fillStyle = "white";
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoWidth + padding * 2,
            logoHeight + padding * 2
          );

          // Draw the logo with maintained aspect ratio
          ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);

          // Add a subtle border around the logo
          ctx.strokeStyle = "#ddd";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            logoX - padding,
            logoY - padding,
            logoWidth + padding * 2,
            logoHeight + padding * 2
          );

          // Clear any prior SVG
          this.svgMarkup = "";
          resolve();
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(logoFile);
    },

    // SVG path
    drawQRCodeSVG(url, logoFile, resolve, reject) {
      try {
        const qr = window.qrcode(0, "M");
        qr.addData(url);
        qr.make();

        const moduleCount = qr.getModuleCount();

        // Aim for ~400px size like the canvas. Compute integer cell size.
        const targetSize = 400;
        const cellSize = Math.max(1, Math.floor(targetSize / moduleCount));
        const margin = 0; // we draw full-bleed like canvas
        const totalSize = moduleCount * cellSize + margin * 2 * cellSize;

        // Base SVG tag from lib (black on white)
        const baseSvg = qr.createSvgTag({
          cellSize,
          margin,
        });

        // Parse to DOM so we can inject logo/background and class
        const parser = new DOMParser();
        const doc = parser.parseFromString(baseSvg, "image/svg+xml");
        const svgEl = doc.documentElement;

        // Ensure fixed width/height to match our layout and apply class for styling parity
        svgEl.setAttribute("width", String(totalSize));
        svgEl.setAttribute("height", String(totalSize));
        svgEl.setAttribute("viewBox", `0 0 ${totalSize} ${totalSize}`);
        // Apply same class used for canvas so page styling remains consistent
        svgEl.setAttribute("class", "qr-generator__canvas");

        // Inject logo if provided
        const finalize = (dataUrl) => {
          if (dataUrl) {
            // Calculate logo size and position (20% of total size)
            const maxLogoSize = totalSize * 0.2;
            // We don't know aspect until image loads, but with SVG <image> we can still place it square;
            // for better quality, compute by reading image size via offscreen Image
            const img = new Image();
            img.onload = () => {
              const imgAspect = img.width / img.height;
              let logoW, logoH;
              if (imgAspect > 1) {
                logoW = maxLogoSize;
                logoH = maxLogoSize / imgAspect;
              } else {
                logoH = maxLogoSize;
                logoW = maxLogoSize * imgAspect;
              }
              const padding = 10;
              const x = (totalSize - logoW) / 2;
              const y = (totalSize - logoH) / 2;

              // White background rect under the logo
              const bg = doc.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              bg.setAttribute("x", String(x - padding));
              bg.setAttribute("y", String(y - padding));
              bg.setAttribute("width", String(logoW + padding * 2));
              bg.setAttribute("height", String(logoH + padding * 2));
              bg.setAttribute("fill", "#ffffff");
              svgEl.appendChild(bg);

              // Logo image
              const imageEl = doc.createElementNS(
                "http://www.w3.org/2000/svg",
                "image"
              );
              imageEl.setAttribute("x", String(x));
              imageEl.setAttribute("y", String(y));
              imageEl.setAttribute("width", String(logoW));
              imageEl.setAttribute("height", String(logoH));
              imageEl.setAttributeNS(
                "http://www.w3.org/1999/xlink",
                "xlink:href",
                dataUrl
              );
              imageEl.setAttributeNS(
                "http://www.w3.org/1999/xlink",
                "href",
                dataUrl
              );
              svgEl.appendChild(imageEl);

              // Subtle border
              const border = doc.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              border.setAttribute("x", String(x - padding));
              border.setAttribute("y", String(y - padding));
              border.setAttribute("width", String(logoW + padding * 2));
              border.setAttribute("height", String(logoH + padding * 2));
              border.setAttribute("fill", "none");
              border.setAttribute("stroke", "#dddddd");
              border.setAttribute("stroke-width", "2");
              svgEl.appendChild(border);

              // Serialize back to string
              const serializer = new XMLSerializer();
              this.svgMarkup = serializer.serializeToString(svgEl);
              resolve();
            };
            img.onerror = () => {
              // If image fails, still provide QR without logo
              const serializer = new XMLSerializer();
              this.svgMarkup = serializer.serializeToString(svgEl);
              resolve();
            };
            img.src = dataUrl;
          } else {
            const serializer = new XMLSerializer();
            this.svgMarkup = serializer.serializeToString(svgEl);
            resolve();
          }
        };

        if (!logoFile) {
          finalize(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          finalize(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(logoFile);
      } catch (e) {
        reject(e);
      }
    },

    downloadQR() {
      if (this.outputFormat === "SVG") {
        if (!this.svgMarkup) {
          this.showError("Please generate the QR code first.");
          return;
        }
        const blob = new Blob([this.svgMarkup], {
          type: "image/svg+xml;charset=utf-8",
        });
        const link = document.createElement("a");
        link.download = "qr-code-with-logo.svg";
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else {
        const canvas = this.$refs.qrCanvas;
        if (!canvas) {
          this.showError("Please generate the QR code first.");
          return;
        }
        const link = document.createElement("a");
        link.download = "qr-code-with-logo.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }

      this.$emit("qr-downloaded", {
        url: this.url,
        fileName: this.selectedFile ? this.selectedFile.name : null,
      });
    },

    showError(message) {
      this.error = message;
      setTimeout(() => {
        this.error = null;
      }, 5000);
    },

    // Public method to clear the form
    clearForm() {
      this.url = "";
      this.selectedFile = null;
      this.qrGenerated = false;
      this.error = null;
      this.svgMarkup = "";
      if (this.$refs.logoInput) {
        this.$refs.logoInput.value = "";
      }
    },
  },
};
</script>

<style scoped>
.qr-generator {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.qr-generator__header {
  text-align: center;
  margin-bottom: 2rem;
}

.qr-generator__title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.qr-generator__subtitle {
  color: #666;
  font-size: 1rem;
}

.qr-generator__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qr-generator__input-group {
  display: flex;
  flex-direction: column;
}

.qr-generator__label {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.qr-generator__input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.qr-generator__input:focus {
  outline: none;
  border-color: #667eea;
}

.qr-generator__file-wrapper {
  position: relative;
}

.qr-generator__file-input {
  position: absolute;
  left: -9999px;
}

.qr-generator__file-label {
  display: block;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 2px dashed #ccc;
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.qr-generator__file-label:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.qr-generator__file-label--has-file {
  background: #e8f5e8;
  border-color: #28a745;
  color: #155724;
}

.qr-generator__button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-top: 1rem;
}

.qr-generator__button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.qr-generator__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.qr-generator__button--loading {
  opacity: 0.8;
}

.qr-generator__error {
  color: #dc3545;
  background: #f8d7da;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
}

.qr-generator__result {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.qr-generator__result-title {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

/* Apply same framing to both canvas and svg */
.qr-generator__canvas {
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
  margin-bottom: 1rem;
  display: inline-block;
}

.qr-generator__download-button {
  background: #28a745;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.qr-generator__download-button:hover {
  background: #218838;
}

/* Responsive design */
@media (max-width: 768px) {
  .qr-generator {
    padding: 1rem;
    margin: 1rem;
  }

  .qr-generator__title {
    font-size: 1.5rem;
  }

  .qr-generator__canvas {
    max-width: 100%;
  }
}
</style>
