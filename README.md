# Diseñador de bolitas Miyuki

App web simple para convertir cualquier imagen en un patrón tipo Miyuki.

## Cómo usar

1. Abre `index.html` en tu navegador.
2. Sube una imagen.
3. Ajusta:
   - **Bolitas de ancho**: cantidad horizontal de bolitas del patrón.
   - **Grosor**: tamaño visual de cada bolita en píxeles.
   - **Colores máximos**: simplifica la paleta para que el patrón sea más fácil de armar.
4. Haz clic en **Generar diseño**.

## Despliegue en GitHub Pages

1. Sube este repo a GitHub.
2. Asegúrate de usar la rama `main` como rama principal.
3. Ve a **Settings → Pages** y en **Build and deployment** selecciona **GitHub Actions**.
4. Haz push a `main`: el workflow `.github/workflows/deploy-pages.yml` publicará el sitio automáticamente.

## Notas

- El alto del patrón se calcula automáticamente manteniendo la proporción de la imagen original.
- Se incluye una leyenda con colores usados y número de bolitas por color.
