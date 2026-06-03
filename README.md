# Página premium de cumpleaños para Lesly

Abre `index.html` en cualquier navegador para ver la sorpresa.

## Cambiar fotos

1. Coloca tus fotos dentro de la carpeta `images/`.
2. Abre `script.js`.
3. En `galleryImages`, agrega o cambia objetos con esta forma:

```js
{ src: "images/tu-foto.jpg", caption: "Texto bonito para esta foto" }
```

4. Para el carrusel, edita `carouselSlides` con la misma idea.

Nota: por seguridad del navegador, una página abierta como archivo local no puede leer automáticamente todos los archivos de una carpeta sin que se declaren en JavaScript o sin que el usuario seleccione archivos manualmente.

## Cambiar música

1. Coloca tu canción en `assets/`.
2. En `index.html`, cambia el audio a una ruta real:

```html
<source src="assets/musica.mp3" type="audio/mpeg">
```

## Cambiar textos

- La carta principal está en `index.html`, dentro de `data-message`.
- Los mensajes sorpresa están en `script.js`, dentro de `surpriseMessages`.
- Los textos de fotos están en `galleryImages` y `carouselSlides`.

## Archivos principales

- `index.html`: estructura de la página.
- `styles.css`: diseño, responsive y animaciones.
- `script.js`: confeti, corazones, galería, carrusel, lightbox, contador y mensajes.
- `images/`: fotos o placeholders de recuerdos.
- `assets/`: fondo decorativo y música opcional.
