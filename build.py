import pathlib
d=pathlib.Path(__file__).parent/'src'
css=(d/'style.css').read_text(); body=(d/'body.html').read_text(); js=(d/'app.js').read_text()
html=f'''<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Biodigestor: de residuos a energía · Feria de Ciencias 2026</title>
<meta name="description" content="Producción de metano a partir de residuos de frutas y verduras en un biodigestor escolar durante 40 días. Institución Educativa Aureliano Flórez Cardona, Anserma, Caldas.">
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
'''
(pathlib.Path(__file__).parent/'index.html').write_text(html)
print(len(html)//1024,'KB')
