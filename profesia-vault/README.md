# ProfesIA Vault

Segundo cerebro de ProfesIA como notas atómicas, en vez de dos archivos monolíticos
(`profesia.config.md` y `profesia.sops.md`). Cada agente, SOP, alumno, clase y entrada de bitácora es
su propio `.md` con frontmatter YAML — fácil de leer, escribir y versionar sin pisar el resto de la
información.

Este vault se genera junto con el resto del plugin (`python3 build_plugin.py`), así que **cualquier
instalación nueva del plugin arranca con los 27 agentes del catálogo ya cargados acá**
(genéricos, inactivos) — no hace falta empezar de cero.

## Organización

- `perfil.md` — profesión, dolor operativo y zona de genio (una sola nota).
- `agentes/` — un agente del plugin, un archivo (los 27 vienen incluidos).
- `sops/` — un proceso documentado (SOP), un archivo.
- `bitacora/` — una entrada de la agenda de trabajo, un archivo (una fecha = una nota).
- `alumnos/` y `clases/` — vacías por ahora, listas para cuando haya esa fuente de datos.
- `_templates/` — plantilla en blanco de cada tipo de nota.

Las notas se conectan con wikilinks (`[[sops/armar-presupuesto]]`, `[[agentes/tincho-mensajero]]`)
cuando el contenido lo justifica.

## Compatibilidad con Obsidian

Esta carpeta es un vault válido de [Obsidian](https://obsidian.md) tal cual está: markdown +
frontmatter YAML + wikilinks, sin nada adicional que instalar o convertir. Abrila directo desde la
app ("Open folder as vault") y vas a tener graph view, backlinks y búsqueda funcionando.

## Relación con los archivos originales

Este vault convive con `profesia.config.md` y `profesia.sops.md` — todavía no los reemplaza.
