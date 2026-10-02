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
  var LS_PRIO   = "banana-assets-prio-v1";
  var LS_ASSIGN = "banana-assets-assign-v1";
  var LS_FILTER = "banana-assets-filter-v1";
  var LS_FMODE  = "banana-assets-filtermode-v1";
  var LS_PSEL   = "banana-assets-personsel-v1";
  var LS_COLLAP = "banana-assets-collapsed-v1";
  var LS_LANG   = "banana-assets-lang";
  var LS_TOKEN  = "banana-assets-gh-token";
  var LS_SHA    = "banana-assets-data-sha";

  var statusOverride = load(LS_STATUS, {});
  var linkStore      = load(LS_LINKS, {});
  var noteStore      = load(LS_NOTES, {});   // notas "qué hay que actualizar" por item
  var prioOverride   = load(LS_PRIO, {});    // prioridad cambiada por item (P1/P2/P3)
  var assignStore    = load(LS_ASSIGN, {});  // personas asignadas por item (array de nombres)
  var hiddenStatus   = load(LS_FILTER, {});  // estados ocultos por el filtro (solo vista local)
  var filterMode     = localStorage.getItem(LS_FMODE) || "estado";  // "estado" | "persona"
  var personSelected = load(LS_PSEL, {});    // personas elegidas en el filtro por persona
  var collapsed      = load(LS_COLLAP, {});
  var lang           = localStorage.getItem(LS_LANG) || "es";

  var mode = new URLSearchParams(location.search).has("edit") ? "edit" : "read";
  var dirty = false;   // hay cambios sin guardar en GitHub
  var searchQ = "";    // texto del buscador (no se guarda, es de la sesión)

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
      noteTitle: "Nota", notePlaceholder: "Escribí una nota…",
      noteSave: "Guardar nota", assignTitle: "Asignar a",
      filterHide: "Clic para ocultar este estado", filterShow: "Clic para volver a mostrarlo",
      filterEmpty: "No hay ítems para mostrar con el filtro actual.",
      filterBy: "Filtrar por:", byStatus: "Estado", byPerson: "Persona",
      filterClear: "Limpiar filtros", filterClearTip: "Quita todos los filtros (estado y persona)",
      tlTitle: "Línea de tiempo", tlPending: "Pendientes de generar:", tlToday: "Hoy", tlTbd: "a definir",
      searchPlaceholder: "Buscar tarea…", exportBtn: "⬇️ Exportar tareas",
      exportTitle: "BANANA AIRWAYS — Lista de tareas", exportSub: "Filtro:",
      exportCount: "tareas", exportAll: "todas", exportExcept: "sin", exportEmptyAlert: "No hay tareas para exportar con el filtro actual."
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
      noteTitle: "Note", notePlaceholder: "Write a note…",
      noteSave: "Save note", assignTitle: "Assign to",
      filterHide: "Click to hide this status", filterShow: "Click to show it again",
      filterEmpty: "No items to show with the current filter.",
      filterBy: "Filter by:", byStatus: "Status", byPerson: "Assigned",
      filterClear: "Clear filters", filterClearTip: "Remove all filters (status and person)",
      tlTitle: "Timeline", tlPending: "Left to create:", tlToday: "Today", tlTbd: "TBD",
      searchPlaceholder: "Search task…", exportBtn: "⬇️ Export tasks",
      exportTitle: "BANANA AIRWAYS — Task list", exportSub: "Filter:",
      exportCount: "tasks", exportAll: "all", exportExcept: "except", exportEmptyAlert: "No tasks to export with the current filter."
    }
  };

  function load(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function L(o) { return (o && (o[lang] || o.es || o.en)) || ""; }
  function keyOf(sId, iId) { return sId + "::" + iId; }
  function statusOf(sId, it) { return statusOverride[keyOf(sId, it.id)] || it.status || "falta"; }
  function priorityOf(sId, it) { return prioOverride[keyOf(sId, it.id)] || it.p || "P1"; }
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

    var si = document.getElementById("search-input");
    si.placeholder = t.searchPlaceholder;
    if (si.value !== searchQ) si.value = searchQ;
    document.getElementById("search-clear").parentNode.classList.toggle("has", !!searchQ);
    document.getElementById("btn-export").textContent = t.exportBtn;

    renderFilterBar();
    renderTimeline();
    renderSectionsOnly();
  }

  // Redibuja solo las secciones + progreso (sin tocar el buscador → no pierde foco).
  function renderSectionsOnly() {
    var root = document.getElementById("sections");
    root.innerHTML = "";
    CFG.sections.forEach(function (sec) { var el = renderSection(sec); if (el) root.appendChild(el); });
    if (!root.children.length) {
      root.innerHTML = '<p class="empty-filter">' + UI[lang].filterEmpty + "</p>";
    }
    renderProgress();
  }

  function counts() {
    var c = { hecho: 0, falta: 0, revisar: 0, actualizar: 0, total: 0 };
    CFG.sections.forEach(function (s) {
      s.items.forEach(function (it) { c.total++; c[statusOf(s.id, it)]++; });
    });
    return c;
  }

  // ¿coincide con el texto buscado? (título es/en, nota del asset, nota manual, personas)
  function matchesSearch(sec, it) {
    if (!searchQ) return true;
    var k = keyOf(sec.id, it.id);
    var hay = [
      it.title && it.title.es, it.title && it.title.en,
      it.note && it.note.es, it.note && it.note.en,
      noteStore[k] || "",
      (assignStore[k] || []).join(" "),
      L(sec.title)
    ].join(" ").toLowerCase();
    return searchQ.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  // ¿se ve este item? Se combinan TODOS los filtros a la vez (búsqueda Y estado Y persona).
  function itemVisible(sec, it) {
    if (!matchesSearch(sec, it)) return false;
    // Estado: ocultar los estados marcados
    if (hiddenStatus[statusOf(sec.id, it)]) return false;
    // Persona: si hay personas elegidas, el item tiene que estar asignado a alguna
    var sel = (CFG.meta.people || []).filter(function (n) { return personSelected[n]; });
    if (sel.length) {
      var assigned = assignStore[keyOf(sec.id, it.id)] || [];
      if (!assigned.some(function (n) { return personSelected[n]; })) return false;
    }
    return true;
  }

  function renderFilterBar() {
    var t = UI[lang];
    var bar = document.getElementById("filterbar");
    bar.innerHTML = "";

    // --- Fila Estado ---
    var rowStatus = document.createElement("div");
    rowStatus.className = "filter-row";
    var labS = document.createElement("span");
    labS.className = "filter-label"; labS.textContent = t.byStatus + ":";
    rowStatus.appendChild(labS);
    ["hecho", "actualizar", "revisar", "falta"].forEach(function (k) {
      var b = document.createElement("button");
      b.className = "filter-chip" + (hiddenStatus[k] ? " off" : "");
      b.title = hiddenStatus[k] ? t.filterShow : t.filterHide;
      b.innerHTML = '<span class="chip ' + k + '">' + t.st[k] + "</span>" +
                    (hiddenStatus[k] ? '<span class="eye">🚫</span>' : "");
      b.addEventListener("click", function () {
        if (hiddenStatus[k]) delete hiddenStatus[k]; else hiddenStatus[k] = true;
        save(LS_FILTER, hiddenStatus); render();
      });
      rowStatus.appendChild(b);
    });
    bar.appendChild(rowStatus);

    // --- Fila Persona / Asignado ---
    var rowPers = document.createElement("div");
    rowPers.className = "filter-row";
    var labP = document.createElement("span");
    labP.className = "filter-label"; labP.textContent = t.byPerson + ":";
    rowPers.appendChild(labP);
    (CFG.meta.people || []).forEach(function (name) {
      var on = !!personSelected[name];
      var b = document.createElement("button");
      b.className = "person-chip" + (on ? " on" : "");
      b.innerHTML = '<span class="assign-chip" style="background:' + colorFor(name) + '">' +
                    initials(name).toUpperCase() + "</span><span>" + esc(name) + "</span>";
      b.addEventListener("click", function () {
        if (personSelected[name]) delete personSelected[name]; else personSelected[name] = true;
        save(LS_PSEL, personSelected); render();
      });
      rowPers.appendChild(b);
    });
    bar.appendChild(rowPers);

    // "Limpiar filtros" borra TODO (estado + persona) de una sola vez
    var anyActive = Object.keys(hiddenStatus).length ||
      (CFG.meta.people || []).filter(function (n) { return personSelected[n]; }).length;
    if (anyActive) {
      var clr = document.createElement("button");
      clr.className = "filter-clear"; clr.textContent = t.filterClear;
      clr.title = t.filterClearTip;
      clr.addEventListener("click", function () {
        hiddenStatus = {}; personSelected = {};
        save(LS_FILTER, hiddenStatus); save(LS_PSEL, personSelected);
        render();
      });
      bar.appendChild(clr);
    }
  }

  // Cuenta pendientes (no "hecho") por prioridad
  function pendingByPriority() {
    var c = { P1: 0, P2: 0, P3: 0 };
    CFG.sections.forEach(function (s) {
      s.items.forEach(function (it) {
        if (statusOf(s.id, it) === "hecho") return;
        var p = priorityOf(s.id, it);
        if (c[p] !== undefined) c[p]++;
      });
    });
    return c;
  }

  function fmtDate(iso) {
    var p = iso.split("-");
    var months = (lang === "es")
      ? ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return parseInt(p[2], 10) + " " + months[parseInt(p[1], 10) - 1];
  }
  function dayMs(iso) { var p = iso.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function todayMs() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }

  function renderTimeline() {
    var t = UI[lang], tl = CFG.meta.timeline;
    var box = document.getElementById("timeline");
    if (!tl || !tl.milestones) { box.innerHTML = ""; return; }

    var pend = pendingByPriority();
    var start = dayMs(tl.start), end = dayMs(tl.end), span = Math.max(1, end - start);
    function pct(ms) { return Math.max(0, Math.min(100, ((ms - start) / span) * 100)); }

    var h = '<div class="tl-head">' +
      '<span class="tl-title">🗺️ ' + t.tlTitle + "</span>" +
      '<span class="tl-prios">' + t.tlPending + " " +
        '<span class="pri-count p1">P1 ×' + pend.P1 + "</span>" +
        '<span class="pri-count p2">P2 ×' + pend.P2 + "</span>" +
        '<span class="pri-count p3">P3 ×' + pend.P3 + "</span>" +
      "</span></div>";

    // track con "hoy" + hitos
    var tms = todayMs();
    h += '<div class="tl-track">';
    if (tms >= start && tms <= end) {
      h += '<div class="tl-today" style="left:' + pct(tms) + '%"><span>' + t.tlToday + "</span></div>";
    }
    tl.milestones.forEach(function (m) {
      h += '<div class="tl-dot ' + (m.type || "") + (m.tbd ? " tbd" : "") + '" style="left:' + pct(dayMs(m.date)) + '%" title="' + esc(L(m.label)) + '"></div>';
    });
    h += "</div>";

    // lista de hitos
    h += '<ul class="tl-list">';
    tl.milestones.forEach(function (m) {
      h += '<li class="tl-item ' + (m.type || "") + (m.tbd ? " tbd" : "") + '">' +
        '<span class="tl-date">' + fmtDate(m.date) + "</span>" +
        '<span class="tl-label">' + esc(L(m.label)) + (m.tbd ? ' <span class="tl-tbd">' + t.tlTbd + "</span>" : "") + "</span>" +
      "</li>";
    });
    h += "</ul>";

    box.innerHTML = h;
  }

  function renderProgress() {
    var c = counts();
    var pct = c.total ? Math.round((c.hecho / c.total) * 100) : 0;
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-label").textContent = UI[lang].progress(c.hecho, c.total) + "  ·  " + pct + "%";
  }

  // ---- Exportar tareas (formato WhatsApp, según el filtro/búsqueda actual) ----
  // *Título de sección* en negrita; cada tarea como viñeta "- ..."; ordenadas por
  // prioridad (P1→P2→P3). No se muestra la prioridad, ni el estado, ni los asignados.
  function buildExportText() {
    var t = UI[lang];
    var prioRank = { P1: 1, P2: 2, P3: 3 };
    var lines = ["*" + t.exportTitle + "*", ""];
    CFG.sections.forEach(function (sec) {
      var vis = sec.items.filter(function (it) { return itemVisible(sec, it); });
      if (!vis.length) return;
      vis = vis.slice().sort(function (a, b) {
        var da = statusOf(sec.id, a) === "hecho", db = statusOf(sec.id, b) === "hecho";
        if (da !== db) return da ? 1 : -1;                 // hechos al final
        return (prioRank[priorityOf(sec.id, a)] || 9) - (prioRank[priorityOf(sec.id, b)] || 9);
      });
      lines.push("*" + L(sec.title) + "*");
      vis.forEach(function (it) { lines.push("- " + L(it.title)); });
      lines.push("");
    });
    return lines.join("\n").trim() + "\n";
  }

  function exportTasks() {
    var text = buildExportText();
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "banana-tareas.txt";
    document.body.appendChild(a); a.click(); a.remove();
  }

  function exportFilterDesc() {
    var t = UI[lang], parts = [];
    if (searchQ) parts.push('"' + searchQ + '"');
    if (filterMode === "persona") {
      var sel = (CFG.meta.people || []).filter(function (n) { return personSelected[n]; });
      parts.push(t.byPerson + ": " + (sel.length ? sel.join(", ") : t.exportAll));
    } else {
      var hidden = Object.keys(hiddenStatus);
      parts.push(t.byStatus + ": " + (hidden.length
        ? t.exportExcept + " " + hidden.map(function (k) { return t.st[k]; }).join(", ")
        : t.exportAll));
    }
    return parts.join(" · ");
  }

  function renderSection(sec) {
    var t = UI[lang];
    var isVideo = sec.kind === "video";
    var visible = sec.items.filter(function (it) { return itemVisible(sec, it); });
    if (visible.length === 0) return null;    // toda la sección filtrada → no se muestra
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
    visible.forEach(function (it) { tbody.appendChild(renderRow(sec, it, isVideo)); });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function renderRow(sec, it, isVideo) {
    var t = UI[lang];
    var st = statusOf(sec.id, it);
    var tr = document.createElement("tr");
    tr.className = (st === "hecho") ? "hecho" : "";

    // Estado (con la nota "qué actualizar" a la izquierda del chip)
    var tdSt = document.createElement("td");
    tdSt.className = "estado-cell";
    var naf = renderNoteAffordance(sec, it, st);
    if (naf) tdSt.appendChild(naf);
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

    // P (desplegable en edición, texto en vista pública). Si está Hecho, no lleva prioridad.
    var pr = priorityOf(sec.id, it);
    var tdP = document.createElement("td");
    if (st === "hecho") {
      tdP.className = "p-cell"; tdP.innerHTML = "";
      tr.appendChild(tdP);
    } else {
    tdP.className = "p-cell " + pr;
    if (isEdit()) {
      var sel = document.createElement("select");
      sel.className = "p-select " + pr;
      ["P1", "P2", "P3"].forEach(function (p) {
        var o = document.createElement("option");
        o.value = p; o.textContent = p; if (p === pr) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () {
        prioOverride[keyOf(sec.id, it.id)] = sel.value; markDirty(); render();
      });
      tdP.appendChild(sel);
    } else {
      tdP.textContent = pr;
    }
    tr.appendChild(tdP);
    }

    // Asset / Video
    var tdA = document.createElement("td");
    var optTag = it.optional ? '<span class="opt-tag">' + t.optional + "</span>" : "";
    tdA.innerHTML = '<p class="asset-title">' + esc(L(it.title)) + optTag + "</p>";
    if (!isVideo && L(it.note)) tdA.innerHTML += '<p class="asset-note">' + esc(L(it.note)) + "</p>";
    var asg = renderAssignees(sec, it, st);
    if (asg) tdA.appendChild(asg);
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
    return { status: statusOverride, priority: prioOverride, links: linkStore, notes: noteStore, assign: assignStore, updated: new Date().toISOString() };
  }

  function applyData(d) {
    if (!d) return;
    if (d.status && typeof d.status === "object") { statusOverride = d.status; save(LS_STATUS, statusOverride); }
    if (d.priority && typeof d.priority === "object") { prioOverride = d.priority; save(LS_PRIO, prioOverride); }
    if (d.links  && typeof d.links  === "object") { linkStore = d.links; save(LS_LINKS, linkStore); }
    if (d.notes  && typeof d.notes  === "object") { noteStore = d.notes; save(LS_NOTES, noteStore); }
    if (d.assign && typeof d.assign === "object") { assignStore = d.assign; save(LS_ASSIGN, assignStore); }
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
    save(LS_STATUS, statusOverride); save(LS_PRIO, prioOverride); save(LS_LINKS, linkStore); save(LS_NOTES, noteStore); save(LS_ASSIGN, assignStore);
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

  /* ---------------- Asignación de personas ---------------- */
  var ASSIGN_COLORS = ["#d98324", "#2fa360", "#5b53c7", "#c0392b", "#0e7c86", "#b8860b"];
  function initials(name) {
    var p = String(name).trim().split(/\s+/);
    return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || "");
  }
  function colorFor(name) {
    var people = (CFG.meta.people || []);
    var i = people.indexOf(name);
    if (i < 0) { i = 0; for (var k = 0; k < name.length; k++) i += name.charCodeAt(k); }
    return ASSIGN_COLORS[i % ASSIGN_COLORS.length];
  }
  function fillAssignChips(chips, key) {
    chips.innerHTML = "";
    (assignStore[key] || []).forEach(function (name) {
      var c = document.createElement("span");
      c.className = "assign-chip";
      c.style.background = colorFor(name);
      c.textContent = initials(name).toUpperCase();
      c.title = name;
      chips.appendChild(c);
    });
  }
  // Aparece cuando el item está en Actualizar / Revisar / Falta (o ya tiene gente).
  function renderAssignees(sec, it, st) {
    var key = keyOf(sec.id, it.id);
    var eligible = (st === "actualizar" || st === "revisar" || st === "falta");
    var assigned = assignStore[key] || [];
    if (!eligible && assigned.length === 0) return null;
    if (!isEdit() && assigned.length === 0) return null;
    var box = document.createElement("div");
    box.className = "assignees";
    var chips = document.createElement("span");
    chips.className = "assign-chips";
    fillAssignChips(chips, key);
    box.appendChild(chips);
    if (isEdit() && eligible) {
      var add = document.createElement("button");
      add.className = "assign-add";
      add.textContent = assigned.length ? "+" : (lang === "es" ? "+ Asignar" : "+ Assign");
      add.title = lang === "es" ? "Asignar personas" : "Assign people";
      add.addEventListener("click", function (e) { e.stopPropagation(); openAssignPicker(add, key, chips); });
      box.appendChild(add);
    }
    return box;
  }

  function openAssignPicker(anchor, key, chips) {
    var pop = document.getElementById("assign-pop");
    document.getElementById("assign-pop-title").textContent = UI[lang].assignTitle;
    var list = document.getElementById("assign-list");
    list.innerHTML = "";
    (CFG.meta.people || []).forEach(function (name) {
      var assigned = assignStore[key] || [];
      var lbl = document.createElement("label");
      lbl.className = "assign-opt";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = assigned.indexOf(name) !== -1;
      cb.addEventListener("change", function () {
        var arr = (assignStore[key] || []).slice();
        if (cb.checked) { if (arr.indexOf(name) === -1) arr.push(name); }
        else { arr = arr.filter(function (n) { return n !== name; }); }
        if (arr.length) assignStore[key] = arr; else delete assignStore[key];
        markDirty();
        fillAssignChips(chips, key);
      });
      var av = document.createElement("span");
      av.className = "assign-chip"; av.style.background = colorFor(name);
      av.textContent = initials(name).toUpperCase();
      var nm = document.createElement("span"); nm.textContent = name;
      lbl.appendChild(cb); lbl.appendChild(av); lbl.appendChild(nm);
      list.appendChild(lbl);
    });
    pop.classList.add("open");
    positionPop(pop, anchor);
  }
  function closeAssign() { document.getElementById("assign-pop").classList.remove("open"); }

  // posiciona un popover flotante cerca de un ancla, dentro de la pantalla
  function positionPop(pop, anchor) {
    var r = anchor.getBoundingClientRect();
    var w = pop.offsetWidth || 240, h = pop.offsetHeight || 180;
    var left = Math.min(r.left, window.innerWidth - w - 12);
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 6);
    pop.style.left = Math.max(12, left) + "px";
    pop.style.top = top + "px";
  }

  /* ---------------- Nota "qué actualizar" ---------------- */
  // Aparece un ícono cuando el item está en "Actualizar" (o ya tiene nota).
  function renderNoteAffordance(sec, it, st) {
    var key = keyOf(sec.id, it.id);
    var note = noteStore[key] || "";
    var eligible = (st === "actualizar" || st === "revisar" || st === "falta");
    var show = eligible || !!note;
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

  // Buscador
  var searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    searchQ = searchInput.value.trim().toLowerCase();
    document.getElementById("search-clear").parentNode.classList.toggle("has", !!searchQ);
    renderSectionsOnly();
  });
  document.getElementById("search-clear").addEventListener("click", function () {
    searchQ = ""; searchInput.value = ""; searchInput.focus();
    document.getElementById("search-clear").parentNode.classList.remove("has");
    renderSectionsOnly();
  });

  // Exportar tareas según el filtro/búsqueda actual
  document.getElementById("btn-export").addEventListener("click", function () {
    var any = CFG.sections.some(function (s) { return s.items.some(function (it) { return itemVisible(s, it); }); });
    if (!any) { window.alert(UI[lang].exportEmptyAlert); return; }
    exportTasks();
  });

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
  // cerrar los popovers al clickear afuera o con Escape
  document.addEventListener("click", function (e) {
    var cls = e.target.classList || { contains: function () { return false; } };
    var np = document.getElementById("note-pop");
    if (np.classList.contains("open") && !np.contains(e.target) && !cls.contains("note-btn")) closeNote();
    var ap = document.getElementById("assign-pop");
    if (ap.classList.contains("open") && !ap.contains(e.target) && !cls.contains("assign-add")) closeAssign();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeNote(); closeAssign(); closeTemplate(); }
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    if (!window.confirm(UI[lang].resetConfirm)) return;
    statusOverride = {}; prioOverride = {}; linkStore = {}; noteStore = {}; assignStore = {}; collapsed = {};
    save(LS_STATUS, statusOverride); save(LS_PRIO, prioOverride); save(LS_LINKS, linkStore); save(LS_NOTES, noteStore); save(LS_ASSIGN, assignStore); save(LS_COLLAP, collapsed);
    markDirty(); render();
  });

  // Arranque: traer los datos del repo (lo que ve el público) y después dibujar.
  loadFromGitHub(function () { render(); });
})();
