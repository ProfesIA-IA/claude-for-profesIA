---
name: configuracion-inicial
description: >
  Use this skill when the user has just installed the agentes-profesia plugin and wants to set it up, or when they ask things like "configurar profesia", "empezar con los agentes de profesia", "qué agentes me sirven", "cuáles agentes de profesia debería usar", "onboarding de profesia", "instalé el plugin, ¿ahora qué?", "quiero saber qué agentes me convienen para mi profesión". Also use it as a lightweight recurring check-in when the setup already exists and the user says things like "en qué quedé", "quiero anotar en qué estoy trabajando", "con qué sigo hoy", "actualizá mi bitácora", or "quiero repasar mi configuración de profesia".
metadata:
  version: "0.3.0"
---

# Configuración inicial de Agentes ProfesIA

**El vault (`profesia-vault/`) es la fuente de verdad — no `profesia.config.md`.** Este plugin pasó
de un archivo único a notas atómicas estilo Obsidian; esta skill lee y escribe en esas notas. El
archivo `profesia.config.md` (si existe en el proyecto) es un formato legado de una versión anterior
del plugin: se puede mirar como referencia si el usuario lo tenía completado, pero nunca se le
escribe nada nuevo.

Esta skill tiene DOS modos. Fijate primero si existe `profesia-vault/perfil.md` y si su campo
`profesion` en el frontmatter ya tiene un valor (no está vacío `""`):

- **Vacío o el archivo no existe → Modo A (setup completo):** Paso 1 a 6.
- **Ya tiene profesión cargada → Modo B (check-in / bitácora):** saltá directo al Paso 7. Solo volvé
  a correr el setup completo si el usuario lo pide explícitamente (ej. "cambié de actividad",
  "quiero rehacer mi configuración").

El objetivo de fondo no es solo activar agentes: es que el vault funcione como la memoria compartida
de la persona con sus 27 agentes (su "system prompt" personal, ahora repartido en notas), que
entendamos su dolor operativo y su zona de genio, y que los agentes se usen también como agenda del
día a día. La meta es sacarle entre 60% y 70% de la carga operativa de encima, no solo resolver
tareas sueltas.

No expliques la arquitectura del plugin ni menciones nombres de archivos técnicos salvo que el usuario
pregunte — hablale en términos de "tu profesión" / "tu trabajo" y "qué te conviene usar". No le preguntes
por "tu negocio": arrancá siempre preguntando cuál es su profesión u oficio, sea que trabaje en relación
de dependencia, de forma independiente, con un comercio o con un estudio — el punto de partida es la
persona y a qué se dedica, no una empresa.

## Catálogo completo de agentes (referencia interna)

**Equipo 1 · Comunicación**
- `tincho-mensajero` — Tincho · el Mensajero: Responde los WhatsApp y DM repetidos (precios, horarios, disponibilidad, preguntas frecuentes) las 24 horas.
- `meli-recepcionista` — Meli · la Recepcionista: Agenda turnos, confirma citas y arma recordatorios sin superponer horarios.
- `ramiro-redactor` — Ramiro · el Redactor: Deja el borrador de cada respuesta listo para revisar y enviar, escrito en tu tono.
- `sofi-postventa` — Sofi · la Postventa: Hace seguimiento a clientes, pide reseñas y reactiva a los que dejaron de venir.
- `lucho-filtro` — Lucho · el Filtro: Clasifica todo lo que entra por urgencia y tema, y deja pasar solo lo que necesita tu atención.

**Equipo 2 · Datos y administración**
- `rita-reportes` — Rita · la de Reportes: Arma el informe del período con formato profesional a partir de datos crudos.
- `beto-contador` — Beto · el Contador: Ordena ingresos y egresos, cierra balances por mes y por producto, y te dice qué deja plata.
- `facu-facturador` — Facu · el Facturador: Genera y organiza las facturas a partir de los datos cargados una sola vez.
- `nacho-deposito` — Nacho · el del Depósito: Controla el stock, avisa cuando algo baja del mínimo y arma la planilla de reposición.
- `carla-conciliadora` — Carla · la Conciliadora: Cruza pagos, cuentas y comprobantes para detectar diferencias y errores.
- `pili-planillas` — Pili · la de Planillas: Convierte datos sueltos en planillas ordenadas y las mantiene actualizadas.
- `vera-analista` — Vera · la Analista: Toma tu histórico y proyecta ventas, gastos y demanda a futuro.
- `coco-cobrador` — Coco · el Cobrador: Detecta vencimientos y genera los avisos de cobranza a tiempo.

