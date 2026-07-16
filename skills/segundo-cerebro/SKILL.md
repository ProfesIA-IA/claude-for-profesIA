---
name: segundo-cerebro
description: >
  Use this skill when the user wants a visual map of their ProfesIA agent staff and what the plugin knows about their profession — phrases like "generá mi segundo cerebro", "quiero ver el mapa de mis agentes", "cómo trabajan mis agentes", "mostrame cómo se organizan los agentes de ProfesIA", "quiero ver qué información cargué", or "armá un gráfico de mi segundo cerebro".
metadata:
  version: "0.1.0"
---

# Segundo Cerebro de Agentes ProfesIA

Generá una página HTML interactiva y navegable (un mapa de nodos tipo "segundo cerebro") que le
muestre al usuario, de forma visual, dos cosas: (1) cómo están organizados y qué hace cada uno de
los 27 agentes de ProfesIA, agrupados por equipo, y (2) qué información de su profesión ya quedó
cargada en `profesia.config.md`. No inventes datos: si algo no está configurado todavía, decilo en
vez de completarlo con un valor de ejemplo.

## Qué es esta visualización

Es un motor de grafo en Canvas 2D (sin librerías, sin Three.js/D3) con la estética de ProfesIA
(fondo oscuro, blooms naranja/navy, partículas). Un núcleo central ("Vos") se conecta a un hub por
cada equipo; cada hub, al hacer click, expande sus agentes como células alrededor. Ya viene
armado en `references/` — tu trabajo es generar los DATOS (`data.js` + `data/brain.json`), no tocar
el motor.

## Paso 1 · Reunir los datos

1. **Catálogo de agentes (fijo):** leé `references/agentes.json` (ruta:
   `${CLAUDE_PLUGIN_ROOT}/skills/segundo-cerebro/references/agentes.json`). Trae los 27
   agentes ya agrupados por equipo con `slug`, `display` y `one_liner` — es la fuente de verdad,
   no la reescribas.
2. **Configuración del usuario (variable):** buscá `profesia.config.md` en la raíz del proyecto.
   - Si existe, extraé: Profesión u oficio, Nombre, cómo trabaja (solo/a o con equipo), y cada
     dato de referencia completado bajo "## Datos de referencia para los agentes" (horarios,
     formas de pago, condición fiscal, etc.). Omití cualquier campo cuyo valor sea un placeholder
     sin completar — cualquier variante que contenga la palabra "completar", como `_completar_`
     o `_completar (si aplica)_`, cuenta como sin completar. También fijate qué agentes están
     tildados con `[x]` bajo "## Agentes activos".
   - Si NO existe (o está vacío), no inventes nada: vas a armar igual el mapa de los 27 agentes,
     pero el cluster de configuración va a tener un único nodo invitando a correr la skill
     `configuracion-inicial` primero.

## Paso 2 · Armar el payload del grafo

Construí un objeto con esta forma (mismo formato que ya entiende `brain.js`):

```json
{
  "meta": { "titulo": "Segundo Cerebro de Agentes ProfesIA", "subtitulo": "<Nombre o profesión del usuario si la tenés>", "fuente": "profesia" },
  "clusters": [
    {
      "id": "equipo-1-comunicacion",
      "nombre": "Equipo 1 · Comunicación",
      "descripcion": "<descripcion del equipo, viene de agentes.json>",
      "nodos": [
        { "id": "tincho-mensajero", "titulo": "Tincho · el Mensajero", "detalle": "<one_liner>" }
      ]
    },
    ...
    {
      "id": "tu-configuracion",
      "nombre": "Tu información cargada",
      "descripcion": "Lo que sabés vos sobre tu profesión y que los agentes ya no te vuelven a preguntar.",
      "nodos": [
        { "titulo": "Profesión u oficio", "detalle": "<valor real de profesia.config.md>" },
        { "titulo": "Agentes activos", "detalle": "<lista de los agentes tildados>" }
      ]
    }
  ]
}
```

Un cluster por cada uno de los 5 equipos (usá `agentes.json` para nombre/descripcion/agentes) más
un 6to cluster "Tu información cargada" con los datos de `profesia.config.md`. No agregues clusters
inventados ni agentes que no estén en `agentes.json`.

Si además existe `profesia.sops.md` en la raíz del proyecto (procesos documentados con la skill
`documentar-procesos`), sumá un 7mo cluster "Procesos documentados" con un nodo por cada
sección `##` de ese archivo (`titulo` = nombre del proceso, `detalle` = su "Cuándo se usa"). Si el
archivo no existe todavía, simplemente omitilo — no lo inventes.

## Paso 3 · Generar los archivos de salida

1. Elegí como carpeta de salida `segundo-cerebro/` en la raíz del proyecto (creala si no existe).
2. Copiá tal cual (sin modificar) desde `references/`: `index.html`, `styles.css`, `brain.js` y
   `grain.png`.
3. Escribí el payload del Paso 2 en dos archivos dentro de esa carpeta:
   - `data.js` con `window.__BRAIN_DATA__ = {...};`
   - `data/brain.json` con el mismo JSON (por si en el futuro se sirve con un servidor local).

## Paso 4 · Cierre

Decile al usuario que abra `segundo-cerebro/index.html` con doble click (funciona directo con
`file://`, no hace falta servidor) y qué se va a encontrar: un núcleo central, un hub por equipo, y
al hacer click en cada hub se expanden sus agentes; el cluster "Tu información cargada" muestra qué
tan completo está su `profesia.config.md`. Si ese cluster salió casi vacío, sugerile correr la skill
`configuracion-inicial` para completarlo y volver a generar el mapa.

No hace falta ningún servidor ni dependencia externa — todo el motor ya viene armado en
`references/`, esta skill solo genera los datos.
