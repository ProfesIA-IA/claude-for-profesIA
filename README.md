# Agentes ProfesIA

Plugin de Claude Code / Cowork con los **27 agentes del Staff de Agentes de IA de ProfesIA**, listos para instalar y usar como subagentes especializados.

Cada agente es un asistente de Claude con un rol acotado (redactar, resumir, calcular, clasificar, etc.) inspirado en patrones de subagentes de código abierto de la comunidad de Claude Code (ver [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)), adaptados al español y al caso de uso de pymes, comercios, estudios y consultorios que describe ProfesIA.

## Los 27 agentes

### Equipo 1 · Comunicación

- **Tincho · el Mensajero** (`tincho-mensajero`) — Responde los WhatsApp y DM repetidos (precios, horarios, disponibilidad, preguntas frecuentes) las 24 horas.
- **Meli · la Recepcionista** (`meli-recepcionista`) — Agenda turnos, confirma citas y arma recordatorios sin superponer horarios.
- **Ramiro · el Redactor** (`ramiro-redactor`) — Deja el borrador de cada respuesta listo para revisar y enviar, escrito en tu tono.
- **Sofi · la Postventa** (`sofi-postventa`) — Hace seguimiento a clientes, pide reseñas y reactiva a los que dejaron de venir.
- **Lucho · el Filtro** (`lucho-filtro`) — Clasifica todo lo que entra por urgencia y tema, y deja pasar solo lo que necesita tu atención.

### Equipo 2 · Datos y administración

- **Rita · la de Reportes** (`rita-reportes`) — Arma el informe del período con formato profesional a partir de datos crudos.
- **Beto · el Contador** (`beto-contador`) — Ordena ingresos y egresos, cierra balances por mes y por producto, y te dice qué deja plata.
- **Facu · el Facturador** (`facu-facturador`) — Genera y organiza las facturas a partir de los datos cargados una sola vez.
- **Nacho · el del Depósito** (`nacho-deposito`) — Controla el stock, avisa cuando algo baja del mínimo y arma la planilla de reposición.
- **Carla · la Conciliadora** (`carla-conciliadora`) — Cruza pagos, cuentas y comprobantes para detectar diferencias y errores.
- **Pili · la de Planillas** (`pili-planillas`) — Convierte datos sueltos en planillas ordenadas y las mantiene actualizadas.
- **Vera · la Analista** (`vera-analista`) — Toma tu histórico y proyecta ventas, gastos y demanda a futuro.
- **Coco · el Cobrador** (`coco-cobrador`) — Detecta vencimientos y genera los avisos de cobranza a tiempo.

### Equipo 3 · Documentos y conocimiento

- **Sole · la Resumidora** (`sole-resumidora`) — Condensa documentos largos, reuniones o expedientes en lo esencial, con los plazos marcados.
- **Dante · el Archivista** (`dante-archivista`) — Encuentra al toque cualquier dato dentro de tus documentos, sin salir a internet.
- **Pedro · el Escribano** (`pedro-escribano`) — Redacta contratos, propuestas e informes desde tus plantillas y datos.
- **Emma · la Correctora** (`emma-correctora`) — Revisa, corrige y estandariza cada texto según tus criterios.
- **Bruno · el Investigador** (`bruno-investigador`) — Releva información sobre un tema y te la entrega ordenada y lista para usar.

### Equipo 4 · Contenido y ventas

- **Zoe · la Creadora** (`zoe-creadora`) — Genera posts, textos para redes e ideas de publicación.
- **Milo · el Diseñador** (`milo-disenador`) — Arma las placas, flyers y promos visuales.
- **Juana · la Copy** (`juana-copy`) — Escribe los textos de venta, descripciones de producto y anuncios.
- **Gastón · el Presupuestador** (`gaston-presupuestador`) — Arma presupuestos y cotizaciones personalizadas al instante.
- **Santi · el Vendedor** (`santi-vendedor`) — Responde consultas comerciales y guía al cliente hacia la compra.

### Equipo 5 · Organización y productividad

- **Feli · el de la Agenda** (`feli-agenda`) — Organiza tu día, reprograma y evita que se te superpongan las cosas.
- **Maru · la Planificadora** (`maru-planificadora`) — Arma tu plan de trabajo o estudio según tus objetivos y tiempos.
- **Tomi · el de Minutas** (`tomi-minutas`) — Toma nota de cada reunión y deja las tareas y acuerdos por escrito.
- **Lola · la Coordinadora** (`lola-coordinadora`) — Reparte y sigue las tareas entre las personas de tu equipo.

## Instalación

### Opción A · Claude Code (línea de comandos)

Este repositorio es a la vez un marketplace y un plugin (todo vive en la raíz: `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`). Una vez que esté pusheado a GitHub:

```bash
claude plugin marketplace add ProfesIA-Profesionales-en-IA/claude-for-profesIA
claude plugin install agentes-profesia@profesia-plugins
```

Para actualizar cuando cambien los agentes:

```bash
claude plugin marketplace update profesia-plugins
```

También podés instalar los agentes a mano sin usar el sistema de plugins: copiá los archivos de `agents/*.md` a `~/.claude/agents/` (para tenerlos en todos tus proyectos) o a `.claude/agents/` dentro de un proyecto puntual.

### Opción B · Cowork (Claude desktop)

Abrí el archivo `agentes-profesia.plugin` que te compartieron en el chat y aceptá la instalación con el botón que aparece en la vista previa.

## Cómo probarlo

Una vez instalado, pedile a Claude que use un agente puntual por nombre, por ejemplo:

- "Usá a **Tincho** para responder este WhatsApp: '¿tienen turno para mañana?'"
- "Que **Rita** me arme el informe de ventas de julio con estos datos: ..."
- "Pedile a **Lucho** que clasifique estos 10 mensajes por urgencia"

Claude va a detectar automáticamente cuál de los 27 agentes conviene usar según lo que pidas, o podés nombrarlo directamente para forzar ese agente.

## Estructura del repo

```
claude-for-profesIA/
├── .claude-plugin/
│   ├── plugin.json         # manifiesto del plugin
│   └── marketplace.json    # catálogo (permite 'claude plugin marketplace add')
├── agents/                 # 27 archivos .md, uno por agente
└── README.md
```

## Notas y límites

- Estos agentes son asistentes de redacción/organización dentro de una conversación con Claude: no están conectados en vivo a WhatsApp, AFIP, tu sistema de facturación ni tu calendario. Para automatizar esas conexiones hace falta sumar los MCP/conectores correspondientes (WhatsApp Business API, Google Calendar, etc.).
- Beto (el Contador) y Pedro (el Escribano) dejan explícito en su propio prompt que no reemplazan a un contador ni a un abogado matriculado — son un apoyo de organización y redacción, no asesoramiento profesional.
- Todos los agentes están escritos para pedir el dato faltante en vez de inventarlo (precios, plazos, stock).
