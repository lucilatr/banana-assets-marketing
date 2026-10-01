/* =========================================================================
   Banana Airways — Assets de marketing · lógica del microsite
   - Estado clickeable (falta → revisar → hecho → ...), fila verde si "hecho"
   - Botón 📁 por sección (carpeta de Drive con todo el material)
   - Botón "+" por elemento para pegar/editar un link (se guarda en el navegador)
   - Badges de medida punteados → muestran la plantilla a escala
   Todo el estado se guarda en localStorage (este navegador).
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.MATERIALS_CONFIG;
  var LS_STATUS = "banana-assets-status-v1";   // overrides de estado por item
  var LS_LINKS  = "banana-assets-links-v1";    // links agregados con "+"
  var LS_COLLAP = "banana-assets-collapsed-v1";
  var LS_LANG   = "banana-assets-lang";

  var statusOverride = load(LS_STATUS, {});
  var linkStore      = load(LS_LINKS, {});
  var collapsed      = load(LS_COLLAP, {});
  var lang           = localStorage.getItem(LS_LANG) || "es";

  var CYCLE = ["falta", "revisar", "hecho"];

  var UI = {
    es: {
      colEstado: "Estado", colP: "P", colAsset: "Asset", colVideo: "Video",
      colMedida: "Medida / plantilla", colLinks: "Links", colDur: "Duración", colNotas: "Para qué / notas",
      secList: "Lista de assets",
      st: { hecho: "Hecho", falta: "Falta", revisar: "Revisar" },
      done: "hechos", missing: "faltan", review: "para revisar",
      progress: function (d, t) { return d + " de " + t + " assets en Hecho"; },
      openFolder: "Carpeta", noFolder: "Carpeta",
      addLink: "+ link", setLink: "Pegá el link:", editLink: "Editar link (vacío = borrar):",
      pending: "+ agregar link",
      footer: "El estado y los links se guardan en este navegador. Para compartir una versión fija, editá config.js.",
      reset: "Reiniciar todo a los valores del archivo",
      resetConfirm: "¿Borrar todos los cambios de estado y los links agregados a mano?",
      tpl: "Plantilla a escala", close: "Cerrar"
    },
    en: {
      colEstado: "Status", colP: "P", colAsset: "Asset", colVideo: "Video",
      colMedida: "Size / template", colLinks: "Links", colDur: "Length", colNotas: "What for / notes",
      secList: "Asset list",
      st: { hecho: "Done", falta: "Missing", revisar: "Review" },
      done: "done", missing: "missing", review: "to review",
      progress: function (d, t) { return d + " of " + t + " assets marked Done"; },
      openFolder: "Folder", noFolder: "Folder",
      addLink: "+ link", setLink: "Paste the link:", editLink: "Edit link (empty = delete):",
      pending: "+ add link",
      footer: "Status and links are saved in this browser. To share a fixed version, edit config.js.",
      reset: "Reset everything to the file values",
      resetConfirm: "Clear all status changes and manually-added links?",
      tpl: "Template at scale", close: "Close"
    }
  };

  function load(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function L(o) { return (o && (o[lang] || o.es || o.en)) || ""; }
  function keyOf(sId, iId) { return sId + "::" + iId; }
  function statusOf(sId, item) { var k = keyOf(sId, item.id); return statusOverride[k] || item.status || "falta"; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Render ---------------- */
  function render() {
    var t = UI[lang];
    document.documentElement.lang = lang;

    document.getElementById("site-title").textContent = L(CFG.meta.title);
    document.getElementById("site-subtitle").textContent = L(CFG.meta.subtitle);
    document.getElementById("sec-list-title").textContent = t.secList;
    document.getElementById("footer-text").textContent = t.footer;
    document.getElementById("reset-btn").textContent = t.reset;
    document.getElementById("modal-close").textContent = t.close;
    document.getElementById("btn-en").classList.toggle("active", lang === "en");
    document.getElementById("btn-es").classList.toggle("active", lang === "es");

    renderSummary();
    renderLegend();

    var root = document.getElementById("sections");
    root.innerHTML = "";
    CFG.sections.forEach(function (sec) { root.appendChild(renderSection(sec)); });

    renderProgress();
  }

  function counts() {
    var c = { hecho: 0, falta: 0, revisar: 0, total: 0 };
    CFG.sections.forEach(function (s) {
      s.items.forEach(function (it) { c.total++; c[statusOf(s.id, it)]++; });
    });
    return c;
  }

  function renderSummary() {
    var t = UI[lang], c = counts();
    var el = document.getElementById("summary");
    el.innerHTML =
      '<span class="chip hecho">' + t.st.hecho + "</span><span class='cnt'>" + c.hecho + " " + t.done + " ·</span>" +
      '<span class="chip falta">' + t.st.falta + "</span><span class='cnt'>" + c.falta + " " + t.missing + " ·</span>" +
      '<span class="chip revisar">' + t.st.revisar + "</span><span class='cnt'>" + c.revisar + " " + t.review + "</span>";
  }

  function renderLegend() {
    var t = UI[lang], el = document.getElementById("legend"), h = "";
    CFG.meta.priorities.forEach(function (p) {
      h += '<span><span class="pri ' + p.key + '">' + p.key + "</span> " + esc(L(p.label)) + "</span>";
    });
    h += '<span class="hint">' + esc(L(CFG.meta.hint)) + "</span>";
    el.innerHTML = h;
  }

  function renderProgress() {
    var t = UI[lang], c = counts();
    var pct = c.total ? Math.round((c.hecho / c.total) * 100) : 0;
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-label").textContent = t.progress(c.hecho, c.total) + "  ·  " + pct + "%";
  }

  function renderSection(sec) {
    var t = UI[lang];
    var isVideo = sec.kind === "video";
    var done = sec.items.filter(function (it) { return statusOf(sec.id, it) === "hecho"; }).length;
    var isCollapsed = !!collapsed[sec.id];

    var wrap = document.createElement("div");
    wrap.className = "section" + (isCollapsed ? " collapsed" : "");

    // ---- head
    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML =
      '<span class="section-caret">▼</span>' +
      '<h3 class="section-title">' + esc(L(sec.title)) + "</h3>" +
      '<span class="section-count">' + done + "/" + sec.items.length + "</span>";

    var folder = document.createElement("a");
    if (sec.folderUrl) {
      folder.className = "folder-link"; folder.href = sec.folderUrl;
      folder.target = "_blank"; folder.rel = "noopener";
      folder.innerHTML = "📁 " + esc(t.openFolder);
    } else {
      folder.className = "folder-link empty"; folder.href = "javascript:void(0)";
      folder.textContent = "📁 " + t.noFolder;
      folder.addEventListener("click", function (e) {
        e.stopPropagation();
        promptFolder(sec);
      });
    }
    folder.addEventListener("click", function (e) { e.stopPropagation(); });
    head.appendChild(folder);
    head.addEventListener("click", function () {
      collapsed[sec.id] = !collapsed[sec.id]; save(LS_COLLAP, collapsed); render();
    });
    wrap.appendChild(head);

    // ---- table
    var table = document.createElement("table");
    var thead = "<thead><tr>" +
      '<th class="col-estado">' + t.colEstado + "</th>" +
      '<th class="col-p">' + t.colP + "</th>" +
      "<th>" + (isVideo ? t.colVideo : t.colAsset) + "</th>" +
      (isVideo ? '<th class="col-dur">' + t.colDur + "</th><th>" + t.colNotas + "</th>"
               : '<th class="col-medida">' + t.colMedida + "</th>") +
      '<th class="col-links">' + t.colLinks + "</th>" +
      "</tr></thead>";
    var tbody = document.createElement("tbody");

    sec.items.forEach(function (it) {
      tbody.appendChild(renderRow(sec, it, isVideo));
    });

    table.innerHTML = thead;
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
    btn.title = lang === "es" ? "Clic para cambiar el estado" : "Click to change status";
    btn.addEventListener("click", function () {
      var k = keyOf(sec.id, it.id);
      var cur = statusOf(sec.id, it);
      var next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
      statusOverride[k] = next; save(LS_STATUS, statusOverride); render();
    });
    tdSt.appendChild(btn);
    tr.appendChild(tdSt);

    // P
    var tdP = document.createElement("td");
    tdP.className = "p-cell " + it.p;
    tdP.textContent = it.p;
    tr.appendChild(tdP);

    // Asset / Video
    var tdA = document.createElement("td");
    tdA.innerHTML = '<p class="asset-title">' + esc(L(it.title)) + "</p>" +
      (L(it.note) ? '<p class="asset-note">' + esc(L(it.note)) + "</p>" : "");
    tr.appendChild(tdA);

    if (isVideo) {
      var tdDur = document.createElement("td");
      tdDur.innerHTML = it.duration ? '<span class="dur">' + esc(it.duration) + "</span>" : "";
      tr.appendChild(tdDur);
      // notas ya van en la columna Asset? No: en videos, Asset=Video (title+?), notas aparte.
      // Movemos la nota a la columna notas:
      var tdNotas = document.createElement("td");
      tdNotas.innerHTML = L(it.note) ? '<p class="asset-note">' + esc(L(it.note)) + "</p>" : "";
      // quitar la nota duplicada del título
      tdA.innerHTML = '<p class="asset-title">' + esc(L(it.title)) + "</p>";
      tr.appendChild(tdNotas);
    } else {
      var tdM = document.createElement("td");
      tdM.appendChild(renderMedida(it.medida, L(it.title)));
      tr.appendChild(tdM);
    }

    // Links
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
      tok = tok.trim();
      if (!tok) return;
      var span = document.createElement("span");
      var m = tok.match(/^(\d+)[×x](\d+)$/);
      if (m) {
        span.className = "mbadge dim";
        span.textContent = tok;
        span.addEventListener("click", function () {
          openTemplate(parseInt(m[1], 10), parseInt(m[2], 10), titleForModal);
        });
      } else {
        span.className = "mbadge plain";
        span.textContent = tok;
      }
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
      var row = document.createElement("span");
      row.className = "link-row";
      if (url) {
        var a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = L(lk.label);
        if (custom) a.className = "link-custom";
        row.appendChild(a);
        var edit = document.createElement("button");
        edit.className = "link-edit"; edit.textContent = "✎";
        edit.title = lang === "es" ? "Editar link" : "Edit link";
        edit.addEventListener("click", function () { editCustomLink(storeKey, t); });
        if (!lk.url) row.appendChild(edit);   // solo editable si no viene fijo del config
      } else {
        var pend = document.createElement("button");
        pend.className = "link-pending";
        pend.textContent = L(lk.label) + " ·+";
        pend.title = t.setLink;
        pend.addEventListener("click", function () { editCustomLink(storeKey, t); });
        row.appendChild(pend);
      }
      box.appendChild(row);
    });

    // Botón "+" para agregar un link libre (elemento suelto dentro del grupo)
    var freeKey = keyOf(sec.id, it.id) + "::free";
    if (linkStore[freeKey]) {
      var frow = document.createElement("span");
      frow.className = "link-row";
      var fa = document.createElement("a");
      fa.href = linkStore[freeKey]; fa.target = "_blank"; fa.rel = "noopener";
      fa.className = "link-custom"; fa.textContent = "🔗 " + (lang === "es" ? "link" : "link");
      frow.appendChild(fa);
      var fe = document.createElement("button");
      fe.className = "link-edit"; fe.textContent = "✎";
      fe.addEventListener("click", function () { editCustomLink(freeKey, t); });
      frow.appendChild(fe);
      box.appendChild(frow);
    } else {
      var add = document.createElement("button");
      add.className = "add-link"; add.textContent = t.pending;
      add.addEventListener("click", function () { editCustomLink(freeKey, t); });
      box.appendChild(add);
    }

    return box;
  }

  function editCustomLink(storeKey, t) {
    var cur = linkStore[storeKey] || "";
    var val = window.prompt(cur ? t.editLink : t.setLink, cur);
    if (val === null) return;
    val = val.trim();
    if (val) linkStore[storeKey] = val; else delete linkStore[storeKey];
    save(LS_LINKS, linkStore); render();
  }

  function promptFolder(sec) {
    var t = UI[lang];
    var cur = linkStore["folder::" + sec.id] || "";
    var val = window.prompt(lang === "es"
      ? "Link de la carpeta de material de esta sección:"
      : "Folder link for this section's material:", cur);
    if (val === null) return;
    val = val.trim();
    if (val) { sec.folderUrl = val; linkStore["folder::" + sec.id] = val; }
    else { delete linkStore["folder::" + sec.id]; }
    save(LS_LINKS, linkStore); render();
  }

  /* ---------------- Template modal ---------------- */
  function openTemplate(w, h, title) {
    var t = UI[lang];
    document.getElementById("modal-title").textContent = t.tpl + " · " + title + "  (" + w + "×" + h + ")";
    var maxW = Math.min(window.innerWidth * 0.8, 760);
    var maxH = Math.min(window.innerHeight * 0.6, 520);
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

  document.getElementById("modal-close").addEventListener("click", closeTemplate);
  document.getElementById("modal-back").addEventListener("click", function (e) {
    if (e.target === this) closeTemplate();
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    if (!window.confirm(UI[lang].resetConfirm)) return;
    statusOverride = {}; linkStore = {}; collapsed = {};
    save(LS_STATUS, statusOverride); save(LS_LINKS, linkStore); save(LS_COLLAP, collapsed);
    render();
  });

  // restaurar carpetas guardadas a mano
  CFG.sections.forEach(function (s) {
    if (!s.folderUrl && linkStore["folder::" + s.id]) s.folderUrl = linkStore["folder::" + s.id];
  });

  render();
})();
