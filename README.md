# BIO DIGESTIÓN · Energía a partir de residuos orgánicos

Experiencia web 3D e interactiva del proyecto de feria de ciencias
**“Producción de metano a partir de residuos de frutas y verduras en un biodigestor escolar durante 40 días”**.

Juan Pablo Piedrahita Hurtado · Juan Miguel Piedrahita Hurtado · Jerónimo Muñoz Moreno
Grado 11-A · Institución Educativa Aureliano Flórez Cardona · Anserma, Caldas, Colombia · 2026

---

## Abrir la versión SIN internet (para la feria)

El archivo `entrega/BIO-DIGESTION-offline.html` trae todo dentro: código, 3D, tipografías y la foto.

1. Copia el archivo al portátil del stand (USB, Drive, correo…).
2. Ábrelo con doble clic en **Chrome** o **Edge**.
3. Funciona sin conexión. Las opiniones se guardan en ese navegador.

> Usa siempre el mismo navegador y el mismo archivo durante la feria, para que las opiniones se acumulen en un solo lugar.
> Al final del día, en la sección **Opiniones**, pulsa **Exportar (.csv)** para guardarlas.

## Cómo está organizado el repositorio

- **Raíz** (`index.html`, `assets/`): la página **ya compilada**, que es lo que publica GitHub Pages (modo "Deploy from a branch", rama `main`, carpeta `/`).
- **`app/`**: el código fuente.
- **`entrega/`**: la versión sin internet.

Dirección pública: `https://jacobopiedrahita1-cloud.github.io/Biodigestor/`

## Modificar y volver a publicar

Requisitos: Node.js 20.19 o superior.

```bash
cd app
npm install
npm run dev        # vista de desarrollo en http://localhost:5173
npm run publish    # compila y copia el resultado a la raíz y a entrega/
```

Después haz commit y push a `main`: GitHub Pages se actualiza solo en uno o dos minutos.

## Estructura

```
app/index.html           Contenido semántico de todas las secciones
app/src/
  main.ts                Arranque: cada sección se inicia por separado
  data/experiment.ts     ÚNICA fuente de datos del experimento (del informe)
  data/game.ts           Residuos y preguntas del ECO RETO
  scene/objects.ts       Geometrías 3D procedurales (frasco, residuos, globo, turbina…)
  scene/scene.ts         Escena Three.js, estados por capítulo, calidad adaptable
  sections/story.ts      Scroll narrativo (GSAP ScrollTrigger) ↔ escena 3D
  sections/results.ts    Contadores, cronología, día de máximo, limitaciones
  sections/game.ts       Minijuego (arrastrar, tocar o teclado; preguntas)
  sections/reviews.ts    Opiniones en localStorage, validación, exportar, moderar
  sections/chrome.ts     Logo, menú, créditos, referencias, ilustración sin WebGL
  lib/                   Logo SVG, utilidades DOM, sonido sintetizado
  styles/                Tokens del sistema de diseño y estilos por sección
```

## Decisiones importantes

- **Datos**: solo los del informe (40 días, día 9, 200 mL el día 14, 802 mL, 24,9 %, 25,1 y ≈20,1 mL/día). No hay curva diaria, porque no existe un registro diario y una curva obligaría a inventar valores.
- **Turbina y generador**: se muestran como *propuesta conceptual*, con estética de holograma y la advertencia correspondiente.
- **Opiniones**: se guardan únicamente en el navegador (localStorage), y la página lo dice. El texto se muestra siempre como texto plano, nunca como HTML. Incluye un campo trampa para bots, una espera de 20 s entre envíos, un modo de moderación local y exportación a CSV.
- **3D**: todo es procedural, sin modelos descargados. En celulares y equipos modestos se reduce la calidad automáticamente. Sin WebGL se muestra una ilustración SVG. Con `prefers-reduced-motion` la escena queda estática.
- Para probar la ilustración sin 3D, agrega `?no3d` a la URL.

## Dependencias

- `three`: 3D
- `gsap`: animaciones ligadas al scroll
- `vite`, `typescript`, `vite-plugin-singlefile`: compilación (desarrollo)
- Tipografías Bricolage Grotesque, Inter y JetBrains Mono (Fontsource), incluidas localmente
