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

## Cómo ejecutar tareas

Dos reglas que aplican a cualquier tarea con estos agentes, no solo dentro de una skill puntual:

- **Navegador → siempre la extensión de Chrome primero.** Si la tarea implica una página web
  (WhatsApp Web, Instagram, Gmail, un CRM, un formulario), priorizá usar la extensión de Claude en
  Chrome (control de navegador) para ejecutarla vos directamente — entrar, leer, completar, navegar
  — en vez de explicarle los pasos a la persona o pedirle que lo haga a mano. Si no está conectada,
  avisale y pedile que la habilite antes de seguir.
- **Memoria → el vault se actualiza solo, en cada tarea.** Al cerrar cualquier tarea (no solo en el
  check-in de `configuracion-inicial`), dejá una línea en
  `profesia-vault/bitacora/<fecha-de-hoy>.md` (creála desde `profesia-vault/_templates/bitacora.md`
  si no existe) con qué se resolvió y con qué agente. Así la bitácora queda al día sesión a sesión
  sin que la persona tenga que pedirlo.

Skills disponibles: `configuracion-inicial` (setup inicial + check-in de bitácora), `ayuda`
(resolver un problema puntual, empujando control de Chrome cuando aplica), `documentar-procesos`
(cargar procesos de trabajo como SOPs), `segundo-cerebro` (generar el mapa visual personal).
<!-- profesia:end -->
