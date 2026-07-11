---
name: configuracion-inicial
description: >
  Use this skill when the user has just installed the agentes-profesia plugin and wants to set it up, or when they ask things like "configurar profesia", "empezar con los agentes de profesia", "qué agentes me sirven", "cuáles agentes de profesia debería usar", "onboarding de profesia", "instalé el plugin, ¿ahora qué?", or "quiero saber qué agentes me convienen para mi negocio".
metadata:
  version: "0.1.0"
---

# Configuración inicial de Agentes ProfesIA

Guiá al usuario, con preguntas cortas, para descubrir cuáles de los 27 agentes de ProfesIA le sirven a
SU negocio en particular, y dejá esa decisión (más los datos de referencia del negocio) guardada en
`profesia.config.md` en la raíz del proyecto. El resto de los agentes leen ese archivo antes de
preguntarle al usuario datos que ya dio, así no se repite la misma información sesión tras sesión.

No expliques la arquitectura del plugin ni menciones nombres de archivos técnicos salvo que el usuario
pregunte — hablale en términos de "tu negocio" y "qué te conviene usar".

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


## Paso 1 · Explicar en una línea

Antes de preguntar nada, decí en 1-2 frases qué vas a hacer: le vas a hacer unas preguntas rápidas
sobre el negocio para armar la lista de agentes que más le sirven, y va a quedar guardado para no
tener que repetirlo.

## Paso 2 · Preguntas sobre el negocio

Usá la herramienta de preguntas (AskUserQuestion) — de a una o dos preguntas por vez, no todas juntas.
Como mínimo cubrí estos ejes (adaptá la redacción, no hace falta preguntar literalmente esto si el
usuario ya lo contó en su mensaje inicial):

1. **Rubro y tamaño**: ¿A qué se dedica el negocio (comercio, servicios profesionales, consultorio/estudio,
   gastronomía, cursos/educación, otro) y cuántas personas lo llevan adelante?
2. **Atención al cliente**: ¿Recibe consultas repetidas por WhatsApp/Instagram (precio, horario,
   disponibilidad)? ¿Da turnos o citas?
3. **Administración**: ¿Factura? ¿Lleva control de ingresos/egresos? ¿Maneja stock o inventario?
4. **Documentos**: ¿Redacta contratos, propuestas, informes o expedientes largos con frecuencia?
5. **Contenido y ventas**: ¿Genera contenido para redes sociales? ¿Arma presupuestos o cotizaciones a medida?
6. **Organización**: ¿Coordina un equipo de más de una persona? ¿Necesita ayuda para planificar su agenda
   o proyectos?

## Paso 3 · Mapear respuestas a agentes recomendados

Usando el catálogo de arriba y las respuestas, armá una lista de agentes recomendados. Guía general
(no es una regla rígida, usá criterio):

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
agentes antes de guardar nada.

## Paso 4 · Datos de referencia del negocio

Preguntale SOLO los datos de referencia que necesitan los agentes que quedaron activos (no preguntes
todo si no aplica). Por ejemplo: horarios de atención y formas de pago si activó `tincho-mensajero` o
`meli-recepcionista`; condición fiscal si activó `facu-facturador` o `beto-contador`; rango de precios o
tarifario si activó `gaston-presupuestador` o `santi-vendedor`.

## Paso 5 · Guardar la configuración

Escribí (o actualizá si ya existe) el archivo `profesia.config.md` en la raíz del proyecto con:
nombre y rubro del negocio, los datos de referencia recolectados, y la lista de agentes activos
tildados con `[x]` (dejá el resto de los 27 sin tildar, siguen instalados igual). Actualizá también la
fecha de "Última actualización".

## Paso 6 · Cierre

Resumí en pocas líneas qué agentes quedaron activos y un ejemplo concreto de cómo invocar a uno de
ellos (ej. "usá a Tincho para responder este WhatsApp: ..."). Aclará que puede volver a correr este
mismo proceso cuando quiera (por ejemplo si suma un rubro nuevo o cambian los precios) para actualizar
`profesia.config.md`.
