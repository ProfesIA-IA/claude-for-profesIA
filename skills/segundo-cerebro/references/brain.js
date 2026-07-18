/**
 * Segundo Cerebro — graph view estilo Obsidian
 *
 * Toda la red se dibuja desde el arranque (nada queda oculto detrás de un
 * click): fondo plano oscuro, nodos chatos sin glow, tamaño según cantidad
 * de conexiones, líneas finas. Al pasar el mouse (o seleccionar / buscar /
 * tocar la leyenda) se resalta el nodo + sus vecinos directos y se atenúa
 * el resto — el mismo comportamiento que el graph view real de Obsidian.
 *
 * Data: window.__BRAIN_DATA__ (data.js) — funciona directo con file://.
 * Alternativa: fetch('./data/brain.json') si se sirve por http.
 */

const DATA_URL = "./data/brain.json";

const COLORS = {
  accent: [239, 122, 30],
  edge: "rgba(255,255,255,",
  edgeDim: "rgba(255,255,255,",
};

const CLUSTER_PALETTE = [
  [239, 122, 30],
  [90, 140, 240],
  [111, 134, 184],
  [246, 168, 98],
  [86, 178, 121],
  [120, 159, 237],
  [232, 160, 60],
  [130, 150, 210],
  [200, 130, 80],
];

/* ---------------- Data adapter (swap for real sources) ---------------- */

/**
 * Normalize any payload into { clusters: [{id, nombre, descripcion, nodos}] }.
 * Replace or extend this when connecting a task log / API.
 */
function normalizeBrainData(raw) {
  if (!raw || !Array.isArray(raw.clusters)) {
    throw new Error("Invalid brain payload: expected { clusters: [...] }");
  }
  return {
    meta: raw.meta || {},
    clusters: raw.clusters.map((c, i) => ({
      id: c.id || `cluster-${i}`,
      nombre: c.nombre || c.name || `Área ${i + 1}`,
      descripcion: c.descripcion || c.description || "",
      nodos: (c.nodos || c.nodes || []).map((n, j) => ({
        id: n.id || `${c.id || i}-nodo-${j}`,
        titulo: n.titulo || n.title || `Nodo ${j + 1}`,
        detalle: n.detalle || n.detail || n.description || "",
      })),
    })),
  };
}

async function loadBrainData() {
  // Prefiere la data embebida para que funcione con file:// sin servidor.
  if (window.__BRAIN_DATA__) {
    return normalizeBrainData(window.__BRAIN_DATA__);
  }
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
  return normalizeBrainData(await res.json());
}

/* ---------------- Force simulation (grafo tipo Obsidian) ---------------- */

class ForceBrain {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.data = data;
    this.nodes = [];
    this.links = [];
    this.adjacency = new Map();
    this.hovered = null;
    this.selected = null;
    this.dragNode = null;
    this.searchQuery = "";
    this.activeClusterId = null;
    this.lockedClusterId = null;
    this.focusIds = null;

    this.camera = { x: 0, y: 0, scale: 1, targetScale: 1, tx: 0, ty: 0 };
    this.pointer = { x: 0, y: 0, down: false, moved: false, lastX: 0, lastY: 0 };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.time = 0;
    this.hintHidden = false;
    this.touring = false;
    this.tourTimer = null;
    this.tourIndex = 0;

