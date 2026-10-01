/* =========================================================================
   Banana Airways — Assets de marketing · lógica del microsite
   - Estados: Falta → Actualizar → Revisar → Hecho (clic para ciclar)
   - Modo EDICIÓN vs SOLO LECTURA (la URL con ?edit = edición)
       · lectura: no se ven los "+ agregar link" vacíos, el estado no se cambia
       · edición: todo editable + botón "Publicar" para bajar un config con los
         links cargados (eso es lo que ve el público cuando lo subís)
   - Botón PDF (imprime / guarda como PDF)
   - Badges de medida punteados → muestran la plantilla a escala
   Estado y links se guardan en localStorage mientras editás; "Publicar" los
   vuelca a config.js para que queden fijos y los vea cualquiera.
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.MATERIALS_CONFIG;
  var LS_STATUS = "banana-assets-status-v1";
  var LS_LINKS  = "banana-assets-links-v1";
  var LS_NOTES  = "banana-assets-notes-v1";
  var LS_COLLAP = "banana-assets-collapsed-v1";
  var LS_LANG   = "banana-assets-lang";
  var LS_TOKEN  = "banana-assets-gh-token";
  var LS_SHA    = "banana-assets-data-sha";

  var statusOverride = load(LS_STATUS, {});
  var linkStore      = load(LS_LINKS, {});
  var noteStore      = load(LS_NOTES, {});   // notas "qué hay que actualizar" por item
  var collapsed      = load(LS_COLLAP, {});
  var lang           = localStorage.getItem(LS_LANG) || "es";

  var mode = new URLSearchParams(location.search).has("edit") ? "edit" : "read";
  var dirty = false;   // hay cambios sin guardar en GitHub

  var CYCLE = ["falta", "actualizar", "revisar", "hecho"];

  var UI = {
    es: {
      colEstado: "Estado", colP: "P", colAsset: "Asset", colVideo: "Video",
      colMedida: "Medida / plantilla", colLinks: "Links", colDur: "Duración", colNotas: "Para qué / notas",
      secList: "Lista de assets",
      st: { hecho: "Hecho", falta: "Falta", revisar: "Revisar", actualizar: "Actualizar" },
      done: "hechos", missing: "faltan", review: "para revisar", update: "para actualizar",
      progress: function (d, t) { return d + " de " + t + " assets en Hecho"; },
      folder: "Carpeta", addLink: "+ agregar link", setLink: "Pegá el link:", editLink: "Editar link (vacío = borrar):",
      optional: "Opcional",
      footer: "Los cambios se guardan en este navegador. Tocá “Publicar” para bajar un config.js con los links cargados y subirlo al repo.",
      reset: "Reiniciar todo a los valores del archivo",
      resetConfirm: "¿Borrar todos los cambios de estado y los links agregados a mano?",
      tpl: "Plantilla a escala", close: "Cerrar",
      modeToEdit: "✏️ Editar", modeToRead: "👁 Vista pública",
      save: "💾 Guardar", saveDirty: "💾 Guardar *", saving: "Guardando…",
      saved: "✓ Guardado. En ~1 minuto se ve en la versión pública.",
      saveErr: "No se pudo guardar: ",
      tokenPrompt: "Pegá tu token de GitHub (se guarda solo en este navegador).\n\nCreá uno en: github.com/settings/tokens → Fine-grained → repo banana-assets-marketing → permiso Contents: Read and write.",
      noChanges: "No hay cambios para guardar.",
      autoIdle: "Autoguardado", autoPending: "Sin guardar…", autoSaving: "Guardando…",
      autoSaved: "✓ Guardado", autoError: "⚠ Error (clic para reintentar)",
      autoTip: "Se guarda solo. Clic para guardar ahora.",
      noteTitle: "Qué hay que actualizar", notePlaceholder: "Escribí acá qué hay que actualizar…",
      noteSave: "Guardar nota"
    },
    en: {
      colEstado: "Status", colP: "P", colAsset: "Asset", colVideo: "Video",
      colMedida: "Size / template", colLinks: "Links", colDur: "Length", colNotas: "What for / notes",
      secList: "Asset list",
      st: { hecho: "Done", falta: "Missing", revisar: "Review", actualizar: "Update" },
      done: "done", missing: "missing", review: "to review", update: "to update",
      progress: function (d, t) { return d + " of " + t + " assets marked Done"; },
      folder: "Folder", addLink: "+ add link", setLink: "Paste the link:", editLink: "Edit link (empty = delete):",
      optional: "Optional",
      footer: "Changes are saved in this browser. Click “Publish” to download a config.js with the links baked in and push it to the repo.",
      reset: "Reset everything to the file values",
      resetConfirm: "Clear all status changes and manually-added links?",
      tpl: "Template at scale", close: "Close",
      modeToEdit: "✏️ Edit", modeToRead: "👁 Public view",
      save: "💾 Save", saveDirty: "💾 Save *", saving: "Saving…",
      saved: "✓ Saved. It shows up in the public version in ~1 minute.",
      saveErr: "Could not save: ",
      tokenPrompt: "Paste your GitHub token (stored only in this browser).\n\nCreate one at: github.com/settings/tokens → Fine-grained → repo banana-assets-marketing → Contents: Read and write.",
      noChanges: "No changes to save.",
      autoIdle: "Autosave", autoPending: "Unsaved…", autoSaving: "Saving…",
      autoSaved: "✓ Saved", autoError: "⚠ Error (click to retry)",
      autoTip: "Saves automatically. Click to save now.",
      noteTitle: "What needs updating", notePlaceholder: "Write what needs updating…",
      noteSave: "Save note"
    }
  };

  function load(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function L(o) { return (o && (o[lang] || o.es || o.en)) || ""; }
  function keyOf(sId, iId) { return sId + "::" + iId; }
  function statusOf(sId, it) { return statusOverride[keyOf(sId, it.id)] || it.status || "falta"; }
  function isEdit() { return mode === "edit"; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Render ---------------- */
  function render() {
    var t = UI[lang];
    document.documentElement.lang = lang;
    document.body.classList.toggle("read", !isEdit());

    document.getElementById("site-title").textContent = L(CFG.meta.title);
    var sub = document.getElementById("site-subtitle");
    sub.textContent = L(CFG.meta.subtitle);
    sub.style.display = L(CFG.meta.subtitle) ? "" : "none";

    document.getElementById("sec-list-title").textContent = t.secList;
    document.getElementById("footer-text").textContent = t.footer;
    document.getElementById("reset-btn").textContent = t.reset;
    document.getElementById("modal-close").textContent = t.close;
    document.getElementById("btn-en").classList.toggle("active", lang === "en");
    document.getElementById("btn-es").classList.toggle("active", lang === "es");
    document.getElementById("btn-mode").textContent = isEdit() ? t.modeToRead : t.modeToEdit;
    document.getElementById("btn-publish").classList.toggle("btn-publish-only", true);
    document.getElementById("btn-publish").style.display = isEdit() ? "" : "none";
    updateSaveBtn();

    renderSummary();
    renderLegend();

    var root = document.getElementById("sections");
    root.innerHTML = "";
    CFG.sections.forEach(function (sec) { root.appendChild(renderSection(sec)); });

    renderProgress();
  }

  function counts() {
    var c = { hecho: 0, falta: 0, revisar: 0, actualizar: 0, total: 0 };
    CFG.sections.forEach(function (s) {
      s.items.forEach(function (it) { c.total++; c[statusOf(s.id, it)]++; });
    });
    return c;
  }

  function renderSummary() {
    var t = UI[lang], c = counts();
    document.getElementById("summary").innerHTML =
      '<span class="chip hecho">' + t.st.hecho + "</span><span class='cnt'>" + c.hecho + " " + t.done + " ·</span>" +
      '<span class="chip actualizar">' + t.st.actualizar + "</span><span class='cnt'>" + c.actualizar + " " + t.update + " ·</span>" +
      '<span class="chip revisar">' + t.st.revisar + "</span><span class='cnt'>" + c.revisar + " " + t.review + " ·</span>" +
      '<span class="chip falta">' + t.st.falta + "</span><span class='cnt'>" + c.falta + " " + t.missing + "</span>";
  }

  function renderLegend() {
    var h = "";
    CFG.meta.priorities.forEach(function (p) {
      h += '<span><span class="pri ' + p.key + '">' + p.key + "</span> " + esc(L(p.label)) + "</span>";
    });
    if (L(CFG.meta.hint)) h += '<span class="hint">' + esc(L(CFG.meta.hint)) + "</span>";
    document.getElementById("legend").innerHTML = h;
  }

  function renderProgress() {
    var c = counts();
    var pct = c.total ? Math.round((c.hecho / c.total) * 100) : 0;
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-label").textContent = UI[lang].progress(c.hecho, c.total) + "  ·  " + pct + "%";
  }

  function renderSection(sec) {
    var t = UI[lang];
    var isVideo = sec.kind === "video";
    var done = sec.items.filter(function (it) { return statusOf(sec.id, it) === "hecho"; }).length;
    var isCollapsed = !!collapsed[sec.id];

    var wrap = document.createElement("div");
    wrap.className = "section" + (isCollapsed ? " collapsed" : "");

    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML =
      '<span class="section-caret">▼</span>' +
      '<h3 class="section-title">' + esc(L(sec.title)) + "</h3>" +
      '<span class="section-count">' + done + "/" + sec.items.length + "</span>";

    var folderUrl = linkStore["folder::" + sec.id] || sec.folderUrl || "";
    if (folderUrl || isEdit()) {
      var folder = document.createElement("a");
      if (folderUrl) {
        folder.className = "folder-link"; folder.href = folderUrl;
        folder.target = "_blank"; folder.rel = "noopener";
        folder.innerHTML = "📁 " + esc(t.folder);
        if (isEdit()) folder.addEventListener("dblclick", function (e) { e.preventDefault(); e.stopPropagation(); promptFolder(sec); });
      } else {
        folder.className = "folder-link empty"; folder.href = "javascript:void(0)";
        folder.textContent = "📁 " + t.folder;
        folder.addEventListener("click", function (e) { e.stopPropagation(); promptFolder(sec); });
      }
      folder.addEventListener("click", function (e) { e.stopPropagation(); });
      head.appendChild(folder);
    }

    head.addEventListener("click", function () {
      collapsed[sec.id] = !collapsed[sec.id]; save(LS_COLLAP, collapsed); render();
    });
    wrap.appendChild(head);

    var table = document.createElement("table");
    table.innerHTML = "<thead><tr>" +
      '<th class="col-estado">' + t.colEstado + "</th>" +
      '<th class="col-p">' + t.colP + "</th>" +
      "<th>" + (isVideo ? t.colVideo : t.colAsset) + "</th>" +
      (isVideo ? '<th class="col-dur">' + t.colDur + "</th><th>" + t.colNotas + "</th>"
               : '<th class="col-medida">' + t.colMedida + "</th>") +
      '<th class="col-links">' + t.colLinks + "</th></tr></thead>";
    var tbody = document.createElement("tbody");
    sec.items.forEach(function (it) { tbody.appendChild(renderRow(sec, it, isVideo)); });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function renderRow(sec, it, isVideo) {
    var t = UI[lang];
    var st = statusOf(sec.id, it);
    var tr = document.createElement("tr");
    tr.className = (st === "hecho") ? "hecho" : "";

    // Estado
    var tdSt = document.createElement("td");
    var btn = document.createElement("button");
    btn.className = "status-btn " + st;
    btn.textContent = t.st[st];
    if (isEdit()) {
      btn.title = lang === "es" ? "Clic para cambiar el estado" : "Click to change status";
      btn.addEventListener("click", function () {
        var k = keyOf(sec.id, it.id);
        statusOverride[k] = CYCLE[(CYCLE.indexOf(st) + 1) % CYCLE.length];
        save(LS_STATUS, statusOverride); markDirty(); render();
      });
    } else {
      btn.disabled = true;
    }
    tdSt.appendChild(btn);
    tr.appendChild(tdSt);

    // P
    var tdP = document.createElement("td");
    tdP.className = "p-cell " + it.p; tdP.textContent = it.p;
    tr.appendChild(tdP);

    // Asset / Video
    var tdA = document.createElement("td");
    var optTag = it.optional ? '<span class="opt-tag">' + t.optional + "</span>" : "";
    tdA.innerHTML = '<p class="asset-title">' + esc(L(it.title)) + optTag + "</p>";
    if (!isVideo && L(it.note)) tdA.innerHTML += '<p class="asset-note">' + esc(L(it.note)) + "</p>";
    var naf = renderNoteAffordance(sec, it, st);
    if (naf) tdA.querySelector(".asset-title").appendChild(naf);
    tr.appendChild(tdA);

    if (isVideo) {
      var tdDur = document.createElement("td");
      tdDur.innerHTML = it.duration ? '<span class="dur">' + esc(it.duration) + "</span>" : "";
      tr.appendChild(tdDur);
      var tdNotas = document.createElement("td");
      tdNotas.innerHTML = L(it.note) ? '<p class="asset-note">' + esc(L(it.note)) + "</p>" : "";
      tr.appendChild(tdNotas);
    } else {
      var tdM = document.createElement("td");
      tdM.appendChild(renderMedida(it.medida, L(it.title)));
      tr.appendChild(tdM);
    }

    var tdL = document.createElement("td");
    tdL.appendChild(renderLinks(sec, it));
    tr.appendChild(tdL);
    return tr;
  }

  function renderMedida(medida, titleForModal) {
    var box = document.createElement("div");
    box.className = "medida";
    if (!medida) return box;
    medida.split("·").forEach(function (tok) {
      tok = tok.trim(); if (!tok) return;
      var span = document.createElement("span");
      var m = tok.match(/^(\d+)[×x](\d+)$/);
      if (m) {
        span.className = "mbadge dim"; span.textContent = tok;
        span.addEventListener("click", function () { openTemplate(+m[1], +m[2], titleForModal); });
      } else { span.className = "mbadge plain"; span.textContent = tok; }
      box.appendChild(span);
    });
    return box;
  }

  function renderLinks(sec, it) {
    var t = UI[lang];
    var box = document.createElement("div");
    box.className = "links";

    (it.links || []).forEach(function (lk, idx) {
      var storeKey = keyOf(sec.id, it.id) + "::link" + idx;
      var url = lk.url || linkStore[storeKey] || "";
      var custom = !lk.url && !!linkStore[storeKey];
      if (!url && !isEdit()) return;               // lectura: ocultar links sin cargar
      var row = document.createElement("span");
      row.className = "link-row";
      if (url) {
        var a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = L(lk.label); if (custom) a.className = "link-custom";
        row.appendChild(a);
        if (isEdit() && !lk.url) row.appendChild(editBtn(storeKey, t));
      } else {
        var pend = document.createElement("button");
        pend.className = "link-pending"; pend.textContent = L(lk.label) + " ·+"; pend.title = t.setLink;
        pend.addEventListener("click", function () { editCustomLink(storeKey, t); });
        row.appendChild(pend);
      }
      box.appendChild(row);
    });

    // link libre (elemento suelto del grupo)
    var freeKey = keyOf(sec.id, it.id) + "::free";
    if (linkStore[freeKey]) {
      var frow = document.createElement("span");
      frow.className = "link-row";
      var fa = document.createElement("a");
      fa.href = linkStore[freeKey]; fa.target = "_blank"; fa.rel = "noopener";
      fa.className = "link-custom"; fa.textContent = "🔗 " + (lang === "es" ? "Material" : "Material");
      frow.appendChild(fa);
      if (isEdit()) frow.appendChild(editBtn(freeKey, t));
      box.appendChild(frow);
    } else if (isEdit()) {
      var add = document.createElement("button");
      add.className = "add-link"; add.textContent = t.addLink;
      add.addEventListener("click", function () { editCustomLink(freeKey, t); });
      box.appendChild(add);
    }
    return box;
  }

  function editBtn(storeKey, t) {
    var b = document.createElement("button");
    b.className = "link-edit"; b.textContent = "✎";
    b.title = lang === "es" ? "Editar link" : "Edit link";
    b.addEventListener("click", function () { editCustomLink(storeKey, t); });
    return b;
  }

  function editCustomLink(storeKey, t) {
    var cur = linkStore[storeKey] || "";
    var val = window.prompt(cur ? t.editLink : t.setLink, cur);
    if (val === null) return;
    val = val.trim();
    if (val) linkStore[storeKey] = val; else delete linkStore[storeKey];
    save(LS_LINKS, linkStore); markDirty(); render();
  }

  function promptFolder(sec) {
    var cur = linkStore["folder::" + sec.id] || sec.folderUrl || "";
    var val = window.prompt(lang === "es"
      ? "Link de la carpeta de material de esta sección:"
      : "Folder link for this section's material:", cur);
    if (val === null) return;
    val = val.trim();
    if (val) linkStore["folder::" + sec.id] = val; else delete linkStore["folder::" + sec.id];
    save(LS_LINKS, linkStore); markDirty(); render();
  }

  /* ---------------- Datos compartidos (GitHub) ---------------- */
  // data.json guarda SOLO lo que cambia: estados + links. La estructura y los
  // textos viven en config.js. Así el público ve lo último que guardaste.
  function currentData() {
    return { status: statusOverride, links: linkStore, notes: noteStore, updated: new Date().toISOString() };
  }

  function applyData(d) {
    if (!d) return;
    if (d.status && typeof d.status === "object") { statusOverride = d.status; save(LS_STATUS, statusOverride); }
    if (d.links  && typeof d.links  === "object") { linkStore = d.links; save(LS_LINKS, linkStore); }
    if (d.notes  && typeof d.notes  === "object") { noteStore = d.notes; save(LS_NOTES, noteStore); }
  }

  // Al abrir: traer data.json del repo (versión pública/última guardada).
  function loadFromGitHub(done) {
    var url = "./" + (CFG.meta.github && CFG.meta.github.path || "data.json") + "?t=" + Date.now();
    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { applyData(d); done(); })
      .catch(function () { done(); });   // local (file://) o sin red → usa localStorage
  }

  function b64(str) { return btoa(unescape(encodeURIComponent(str))); }

  // ----- Auto-guardado -----
  var saveTimer = null;     // debounce
  var savingNow = false;    // hay un PUT en curso
  var saveState = "idle";   // idle | pending | saving | saved | error

  // Pide el token UNA sola vez (queda en el navegador). Si ya está, lo devuelve.
  function ensureToken(interactive) {
    var token = localStorage.getItem(LS_TOKEN) || "";
    if (token) return token;
    if (!interactive) return "";
    token = (window.prompt(UI[lang].tokenPrompt, "") || "").trim();
    if (token) localStorage.setItem(LS_TOKEN, token);
    return token;
  }

  // Marca que hay cambios y programa el guardado automático (sin botón).
  function markDirty() {
    dirty = true;
    save(LS_STATUS, statusOverride); save(LS_LINKS, linkStore); save(LS_NOTES, noteStore);
    scheduleAutosave();
    setSaveState("pending");
  }

  function scheduleAutosave() {
    if (!isEdit()) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { doSave(true); }, 1200);
  }

  // interactive=true → vino de un clic manual (puede pedir el token).
  function doSave(fromAuto) {
    if (!isEdit()) return;
    var gh = CFG.meta.github;
    if (!gh || !gh.owner) return;
    if (savingNow) { scheduleAutosave(); return; }     // reintenta cuando termine

    // Pide el token una sola vez (la primera que haya que guardar). Después queda.
    var token = ensureToken(true);
    if (!token) { setSaveState("pending"); return; }

    savingNow = true; setSaveState("saving");
    var api = "https://api.github.com/repos/" + gh.owner + "/" + gh.repo + "/contents/" + gh.path;
    var headers = { "Authorization": "token " + token, "Accept": "application/vnd.github+json" };
    var content = b64(JSON.stringify(currentData(), null, 2));

    fetch(api + "?ref=" + gh.branch, { headers: headers, cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (meta) {
        var curSha = (meta && meta.sha) || localStorage.getItem(LS_SHA) || "";
        var payload = { message: "Actualizar assets de marketing", content: content, branch: gh.branch };
        if (curSha) payload.sha = curSha;
        return fetch(api, { method: "PUT", headers: headers, body: JSON.stringify(payload) });
      })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (res) {
        savingNow = false;
        if (res.ok) {
          if (res.j && res.j.content && res.j.content.sha) localStorage.setItem(LS_SHA, res.j.content.sha);
          dirty = false; setSaveState("saved");
        } else {
          setSaveState("error");
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem(LS_TOKEN);
            window.alert(UI[lang].saveErr + (res.j && res.j.message ? res.j.message : res.status));
          }
        }
      })
      .catch(function () { savingNow = false; setSaveState("error"); });
  }

  function setSaveState(s) {
    saveState = s;
    var el = document.getElementById("btn-publish");
    if (!el) return;
    var t = UI[lang], map = {
      idle:    t.autoIdle,
      pending: t.autoPending,
      saving:  t.autoSaving,
      saved:   t.autoSaved,
      error:   t.autoError
    };
    el.textContent = map[s] || t.autoIdle;
    el.className = "save-indicator " + s;
  }
  function updateSaveBtn() { setSaveState(saveState); }

  /* ---------------- Nota "qué actualizar" ---------------- */
  // Aparece un ícono cuando el item está en "Actualizar" (o ya tiene nota).
  function renderNoteAffordance(sec, it, st) {
    var key = keyOf(sec.id, it.id);
    var note = noteStore[key] || "";
    var show = (st === "actualizar") || !!note;
    if (!show) return null;
    if (!isEdit() && !note) return null;          // público sin nota → no muestra nada
    var b = document.createElement("button");
    b.className = "note-btn" + (note ? " has" : "");
    b.textContent = note ? "📝" : "✎";
    b.title = note ? note : (lang === "es" ? "Agregar nota" : "Add note");
    b.addEventListener("click", function (e) { e.stopPropagation(); openNotePopover(b, key); });
    return b;
  }

  var curNoteKey = null;
  function openNotePopover(anchor, key) {
    var t = UI[lang];
    curNoteKey = key;
    var pop = document.getElementById("note-pop");
    var ta = document.getElementById("note-text");
    document.getElementById("note-pop-title").textContent = t.noteTitle;
    ta.value = noteStore[key] || "";
    ta.readOnly = !isEdit();
    ta.placeholder = t.notePlaceholder;
    var sv = document.getElementById("note-save");
    sv.style.display = isEdit() ? "" : "none";
    sv.textContent = t.noteSave;
    document.getElementById("note-cancel").textContent = t.close;

    pop.classList.add("open");
    // posicionar cerca del ícono, dentro de la pantalla
    var r = anchor.getBoundingClientRect();
    var w = 270, h = pop.offsetHeight || 170;
    var left = Math.min(r.left, window.innerWidth - w - 12);
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 6);
    pop.style.left = Math.max(12, left) + "px";
    pop.style.top = top + "px";
    if (isEdit()) ta.focus();
  }

  function saveNote() {
    if (curNoteKey === null) return;
    var val = document.getElementById("note-text").value.trim();
    if (val) noteStore[curNoteKey] = val; else delete noteStore[curNoteKey];
    markDirty(); closeNote(); render();
  }
  function closeNote() {
    curNoteKey = null;
    document.getElementById("note-pop").classList.remove("open");
  }

  /* ---------------- Template modal ---------------- */
  function openTemplate(w, h, title) {
    var t = UI[lang];
    document.getElementById("modal-title").textContent = t.tpl + " · " + title + "  (" + w + "×" + h + ")";
    var maxW = Math.min(window.innerWidth * 0.8, 760), maxH = Math.min(window.innerHeight * 0.6, 520);
    var scale = Math.min(maxW / w, maxH / h, 1);
    var box = document.getElementById("tpl-box");
    box.style.width = Math.round(w * scale) + "px";
    box.style.height = Math.round(h * scale) + "px";
    document.getElementById("tpl-label").textContent = w + " × " + h;
    document.getElementById("modal-back").classList.add("open");
  }
  function closeTemplate() { document.getElementById("modal-back").classList.remove("open"); }

  /* ---------------- Controls ---------------- */
  document.getElementById("btn-en").addEventListener("click", function () { setLang("en"); });
  document.getElementById("btn-es").addEventListener("click", function () { setLang("es"); });
  function setLang(l) { lang = l; localStorage.setItem(LS_LANG, l); render(); }

  document.getElementById("btn-pdf").addEventListener("click", function () { window.print(); });
  document.getElementById("btn-publish").addEventListener("click", function () { doSave(false); });
  document.getElementById("btn-publish").title = UI[lang].autoTip;

  document.getElementById("btn-mode").addEventListener("click", function () {
    mode = isEdit() ? "read" : "edit";
    var p = new URLSearchParams(location.search);
    if (mode === "edit") p.set("edit", "1"); else p.delete("edit");
    var qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    render();
  });

  document.getElementById("modal-close").addEventListener("click", closeTemplate);
  document.getElementById("modal-back").addEventListener("click", function (e) { if (e.target === this) closeTemplate(); });

  document.getElementById("note-save").addEventListener("click", saveNote);
  document.getElementById("note-cancel").addEventListener("click", closeNote);
  // cerrar el popover al clickear afuera o con Escape
  document.addEventListener("click", function (e) {
    var pop = document.getElementById("note-pop");
    if (!pop.classList.contains("open")) return;
    if (pop.contains(e.target) || (e.target.classList && e.target.classList.contains("note-btn"))) return;
    closeNote();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeNote(); closeTemplate(); } });

  document.getElementById("reset-btn").addEventListener("click", function () {
    if (!window.confirm(UI[lang].resetConfirm)) return;
    statusOverride = {}; linkStore = {}; noteStore = {}; collapsed = {};
    save(LS_STATUS, statusOverride); save(LS_LINKS, linkStore); save(LS_NOTES, noteStore); save(LS_COLLAP, collapsed);
    markDirty(); render();
  });

  // Arranque: traer los datos del repo (lo que ve el público) y después dibujar.
  loadFromGitHub(function () { render(); });
})();
