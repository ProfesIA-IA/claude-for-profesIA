/**
 * Segundo Cerebro — interactive knowledge map
 *
 * Visual language: Sistema-ATS (CSS particles, dark blooms, orange/navy glow).
 * Graph layer: Canvas 2D force simulation (no Three/D3) so clusters can
 * expand/collapse with the same premium motion feel.
 *
 * Data: window.__BRAIN_DATA__ (data.js) — works with file://.
 * Optional: fetch('./data/brain.json') when served over http.
 */

const DATA_URL = "./data/brain.json";

const COLORS = {
  orange: "#EF7A1E",
  orangeGlow: "rgba(239,122,30,",
  navy: "#203E7F",
  navyGlow: "rgba(58,110,210,",
  line: "rgba(201,206,218,",
  core: "#F6A862",
  white: "#FFFFFF",
};

const CLUSTER_PALETTE = [
  [239, 122, 30],
  [58, 110, 210],
  [111, 134, 184],
  [246, 168, 98],
  [46, 158, 91],
  [100, 149, 237],
  [232, 160, 60],
  [80, 120, 200],
  [180, 110, 60],
];

/* ---------------- ATS-style floating particles ---------------- */

function createParticles(count = 28) {
  const container = document.getElementById("particles");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${4 + Math.random() * 6}s`;
    p.style.animationDelay = `${Math.random() * 5}s`;
    const size = 2 + Math.random() * 4;
    p.style.width = p.style.height = `${size}px`;
    if (Math.random() > 0.5) {
      p.style.background = "rgba(32,62,127,.5)";
    }
    container.appendChild(p);
  }
}

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
    clusters: raw.clusters
      .filter((c) => c.id !== "marketing-contenido")
      .map((c, i) => ({
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
  // Prefers embedded data so file:// works without a local server.
  if (window.__BRAIN_DATA__) {
    return normalizeBrainData(window.__BRAIN_DATA__);
  }
  // Future: const res = await fetch('/api/assistant/activity');
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
  return normalizeBrainData(await res.json());
}

/* ---------------- Force simulation ---------------- */

class ForceBrain {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.data = data;
    this.nodes = [];
    this.links = [];
    this.expanded = new Set();
    this.hovered = null;
    this.selected = null;
    this.dragNode = null;

    this.camera = { x: 0, y: 0, scale: 1, targetScale: 1, tx: 0, ty: 0 };
    this.pointer = { x: 0, y: 0, down: false, moved: false, lastX: 0, lastY: 0 };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.time = 0;
    this.hintHidden = false;
    this.touring = false;
    this.tourTimer = null;
    this.tourIndex = 0;
    this.tourAbort = false;

    this._buildGraph();
    this._bindUI();
    this._bindPointer();
    this._resize();
    window.addEventListener("resize", () => this._resize());
    requestAnimationFrame((t) => this._loop(t));
  }

  _buildGraph() {
    const clusters = this.data.clusters;
    const n = clusters.length;
    const radius = Math.min(260, 90 + n * 22);

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
      r: 16,
      mass: 3,
      pulse: 0,
      visible: true,
      alpha: 1,
      targetAlpha: 1,
      rgb: [239, 122, 30],
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
        fx: Math.cos(angle) * radius,
        fy: Math.sin(angle) * radius,
        homeAngle: angle,
        homeRadius: radius,
        r: 11 + Math.min(6, c.nodos.length * 0.4),
        mass: 2,
        pulse: Math.random() * Math.PI * 2,
        visible: true,
        alpha: 1,
        targetAlpha: 1,
        rgb,
        expanded: false,
      };
      this.nodes.push(hub);
      this.links.push({ source: core, target: hub, strength: 0.02, kind: "spine" });

      c.nodos.forEach((nodo, j) => {
        const a = angle + ((j - (c.nodos.length - 1) / 2) * 0.28) / Math.max(1, c.nodos.length * 0.15);
        const child = {
          id: nodo.id,
          type: "leaf",
          label: nodo.titulo,
          detail: nodo.detalle,
          clusterId: c.id,
          parentId: c.id,
          x: hub.x + Math.cos(a) * 40,
          y: hub.y + Math.sin(a) * 40,
          vx: 0,
          vy: 0,
          fx: null,
          fy: null,
          r: 4.5,
          mass: 0.6,
          pulse: Math.random() * Math.PI * 2,
          visible: false,
          alpha: 0,
          targetAlpha: 0,
          rgb,
        };
        this.nodes.push(child);
        this.links.push({
          source: hub,
          target: child,
          strength: 0.08,
          kind: "branch",
          clusterId: c.id,
        });
      });
    });

    // Soft cross-links between nearby hubs (constellation feel)
    const hubs = this.nodes.filter((n) => n.type === "hub");
    for (let i = 0; i < hubs.length; i++) {
      const a = hubs[i];
      const b = hubs[(i + 1) % hubs.length];
      this.links.push({ source: a, target: b, strength: 0.004, kind: "ring" });
      if (i % 2 === 0) {
        const c = hubs[(i + 2) % hubs.length];
        this.links.push({ source: a, target: c, strength: 0.002, kind: "ring" });
      }
    }

    this._updateStats();
  }

  _updateStats() {
    const clusters = this.data.clusters.length;
    const nodes = this.data.clusters.reduce((s, c) => s + c.nodos.length, 0);
    document.getElementById("stat-clusters").textContent = `${clusters} áreas`;
    document.getElementById("stat-nodes").textContent = `${nodes} células`;
  }

  _bindUI() {
    this.panel = document.getElementById("panel");
    this.panelKicker = document.getElementById("panel-kicker");
    this.panelTitle = document.getElementById("panel-title");
    this.panelDetail = document.getElementById("panel-detail");
    this.panelMeta = document.getElementById("panel-meta");
    this.panelAction = document.getElementById("panel-action");
    this.resetBtn = document.getElementById("reset");
    this.hint = document.getElementById("hint");
    this.tourBtn = document.getElementById("tour");
    this.tourBanner = document.getElementById("tour-banner");
    this.tourLabel = document.getElementById("tour-label");

    document.getElementById("panel-close").addEventListener("click", () => this._closePanel());
    this.panelAction.addEventListener("click", () => {
      if (this.selected?.type === "hub" && this.expanded.has(this.selected.id)) {
        this._collapse(this.selected.id);
        this._closePanel();
      }
    });
    this.resetBtn.addEventListener("click", () => {
      this._stopTour(false);
      this._resetView();
    });
    this.tourBtn.addEventListener("click", () => {
      if (this.touring) this._stopTour(true);
      else this.startTour();
    });
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
      if (hit) {
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
        this.hovered = hit;
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
      c.classList.remove("is-hover-node");
      if (!this.selected) this._closePanel();
    });

    const end = (e) => {
      if (this.dragNode && this.dragNode.type !== "core" && this.dragNode.type !== "hub") {
        this.dragNode.fx = null;
        this.dragNode.fy = null;
      } else if (this.dragNode?.type === "hub" && !this.expanded.has(this.dragNode.id)) {
        // keep soft home bias via homeAngle; clear hard pin after drag
        this.dragNode.fx = null;
        this.dragNode.fy = null;
      } else if (this.dragNode?.type === "core") {
        this.dragNode.fx = 0;
        this.dragNode.fy = 0;
      }
      this.dragNode = null;
      this.pointer.down = false;
      this.canvas.classList.remove("is-dragging");

      if (!this.pointer.moved) {
        const p = pos(e.changedTouches ? e : e);
        // for pointerup, use last known or event
        const clientX = e.clientX ?? this.pointer.x;
        const clientY = e.clientY ?? this.pointer.y;
        const rect = this.canvas.getBoundingClientRect();
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;
        const world = this._screenToWorld(sx, sy);
        const hit = this._hitTest(world.x, world.y);
        if (hit) this._onClickNode(hit);
        else this._closePanel();
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
        this.camera.targetScale = Math.min(2.8, Math.max(0.45, this.camera.targetScale * factor));
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
    this.tourAbort = false;
    this.tourIndex = 0;
    this.tourBtn.classList.add("is-active");
    this.tourBtn.textContent = "Detener recorrido";
    this.tourBanner.hidden = false;
    requestAnimationFrame(() => this.tourBanner.classList.add("is-open"));

    // Overview beat first
    for (const id of [...this.expanded]) this._collapse(id);
    this.camera.targetScale = 0.85;
    this.camera.tx = 0;
    this.camera.ty = 0;
    this.selected = this.nodes.find((n) => n.type === "core");
    this._showPanel(this.selected);
    this.tourLabel.textContent = "Vista general del conocimiento";

    clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => this._tourNextHub(), 1800);
  }

  _tourNextHub() {
    if (!this.touring || this.tourAbort) return;
    const hubs = this.nodes.filter((n) => n.type === "hub");
    if (this.tourIndex >= hubs.length) {
      this._tourFinale();
      return;
    }

    const hub = hubs[this.tourIndex];
    this.tourIndex += 1;

    for (const id of [...this.expanded]) {
      if (id !== hub.id) this._collapse(id);
    }

    this._expand(hub.id);
    this._focusOn(hub, 1.65);
    this.selected = hub;
    this.hovered = hub;
    this._showPanel(hub, true);
    this.tourLabel.textContent = hub.label;

    clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => {
      if (!this.touring) return;
      // Peek a leaf inside the cluster
      const leaves = this.nodes.filter((n) => n.parentId === hub.id && n.visible);
      const leaf = leaves[Math.min(1, leaves.length - 1)] || leaves[0];
      if (leaf) {
        this._focusOn(leaf, 1.9);
        this.selected = leaf;
        this.hovered = leaf;
        this._showPanel(leaf);
        this.tourLabel.textContent = leaf.label;
      }
      this.tourTimer = setTimeout(() => this._tourNextHub(), 2200);
    }, 2600);
  }

  _tourFinale() {
    if (!this.touring) return;
    for (const id of [...this.expanded]) this._collapse(id);
    this.camera.targetScale = 1;
    this.camera.tx = 0;
    this.camera.ty = 0;
    this.hovered = null;
    this.tourLabel.textContent = "Recorrido completo";
    const core = this.nodes.find((n) => n.type === "core");
    this.selected = core;
    this._showPanel(core);

    clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => this._stopTour(false), 1600);
  }

  _stopTour(userStopped) {
    this.touring = false;
    this.tourAbort = true;
    clearTimeout(this.tourTimer);
    this.tourBtn.classList.remove("is-active");
    this.tourBtn.textContent = "Recorrer cerebro";
    this.tourBanner.classList.remove("is-open");
    setTimeout(() => {
      if (!this.touring) this.tourBanner.hidden = true;
    }, 400);
    if (userStopped) {
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
    for (const id of [...this.expanded]) this._collapse(id);
    this.camera.targetScale = 1;
    this.camera.tx = 0;
    this.camera.ty = 0;
    this.resetBtn.classList.remove("is-visible");
    this._closePanel();
    // re-home hubs
    for (const n of this.nodes) {
      if (n.type === "hub") {
        n.fx = Math.cos(n.homeAngle) * n.homeRadius;
        n.fy = Math.sin(n.homeAngle) * n.homeRadius;
        setTimeout(() => {
          if (!this.expanded.has(n.id)) {
            n.fx = null;
            n.fy = null;
          }
        }, 800);
      }
    }
  }

  _onClickNode(node) {
    this._hideHint();
    this._showReset();
    this.selected = node;

    if (node.type === "hub") {
      if (this.expanded.has(node.id)) {
        this._collapse(node.id);
        this._showPanel(node);
      } else {
        // collapse others for focus (zoom-into-cluster feel)
        for (const id of [...this.expanded]) {
          if (id !== node.id) this._collapse(id);
        }
        this._expand(node.id);
        this._focusOn(node, 1.55);
        this._showPanel(node, true);
      }
    } else {
      this._showPanel(node);
      if (node.type === "leaf") {
        const hub = this.nodes.find((n) => n.id === node.clusterId);
        if (hub) this._focusOn(hub, Math.max(this.camera.targetScale, 1.45));
      }
    }
  }

  _expand(clusterId) {
    this.expanded.add(clusterId);
    const hub = this.nodes.find((n) => n.id === clusterId);
    if (hub) {
      hub.expanded = true;
      hub.fx = hub.x;
      hub.fy = hub.y;
    }
    const leaves = this.nodes.filter((n) => n.parentId === clusterId);
    leaves.forEach((leaf, i) => {
      leaf.visible = true;
      leaf.targetAlpha = 1;
      const angle = (hub?.homeAngle || 0) + ((i - (leaves.length - 1) / 2) * 0.45);
      const dist = 55 + leaves.length * 4;
      leaf.x = (hub?.x || 0) + Math.cos(angle) * (dist * 0.35);
      leaf.y = (hub?.y || 0) + Math.sin(angle) * (dist * 0.35);
      leaf.vx = Math.cos(angle) * 2;
      leaf.vy = Math.sin(angle) * 2;
    });
  }

  _collapse(clusterId) {
    this.expanded.delete(clusterId);
    const hub = this.nodes.find((n) => n.id === clusterId);
    if (hub) {
      hub.expanded = false;
      hub.fx = null;
      hub.fy = null;
    }
    for (const leaf of this.nodes.filter((n) => n.parentId === clusterId)) {
      leaf.targetAlpha = 0;
      // hide after fade
      setTimeout(() => {
        if (leaf.targetAlpha === 0) leaf.visible = false;
      }, 420);
    }
  }

  _focusOn(node, scale = 1.5) {
    this.camera.targetScale = scale;
    this.camera.tx = -node.x;
    this.camera.ty = -node.y;
  }

  _showHoverPanel(node) {
    // Only auto-open on hover if nothing selected, or same cluster browsing
    if (this.selected && this.selected.id === node.id) return;
    if (!this.pointer.down && !this.selected) {
      // light preview via panel without locking selection
      this._fillPanel(node, false);
      this.panel.hidden = false;
      requestAnimationFrame(() => this.panel.classList.add("is-open"));
    }
  }

  _showPanel(node, showCollapse = false) {
    this._fillPanel(node, showCollapse || (node.type === "hub" && this.expanded.has(node.id)));
    this.panel.hidden = false;
    requestAnimationFrame(() => this.panel.classList.add("is-open"));
  }

  _fillPanel(node, showCollapse) {
    if (node.type === "core") {
      this.panelKicker.textContent = "Núcleo";
      this.panelTitle.textContent = "Segundo Cerebro";
      this.panelDetail.textContent = node.detail;
      this.panelMeta.textContent = `${this.data.clusters.length} áreas de conocimiento`;
    } else if (node.type === "hub") {
      this.panelKicker.textContent = "Área de conocimiento";
      this.panelTitle.textContent = node.label;
      this.panelDetail.textContent = node.detail;
      this.panelMeta.textContent = `${node.count} células · click para ${this.expanded.has(node.id) ? "colapsar" : "expandir"}`;
    } else {
      const hub = this.data.clusters.find((c) => c.id === node.clusterId);
      this.panelKicker.textContent = hub?.nombre || "Célula";
      this.panelTitle.textContent = node.label;
      this.panelDetail.textContent = node.detail;
      this.panelMeta.textContent = "Pieza de trabajo del asistente";
    }
    this.panelAction.hidden = !showCollapse;
  }

  _closePanel() {
    this.selected = null;
    this.panel.classList.remove("is-open");
    setTimeout(() => {
      if (!this.panel.classList.contains("is-open")) this.panel.hidden = true;
    }, 400);
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
      if (!n.visible && n.type === "leaf") continue;
      if (n.alpha < 0.2) continue;
      const d = Math.hypot(n.x - wx, n.y - wy);
      const pad = n.type === "hub" ? n.r + 10 : n.r + 6;
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

  _tick(dt) {
    const nodes = this.nodes;
    const links = this.links;

    // spring links
    for (const link of links) {
      const a = link.source;
      const b = link.target;
      if (link.kind === "branch" && !this.expanded.has(link.clusterId)) continue;
      if ((a.type === "leaf" && a.alpha < 0.05) || (b.type === "leaf" && b.alpha < 0.05)) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      let ideal = 90;
      if (link.kind === "branch") ideal = 70;
      if (link.kind === "ring") ideal = 200;
      if (link.kind === "spine") ideal = 160;

      const force = (dist - ideal) * link.strength;
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

    // repulsion
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (a.type === "leaf" && !a.visible) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        if (b.type === "leaf" && !b.visible) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 1) dist2 = 1;
        const dist = Math.sqrt(dist2);
        let charge = 1800;
        if (a.type === "leaf" || b.type === "leaf") charge = 400;
        if (a.type === "hub" && b.type === "hub") charge = 4200;
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

    // gentle mouse wake
    const world = this._screenToWorld(this.pointer.x, this.pointer.y);
    for (const n of nodes) {
      if (n.type === "leaf" && !n.visible) continue;
      if (n.fx != null) continue;
      const dx = n.x - world.x;
      const dy = n.y - world.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 120 * 120 && d2 > 1) {
        const d = Math.sqrt(d2);
        const push = (1 - d / 120) * 0.35;
        n.vx += (dx / d) * push;
        n.vy += (dy / d) * push;
      }
    }

    // hub home bias when collapsed
    for (const n of nodes) {
      if (n.type === "hub" && !n.expanded && n.fx == null) {
        const hx = Math.cos(n.homeAngle) * n.homeRadius;
        const hy = Math.sin(n.homeAngle) * n.homeRadius;
        n.vx += (hx - n.x) * 0.01;
        n.vy += (hy - n.y) * 0.01;
      }
      if (n.type === "core") {
        n.fx = 0;
        n.fy = 0;
      }
    }

    // integrate
    const damp = Math.pow(0.86, dt * 60);
    for (const n of nodes) {
      if (n.type === "leaf" && !n.visible && n.alpha <= 0) continue;
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
      // alpha lerp (ATS ease feel)
      n.alpha += (n.targetAlpha - n.alpha) * Math.min(1, dt * 6);
      n.pulse += dt * (n.type === "core" ? 2.2 : 1.4);
    }

    // camera ease
    this.camera.scale += (this.camera.targetScale - this.camera.scale) * Math.min(1, dt * 5);
    this.camera.x += (this.camera.tx - this.camera.x) * Math.min(1, dt * 4);
    this.camera.y += (this.camera.ty - this.camera.y) * Math.min(1, dt * 4);
  }

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(this.camera.x, this.camera.y);

    // links
    for (const link of this.links) {
      const a = link.source;
      const b = link.target;
      if (link.kind === "branch" && !this.expanded.has(link.clusterId)) continue;
      const alphaMul = Math.min(a.alpha, b.alpha);
      if (alphaMul < 0.05) continue;

      let alpha = 0.12;
      let width = 1;
      if (link.kind === "spine") {
        alpha = 0.22;
        width = 1.4;
      }
      if (link.kind === "branch") {
        alpha = 0.35 * alphaMul;
        width = 1.1;
      }
      if (link.kind === "ring") {
        alpha = 0.07;
        width = 0.8;
      }

      const hovered =
        this.hovered &&
        ((this.hovered === a && (b.type !== "leaf" || b.visible)) ||
          (this.hovered === b && (a.type !== "leaf" || a.visible)) ||
          (this.hovered.clusterId &&
            (a.clusterId === this.hovered.clusterId || b.clusterId === this.hovered.clusterId) &&
            link.kind !== "ring"));

      if (hovered) alpha = Math.min(0.55, alpha + 0.2);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `${COLORS.line}${alpha})`;
      ctx.lineWidth = width / this.camera.scale;
      ctx.stroke();
    }

    // nodes
    for (const n of this.nodes) {
      if (n.type === "leaf" && !n.visible && n.alpha < 0.02) continue;
      const isHover = this.hovered === n;
      const isSel = this.selected === n;
      const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
      const [r, g, b] = n.rgb || [239, 122, 30];

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, n.alpha));

      // glow
      const glowR = n.r * (n.type === "core" ? 4.2 : n.type === "hub" ? 3.2 : 2.4);
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
      const glowA = (n.type === "core" ? 0.45 : 0.28) + pulse * 0.12;
      glow.addColorStop(0, `rgba(${r},${g},${b},${glowA})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // expanding rings on hubs/core (ATS motif)
      if (n.type === "hub" || n.type === "core") {
        const ringT = (n.pulse % 2) / 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6 + ringT * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - ringT) * 0.35})`;
        ctx.lineWidth = 1.2 / this.camera.scale;
        ctx.stroke();
      }

      // body
      const rad = n.r * (isHover || isSel ? 1.25 : 1);
      const body = ctx.createRadialGradient(n.x - rad * 0.3, n.y - rad * 0.3, 0, n.x, n.y, rad);
      if (n.type === "core") {
        body.addColorStop(0, "#F6A862");
        body.addColorStop(1, COLORS.navy);
      } else {
        body.addColorStop(0, `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 20)},1)`);
        body.addColorStop(1, `rgba(${r},${g},${b},1)`);
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      if (isHover || isSel) {
        ctx.strokeStyle = "rgba(255,255,255,.55)";
        ctx.lineWidth = 1.5 / this.camera.scale;
        ctx.stroke();
      }

      // labels
      if (n.type === "hub" || (n.type === "leaf" && n.alpha > 0.7 && this.camera.scale > 1.1) || n.type === "core") {
        const label = n.type === "hub" ? this._shortLabel(n.label, 22) : n.type === "core" ? "" : this._shortLabel(n.label, 28);
        if (label) {
          ctx.font = `${n.type === "hub" ? 600 : 500} ${11 / this.camera.scale}px "DM Sans", sans-serif`;
          ctx.fillStyle = `rgba(255,255,255,${0.55 + n.alpha * 0.35})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, n.x, n.y + rad + 6 / this.camera.scale);
        }
        if (n.type === "hub" && !n.expanded) {
          ctx.font = `500 ${9 / this.camera.scale}px "DM Sans", sans-serif`;
          ctx.fillStyle = `rgba(201,206,218,${0.45 * n.alpha})`;
          ctx.fillText(`${n.count}`, n.x, n.y + rad + 18 / this.camera.scale);
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
  "Conectando células de trabajo…",
  "Mapeando decisiones recientes…",
  "Calibrando la red neuronal…",
];