**Equipo 3 · Documentos y conocimiento**
- `sole-resumidora` — Sole · la Resumidora: Condensa documentos largos, reuniones o expedientes en lo esencial, con los plazos marcados.
- `dante-archivista` — Dante · el Archivista: Encuentra al toque cualquier dato dentro de tus documentos, sin salir a internet.
- `pedro-escribano` — Pedro · el Escribano: Redacta contratos, propuestas e informes desde tus plantillas y datos.
- `emma-correctora` — Emma · la Correctora: Revisa, corrige y estandariza cada texto según tus criterios.
- `bruno-investigador` — Bruno · el Investigador: Releva información sobre un tema y te la entrega ordenada y lista para usar.

**Equipo 4 · Contenido y ventas**
- `zoe-creadora` — Zoe · la Creadora: Genera posts, textos para redes e ideas de publicación.
- `milo-disenador` — Milo · el Diseñador: Arma las placas, flyers y promos visuales.
- `juana-copy` — Juana · la Copy: Escribe los textos de venta, descripciones de producto y anuncios.
- `gaston-presupuestador` — Gastón · el Presupuestador: Arma presupuestos y cotizaciones personalizadas al instante.
- `santi-vendedor` — Santi · el Vendedor: Responde consultas comerciales y guía al cliente hacia la compra.

**Equipo 5 · Organización y productividad**
- `feli-agenda` — Feli · el de la Agenda: Organiza tu día, reprograma y evita que se te superpongan las cosas.
- `maru-planificadora` — Maru · la Planificadora: Arma tu plan de trabajo o estudio según tus objetivos y tiempos.
- `tomi-minutas` — Tomi · el de Minutas: Toma nota de cada reunión y deja las tareas y acuerdos por escrito.
- `lola-coordinadora` — Lola · la Coordinadora: Reparte y sigue las tareas entre las personas de tu equipo.


# MODO A · Setup completo (primera vez)

## Paso 1 · Explicar en una línea

Antes de preguntar nada, decí en 1-2 frases qué vas a hacer: le vas a hacer unas preguntas rápidas
sobre su profesión, su día a día y qué le pesa más del trabajo operativo, para armar la lista de
agentes que más le sirven y dejarlos configurados para su caso — y que esto va a quedar guardado
como memoria para no repetir lo mismo cada vez.

## Paso 2 · Preguntas sobre su profesión y cómo trabaja

Usá la herramienta de preguntas (AskUserQuestion) — de a una o dos preguntas por vez, no todas juntas.
Arrancá siempre por la profesión. Como mínimo cubrí estos ejes (adaptá la redacción, no hace falta
preguntar literalmente esto si el usuario ya lo contó en su mensaje inicial):

1. **Profesión u oficio**: ¿Cuál es tu profesión u oficio (abogado/a, contador/a, diseñador/a, docente,
   terapeuta/profesional de la salud, comerciante, consultor/a, otro) y trabajás solo/a o con un equipo?
2. **Atención a clientes/pacientes/alumnos**: ¿Recibís consultas repetidas por WhatsApp/Instagram (precio,
   horario, disponibilidad)? ¿Das turnos o citas?
3. **Administración**: ¿Facturás? ¿Llevás control de ingresos/egresos? ¿Manejás stock o inventario?
4. **Documentos**: ¿Redactás contratos, propuestas, informes o expedientes largos con frecuencia?
5. **Contenido y ventas**: ¿Generás contenido para redes sociales? ¿Armás presupuestos o cotizaciones a medida?
6. **Organización**: ¿Coordinás un equipo de más de una persona? ¿Necesitás ayuda para planificar tu agenda
   o proyectos?

## Paso 3 · Detectar el dolor operativo y la zona de genio

