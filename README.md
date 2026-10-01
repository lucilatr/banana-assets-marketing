# Banana Airways — Assets de marketing

Microsite estático (sin dependencias) con la lista de materiales de marketing para el publisher.
Static, dependency-free microsite with the marketing material list for the publisher.

## Qué hace / What it does
- Tabla por sección: **Estado · P · Asset · Medida/plantilla · Links** (sección de Videos con **Duración** y **Notas**).
- **Estado clickeable**: clic en el chip cambia `Falta → Revisar → Hecho → ...`. Cuando queda en **Hecho**, la fila se pinta de verde. Se guarda en el navegador.
- **📁 por sección**: link a la carpeta de Drive con todo el material. Si no tiene link cargado, clic en 📁 te deja pegar uno.
- **+ agregar link** por elemento: para linkear cosas sueltas que no están en la carpeta del grupo. Se guarda en el navegador.
- Badges de medida punteados (ej. `920×430`) → clic muestra la **plantilla a escala**.
- Toggle **ES / EN** y barra de progreso.

## Editar el contenido / Edit content
Todo vive en **`config.js`** (un solo archivo, comentado). No hace falta tocar `index.html` ni `app.js`.
Para fijar links de forma permanente (que los vea cualquiera, no solo tu navegador), poné la `url` en `config.js`.

## Subir a tu GitHub / Publish
```bash
# dentro de esta carpeta
git init && git add -A && git commit -m "Base microsite assets de marketing"
gh repo create banana-assets-marketing --public --source=. --push   # o creá el repo a mano
```
Después, en GitHub: **Settings → Pages → Deploy from branch → main / root**.
Queda en `https://TU-USUARIO.github.io/banana-assets-marketing/`.

> El estado (Hecho/Falta/Revisar) y los links agregados con "+" se guardan en el **localStorage del navegador** de quien mira. Para una versión fija/compartida, cargá los valores en `config.js`.
