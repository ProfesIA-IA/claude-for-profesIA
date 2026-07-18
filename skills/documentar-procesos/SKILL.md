---
name: documentar-procesos
description: >
  Use this skill when the user wants to teach their ProfesIA agents how they actually work so it gets saved as a standard operating procedure — phrases like "quiero cargar información a mi segundo cerebro", "te voy a enseñar cómo hago esto", "quiero que aprendas mi proceso de...", "armame un SOP de...", "documentar cómo trabajo", or when the user starts describing a work process step by step (in text, a voice note, or a video) wanting it documented for future reuse.
metadata:
  version: "0.2.0"
---

# Documentar procesos (cargar al vault)

Esta skill alimenta el vault (`profesia-vault/`) de la persona con SUS propios procesos de
trabajo, para que en el futuro los agentes (o ella misma) puedan repetirlos sin reinventar cada vez.
Cada proceso documentado es su propia nota en `profesia-vault/sops/` — no un archivo único que
crece sin límite. (El formato viejo, `profesia.sops.md` como archivo monolítico, quedó legado: si
existe en el proyecto es de una versión anterior del plugin, no le agregues nada nuevo ahí.)

## Paso 1 · Pedir el paso a paso

Preguntale qué proceso o tarea quiere documentar (ej. "cómo armo un presupuesto", "cómo doy de alta
un cliente nuevo", "cómo cierro la caja del día") y pedile que te cuente el paso a paso de cómo lo
hace HOY, con sus propias palabras. Aclarale que puede mandarlo como más le resulte cómodo:

- **Por escrito**: tipeando los pasos, aunque sean desordenados o incompletos.
- **Por audio**: un audio/nota de voz contando el proceso en voz alta.
- **Por video**: grabando su pantalla o a sí mismo haciendo el proceso.

Si adjunta un audio o un video, procesalo vos (transcribí/mirá el contenido) en vez de pedirle que
lo pase a texto — el objetivo es que ella no tenga que hacer trabajo extra para enseñarte.

## Paso 2 · Repreguntar lo que falte

Un relato real casi nunca viene completo. Antes de armar el SOP, identificá huecos y preguntá
puntualmente: ¿qué información/herramienta necesita para arrancar el paso 1? ¿qué decide en cada
bifurcación (ej. "si el cliente ya existe vs. si es nuevo")? ¿cómo sabe que el proceso terminó bien?
¿qué pasa si algo sale mal en el medio? No inventes pasos que no te contó.

## Paso 3 · Armar la nota del SOP

Elegí un slug corto en kebab-case para el proceso (ej. "armar-presupuesto") — va a ser el nombre del
archivo y lo que uses en wikilinks. Armá la nota con esta estructura fija (mismo formato que
`profesia-vault/_templates/sop.md`):

```markdown
---
tipo: sop
nombre: "<Nombre del proceso, legible>"
quien_lo_hace: "<la persona / su equipo>"
agentes_relacionados: []
fecha_carga: <fecha de hoy, YYYY-MM-DD>
tags: []
---

## Pasos

1. ...

## Decisiones / bifurcaciones

- Si <condición> → <qué hacer>

## Qué puede salir mal

- <problema frecuente> → <cómo se resuelve>

## Cómo se sabe que terminó

<criterio de "está listo">

_Cargado el <fecha> a partir de <texto/audio/video>._
```

Si alguno de los 27 agentes cubre parte de este proceso, agregalo a `agentes_relacionados` como
wikilink (ej. `["[[agentes/gaston-presupuestador]]"]`) — solo si el relato lo sugiere, no inventes
conexiones. Inferí 1-3 `tags` cortos del contenido, igual que en las notas de agentes.

Mostrale el SOP armado y dejala corregir antes de guardarlo — no asumas que quedó perfecto a la
primera.

## Paso 4 · Guardar

Guardá la nota en `profesia-vault/sops/<slug-del-proceso>.md`. Si ya existe una nota con ese slug
(la persona está actualizando un proceso, no documentando uno nuevo), preguntale si querés
sobrescribirla o si es un proceso distinto que necesita otro nombre — no pises una nota existente
sin confirmar.

## Paso 5 · Conectar con los agentes y el vault

Si alguno de los 27 agentes quedó en `agentes_relacionados`, sugerile activarlo (si no lo estaba ya)
la próxima vez que corra `configuracion-inicial` — podés poner `activo: true` vos mismo en la nota
de `profesia-vault/agentes/<slug>.md` si es evidente que corresponde. Mencionale que puede volver
a generar su mapa visual con la skill `segundo-cerebro` para ver este proceso sumado al mapa.