function runLoader(onReady) {
  const loader = document.getElementById("loader");
  const sub = document.getElementById("loader-sub");
  const fill = document.getElementById("loader-fill");
  let step = 0;
  const totalMs = 2400;
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
      }, 160);
    }
    if (step >= LOADER_STEPS.length) {
      clearInterval(interval);
      fill.style.width = "100%";
      sub.textContent = "Listo";
      setTimeout(() => {
        loader.classList.add("is-done");
        onReady();
      }, 420);
    }
  }, tickMs);

  fill.style.width = `${100 / LOADER_STEPS.length}%`;
}

createParticles(30);

loadBrainData()
  .then((data) => {
    const canvas = document.getElementById("brain");
    const brain = new ForceBrain(canvas, data);
    runLoader(() => {
      // Soft intro: pull back then settle, then start guided tour
      brain.camera.scale = 0.55;
      brain.camera.targetScale = 1;
      setTimeout(() => brain.startTour(), 700);
    });
  })
  .catch((err) => {
    console.error(err);
    const loader = document.getElementById("loader");
    const sub = document.getElementById("loader-sub");
    sub.textContent = "No se pudieron cargar los datos. Revisá data.js.";
    sub.style.color = "#F6A862";
    document.getElementById("hint").innerHTML =
      `<p style="color:#F6A862">No se pudieron cargar los datos del cerebro. Revisá data.js.</p>`;
    setTimeout(() => loader.classList.add("is-done"), 1200);
  });
