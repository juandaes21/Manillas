# Diseñador de bolitas Miyuki

App web para convertir imágenes en una guía de manilla Miyuki fácil de construir, con una vista inspirada en herramientas tipo **BeadTool**.

## Enfoque para manillas (recomendado)

- **Largo manilla:** `200` columnas (aprox. vuelta de muñeca).
- **Grosor manilla:** `11-12` filas.
- Por defecto la app viene en **200 × 12** para empezar rápido.

## Cómo usar

1. Abre `index.html` en tu navegador.
2. Sube una imagen.
3. Ajusta:
   - **Largo manilla (columnas)**.
   - **Grosor manilla (filas)**.
   - **Grosor visual** de cada bolita (solo vista).
   - **Colores máximos** para simplificar el armado.
4. Haz clic en **Generar guía de manilla**.
5. Usa las dos vistas principales:
   - **Vista bolitas** para revisar el resultado visual final.
   - **Tabla de patrón (códigos)** con cuadrícula y numeración para construir más fácil.
6. Usa la sección **Guía rápida por filas** para ensartar por secuencias (`C1x4 · C2x2...`).
7. Descarga:
   - **PNG bolitas** para imprimir/compartir referencia visual.
   - **PNG tabla** para guía técnica por código.
   - **Matriz CSV** con códigos de color (`C1`, `C2`, etc.).

## Despliegue en GitHub Pages

1. Sube este repo a GitHub.
2. Usa `main` como rama principal.
3. Ve a **Settings → Pages** y en **Build and deployment** selecciona **GitHub Actions**.
4. Haz push a `main`: el workflow `.github/workflows/deploy-pages.yml` publicará el sitio automáticamente.
