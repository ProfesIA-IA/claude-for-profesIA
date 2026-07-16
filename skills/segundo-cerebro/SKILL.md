---
name: segundo-cerebro
description: >
  Use this skill when the user wants a visual map of their ProfesIA agent staff and what the plugin knows about their profession — phrases like "generá mi segundo cerebro", "quiero ver el mapa de mis agentes", "cómo trabajan mis agentes", "mostrame cómo se organizan los agentes de ProfesIA", "quiero ver qué información cargué", or "armá un gráfico de mi segundo cerebro".
metadata:
  version: "0.1.0"
---

# Segundo Cerebro de Agentes ProfesIA

Generá una página HTML interactiva y navegable (un mapa de nodos tipo "segundo cerebro") del perfil
de ESTA persona en particular: (1) sus propios agentes activos y cómo los usa (casos de uso
concretos, no un one-liner genérico), (2) su dolor operativo y su zona de genio, y (3) sus tareas
recientes según su bitácora. Todo sale de `profesia.config.md`, que ya se completó al correr el
onboarding. No inventes datos: si algo no está configurado todavía, decilo en vez de completarlo con
un valor de ejemplo, y nunca reemplaces esta información personal por el catálogo completo de los 27
agentes del plugin.

## Qué es esta visualización

Es un motor de grafo en Canvas 2D (sin librerías, sin Three.js/D3) con la estética de ProfesIA
(fondo oscuro, blooms naranja/navy, partículas). Un núcleo central ("Vos") se conecta a un hub por
cada grupo relevante (sus equipos con agentes activos, cómo trabaja, sus tareas); cada hub, al hacer
click, expande sus nodos alrededor. Ya viene armado en `references/` — tu trabajo es generar los
DATOS (`data.js` + `data/brain.json`) reflejando a esta persona puntual, no tocar el motor.

**Importante — esto NO es un catálogo genérico:** el mapa tiene que ser el de ESTA persona, con SUS
agentes activos, SUS casos de uso, SU dolor/zona de genio y SUS tareas — no un volcado de los 27
agentes del plugin agrupados por equipo. Si le mostrás el catálogo completo en vez de su propia
configuración, la skill está mal usada.

## Paso 1 · Reunir los datos

1. **Configuración del usuario (fuente principal):** buscá `profesia.config.md` en la raíz del
   proyecto.
   - Si NO existe, o existe pero la Profesión todavía dice `_completar_` (nunca se corrió el
     onboarding): NO generes el mapa de los 27 agentes como reemplazo. Armá un payload mínimo de
     un solo cluster ("Todavía no configuraste tu segundo cerebro") con un nodo que invite a correr
     `configuracion-inicial` primero, generá igual los archivos de salida (Paso 3) y avisale al
     usuario que sin esa configuración no hay nada personal que mapear todavía. Cortá acá.
   - Si existe y está completo, extraé: Profesión u oficio, Nombre, Dolor operativo, Zona de genio,
     y — bajo "## Agentes y casos de uso para vos" — SOLO los agentes tildados con `[x]`, con el
     "Caso de uso concreto" escrito debajo de cada uno (si ese caso de uso quedó en `_completar_`,
     mirá `references/agentes.json` únicamente para rellenar ese agente puntual con su one_liner de
     respaldo — nunca uses agentes.json para agregar agentes que la persona no activó). También
     extraé las filas de "## Bitácora de trabajo (tu agenda)" que no digan "sin registros todavía".
   - Omití cualquier campo cuyo valor sea un placeholder sin completar — cualquier variante que
     contenga la palabra "completar", como `_completar_` o `_completar (si aplica)_`, cuenta como
     sin completar.

## Paso 2 · Armar el payload del grafo (personal, no el catálogo)

Construí un objeto con esta forma (mismo formato que ya entiende `brain.js`):