Esto es tan importante como elegir agentes — no lo saltees. Preguntale (con AskUserQuestion, en
lenguaje simple, sin jerga de "productividad"):

1. **Dolor operativo**: "De todo lo que hacés en una semana típica, ¿qué es lo repetitivo que más
   tiempo te quita o que más bronca/estrés te genera?" (buscá tareas concretas: responder lo mismo
   por WhatsApp, facturar, cargar planillas, perseguir cobros, etc.)
2. **Zona de genio**: "¿Y en qué tarea de tu trabajo sentís que rendís mejor o más disfrutás — la
   que harías vos igual aunque nadie te lo pidiera?"

Guardá las respuestas tal cual las dijo, sin reinterpretarlas de más.

## Paso 4 · Mapear respuestas a agentes recomendados

Usando el catálogo de arriba, las respuestas del Paso 2 y el dolor detectado en el Paso 3, armá una
lista de agentes recomendados priorizando lo que más le pesa. Guía general (no es una regla rígida,
usá criterio):

- Consultas repetidas por WhatsApp/redes → equipo Comunicación (`tincho-mensajero`, `lucho-filtro`;
  sumar `meli-recepcionista` si da turnos, `sofi-postventa` si quiere fidelizar clientes, `ramiro-redactor`
  si prefiere revisar antes de enviar).
- Factura, controla caja o stock → equipo Datos y administración (elegir entre `rita-reportes`,
  `beto-contador`, `facu-facturador`, `nacho-deposito`, `carla-conciliadora`, `pili-planillas`,
  `vera-analista`, `coco-cobrador` según qué mencionó puntualmente).
- Redacta documentos largos o busca información en papeles propios → equipo Documentos y conocimiento
  (`sole-resumidora`, `dante-archivista`, `pedro-escribano`, `emma-correctora`, `bruno-investigador`).
- Genera contenido, vende o cotiza → equipo Contenido y ventas (`zoe-creadora`, `milo-disenador`,
  `juana-copy`, `gaston-presupuestador`, `santi-vendedor`).
- Coordina equipo o necesita ordenar su agenda/proyectos → equipo Organización y productividad
  (`feli-agenda`, `maru-planificadora`, `tomi-minutas`, `lola-coordinadora`).

Mostrale la lista recomendada (agrupada por equipo, en lenguaje simple) y dejalo agregar o sacar
agentes antes de guardar nada. Priorizá siempre los agentes que atacan directamente el dolor que
declaró en el Paso 3.

## Paso 5 · Un caso de uso concreto por agente

Para CADA uno de los 27 agentes (no solo los recomendados) escribí una línea de "caso de uso
concreto" adaptada a la profesión real de la persona — no repitas el one-liner genérico del
catálogo, armá un ejemplo puntual con su propio contexto. Ejemplo: si es kinesiólogo/a y activó a
Meli, el caso de uso no es "agenda turnos" (genérico) sino algo como "Meli: cuando un paciente te
escribe pidiendo turno para la rodilla, te revisa la agenda de la semana y te propone 2-3 horarios
libres sin pisar otra sesión". Si un agente no aplica directamente a su rubro, armá igual un caso
de uso plausible (todos los agentes quedan instalados, no solo los recomendados).

## Paso 6 · Guardado en el vault

1. Preguntale SOLO los datos de referencia que necesitan los agentes que quedaron activos (no
   preguntes todo si no aplica). Por ejemplo: horarios de atención y formas de pago si activó
   `tincho-mensajero` o `meli-recepcionista`; condición fiscal si activó `facu-facturador` o
   `beto-contador`; rango de precios o tarifario si activó `gaston-presupuestador` o `santi-vendedor`.
2. **Actualizá `profesia-vault/perfil.md`**: completá el frontmatter (`profesion`, `nombre`,
   `trabaja_solo_o_equipo`, `dolor_operativo`, `zona_de_genio`) y, en el cuerpo, la sección "##
   Datos de referencia para los agentes" con lo que te haya dado en el punto 1. Sacá del cuerpo las
   marcas `_completar_` de lo que sí completaste; dejá tal cual las que sigan pendientes.
