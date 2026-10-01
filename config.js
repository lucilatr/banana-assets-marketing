/* =========================================================================
   BANANA AIRWAYS — Assets de marketing (lista para publisher)
   -------------------------------------------------------------------------
   ESTE es el único archivo que editás para cambiar el contenido.
   This is the only file you edit to change the content.

   CADA ITEM / EACH ITEM:
     id      : identificador único dentro de su sección (sin espacios)
     status  : "hecho" | "falta" | "revisar"   (estado inicial; después se
               puede cambiar con un clic en el chip y queda guardado)
     p       : "P1" | "P2" | "P3"               (prioridad)
     title   : { es, en }
     note    : { es, en }  (opcional — texto gris debajo del título)
     medida  : "920×430"  o  "800×450 · 1920×622"  o  "4K · 60fps" / "PDF"...
               (los tokens tipo 1234×567 se vuelven badges punteados
                clickeables que muestran la plantilla a escala)
     duration: "60–75s"   (solo para la sección de videos)
     links   : [ { label:{es,en}, url:"" } ... ]
               (si url está vacío, aparece un botón "+" para pegar el link y
                queda guardado en el navegador)

   CADA SECCIÓN / EACH SECTION:
     id, title:{es,en}, kind:"asset"|"video", folderUrl:"" (carpeta de Drive
     con TODO el material de esa sección — el botón 📁 del encabezado)
   ========================================================================= */