```json
{
  "meta": { "titulo": "Segundo Cerebro de <Nombre/Profesión>", "subtitulo": "<Profesión u oficio>", "fuente": "profesia" },
  "clusters": [
    {
      "id": "equipo-1-comunicacion",
      "nombre": "Equipo 1 · Comunicación",
      "descripcion": "Tus agentes activos de este equipo",
      "nodos": [
        { "id": "tincho-mensajero", "titulo": "Tincho · el Mensajero", "detalle": "<Caso de uso concreto de profesia.config.md, NO el one_liner genérico>" }
      ]
    },
    {
      "id": "como-trabajas",
      "nombre": "Cómo trabajás",
      "descripcion": "Tu dolor operativo y tu zona de genio, tal como los contaste.",
      "nodos": [
        { "titulo": "Tu dolor operativo", "detalle": "<texto real>" },
        { "titulo": "Tu zona de genio", "detalle": "<texto real>" }
      ]
    },
    {
      "id": "tus-tareas",
      "nombre": "Tus tareas (bitácora)",
      "descripcion": "Lo último que fuiste registrando sesión a sesión.",
      "nodos": [
        { "titulo": "<fecha>", "detalle": "Avancé: <qué avancé> · Sigo con: <con qué sigo>" }
      ]
    }
  ]
}
```

Reglas clave (para no repetir el error de mostrar el catálogo completo):

- Un cluster por equipo, pero **solo si ese equipo tiene al menos un agente activo** — si ningún
  agente de un equipo está tildado, ese cluster directamente no existe en el payload. No incluyas
  agentes sin tildar.
- El `detalle` de cada agente es su **caso de uso concreto personal** (de `profesia.config.md`), no
  el one-liner genérico del catálogo — esto es lo que hace que el mapa sea "suyo" y no una lista de
  producto.
- Sumá el cluster "Cómo trabajás" (dolor + zona de genio) y el cluster "Tus tareas (bitácora)" —
  estos dos son los que hacen que el mapa muestre a la persona y no solo a los agentes.
- Si además existe `profesia.sops.md` en la raíz del proyecto (procesos documentados con la skill
  `documentar-procesos`), sumá un cluster "Procesos documentados" con un nodo por cada
  sección `##` de ese archivo (`titulo` = nombre del proceso, `detalle` = su "Cuándo se usa"). Si el
  archivo no existe, simplemente omitilo.
- Nunca agregues un cluster con los 27 agentes del catálogo "por las dudas" ni uses
  `references/agentes.json` para completar equipos enteros — ese archivo es solo un diccionario de
  respaldo para rellenar el one_liner de un agente puntual que la persona ya activó pero cuyo caso
  de uso quedó vacío.

## Paso 3 · Generar los archivos de salida

1. Elegí como carpeta de salida `segundo-cerebro/` en la raíz del proyecto (creala si no existe).
2. Copiá tal cual (sin modificar) desde `references/`: `index.html`, `styles.css`, `brain.js` y
   `grain.png`.
3. Escribí el payload del Paso 2 en dos archivos dentro de esa carpeta:
   - `data.js` con `window.__BRAIN_DATA__ = {...};`
   - `data/brain.json` con el mismo JSON (por si en el futuro se sirve con un servidor local).

## Paso 4 · Cierre

Decile al usuario que abra `segundo-cerebro/index.html` con doble click (funciona directo con
`file://`, no hace falta servidor) y qué se va a encontrar: un núcleo central, un hub por cada
equipo donde tiene agentes activos (no los 5 equipos completos si no los usa todos), el cluster
"Cómo trabajás" con su dolor/zona de genio, y "Tus tareas (bitácora)" con lo último que registró. Si
el mapa salió chico o vacío, es señal de que todavía no completó bien `profesia.config.md` — sugerile
correr `configuracion-inicial` (o el check-in de bitácora) y volver a generar el mapa después.

No hace falta ningún servidor ni dependencia externa — todo el motor ya viene armado en
`references/`, esta skill solo genera los datos, y esos datos son siempre los de la persona, nunca
el catálogo completo del plugin.