3. **Actualizá las 27 notas de `profesia-vault/agentes/`** (una por una, ya vienen creadas desde
   que se instaló el plugin): para cada agente, poné `activo: true` en el frontmatter si quedó
   recomendado/elegido (dejá `activo: false` el resto), y reemplazá el cuerpo de la nota por el
   caso de uso concreto del Paso 5 (borrá la frase "(one-liner genérico del catálogo...)" una vez
   que la nota tenga su caso de uso real). Podés revisar/ajustar los `tags` del frontmatter si el
   caso de uso sugiere alguno más específico, pero no hace falta.
4. **Anclá el vault en `CLAUDE.md`** (raíz del proyecto): se carga automático en cada
   sesión de Claude Code/Cowork, así que sirve como el punto de entrada que le avisa a Claude que
   este perfil existe, sin tener que duplicar todo el contenido ahí.
   - Si `CLAUDE.md` no existe todavía, creálo con el bloque de abajo como único contenido.
   - Si ya existe (por ejemplo porque el proyecto lo usa para otra cosa, convenciones de código,
     etc.), buscá si ya tiene un bloque entre `<!-- profesia:start -->` y `<!-- profesia:end -->`:
     si existe, reemplazá SOLO ese bloque; si no existe, agregalo al final del archivo. Nunca borres
     ni reescribas el resto del contenido de `CLAUDE.md` que no sea ese bloque.
   - El bloque debe decir, en esencia: que este proyecto tiene el plugin Agentes ProfesIA instalado,
     que `profesia-vault/` es la fuente de verdad (antes de responder algo relacionado al
     trabajo/profesión de la persona hay que leer `profesia-vault/perfil.md` y la nota del agente
     correspondiente en `profesia-vault/agentes/`), que `profesia.config.md` es un formato legado
     que ya no se actualiza, y que están disponibles las skills `configuracion-inicial`,
     `ayuda`, `documentar-procesos` y `segundo-cerebro`. No copies el
     perfil real de la persona dentro de este bloque — es una referencia, no una copia.
5. Cerrá con Paso 8 (abajo).

# MODO B · Check-in / bitácora (siguientes veces)

## Paso 7 · Preguntar en qué está y con qué sigue

No repreguntes toda la configuración. Simplemente preguntale, en 1-2 líneas de tono cercano:
"¿En qué estuviste trabajando (hoy o la última vez que hablamos) y con qué tarea querés seguir
ahora?". Fijate si ya existe una nota `profesia-vault/bitacora/<fecha-de-hoy>.md` (formato
`YYYY-MM-DD.md`): si existe, actualizala; si no, creala a partir de `profesia-vault/_templates/bitacora.md`
con el frontmatter (`tipo: bitacora`, `fecha: <hoy>`) y el cuerpo "Avancé: ... / Sigo con: ...". Si
de paso mencionó un dato nuevo (cambió un precio, un horario, empezó a usar un agente que no tenía
activo), actualizá también esa nota puntual (`perfil.md` o la nota del agente en `agentes/`) sin
tocar el resto del vault. Si pasó bastante tiempo desde la última entrada de bitácora o cambió de
actividad, ofrecele (sin insistir) rehacer el Modo A completo. De paso, si `CLAUDE.md`
todavía no tiene el bloque `<!-- profesia:start -->` (por ejemplo porque el proyecto es viejo, de antes
de este cambio), creálo ahora siguiendo las mismas reglas del Paso 6.4 — no hace falta repetir todo
el resto del onboarding para eso.

# Cierre (ambos modos)

## Paso 8 · Cierre

Resumí en pocas líneas qué quedó activo/actualizado y un ejemplo concreto de cómo invocar a uno de
los agentes (podés reusar uno de los casos de uso del Paso 5). Mencioná que puede volver a pedir
"configurar profesia" o simplemente contar en qué está trabajando para que quede en la bitácora. No
hace falta que le expliques el detalle técnico del vault ni de `CLAUDE.md` salvo que
pregunte — para ella alcanza con saber que a partir de ahora Claude ya "sabe" quién es apenas abre
el proyecto.
