# Banana Airways — Assets de marketing

Microsite estático con la lista de materiales de marketing para el publisher.
Se publica en GitHub Pages y guarda los cambios (estados + links) directo en el repo.

## Modos
- **Vista pública** (URL normal): lo que ve cualquiera. Solo se ven los links cargados; el estado no se edita.
- **Edición** (agregá `?edit` al final de la URL): podés cambiar estados, cargar links y carpetas.

## Botones
- **💾 Guardar**: escribe los cambios en el repo (archivo `data.json`) usando tu token de GitHub.
  La primera vez te pide el token (se guarda solo en tu navegador). En ~1 min GitHub Pages se actualiza y **todos ven lo mismo**.
- **🖨 PDF**: abre el diálogo de imprimir → "Guardar como PDF".
- **EN / ES**: idioma. **👁 / ✏️**: cambia tu vista entre pública y edición.

## Cómo se guardan los datos
- `config.js` → estructura y textos (secciones, assets, medidas). Lo editamos nosotros.
- `data.json` → estados y links que vas cargando desde el navegador. Lo actualiza el botón **Guardar**.
- Al abrir la página, lee `data.json` del repo, así la versión pública muestra lo último guardado.

## Token de GitHub (una sola vez)
1. Entrá a **github.com/settings/tokens** → *Fine-grained tokens* → *Generate new token*.
2. Repository access: solo **banana-assets-marketing**.
3. Permissions → **Contents: Read and write**.
4. Generá, copiá, y pegalo cuando el sitio te lo pida al tocar **Guardar**.

## Deploy
Repo: `lucilatr/banana-assets-marketing` · GitHub Pages desde `main` / root.
URL pública: `https://lucilatr.github.io/banana-assets-marketing/`
Para editar: `https://lucilatr.github.io/banana-assets-marketing/?edit`
