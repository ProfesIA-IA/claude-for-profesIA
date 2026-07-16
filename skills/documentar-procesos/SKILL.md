---
name: documentar-procesos
description: >
  Use this skill when the user wants to teach their ProfesIA agents how they actually work so it gets saved as a standard operating procedure — phrases like "quiero cargar información a mi segundo cerebro", "te voy a enseñar cómo hago esto", "quiero que aprendas mi proceso de...", "armame un SOP de...", "documentar cómo trabajo", or when the user starts describing a work process step by step (in text, a voice note, or a video) wanting it documented for future reuse.
metadata:
  version: "0.1.0"
---

# Documentar procesos (cargar al segundo cerebro)

Esta skill alimenta el segundo cerebro de la persona con SUS propios procesos de trabajo, para que
en el futuro los agentes (o ella misma) puedan repetirlos sin reinventar cada vez. El resultado se
guarda en `profesia.sops.md` en la raíz del proyecto — es el "documento de respaldo" de procesos,
hermano de `profesia.config.md`.

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

## Paso 3 · Armar el SOP internamente

Convertí el relato en un SOP (Procedimiento Operativo Estándar) con esta estructura fija:

```markdown
## <Nombre del proceso>

**Cuándo se usa:** <disparador — cuándo arranca este proceso>
**Quién lo hace hoy:** <la persona / su equipo>
**Agente(s) de ProfesIA que podrían ayudar:** <si alguno de los 27 agentes cubre partes de esto>

### Pasos
1. ...
2. ...
3. ...

### Decisiones / bifurcaciones
- Si <condición> → <qué hacer>

### Qué puede salir mal
- <problema frecuente> → <cómo se resuelve>

### Cómo se sabe que terminó
<criterio de "está listo">

_Cargado el <fecha> a partir de <texto/audio/video>._
```

Mostrale el SOP armado y dejala corregir antes de guardarlo — no asumas que quedó perfecto a la
primera.

## Paso 4 · Guardar

Agregá el SOP como una sección nueva al final de `profesia.sops.md` en la raíz del proyecto (creá el
archivo con un título "# Procedimientos Operativos Estándar (SOPs)" si todavía no existe). No
sobrescribas SOPs anteriores — cada proceso documentado se suma como su propia sección.

## Paso 5 · Conectar con los agentes y el segundo cerebro

Si alguno de los 27 agentes quedó mencionado en "Agente(s) de ProfesIA que podrían ayudar", sugerile
activarlo (si no lo estaba ya) la próxima vez que corra `configuracion-inicial`, y mencionale que
puede volver a generar su mapa visual con la skill `segundo-cerebro` para ver este proceso
sumado como parte de su segundo cerebro.
