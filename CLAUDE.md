<!-- profesia:start -->
## Agentes ProfesIA

Este proyecto tiene instalado el plugin **Agentes ProfesIA** (27 agentes + 4 skills).

**Antes de responder cualquier cosa relacionada con el trabajo o la profesión de esta persona**, leé
`profesia-vault/` — es la fuente de verdad, organizada como notas atómicas (compatible con
Obsidian) en vez de un archivo único:

- `profesia-vault/perfil.md` — profesión, dolor operativo, zona de genio y datos de referencia.
- `profesia-vault/agentes/<slug>.md` — una nota por agente, con `activo: true/false` en el
  frontmatter y su caso de uso concreto en el cuerpo si ya fue personalizado.
- `profesia-vault/sops/` — procesos documentados (uno por nota).
- `profesia-vault/bitacora/` — agenda de trabajo, una nota por fecha.

Si `profesia-vault/perfil.md` todavía no tiene la profesión completada, no asumas nada — sugerile
correr la skill `configuracion-inicial` primero.

`profesia.config.md` y `profesia.sops.md` (si existen en el proyecto) son el **formato legado** de
una versión anterior del plugin — ya no se actualizan, ninguna skill les escribe nada nuevo. Solo
sirven como referencia de último recurso si alguna vez tuvieron datos y el vault todavía no los
migró; nunca los trates como la fuente de verdad.

Skills disponibles: `configuracion-inicial` (setup inicial + check-in de bitácora), `ayuda`
(resolver un problema puntual, empujando control de Chrome cuando aplica), `documentar-procesos`
(cargar procesos de trabajo como SOPs), `segundo-cerebro` (generar el mapa visual personal).
<!-- profesia:end -->
