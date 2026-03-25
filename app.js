(function () {
  const app = document.querySelector("#app");

  const text = {
    idle: "Støtter også Ctrl + V for innliming av bilde.",
    rawText: "Rå dekodet tekst",
    smdp: "SM-DP+-adresse",
    activation: "Aktiveringskode",
    confirmation: "Bekreftelseskode",
    extras: "Ekstra felt",
    invalidLpa: "Den dekodede teksten samsvarer ikke med forventet format for LPA: versjon$SM-DP+$aktiveringskode, så bare råteksten vises."
  };

  const state = {
    rawText: "",
    parsed: null,
    isDragging: false,
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
            <h1>eSIM Verktøy</h1>
            <p class="header-subtitle">Dekod eSIM-QR-koder og hent ut manuelle verdier lokalt i nettleseren, uten opplasting eller lagring.</p>
          </div>
        </div>
      </header>

      <section class="content">
        <section id="landing-section" class="landing-layout">
          <section class="privacy-card">
            <div class="panel-titlebar">
              <h2>Sikkerhet og personvern</h2>
            </div>
            <div class="panel-body compact-body">
              <p>
                Alt behandles lokalt i nettleseren din. Ingen data sendes, lagres eller spores.<br />
                Applikasjonen er <a href="https://github.com/newbs0001/eSIM-QR-decoder" target="_blank" rel="noreferrer">open source</a>.
              </p>
            </div>
          </section>

          <section id="intake-panel" class="panel intake-panel">
            <div class="panel-titlebar">
              <h2>eSIM-QR</h2>
            </div>
            <div class="panel-body intake-inner">
              <div class="dropzone-copy">
                <h2 class="dropzone-title">Slipp eSIM-QR her</h2>
                <p class="dropzone-subtitle">Dra inn et bilde, lim inn fra utklippstavlen eller velg en fil.</p>
              </div>

              <div class="button-row button-row-start">
                <label class="upload-button" for="image-input">Velg bilde</label>
                <button id="paste-button" class="secondary-button" type="button">Lim inn bilde</button>
                <input id="image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" />
              </div>

              <p id="status" class="status status-idle" role="status" aria-live="polite"></p>
            </div>
          </section>

          <details class="panel manual-panel">
            <summary class="panel-titlebar guidance-summary">
              <h2>Manuell inntasting</h2>
              <span class="guidance-chevron" aria-hidden="true"></span>
            </summary>
            <div class="panel-body">
              <div class="panel-header">
                <p>Lim inn LPA-strengen direkte hvis du ikke bruker et QR-bilde.</p>
              </div>

              <label class="field-label" for="manual-input">LPA-streng</label>
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
          </details>
        </section>

        <section id="results-view" class="results-view is-hidden">
          <div class="results-toolbar">
            <button id="back-button" class="secondary-button back-button is-hidden" type="button">Tilbake</button>
          </div>

          <details id="install-links-section" class="panel results-panel is-hidden">
            <summary class="panel-titlebar guidance-summary">
              <h2>Installasjonslenke <span class="beta-label">BETA</span></h2>
              <span class="guidance-chevron" aria-hidden="true"></span>
            </summary>
            <div class="panel-body">
              <div id="install-links" class="results"></div>
            </div>
          </details>

          <details id="manual-values-section" class="panel results-panel" open>
            <summary class="panel-titlebar guidance-summary">
              <h2>Manuelle verdier</h2>
              <span class="guidance-chevron" aria-hidden="true"></span>
            </summary>
            <div class="panel-body">
              <div class="panel-header">
                <p>Her ser du SM-DP+-adresse, aktiveringskode og eventuelle ekstra felt fra den dekodede verdien.</p>
              </div>
              <div id="results" class="results"></div>
            </div>
          </details>

          <details id="instructions-section" class="panel instructions-panel is-hidden">
            <summary class="panel-titlebar guidance-summary">
              <h2>Veiledning for iPhone og Android</h2>
              <span class="guidance-chevron" aria-hidden="true"></span>
            </summary>
            <div class="panel-body">
              <section class="instructions-grid">
                <article class="panel instruction-card">
                  <div class="panel-titlebar">
                    <h2>iPhone</h2>
                  </div>
                  <div class="panel-body">
                    <div class="panel-header">
                      <p>Instruksjoner for iPhone.</p>
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
                      <p>Instruksjoner for Android. Menyene kan variere mellom ulike produsenter og modeller.</p>
                    </div>
                    <div id="android-template" class="instruction-body"></div>
                  </div>
                </article>
              </section>
            </div>
          </details>
        </section>
      </section>

      <footer class="site-footer">
        <div class="site-footer-inner">
          <p>&copy; 2026 Johnsen IT. Alle rettigheter forbeholdt.</p>
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
    installLinksSection: document.querySelector("#install-links-section"),
    installLinks: document.querySelector("#install-links"),
    manualValuesSection: document.querySelector("#manual-values-section"),
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
    const originalMarkup = button.dataset.originalMarkup || button.innerHTML;
    button.dataset.originalMarkup = originalMarkup;

    if (button.dataset.resetTimer) {
      window.clearTimeout(Number(button.dataset.resetTimer));
    }

    button.innerHTML = copiedIconMarkup();
    button.classList.add("is-copied");

    const resetTimer = window.setTimeout(function () {
      button.innerHTML = originalMarkup;
      button.classList.remove("is-copied");
      delete button.dataset.resetTimer;
    }, 1400);

    button.dataset.resetTimer = String(resetTimer);
  }

  function copyIconMarkup() {
    return `
      <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <path d="M272 0H80C53.5 0 32 21.5 32 48V304c0 26.5 21.5 48 48 48H272c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM80 304V48H272V304H80z"></path>
        <path d="M160 160H432c26.5 0 48 21.5 48 48V464c0 26.5-21.5 48-48 48H176c-26.5 0-48-21.5-48-48V384h48v80H432V208H160V160z"></path>
      </svg>
    `;
  }

  function copiedIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"></path>
      </svg>
    `;
  }

  function buildInstallLinks(rawText, parsed) {
    if (!rawText || !parsed || !parsed.isLpa) {
      return null;
    }

    const encodedCardData = encodeURIComponent(rawText);

    return {
      iphone: "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=" + encodedCardData,
      android: "https://esimsetup.android.com/esim_qrcode_provisioning?carddata=" + encodedCardData
    };
  }

  function fieldCard(label, value, copyLabel, options) {
    const settings = options || {};
    const displayValue = settings.displayValue !== undefined ? settings.displayValue : value;
    const safeValue = displayValue ? escapeHtml(displayValue) : '<span class="muted">Ikke tilgjengelig</span>';
    const disabled = value ? "" : "disabled";
    const encodedValue = encodeURIComponent(value || "");
    const codeClass = settings.subtle ? "result-code result-code-subtle" : "result-code";

    return `
      <div class="result-card result-card-standard">
        <p class="result-label result-card-label">${escapeHtml(label)}</p>
        <pre class="${codeClass} result-card-code">${safeValue}</pre>
        <button class="copy-button icon-copy-button result-card-copy" type="button" aria-label="${escapeHtml(copyLabel)}" title="Kopier" data-copy="${encodedValue}" data-copy-label="${escapeHtml(copyLabel)}" ${disabled}>
          ${copyIconMarkup()}
        </button>
      </div>
    `;
  }

  function priorityFieldCard(label, value, copyLabel, emptyDisplay) {
    const hasValue = Boolean(value);
    const displayValue = hasValue ? value : emptyDisplay;
    const encodedValue = encodeURIComponent(value || "");
    const disabled = hasValue ? "" : "disabled";

    return `
      <div class="result-card result-card-priority">
        <p class="result-label result-card-label">${escapeHtml(label)}</p>
        <pre class="result-code result-code-priority result-card-code">${escapeHtml(displayValue)}</pre>
        <button class="copy-button copy-button-priority icon-copy-button result-card-copy" type="button" aria-label="${escapeHtml(copyLabel)}" title="Kopier" data-copy="${encodedValue}" data-copy-label="${escapeHtml(copyLabel)}" ${disabled}>
          ${copyIconMarkup()}
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
        "Du kan bruke disse eSIM-detaljene på iPhone ved manuell aktivering:",
        "",
        "Gå til Innstillinger > Mobilnett > Legg til eSIM.",
        "Velg alternativet for å angi informasjon manuelt.",
        "",
        "Skriv inn detaljene nedenfor nøyaktig slik de er oppgitt:",
        "SM-DP+-adresse: " + (parsed.smdpAddress || "[SM-DP+-adresse]"),
        "Aktiveringskode: " + (parsed.activationCode || "[aktiveringskode]")
      ]
      : [
        "Du kan bruke disse eSIM-detaljene på Android ved manuell aktivering:",
        "",
        "Åpne Innstillinger og finn menyen for SIM, mobilnett eller tilkoblinger.",
        "Velg å legge til eSIM manuelt.",
        "Skriv inn detaljene nedenfor nøyaktig slik de er oppgitt:",
        "SM-DP+-adresse: " + (parsed.smdpAddress || "[SM-DP+-adresse]"),
        "Aktiveringskode: " + (parsed.activationCode || "[aktiveringskode]")
      ];

    return lines.join("\n");
  }

  function buildInstructionMarkup(platform, parsed) {
    const details = parsed && parsed.isLpa
      ? [
          text.smdp + ": " + (parsed.smdpAddress || "[SM-DP+-adresse]"),
          text.activation + ": " + (parsed.activationCode || "[aktiveringskode]")
        ]
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
          <li>Hvis det ligger inaktive eSIM-profiler på enheten, bør de slettes før du installerer en ny.</li>
          <li>Trykk på <strong>Legg til eSIM</strong> eller <strong>Legg til mobilabonnement</strong>.</li>
          <li>Gå til <strong>Bruk QR-kode</strong> &gt; <strong>Skann QR-kode</strong> &gt; <strong>Oppgi informasjon manuelt</strong>.</li>
          <li>Skriv inn aktiveringsdetaljene nøyaktig slik de vises nedenfor.</li>
          <li>Følg de siste stegene på skjermen for å fullføre aktiveringen.</li>
        </ol>
        ${messageBlock}
        ${details.length ? "<pre>" + escapeHtml(details.join("\n")) + "</pre>" : '<p class="muted">Dekod en LPA-streng for å fylle ut detaljseksjonen.</p>'}
      `;
    }

    return `
      <ol>
        <li>Åpne <strong>Innstillinger</strong> og gå til <strong>Nettverk og internett</strong>, <strong>Tilkoblinger</strong> eller <strong>Mobilnett</strong>.</li>
        <li>Velg alternativet for å legge til eSIM eller mobilabonnement.</li>
        <li>Velg manuell registrering dersom QR-koden ikke kan skannes.</li>
        <li>Skriv inn SM-DP+-adresse og aktiveringskode nøyaktig som oppgitt.</li>
        <li>Følg resten av stegene på skjermen for å laste ned og aktivere eSIM-profilen.</li>
      </ol>
      ${messageBlock}
      ${details.length ? "<pre>" + escapeHtml(details.join("\n")) + "</pre>" : '<p class="muted">Dekod en LPA-streng for å fylle ut detaljseksjonen.</p>'}
    `;
  }

  function buildRawTextToggle(rawText) {
    const encodedValue = encodeURIComponent(rawText);

    return `
      <details class="raw-text-toggle">
        <summary class="raw-text-summary">Vis rå dekodet tekst</summary>
        <div class="raw-text-content">
          ${fieldCard(text.rawText, rawText, text.rawText, { subtle: true })}
        </div>
      </details>
    `;
  }

  function buildInstallLinkRow(platformLabel, versionLabel, linkValue) {
    const encodedLink = encodeURIComponent(linkValue);

    return `
      <div class="result-card result-card-standard result-card-link">
        <p class="result-label result-card-label result-link-label">
          <span class="result-link-platform">${escapeHtml(platformLabel)}</span>
          <span class="result-link-version">${escapeHtml(versionLabel)}</span>
        </p>
        <pre class="result-code result-card-code">${escapeHtml(linkValue)}</pre>
        <button class="copy-button icon-copy-button result-card-copy" type="button" aria-label="${escapeHtml(platformLabel + " " + versionLabel)}" title="Kopier" data-copy="${encodedLink}" data-copy-label="${escapeHtml(platformLabel + " " + versionLabel)}">
          ${copyIconMarkup()}
        </button>
      </div>
    `;
  }

  function buildInstallLinkCard(installLinks) {
    if (!installLinks) {
      return "";
    }

    return `
      ${buildInstallLinkRow("iOS", "17.4+", installLinks.iphone)}
      ${buildInstallLinkRow("Android", "10+", installLinks.android)}
      <p class="result-inline-note result-inline-warning">BETA: Disse lenkene er under utprøving og fungerer bare på enkelte enheter. Støtte og oppførsel kan variere, så bruk manuell inntasting inntil videre.</p>
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
      elements.installLinks.innerHTML = "";
      elements.results.innerHTML = "";
      elements.installLinksSection.classList.add("is-hidden");
      elements.installLinksSection.removeAttribute("open");
      elements.manualValuesSection.setAttribute("open", "");
      elements.instructionsSection.classList.add("is-hidden");
      elements.instructionsSection.removeAttribute("open");
      elements.iphoneTemplate.innerHTML = buildInstructionMarkup("iphone", null);
      elements.androidTemplate.innerHTML = buildInstructionMarkup("android", null);
      renderLayoutState();
      return;
    }

    const extrasMarkup = parsed && parsed.extras && parsed.extras.length
      ? parsed.extras.map(function (extra, index) {
          return fieldCard(text.extras + " " + (index + 1), extra, text.extras + " " + (index + 1));
        }).join("")
      : "";
    const installLinks = buildInstallLinks(rawText, parsed);
    const installLinkMarkup = installLinks ? buildInstallLinkCard(installLinks) : "";

    const priorityMarkup = [
      priorityFieldCard(text.smdp, parsed ? parsed.smdpAddress : "", text.smdp, "Blank"),
      priorityFieldCard(text.activation, parsed ? parsed.activationCode : "", text.activation, "Blank"),
      priorityFieldCard(text.confirmation, parsed ? parsed.confirmationCode : "", text.confirmation, "Blank")
    ].join("");

    const nonLpaNote = parsed && !parsed.isLpa
      ? '<div class="notice">' + escapeHtml(text.invalidLpa) + "</div>"
      : "";

    elements.results.innerHTML = `
      ${nonLpaNote}
      ${priorityMarkup}
      ${extrasMarkup}
      ${buildRawTextToggle(rawText)}
    `;

    elements.installLinks.innerHTML = installLinkMarkup;

    if (parsed && parsed.isLpa) {
      elements.installLinksSection.classList.remove("is-hidden");
      elements.installLinksSection.removeAttribute("open");
      elements.instructionsSection.classList.remove("is-hidden");
    } else {
      elements.installLinksSection.classList.add("is-hidden");
      elements.installLinksSection.removeAttribute("open");
      elements.instructionsSection.classList.add("is-hidden");
      elements.instructionsSection.removeAttribute("open");
    }

    elements.manualValuesSection.setAttribute("open", "");
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
      setStatus("success", sourceLabel + " ble dekodet lokalt. eSIM-feltene er klare til kopiering.");
      return;
    }

    setStatus("warning", sourceLabel + " ble dekodet lokalt, men samsvarer ikke med forventet eSIM LPA-format.");
  }

  async function readClipboardImage() {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      throw new Error("Det er ikke mulig å lese fra utklippstavlen i denne nettleseren. Bruk Ctrl + V eller velg en fil.");
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
    setStatus("idle", "Dekoder eSIM-QR-koden lokalt i nettleseren...");

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

    decodeImageSource(file, "Bildet");
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
        decodeImageSource(blob, "Bildet fra utklippstavlen");
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
    decodeImageSource(pastedImage, "Bildet fra utklippstavlen");
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
      setStatus("error", "Slipp en bildefil med en QR-kode for å dekode den.");
      return;
    }

    decodeImageSource(droppedImage, "Det innsatte bildet");
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