    this._buildGraph();
    this._buildLegend();
    this._bindUI();
    this._bindPointer();
    this._resize();
    window.addEventListener("resize", () => this._resize());
    requestAnimationFrame((t) => this._loop(t));
  }

  /* ---- Grafo: todo visible desde el arranque, tamaño = cantidad de links ---- */

  _buildGraph() {
    const clusters = this.data.clusters;
    const n = clusters.length;
    const radius = Math.min(240, 100 + n * 20);

    this.nodes = [];
    this.links = [];

    const core = {
      id: "core",
      type: "core",
      label: "Yo",
      detail: "Núcleo del segundo cerebro — punto de partida de todo el trabajo.",
      clusterId: null,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
      r: 15,
      mass: 3,
      dispAlpha: 1,
      rgb: COLORS.accent,
    };
    this.nodes.push(core);

    clusters.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rgb = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
      const hub = {
        id: c.id,
        type: "hub",
        label: c.nombre,
        detail: c.descripcion,
        clusterId: c.id,
        count: c.nodos.length,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        r: Math.max(9, Math.min(22, 9 + Math.sqrt(c.nodos.length) * 3)),
        mass: 2,
        dispAlpha: 1,
        rgb,
      };
      this.nodes.push(hub);
      this.links.push({ source: core, target: hub, strength: 0.02, kind: "spine", ideal: 150 });

      c.nodos.forEach((nodo, j) => {
        const a = angle + ((j - (c.nodos.length - 1) / 2) * 0.32) / Math.max(1, c.nodos.length * 0.18);
        const child = {
          id: nodo.id,
          type: "leaf",
          label: nodo.titulo,
          detail: nodo.detalle,
          clusterId: c.id,
          parentId: c.id,
          x: hub.x + Math.cos(a) * 42,
          y: hub.y + Math.sin(a) * 42,
          vx: 0,
          vy: 0,
          fx: null,
          fy: null,
          r: 4.2,
          mass: 0.6,
          dispAlpha: 1,
          rgb,
        };
        this.nodes.push(child);
        this.links.push({ source: hub, target: child, strength: 0.06, kind: "branch", ideal: 46, clusterId: c.id });
      });
    });

    // adjacency (para el resaltado de vecinos al hacer hover/click)
    for (const link of this.links) {
      const a = link.source.id;
      const b = link.target.id;
      if (!this.adjacency.has(a)) this.adjacency.set(a, new Set());
      if (!this.adjacency.has(b)) this.adjacency.set(b, new Set());
      this.adjacency.get(a).add(b);
      this.adjacency.get(b).add(a);
    }

    this._updateStats();
  }

  _updateStats() {
    const clusters = this.data.clusters.length;
    const nodes = this.data.clusters.reduce((s, c) => s + c.nodos.length, 0);
    document.getElementById("stat-clusters").textContent = `${clusters} áreas`;
    document.getElementById("stat-nodes").textContent = `${nodes} notas`;
  }

  /* ---- Leyenda (equivalente a los "groups" de Obsidian) ---- */

  _buildLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = "";
    this.data.clusters.forEach((c, i) => {
      const rgb = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
      const item = document.createElement("div");
      item.className = "legend-item";
      item.dataset.clusterId = c.id;
      item.innerHTML = `<span class="legend-swatch" style="background: rgb(${rgb.join(",")})"></span><span>${this._escapeHtml(c.nombre)}</span>`;

      item.addEventListener("mouseenter", () => {
        if (!this.lockedClusterId) {
          this.activeClusterId = c.id;
          this._updateFocus();
        }
      });
      item.addEventListener("mouseleave", () => {
        if (!this.lockedClusterId) {
          this.activeClusterId = null;
          this._updateFocus();
        }
      });
      item.addEventListener("click", () => {
        if (this.lockedClusterId === c.id) {
          this.lockedClusterId = null;
          this.activeClusterId = null;
        } else {
          this.lockedClusterId = c.id;
          this.activeClusterId = c.id;
        }
        this._renderLegendActiveState();
        this._updateFocus();
      });

      legend.appendChild(item);
    });
  }

  _renderLegendActiveState() {
    document.querySelectorAll(".legend-item").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.clusterId === this.lockedClusterId);
    });
  }

  _escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  /* ---- UI ---- */

  _bindUI() {
    this.panel = document.getElementById("panel");
    this.panelKicker = document.getElementById("panel-kicker");
    this.panelTitle = document.getElementById("panel-title");
    this.panelDetail = document.getElementById("panel-detail");
    this.panelMeta = document.getElementById("panel-meta");
    this.resetBtn = document.getElementById("reset");
    this.hint = document.getElementById("hint");
    this.tourBtn = document.getElementById("tour");
    this.tourBanner = document.getElementById("tour-banner");
    this.tourLabel = document.getElementById("tour-label");
    this.searchInput = document.getElementById("search");

    document.getElementById("panel-close").addEventListener("click", () => {
      this.selected = null;
      this._closePanel();
      this._updateFocus();
    });
    this.resetBtn.addEventListener("click", () => {
      this._stopTour(false);
      this._resetView();
    });
    this.tourBtn.addEventListener("click", () => {
      if (this.touring) this._stopTour(true);
      else this.startTour();
    });
    this.searchInput.addEventListener("input", (e) => {
      if (this.touring) this._stopTour(true);
      this.searchQuery = e.target.value.trim().toLowerCase();
      this._updateFocus();
    });
  }

  /* ---- Resaltado: nodo + vecinos directos, atenuar el resto ---- */

  _updateFocus() {
    let ids = null;
    if (this.hovered) {
      ids = new Set([this.hovered.id, ...(this.adjacency.get(this.hovered.id) || [])]);
    } else if (this.selected) {
      ids = new Set([this.selected.id, ...(this.adjacency.get(this.selected.id) || [])]);
    } else if (this.activeClusterId) {
      ids = new Set(
        this.nodes.filter((n) => n.id === "core" || n.clusterId === this.activeClusterId).map((n) => n.id)
      );
    } else if (this.searchQuery) {
      ids = new Set(
        this.nodes.filter((n) => n.label && n.label.toLowerCase().includes(this.searchQuery)).map((n) => n.id)
      );
    }
    this.focusIds = ids;
  }

  _bindPointer() {
    const c = this.canvas;

    const pos = (e) => {
      const rect = c.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    c.addEventListener("pointerdown", (e) => {
      if (this.touring) this._stopTour(true);
      c.setPointerCapture(e.pointerId);
      const p = pos(e);
      this.pointer.down = true;
      this.pointer.moved = false;
      this.pointer.lastX = p.x;
      this.pointer.lastY = p.y;
      const world = this._screenToWorld(p.x, p.y);
      const hit = this._hitTest(world.x, world.y);
      if (hit && hit.type !== "core") {
        this.dragNode = hit;
        hit.fx = hit.x;
        hit.fy = hit.y;
      }
    });

    c.addEventListener("pointermove", (e) => {
      const p = pos(e);
      this.pointer.x = p.x;
      this.pointer.y = p.y;
      const world = this._screenToWorld(p.x, p.y);

      if (this.pointer.down) {
        const dx = p.x - this.pointer.lastX;
        const dy = p.y - this.pointer.lastY;
        if (Math.hypot(dx, dy) > 3) this.pointer.moved = true;
        this.pointer.lastX = p.x;
        this.pointer.lastY = p.y;

        if (this.dragNode) {
          this.dragNode.fx = world.x;
          this.dragNode.fy = world.y;
          this.dragNode.x = world.x;
          this.dragNode.y = world.y;
          this.dragNode.vx = 0;
          this.dragNode.vy = 0;
        } else {
          this.camera.tx += dx / this.camera.scale;
          this.camera.ty += dy / this.camera.scale;
          c.classList.add("is-dragging");
        }
      } else {
        const hit = this._hitTest(world.x, world.y);
        if (hit !== this.hovered) {
          this.hovered = hit;
          this._updateFocus();
        }
        c.classList.toggle("is-hover-node", !!hit);
        if (hit) {
          this._showHoverPanel(hit);
        } else if (!this.selected) {
          this._closePanel();
        }
      }
    });

    c.addEventListener("pointerleave", () => {
      this.hovered = null;
      this._updateFocus();
      c.classList.remove("is-hover-node");
      if (!this.selected) this._closePanel();
    });

    const end = (e) => {
      if (this.dragNode) {
        this.dragNode.fx = null;
        this.dragNode.fy = null;
      }
      this.dragNode = null;
      this.pointer.down = false;
      this.canvas.classList.remove("is-dragging");

      if (!this.pointer.moved) {
        const clientX = e.clientX ?? this.pointer.x;
        const clientY = e.clientY ?? this.pointer.y;
        const rect = this.canvas.getBoundingClientRect();
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;
        const world = this._screenToWorld(sx, sy);
        const hit = this._hitTest(world.x, world.y);
        if (hit) this._onClickNode(hit);
        else {
          this.selected = null;
          this._closePanel();
          this._updateFocus();
        }
      }
    };

    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);

    c.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (this.touring) this._stopTour(true);
        const factor = Math.exp(-e.deltaY * 0.0012);
        this.camera.targetScale = Math.min(2.8, Math.max(0.4, this.camera.targetScale * factor));
        this._showReset();
        this._hideHint();
      },
      { passive: false }
    );
  }

  /* ---------------- Guided tour ---------------- */

  startTour() {
    this._hideHint();
    this._showReset();
    this.touring = true;
    this.tourIndex = 0;
    this.selected = null;
    this._closePanel();
    this.tourBtn.classList.add("is-active");
    this.tourBtn.textContent = "Detener";
    this.tourBanner.hidden = false;
    requestAnimationFrame(() => this.tourBanner.classList.add("is-open"));

    this.activeClusterId = null;
    this._updateFocus();
    this.camera.targetScale = 0.9;
    this.camera.tx = 0;
    this.camera.ty = 0;
    this.tourLabel.textContent = "Vista general del mapa";

    clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => this._tourNext(), 1600);
  }

  _tourNext() {
    if (!this.touring) return;
    const hubs = this.nodes.filter((n) => n.type === "hub");
    if (this.tourIndex >= hubs.length) {
      this._tourFinale();
      return;
    }
    const hub = hubs[this.tourIndex];
    this.tourIndex += 1;

    this.activeClusterId = hub.id;
    this._updateFocus();
    this._focusOn(hub, 1.4);
    this.tourLabel.textContent = hub.label;

    clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => this._tourNext(), 2200);
  }

  _tourFinale() {
    if (!this.touring) return;
    this.activeClusterId = null;
    this._updateFocus();
    this.camera.targetScale = 1;
    this.camera.tx = 0;
    this.camera.ty = 0;
    this.tourLabel.textContent = "Recorrido completo";

    clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => this._stopTour(false), 1400);
  }

  _stopTour(userStopped) {
    this.touring = false;
    clearTimeout(this.tourTimer);
    this.tourBtn.classList.remove("is-active");
    this.tourBtn.textContent = "Recorrer";
    this.tourBanner.classList.remove("is-open");
    setTimeout(() => {
      if (!this.touring) this.tourBanner.hidden = true;
    }, 350);
    if (userStopped) {
      this.activeClusterId = null;
      this._updateFocus();
      this.tourLabel.textContent = "";
    }
  }

  _hideHint() {
    if (this.hintHidden) return;
    this.hintHidden = true;
    this.hint.classList.add("is-hidden");
  }

  _showReset() {
    this.resetBtn.classList.add("is-visible");
  }

  _resetView() {
    this.camera.targetScale = 1;
    this.camera.tx = 0;
    this.camera.ty = 0;
    this.resetBtn.classList.remove("is-visible");
    this.selected = null;
    this.hovered = null;
    this.activeClusterId = null;
    this.lockedClusterId = null;
    this.searchQuery = "";
    this.searchInput.value = "";
    this._renderLegendActiveState();
    this._updateFocus();
    this._closePanel();
  }

  _onClickNode(node) {
    this._hideHint();
    this._showReset();
    if (this.selected === node) {
      this.selected = null;
      this._closePanel();
    } else {
      this.selected = node;
      this._showPanel(node);
    }
    this._updateFocus();
  }

  _showHoverPanel(node) {
    if (this.selected && this.selected.id === node.id) return;
    if (!this.pointer.down && !this.selected) {
      this._fillPanel(node);
      this.panel.hidden = false;
      requestAnimationFrame(() => this.panel.classList.add("is-open"));
    }
  }

  _showPanel(node) {
    this._fillPanel(node);
    this.panel.hidden = false;
    requestAnimationFrame(() => this.panel.classList.add("is-open"));
  }

  _fillPanel(node) {
    if (node.type === "core") {
      this.panelKicker.textContent = "Núcleo";
      this.panelTitle.textContent = "Segundo Cerebro";
      this.panelDetail.textContent = node.detail;
      this.panelMeta.textContent = `${this.data.clusters.length} áreas de conocimiento`;
    } else if (node.type === "hub") {
      this.panelKicker.textContent = "Área de conocimiento";
      this.panelTitle.textContent = node.label;
      this.panelDetail.textContent = node.detail;
      this.panelMeta.textContent = `${node.count} notas conectadas`;
    } else {
      const hub = this.data.clusters.find((c) => c.id === node.clusterId);
      this.panelKicker.textContent = hub?.nombre || "Nota";
      this.panelTitle.textContent = node.label;
      this.panelDetail.textContent = node.detail;
      this.panelMeta.textContent = "Pieza de trabajo del asistente";
    }
  }

  _closePanel() {
    this.panel.classList.remove("is-open");
    setTimeout(() => {
      if (!this.panel.classList.contains("is-open")) this.panel.hidden = true;
    }, 350);
  }

  _screenToWorld(sx, sy) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    return {
      x: (sx - w / 2) / this.camera.scale - this.camera.x,
      y: (sy - h / 2) / this.camera.scale - this.camera.y,
    };
  }

  _hitTest(wx, wy) {
    let best = null;
    let bestD = Infinity;
    for (const n of this.nodes) {
      const d = Math.hypot(n.x - wx, n.y - wy);
      const pad = n.type === "hub" || n.type === "core" ? n.r + 8 : n.r + 5;
      if (d < pad && d < bestD) {
        best = n;
        bestD = d;
      }
    }
    return best;
  }

  _resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /* ---- Simulación: spring links + repulsión + centrado suave (estilo d3-force) ---- */

  _tick(dt) {
    const nodes = this.nodes;
    const links = this.links;

    for (const link of links) {
      const a = link.source;
      const b = link.target;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const force = (dist - link.ideal) * link.strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (a.fx == null) {
        a.vx += fx / a.mass;
        a.vy += fy / a.mass;
      }
      if (b.fx == null) {
        b.vx -= fx / b.mass;
        b.vy -= fy / b.mass;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 1) dist2 = 1;
        const dist = Math.sqrt(dist2);
        let charge = 900;
        if (a.type === "leaf" || b.type === "leaf") charge = 260;
        if (a.type === "hub" && b.type === "hub") charge = 3200;
        const force = charge / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (a.fx == null) {
          a.vx -= fx / a.mass;
          a.vy -= fy / a.mass;
        }
        if (b.fx == null) {
          b.vx += fx / b.mass;
          b.vy += fy / b.mass;
        }
      }
    }

    // centrado suave (evita que el grafo se vaya a la deriva)
    for (const n of nodes) {
      if (n.fx != null) continue;
      n.vx -= n.x * 0.0018;
      n.vy -= n.y * 0.0018;
    }

    // el núcleo queda fijo como ancla del mapa
    const core = nodes[0];
    core.fx = 0;
    core.fy = 0;

    const damp = Math.pow(0.85, dt * 60);
    for (const n of nodes) {
      if (n.fx != null) {
        n.x = n.fx;
        n.y = n.fy;
        n.vx = 0;
        n.vy = 0;
      } else {
        n.vx *= damp;
        n.vy *= damp;
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
      }
      const target = !this.focusIds ? 1 : this.focusIds.has(n.id) ? 1 : 0.15;
      n.dispAlpha += (target - n.dispAlpha) * Math.min(1, dt * 8);
    }

    this.camera.scale += (this.camera.targetScale - this.camera.scale) * Math.min(1, dt * 5);
    this.camera.x += (this.camera.tx - this.camera.x) * Math.min(1, dt * 4);
    this.camera.y += (this.camera.ty - this.camera.y) * Math.min(1, dt * 4);
  }

  _focusOn(node, scale = 1.4) {
    this.camera.targetScale = scale;
    this.camera.tx = -node.x;
    this.camera.ty = -node.y;
  }

  /* ---- Dibujo: círculos chatos, líneas finas, sin glow ---- */

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(this.camera.x, this.camera.y);

    // líneas
    for (const link of this.links) {
      const a = link.source;
      const b = link.target;
      const bothInFocus = !this.focusIds || (this.focusIds.has(a.id) && this.focusIds.has(b.id));
      const alphaMul = Math.min(a.dispAlpha, b.dispAlpha);
      let alpha = link.kind === "spine" ? 0.28 : 0.2;
      if (!bothInFocus) alpha *= 0.25;
      alpha *= alphaMul;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `${COLORS.edge}${alpha})`;
      ctx.lineWidth = (link.kind === "spine" ? 1.2 : 1) / this.camera.scale;
      ctx.stroke();
    }

    // nodos
    for (const n of this.nodes) {
      const isHover = this.hovered === n;
      const isSel = this.selected === n;
      const inFocus = !this.focusIds || this.focusIds.has(n.id);
      const [r, g, b] = n.rgb || [180, 180, 185];

      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(1, n.dispAlpha));

      const rad = n.r * (isHover || isSel ? 1.25 : 1);
      ctx.beginPath();
      ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();

      if (isHover || isSel) {
        ctx.strokeStyle = "rgba(255,255,255,.65)";
        ctx.lineWidth = 1.5 / this.camera.scale;
        ctx.stroke();
      } else if (this.focusIds && inFocus && n.type !== "core") {
        ctx.strokeStyle = `rgba(${r},${g},${b},.5)`;
        ctx.lineWidth = 1 / this.camera.scale;
        ctx.stroke();
      }

      // etiquetas: hub/core siempre, leaf sólo si hay zoom o está resaltado
      const showLabel =
        n.type !== "leaf" || this.camera.scale > 0.85 || (this.focusIds && this.focusIds.has(n.id));
      if (showLabel && n.dispAlpha > 0.3) {
        const label = this._shortLabel(n.label, n.type === "hub" ? 24 : 26);
        if (label) {
          ctx.font = `${n.type === "hub" || n.type === "core" ? 600 : 500} ${11 / this.camera.scale}px "DM Sans", sans-serif`;
          ctx.fillStyle = `rgba(220,221,222,${0.5 + n.dispAlpha * 0.4})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, n.x, n.y + rad + 5 / this.camera.scale);
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  _shortLabel(text, max) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  _loop(t) {
    const now = t / 1000;
    const dt = Math.min(0.033, now - (this.time || now));
    this.time = now;
    this._tick(dt);
    this._draw();
    requestAnimationFrame((nt) => this._loop(nt));
  }
}

/* ---------------- Boot + loading sequence ---------------- */

const LOADER_STEPS = [
  "Sincronizando áreas de conocimiento…",
  "Conectando notas…",
  "Mapeando decisiones recientes…",
  "Armando el grafo…",
];

function runLoader(onReady) {
  const loader = document.getElementById("loader");
  const sub = document.getElementById("loader-sub");
  const fill = document.getElementById("loader-fill");
  let step = 0;
  const totalMs = 1600;
  const tickMs = totalMs / LOADER_STEPS.length;

  const interval = setInterval(() => {
    step += 1;
    const progress = Math.min(100, (step / LOADER_STEPS.length) * 100);
    fill.style.width = `${progress}%`;
    if (step < LOADER_STEPS.length) {
      sub.style.opacity = "0";
      setTimeout(() => {
        sub.textContent = LOADER_STEPS[step];
        sub.style.opacity = "1";
      }, 140);
    }
    if (step >= LOADER_STEPS.length) {
      clearInterval(interval);
      fill.style.width = "100%";
      sub.textContent = "Listo";
      setTimeout(() => {
        loader.classList.add("is-done");
        onReady();
      }, 350);
    }
  }, tickMs);

  fill.style.width = `${100 / LOADER_STEPS.length}%`;
}

loadBrainData()
  .then((data) => {
    const canvas = document.getElementById("brain");
    const brain = new ForceBrain(canvas, data);
    runLoader(() => {
      brain.camera.scale = 0.6;
      brain.camera.targetScale = 1;
      setTimeout(() => brain.startTour(), 600);
    });
  })
  .catch((err) => {
    console.error(err);
    const loader = document.getElementById("loader");
    const sub = document.getElementById("loader-sub");
    sub.textContent = "No se pudieron cargar los datos. Revisá data.js.";
    sub.style.color = "#EF7A1E";
    document.getElementById("hint").innerHTML =
      `<p style="color:#EF7A1E">No se pudieron cargar los datos del cerebro. Revisá data.js.</p>`;
    setTimeout(() => loader.classList.add("is-done"), 1000);
  });