window.MATERIALS_CONFIG = {
  meta: {
    title:    { es: "Banana Airways · Assets de marketing",
                en: "Banana Airways · Marketing assets" },
    subtitle: { es: "", en: "" },
    // Repo donde se guardan los estados/links (botón "Guardar"). El token NO va
    // acá: se pega una vez en el navegador y queda solo en tu máquina.
    github: { owner: "lucilatr", repo: "banana-assets-marketing", branch: "main", path: "data.json" },
    priorities: [
      { key: "P1", label: { es: "Empezar ya", en: "Start now" } },
      { key: "P2", label: { es: "Antes del push de la demo", en: "Before the demo push" } },
      { key: "P3", label: { es: "Después", en: "Later" } }
    ],
    // Personas asignables a tareas en Actualizar / Revisar / Falta (editable).
    people: [
      "JORGE TERESO",
      "FEDERICO CARLINI",
      "FERNANDO MALDONADO",
      "LUCILA TROBBIANI",
      "VALENTIN FRARE",
      "AGUSTIN MARTINEZ"
    ],
    hint: { es: "", en: "" },
    // Línea de tiempo / hoja de ruta (editable). Fechas en formato AAAA-MM-DD.
    timeline: {
      start: "2026-10-01",
      end:   "2026-10-21",
      milestones: [
        { date: "2026-10-07", type: "demo",
          label: { es: "Publicar demo (para testeo de prensa)", en: "Publish demo (for press testing)" } },
        { date: "2026-10-08", type: "press",
          label: { es: "La prensa testea la demo", en: "Press tests the demo" } },
        { date: "2026-10-19", type: "launch", tbd: true,
          label: { es: "Lanzamiento de la demo + anuncio — ¿19 oct o antes? A definir",
                    en: "Demo launch + announcement — Oct 19 or earlier? TBD" } }
      ]
    }
  },

  sections: [
    /* ------------------------------------------------------------------ */
    { id: "captura", kind: "asset",
      title: { es: "Captura", en: "Capture" },
      folderUrl: "",
      items: [
        { id: "build", status: "hecho", p: "P1",
          title: { es: "Build de captura", en: "Capture build" },
          note: { es: "Cualquier build con el modo desarrollador prendido (Settings ▸ Game): cámara libre (tecla -), ocultar HUD (F1), sin texto de debug, F9 graba 1080p60 (4K desde el editor). Cámara lenta no hay en el juego: va en edición." , en: "Any build with developer mode on (Settings ▸ Game): free camera (- key), hide HUD (F1), no debug text, F9 records 1080p60 (4K from the editor). There's no slow-motion in the game: it's done in editing." },
          medida: "4K · 60fps", links: [] },
        { id: "clip-library", status: "falta", p: "P1",
          title: { es: "Biblioteca de clips de sesiones de 4 jugadores", en: "4-player session clip library" },
          note: { es: "Etiquetados por evento: bebés, jeringas, avión roto, mutaciones", en: "Tagged by event: babies, syringes, broken plane, mutations" },
          medida: "", links: [] },
        { id: "photo-mode", status: "hecho", p: "P2",
          title: { es: "Modo foto interno", en: "Internal photo mode" },
          note: { es: "Modo desarrollador: cámara libre (-), ocultar HUD (F1), captura PNG (F2), cámara fija al mundo (F3), ragdoll (T). La selfie (P) también tiene cámara fija tipo trípode.", en: "Developer mode: free camera (-), hide HUD (F1), PNG capture (F2), world-locked camera (F3), ragdoll (T). The selfie (P) also has a tripod-style fixed camera." },
          medida: "", links: [] },
        { id: "capture-guide", status: "falta", p: "P2",
          title: { es: "Mini doc / sitio de cómo capturar en el juego", en: "Mini doc / site on how to capture in-game" },
          note: { es: "Documento chico (o mini sitio) que explique cómo captar dentro del juego: controles y presets.", en: "Small doc (or mini-site) explaining how to capture inside the game: controls and presets." },
          medida: "", links: [] },
        { id: "vertical-cam", status: "hecho", p: "P2",
          title: { es: "Preset de cámara vertical", en: "Vertical camera preset" },
          note: { es: "La K graba un .mp4 vertical desde 3 cámaras (POV, selfie, tercera persona); la P las cambia mientras graba.", en: "K records a vertical .mp4 from 3 cameras (POV, selfie, third person); P switches between them while recording." },
          medida: "1080×1920", links: [] }
      ] },

    /* ------------------------------------------------------------------ */
    { id: "steam", kind: "asset",
      title: { es: "Página de Steam", en: "Steam page" },
      folderUrl: "",
      items: [
        { id: "header", status: "hecho", p: "P1", title: { es: "Header capsule", en: "Header capsule" },
          note: { es: "", en: "" }, medida: "920×430",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "small", status: "hecho", p: "P1", title: { es: "Small capsule", en: "Small capsule" },
          note: { es: "", en: "" }, medida: "462×174",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "main", status: "hecho", p: "P1", title: { es: "Main capsule", en: "Main capsule" },
          note: { es: "", en: "" }, medida: "1232×706",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "vertical", status: "hecho", p: "P1", title: { es: "Vertical capsule", en: "Vertical capsule" },
          note: { es: "Subida, 748×896", en: "Uploaded, 748×896" }, medida: "748×896",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "bg", status: "hecho", p: "P2", title: { es: "Fondo de página", en: "Page background" },
          note: { es: "", en: "" }, medida: "1438×810",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "screenshots", status: "hecho", p: "P1", title: { es: "Screenshots", en: "Screenshots" },
          note: { es: "20 en la página", en: "20 on the page" }, medida: "1920×1080",
          links: [ { label: { es: "Ver en Steam", en: "View on Steam" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "gifs", status: "hecho", p: "P1", title: { es: "GIFs de descripción", en: "Description GIFs" },
          note: { es: "4 clips animados en la página", en: "4 animated clips on the page" }, medida: "~600px",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" } ] },
        { id: "lib-capsule", status: "hecho", p: "P1", title: { es: "Library capsule", en: "Library capsule" },
          note: { es: "Subida, 600×900", en: "Uploaded, 600×900" }, medida: "600×900",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "lib-hero", status: "hecho", p: "P1", title: { es: "Library hero", en: "Library hero" },
          note: { es: "Subido, 3840×1240", en: "Uploaded, 3840×1240" }, medida: "3840×1240",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "lib-logo", status: "hecho", p: "P2", title: { es: "Library logo", en: "Library logo" },
          note: { es: "Subido, 1280×714, con transparencia", en: "Uploaded, 1280×714, with transparency" }, medida: "1280×720",
          links: [ { label: { es: "Ver actual", en: "View current" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "demo-page", status: "hecho", p: "P1", title: { es: "Página y capsule de la demo", en: "Demo page & capsule" },
          note: { es: "Armada en la app de la demo (4900690) con las capsules, screenshots, descripción y trailer del juego. Todavía no es pública: falta poner el build live y mandarla a revisión.", en: "Built in the demo app (4900690) with the game's capsules, screenshots, description and trailer. Not public yet: still need to set the build live and submit it for review." }, medida: "920×430",
          links: [ { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "event-art", status: "falta", p: "P2", title: { es: "Arte de eventos y anuncios", en: "Event & announcement art" },
          note: { es: "", en: "" }, medida: "800×450 · 1920×622",
          links: [ { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] }
      ] },

    /* ------------------------------------------------------------------ */
    { id: "keyart", kind: "asset",
      title: { es: "Key art y marca", en: "Key art & brand" },
      folderUrl: "",
      items: [
        { id: "keyart-main", status: "revisar", p: "P1", title: { es: "Key art principal", en: "Main key art" },
          note: { es: "Master de las capsules", en: "Capsule master" }, medida: "3840×2160", links: [] },
        { id: "logo-versions", status: "hecho", p: "P1", title: { es: "Versiones de logo", en: "Logo versions" },
          note: { es: "Apilado, horizontal y monograma BA, cada uno en color, negro y blanco. SVG + PNG.", en: "Stacked, horizontal and BA monogram, each in color, black and white. SVG + PNG." }, medida: "SVG + PNG", links: [] },
        { id: "renders", status: "hecho", p: "P2", title: { es: "Renders de personajes y pasajeros", en: "Character & passenger renders" },
          note: { es: "35 renders de los modelos del juego: 15 skins, 3 pilotos, 6 pasajeros, 11 peligros (bebé, mutante, caníbal, tornado, pájaros, abejas, misil...).", en: "35 renders of the in-game models: 15 skins, 3 pilots, 6 passengers, 11 hazards (baby, mutant, cannibal, tornado, birds, bees, missile...)." }, medida: "2048×2048", links: [] },
        { id: "brand-guide", status: "hecho", p: "P2", title: { es: "Guía de marca", en: "Brand guide" },
          note: { es: "PDF de 9 páginas: uso del logo, colores, tipografías (Teko + Montserrat), personajes, tono.", en: "9-page PDF: logo usage, colors, typography (Teko + Montserrat), characters, tone." }, medida: "PDF", links: [] },
        { id: "wallpapers", status: "falta", p: "P3", title: { es: "Wallpapers", en: "Wallpapers" },
          note: { es: "", en: "" }, medida: "3840×2160 · 1290×2796", links: [] }
      ] },

    /* ------------------------------------------------------------------ */
    { id: "sitio", kind: "asset",
      title: { es: "Sitio y prensa", en: "Site & press" },
      folderUrl: "",
      items: [
        { id: "website", status: "actualizar", p: "P1", title: { es: "Sitio web", en: "Website" },
          note: { es: "", en: "" }, medida: "",
          links: [ { label: { es: "bananaairways.com", en: "bananaairways.com" }, url: "" } ] },
        { id: "presskit-page", status: "falta", p: "P1", title: { es: "Página de press kit y descarga", en: "Press kit & download page" },
          note: { es: "bananaairways.com/press todavía no existe", en: "bananaairways.com/press doesn't exist yet" }, medida: "", links: [] },
        { id: "descriptions", status: "hecho", p: "P1", title: { es: "Descripción del juego en 3 largos", en: "Game description in 3 lengths" },
          note: { es: "Una línea en el sitio, 50 palabras en la descripción corta de Steam, 251 en About this game", en: "One line on the site, 50 words in Steam's short description, 251 in About this game." }, medida: "", links: [] },
        { id: "factsheet", status: "falta", p: "P1", title: { es: "Ficha técnica", en: "Fact sheet" },
          note: { es: "", en: "" }, medida: "", links: [] },
        { id: "team-photo", status: "falta", p: "P3", title: { es: "Foto del equipo y bios", en: "Team photo & bios" },
          note: { es: "", en: "" }, medida: "", links: [] }
      ] },

    /* ------------------------------------------------------------------ */
    { id: "redes", kind: "asset",
      title: { es: "Redes y comunidad", en: "Social & community" },
      folderUrl: "",
      items: [
        { id: "profiles", status: "hecho", p: "P1", title: { es: "Perfiles en redes", en: "Social profiles" },
          note: { es: "Discord · TikTok · YouTube · Instagram · X", en: "Discord · TikTok · YouTube · Instagram · X" }, medida: "",
          links: [ { label: { es: "Discord", en: "Discord" }, url: "" }, { label: { es: "TikTok", en: "TikTok" }, url: "" }, { label: { es: "YouTube", en: "YouTube" }, url: "" }, { label: { es: "Instagram", en: "Instagram" }, url: "" }, { label: { es: "X", en: "X" }, url: "" }, { label: { es: "Especificación oficial", en: "Official spec" }, url: "" } ] },
        { id: "placa-final", status: "falta", p: "P1", title: { es: "Placa final", en: "End card" },
          note: { es: "A generar", en: "To generate" }, medida: "1080×1920", links: [] },
        { id: "discord-emotes", status: "falta", p: "P2", optional: true, title: { es: "Emotes y stickers de Discord", en: "Discord emotes & stickers" },
          note: { es: "", en: "" }, medida: "128×128 · 320×320", links: [] },
        { id: "giphy", status: "falta", p: "P3", optional: true, title: { es: "Pack de GIFs / stickers para GIPHY", en: "GIF / sticker pack for GIPHY" },
          note: { es: "", en: "" }, medida: "", links: [] }
      ] },

    /* ------------------------------------------------------------------ */
    { id: "creadores", kind: "asset",
      title: { es: "Creadores y demo", en: "Creators & demo" },
      folderUrl: "",
      items: [
        { id: "creator-list", status: "falta", p: "P1", title: { es: "Lista de creadores", en: "Creator list" },
          note: { es: "50–100 canales de co-op y comedia", en: "50–100 co-op & comedy channels" }, medida: "", links: [] },
        { id: "creator-onepager", status: "falta", p: "P1", title: { es: "One-pager para creadores", en: "Creator one-pager" },
          note: { es: "", en: "" }, medida: "PDF", links: [] },
        { id: "wishlist-screen", status: "falta", p: "P1", title: { es: "Pantalla de wishlist al terminar la demo", en: "End-of-demo wishlist screen" },
          note: { es: "", en: "" }, medida: "1920×1080", links: [] },
        { id: "wishlist-button", status: "falta", p: "P1", title: { es: "Botón de wishlist en el menú principal", en: "Wishlist button in main menu" },
          note: { es: "", en: "" }, medida: "", links: [] }
      ] },

    /* ------------------------------------------------------------------ */
    { id: "videos", kind: "video",
      title: { es: "Videos para preparar", en: "Videos to prepare" },
      folderUrl: "",
      items: [
        { id: "main-trailer", status: "hecho", p: "P1", title: { es: "Trailer principal", en: "Main trailer" },
          duration: "", note: { es: 'El "Announcement Trailer" está en la página de Steam. Ahí arranca sin sonido, así que tiene que funcionar sin audio.', en: 'The "Announcement Trailer" is on the Steam page. It autoplays muted there, so it has to work without audio.' },
          links: [ { label: { es: "Ver en Steam", en: "View on Steam" }, url: "" } ] },
        { id: "gameplay-trailer", status: "falta", p: "P1", title: { es: "Trailer de gameplay / demo", en: "Gameplay / demo trailer" },
          duration: "60–75s", note: { es: 'Para el lanzamiento de la demo y Next Fest. Gameplay en los primeros 5 segundos, 4 jugadores, los problemas escalando, cierre con "Jugá la demo / Wishlist".', en: 'For the demo launch and Next Fest. Gameplay in the first 5 seconds, 4 players, problems escalating, closing with "Play the demo / Wishlist".' }, links: [] },
        { id: "trailer-cuts", status: "falta", p: "P2", title: { es: "Versiones cortas del trailer", en: "Short trailer cuts" },
          duration: "6s · 15s", note: { es: "Para redes sociales, en distintos formatos: 16:9 y 9:16.", en: "For social media, in 16:9 and 9:16." }, links: [] }
      ] }
  ]
};
