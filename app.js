(function () {
  const app = document.querySelector("#app");

  const text = {
    idle: "Dra inn et bilde, lim inn fra utklippstavlen (CTRL + V) eller velg en fil.",
    empty: "Ingen dekodet verdi ennå.",
    rawText: "Rå dekodet tekst",
    smdp: "SM-DP+-adresse",
    activation: "Aktiveringskode",
    confirmation: "Bekreftelseskode",
    extrasEmpty: "Ingen ekstra felt",
    invalidLpa: "Den dekodede teksten samsvarer ikke med forventet format LPA:versjon$SM-DP+$aktiveringskode, så bare råteksten vises."
  };

  const state = {
    rawText: "",
    parsed: null,
    isDragging: false,
    manualOpen: true,
    status: {
      type: "idle",
      message: text.idle
    }
  };

  app.innerHTML = `
    <main class="app-shell">
      <header class="masthead">
        <div class="masthead-inner">
          <div class="masthead-brand">
            <p class="masthead-kicker">Johnsen IT</p>
            <h1>eSIM QR-dekoder</h1>
            <p class="header-subtitle">Dekoder eSIM QR-koder lokalt i nettleseren, uten opplasting eller lagring.</p>
          </div>
          <button id="back-button" class="secondary-button header-back is-hidden" type="button">Tilbake</button>
        </div>
      </header>

      <section class="content">

        <section id="landing-section" class="landing-layout">
          <section class="privacy-card">
            <div class="panel-titlebar">
              <h2>Sikkerhet &amp; Personvern</h2>
            </div>
            <div class="panel-body compact-body">
              <p>
                Alt skjer lokalt i nettleseren din. Ingen data sendes, lagres eller spores.<br />
                Applikasjonen er <a href="https://github.com/newbs0001/eSIM-QR-decoder" target="_blank" rel="noreferrer">open-source</a>.
              </p>
            </div>
          </section>

          <section id="intake-panel" class="panel intake-panel">
            <div class="panel-titlebar">
              <h2>eSIM QR</h2>
            </div>
            <div class="panel-body intake-inner">
              <div class="dropzone-copy">
                <h2 class="dropzone-title">Slipp eSIM QR-bildet her</h2>
                <p class="dropzone-subtitle">Dra inn et bilde, lim inn fra utklippstavlen eller velg en fil.</p>
              </div>

              <div class="button-row button-row-start">
                <label class="upload-button" for="image-input">Velg bilde</label>
                <button id="paste-button" class="secondary-button" type="button">Lim inn</button>
                <input id="image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" />
              </div>

              <p id="status" class="status status-idle" role="status" aria-live="polite"></p>
            </div>
          </section>

          <section class="panel manual-panel">
            <div class="panel-titlebar">
              <h2>Manuell inntasting</h2>
            </div>
            <div class="panel-body">
              <div class="panel-header">
                <p>Lim inn LPA-strengen direkte hvis du ikke jobber fra et QR-bilde.</p>
              </div>

              <label class="field-label" for="manual-input">LPA-verdi</label>
              <textarea
                id="manual-input"
                class="text-input"
                rows="5"
                spellcheck="false"
                placeholder="Eksempel: LPA:1$sm-dp.example.com$ABCD1234EFGH5678"
              ></textarea>

              <div class="manual-actions">
                <button id="manual-submit" class="secondary-button" type="button">Vis resultat</button>
              </div>
            </div>
          </section>
        </section>

        <section id="results-view" class="results-view is-hidden">
          <section class="panel results-hero">
            <div class="panel-titlebar">
              <h2>Dekodet resultat</h2>
            </div>
            <div class="panel-body">
              <div class="panel-header">
                <p>SM-DP+-adresse, aktiveringskode og eventuelle ekstra felt fra den dekodede verdien.</p>
              </div>
              <div id="results" class="results"></div>
            </div>
          </section>

          <section id="instructions-section" class="instructions-grid is-hidden">
            <article class="panel instruction-card">
              <div class="panel-titlebar">
                <h2><span class="brand-lower-i">i</span>Phone</h2>
              </div>
              <div class="panel-body">
                <div class="panel-header">
                  <p>Instruksjoner for iPhone (iOS 26+).</p>
                </div>
                <div id="iphone-template" class="instruction-body"></div>
              </div>
            </article>
            <article class="panel instruction-card">
              <div class="panel-titlebar">
                <h2>Android</h2>
              </div>
              <div class="panel-body">
                <div class="panel-header">
                  <p>Tilpasset for vanlige Android-menyer og eSIM-oppsett.</p>
                </div>
                <div id="android-template" class="instruction-body"></div>
              </div>
            </article>
          </section>
        </section>

      </section>

      <footer class="site-footer">
        <div class="site-footer-inner">
          <p>&copy; 2026 Johnsen IT. Alle rettigheter er reservert.</p>
          <p>Utviklet av Michael Johnsen</p>
        </div>
      </footer>
    </main>
  `;

  const elements = {
    imageInput: document.querySelector("#image-input"),
    manualInput: document.querySelector("#manual-input"),
    manualSubmit: document.querySelector("#manual-submit"),
    pasteButton: document.querySelector("#paste-button"),
    backButton: document.querySelector("#back-button"),
    intakePanel: document.querySelector("#intake-panel"),
    status: document.querySelector("#status"),
    landingSection: document.querySelector("#landing-section"),
    resultsView: document.querySelector("#results-view"),
    results: document.querySelector("#results"),
    instructionsSection: document.querySelector("#instructions-section"),
    iphoneTemplate: document.querySelector("#iphone-template"),
    androidTemplate: document.querySelector("#android-template")
  };

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setStatus(type, message) {
    state.status = { type: type, message: message };
    elements.status.textContent = message;
    elements.status.className = "status status-" + type;
  }

  function parseLpaPayload(rawText) {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return null;
    }

    if (!trimmed.toUpperCase().startsWith("LPA:")) {
      return {
        isLpa: false,
        smdpAddress: "",
        activationCode: "",
        confirmationCode: "",
        extras: []
      };
    }

    const body = trimmed.slice(4);
    const segments = body.split("$");

    return {
      isLpa: true,
      smdpAddress: segments[1] || "",
      activationCode: segments[2] || "",
      confirmationCode: segments[3] || "",
      extras: segments.slice(4)
    };
  }

  function copyToClipboard(value) {
    if (!value) {
      return Promise.resolve();
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand("copy");
      document.body.removeChild(input);
      return Promise.resolve();
    } catch (error) {
      document.body.removeChild(input);
      return Promise.reject(error);
    }
  }

  function animateCopyButton(button) {
    const originalText = button.dataset.originalText || button.textContent || "Kopier";
    button.dataset.originalText = originalText;

    if (button.dataset.resetTimer) {
      window.clearTimeout(Number(button.dataset.resetTimer));
    }

    button.textContent = "Kopiert";
    button.classList.add("is-copied");

    const resetTimer = window.setTimeout(function () {
      button.textContent = originalText;
      button.classList.remove("is-copied");
      delete button.dataset.resetTimer;
    }, 1400);

    button.dataset.resetTimer = String(resetTimer);
  }

  function fieldCard(label, value, copyLabel) {
    const safeValue = value ? escapeHtml(value) : '<span class="muted">Ikke tilgjengelig</span>';
    const disabled = value ? "" : "disabled";
    const encodedValue = encodeURIComponent(value || "");

    return `
      <div class="result-card result-card-standard">
        <div>
          <p class="result-label">${escapeHtml(label)}</p>
          <pre class="result-code ${label === text.rawText ? "result-code-subtle" : ""}">${safeValue}</pre>
        </div>
        <button class="copy-button" type="button" data-copy="${encodedValue}" data-copy-label="${escapeHtml(copyLabel)}" ${disabled}>
          Kopier
        </button>
      </div>
    `;
  }

  function priorityFieldCard(label, value, copyLabel) {
    if (!value) {
      return "";
    }

    const encodedValue = encodeURIComponent(value);

    return `
      <div class="result-card result-card-priority">
        <div>
          <p class="result-label">${escapeHtml(label)}</p>
          <pre class="result-code result-code-priority">${escapeHtml(value)}</pre>
        </div>
        <button class="copy-button copy-button-priority" type="button" data-copy="${encodedValue}" data-copy-label="${escapeHtml(copyLabel)}">
          Kopier
        </button>
      </div>
    `;
  }

  function buildCustomerMessage(platform, parsed) {
    if (!parsed || !parsed.isLpa) {
      return "";
    }

    const lines = platform === "iphone"
      ? [
        "Du kan bruke disse eSIM-detaljene på iPhone under manuell aktivering:",
        " ",
        "Gå til Innstillinger > Mobilnett > Legg til eSIM > Skann QR-kode > Oppgi informasjon manuelt",
        " ",
        "Skriv inn detaljene nedenfor nøyaktig som oppgitt:",  
          "SM-DP+-adresse: " + (parsed.smdpAddress || "[angi SM-DP+-adresse]"),
          "Aktiveringskode: " + (parsed.activationCode || "[angi aktiveringskode]"),
          parsed.confirmationCode ? "Bekreftelseskode: " + parsed.confirmationCode : "",
          "",

        ]
      : [
          "Du kan bruk disse eSIM-detaljene på Android under manuell aktivering:",
          "SM-DP+-adresse: " + (parsed.smdpAddress || "[angi SM-DP+-adresse]"),
          "Aktiveringskode: " + (parsed.activationCode || "[angi aktiveringskode]"),
          parsed.confirmationCode ? "Bekreftelseskode: " + parsed.confirmationCode : "",
          "",
          "Gå til Innstillinger > Nettverk/SIM > Legg til eSIM og velg manuell registrering.",
          "Skriv inn detaljene over nøyaktig som oppgitt."
        ];

    return lines.filter(Boolean).join("\n");
  }

  function buildInstructionMarkup(platform, parsed) {
    const details = parsed && parsed.isLpa
      ? [
          text.smdp + ": " + (parsed.smdpAddress || "[angi SM-DP+-adresse]"),
          text.activation + ": " + (parsed.activationCode || "[angi aktiveringskode]"),
          parsed.confirmationCode ? text.confirmation + ": " + parsed.confirmationCode : "",
          parsed.extras.length ? "Ekstra felt: " + parsed.extras.join(" | ") : ""
        ].filter(Boolean)
      : [];
    const message = buildCustomerMessage(platform, parsed);
    const encodedMessage = encodeURIComponent(message);
    const messageBlock = message
      ? `
        <div class="template-message-wrap">
          <div class="template-message-header">
            <p class="result-label">Melding til kunde</p>
            <button class="copy-button template-copy-button" type="button" data-copy="${encodedMessage}" data-copy-label="Melding til kunde">
              Kopier melding
            </button>
          </div>
          <pre class="template-message">${escapeHtml(message)}</pre>
        </div>
      `
      : "";

    if (platform === "iphone") {
      return `
        <ol>
          <li>Åpne <strong>Innstillinger</strong> og gå til <strong>Mobilnett</strong>.</li>
          <li>Dersom kunde har <strong>inaktive SIM-kort</strong> på listen MÅ de <strong>slettes</strong> før nytt eSIM blir installert.</li>
          <li>Velg <strong>Legg til eSIM</strong> eller <strong>Legg til mobilabonnement</strong>.</li>
          <li>Velg <strong>Bruk QR-kode</strong> hvis kunden kan skanne, eller <strong>Angi detaljer manuelt</strong> hvis de trenger hjelp.</li>
          <li>Skriv inn aktiveringsdetaljene nøyaktig som vist nedenfor.</li>
          <li>Følg de resterende stegene for å navngi linjen og fullføre aktiveringen.</li>
        </ol>
        ${messageBlock}
        ${details.length ? "<pre>" + escapeHtml(details.join("\n")) + "</pre>" : '<p class="muted">Dekod en LPA-verdi for å fylle ut detaljseksjonen.</p>'}
      `;
    }

    return `
      <ol>
        <li>Åpne <strong>Innstillinger</strong> og gå til <strong>Nettverk og internett</strong>, <strong>Tilkoblinger</strong> eller <strong>SIM-behandling</strong>.</li>
        <li>Velg <strong>Legg til eSIM</strong>, <strong>Last ned SIM</strong> eller tilsvarende valg på enheten.</li>
        <li>Velg manuell registrering hvis kunden ikke kan skanne QR-koden.</li>
        <li>Skriv inn SM-DP+-adressen og aktiveringskoden nøyaktig som oppgitt.</li>
        <li>Fullfør stegene for å laste ned og aktivere eSIM-profilen.</li>
      </ol>
      ${messageBlock}
      ${details.length ? "<pre>" + escapeHtml(details.join("\n")) + "</pre>" : '<p class="muted">Dekod en LPA-verdi for å fylle ut detaljseksjonen.</p>'}
    `;
  }

  function renderLayoutState() {
    const hasDecoded = Boolean(state.rawText);
    elements.landingSection.classList.toggle("is-hidden", hasDecoded);
    elements.resultsView.classList.toggle("is-hidden", !hasDecoded);
    elements.intakePanel.classList.toggle("is-dragging", state.isDragging && !hasDecoded);
    elements.backButton.classList.toggle("is-hidden", !hasDecoded);
  }

  function renderResults() {
    const parsed = state.parsed;
    const rawText = state.rawText;

    if (!rawText) {
      elements.results.innerHTML = "";
      elements.instructionsSection.classList.add("is-hidden");
      elements.iphoneTemplate.innerHTML = buildInstructionMarkup("iphone", null);
      elements.androidTemplate.innerHTML = buildInstructionMarkup("android", null);
      renderLayoutState();
      return;
    }

    const extrasMarkup = parsed && parsed.extras && parsed.extras.length
      ? parsed.extras.map(function (extra, index) {
          return fieldCard("Ekstra " + (index + 1), extra, "Ekstra " + (index + 1));
        }).join("")
      : "";

    const priorityMarkup = [
      priorityFieldCard(text.smdp, parsed ? parsed.smdpAddress : "", text.smdp),
      priorityFieldCard(text.activation, parsed ? parsed.activationCode : "", text.activation),
      priorityFieldCard(text.confirmation, parsed ? parsed.confirmationCode : "", text.confirmation)
    ].join("");

    const nonLpaNote = parsed && !parsed.isLpa
      ? '<div class="notice">' + escapeHtml(text.invalidLpa) + "</div>"
      : "";

    elements.results.innerHTML = `
      ${nonLpaNote}
      ${priorityMarkup}
      ${fieldCard(text.rawText, rawText, text.rawText)}
      ${extrasMarkup}
    `;

    if (parsed && parsed.isLpa) {
      elements.instructionsSection.classList.remove("is-hidden");
    } else {
      elements.instructionsSection.classList.add("is-hidden");
    }

    elements.iphoneTemplate.innerHTML = buildInstructionMarkup("iphone", parsed);
    elements.androidTemplate.innerHTML = buildInstructionMarkup("android", parsed);
    renderLayoutState();
  }

  function applyDecodedText(rawText, sourceLabel) {
    state.rawText = rawText.trim();
    state.parsed = parseLpaPayload(state.rawText);
    renderResults();

    if (!state.rawText) {
      setStatus("idle", text.idle);
      return;
    }

    if (state.parsed && state.parsed.isLpa) {
      setStatus("success", sourceLabel + " ble dekodet lokalt. Parsede eSIM-felt er klare til kopiering.");
      return;
    }

    setStatus("warning", sourceLabel + " ble dekodet lokalt, men samsvarer ikke med forventet eSIM LPA-format.");
  }

  async function readClipboardImage() {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      throw new Error("Utklippstavle-lesing er ikke tilgjengelig i denne nettleseren. Bruk Ctrl+V eller velg en fil.");
    }

    const clipboardItems = await navigator.clipboard.read();
    for (let index = 0; index < clipboardItems.length; index += 1) {
      const item = clipboardItems[index];
      const imageType = item.types.find(function (type) {
        return type.indexOf("image/") === 0;
      });

      if (imageType) {
        return item.getType(imageType);
      }
    }

    throw new Error("Fant ikke noe bilde i utklippstavlen.");
  }

  function decodeImageFile(file) {
    return createImageBitmap(file).then(function (bitmap) {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        bitmap.close();
        throw new Error("Canvas er ikke tilgjengelig i denne nettleseren.");
      }

      context.drawImage(bitmap, 0, 0);
      bitmap.close();

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth"
      });

      if (!decoded || !decoded.data) {
        throw new Error("Fant ingen QR-kode i det valgte bildet.");
      }

      return decoded.data;
    });
  }

  function getPastedImageFile(event) {
    const clipboardItems = event.clipboardData && event.clipboardData.items;
    if (!clipboardItems) {
      return null;
    }

    for (let index = 0; index < clipboardItems.length; index += 1) {
      const item = clipboardItems[index];
      if (item.kind === "file" && item.type.indexOf("image/") === 0) {
        return item.getAsFile();
      }
    }

    return null;
  }

  function getDroppedImageFile(event) {
    const files = event.dataTransfer && event.dataTransfer.files;
    if (!files || !files.length) {
      return null;
    }

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      if (file.type.indexOf("image/") === 0) {
        return file;
      }
    }

    return null;
  }

  function decodeImageSource(file, sourceLabel) {
    setStatus("idle", "Dekoder QR-bilde lokalt i nettleseren...");

    decodeImageFile(file)
      .then(function (decodedText) {
        applyDecodedText(decodedText, sourceLabel);
      })
      .catch(function (error) {
        setStatus("error", error instanceof Error ? error.message : "Kunne ikke dekode bildet.");
      });
  }

  elements.imageInput.addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    decodeImageSource(file, "QR-bildet");
  });

  elements.manualSubmit.addEventListener("click", function () {
    applyDecodedText(elements.manualInput.value, "Manuell inntasting");
  });

  elements.backButton.addEventListener("click", function () {
    state.rawText = "";
    state.parsed = null;
    state.isDragging = false;
    elements.imageInput.value = "";
    elements.manualInput.value = "";
    renderResults();
    setStatus("idle", text.idle);
  });

  elements.pasteButton.addEventListener("click", function () {
    readClipboardImage()
      .then(function (blob) {
        decodeImageSource(blob, "Utklippsbildet");
      })
      .catch(function (error) {
        setStatus("error", error instanceof Error ? error.message : "Kunne ikke lese utklippstavlen.");
      });
  });

  window.addEventListener("paste", function (event) {
    if (state.rawText) {
      return;
    }

    const pastedImage = getPastedImageFile(event);
    if (!pastedImage) {
      return;
    }

    event.preventDefault();
    decodeImageSource(pastedImage, "Utklippsbildet");
  });

  elements.intakePanel.addEventListener("dragenter", function (event) {
    event.preventDefault();
    state.isDragging = true;
    renderLayoutState();
  });

  elements.intakePanel.addEventListener("dragover", function (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    state.isDragging = true;
    renderLayoutState();
  });

  elements.intakePanel.addEventListener("dragleave", function (event) {
    if (!elements.intakePanel.contains(event.relatedTarget)) {
      state.isDragging = false;
      renderLayoutState();
    }
  });

  elements.intakePanel.addEventListener("drop", function (event) {
    event.preventDefault();
    state.isDragging = false;
    renderLayoutState();

    const droppedImage = getDroppedImageFile(event);
    if (!droppedImage) {
      setStatus("error", "Slipp en bildefil med QR-kode for å dekode.");
      return;
    }

    decodeImageSource(droppedImage, "Det slupne bildet");
  });

  app.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !target.dataset.copy) {
      return;
    }

    const value = decodeURIComponent(target.dataset.copy);

    copyToClipboard(value)
      .then(function () {
        animateCopyButton(target);
        setStatus("success", (target.dataset.copyLabel || "Verdi") + " ble kopiert til utklippstavlen.");
      })
      .catch(function () {
        setStatus("error", "Tilgang til utklippstavlen ble blokkert av nettleseren.");
      });
  });

  renderResults();
  setStatus(state.status.type, state.status.message);
})();
