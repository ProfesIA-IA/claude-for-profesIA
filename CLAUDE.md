<!-- profesia:start -->
## Agentes ProfesIA

Este proyecto tiene instalado el plugin **Agentes ProfesIA** (27 agentes + 4 skills).

**Antes de responder cualquier cosa relacionada con el trabajo o la profesión de esta persona**, leé:

- `profesia.config.md` — su perfil real: profesión, dolor operativo, zona de genio, datos de
  referencia, agentes activos con un caso de uso concreto cada uno, y su bitácora de trabajo
  (funciona como su agenda). Es la fuente de verdad — este bloque solo apunta hacia él, no lo
  reemplaza ni lo duplica.
- `profesia.sops.md` (si existe) — los procesos que documentó paso a paso, como SOPs.

Si `profesia.config.md` todavía no está configurado (la Profesión dice `_completar_` o el archivo no
existe), no asumas nada sobre su profesión — sugerile correr la skill `configuracion-inicial` primero.

Skills disponibles: `configuracion-inicial` (setup inicial + check-in de bitácora), `ayuda`
(resolver un problema puntual, empujando control de Chrome cuando aplica), `documentar-procesos`
(cargar procesos de trabajo como SOPs), `segundo-cerebro` (generar el mapa visual personal).
<!-- profesia:end -->
