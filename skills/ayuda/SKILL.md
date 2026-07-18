---
name: ayuda
description: >
  Use this skill when the user is stuck on a specific problem and wants help figuring out how to solve it with their ProfesIA agents — phrases like "tengo un problema con...", "estoy trabado con...", "necesito ayuda con...", "no sé cómo resolver esto", "qué agente uso para...", "cómo hago para que Claude me responda los WhatsApp", "dale acceso a Chrome", or "quiero que revises mis mensajes". This is the go-to skill for turning a messy, unstructured problem into a concrete plan using the 27 agents (and, when it involves a website like WhatsApp Web/Instagram/mail, using Chrome control directly).
metadata:
  version: "0.3.0"
---

# Ayuda para resolver un problema puntual

Esta skill es el "pronto socorro" del plugin: la persona llega sin saber bien qué agente necesita,
solo sabe que algo le está pesando o no sabe cómo resolverlo. Tu trabajo es diagnosticar y armar un
plan concreto, no resolver el problema de fondo vos mismo salvo que sea trivial.

Antes de nada, si existe la carpeta `profesia-vault/` en la raíz del proyecto, leé
`profesia-vault/perfil.md` y las notas con `activo: true` en `profesia-vault/agentes/`: usá el
dolor operativo, la zona de genio y los agentes activos que ya declaró para no repreguntar cosas que
ya sabés y para priorizar mejor la recomendación. Si el vault no existe, `profesia.config.md` (si
está) sirve solo como referencia de último recurso — es un formato legado que ya no se actualiza.

## Paso 1 · Entender el problema

Preguntale (con AskUserQuestion o simplemente conversando si ya lo contó) lo mínimo para entender:

1. ¿Cuál es el problema puntual? (pedile que lo cuente con sus palabras, sin que tenga que saber
   nombres técnicos)
2. ¿Dónde pasa? (WhatsApp, Instagram, mail, una planilla, un documento, una app puntual)
3. ¿Es algo que pasa una vez o se repite seguido? (si se repite, es candidato fuerte a automatizar
   con un agente + Chrome, no solo a resolver una vez)

No sigas de largo hasta tener claro esto — un diagnóstico apurado lleva a recomendar el agente
equivocado.

## Paso 2 · Diagnosticar y recomendar

Mapeá el problema a uno o más de los 27 agentes (mismo catálogo que usa `configuracion-inicial`)
y explicá en lenguaje simple qué agente(s) conviene usar y en qué orden. Si el problema cruza más de
un equipo (ej. "tengo mensajes sin responder Y no sé cuáles son urgentes"), armá la secuencia: primero
quién clasifica/prioriza, después quién redacta/actúa.

## Paso 3 · El control de Chrome es la prioridad, no una opción más

Regla del plugin (ver `CLAUDE.md`): si el problema vive en una página web (WhatsApp Web,
Instagram, Gmail, un CRM, etc.), el control de Chrome/navegador es el método por defecto — no algo
que se ofrece como alternativa, sino lo que usás vos directamente en vez de que la persona copie y
pegue mensajes a mano. Ejemplos concretos para plantear:

- **"Tengo mensajes de WhatsApp sin responder y no sé por dónde arrancar"** → proponé: dar acceso a
  Chrome, entrar a WhatsApp Web, leer los chats sin responder, usar a **Lucho · el Filtro** para
  clasificarlos por urgencia y tema, y a **Tincho · el Mensajero** o **Ramiro · el Redactor** para
  dejar los borradores de respuesta listos. Aclará siempre que los mensajes se redactan para que
  ella los revise y los mande — no se envía nada sin que lo confirme.
- **"No doy abasto con las consultas de Instagram/mail"** → mismo patrón: Chrome entra, lee lo
  pendiente, Lucho prioriza, Tincho/Santi/Ramiro redactan según el caso.
- **"Quiero saber qué me escribieron mientras no estaba"** → Chrome entra, hace un barrido de lo
  nuevo, y devuelve un resumen ordenado por urgencia (sin responder nada todavía).

Si la persona nunca usó el control de Chrome, explicale en una frase simple que es una función del
asistente para operar el navegador por ella (leer, ordenar, redactar) y que ella mantiene el control
de qué se envía. Si el problema NO involucra una página web (ej. "necesito armar un presupuesto"),
no ofrezcas Chrome — anda directo al agente que corresponda.

## Paso 4 · Plan concreto y siguiente paso

Cerrá con un plan corto y accionable: qué agente(s) usar, en qué orden, y una frase lista para que
la persona la copie y arranque (ej. "Dale acceso a Chrome y decime: 'entrá a mi WhatsApp Web, fijate
qué tengo sin responder y ordename por urgencia con Lucho'"). Si el problema es recurrente y no está
reflejado en su dolor operativo dentro de `profesia-vault/perfil.md`, sugerí agregarlo la próxima
vez que corra `configuracion-inicial` o anotalo vos directamente ahí.

Una vez que el problema quedó resuelto (no solo diagnosticado), aplicá la regla general del plugin:
dejá una línea en `profesia-vault/bitacora/<fecha-de-hoy>.md` con qué se resolvió y con qué
agente(s) — creá la nota desde `profesia-vault/_templates/bitacora.md` si todavía no existe la de
hoy.
