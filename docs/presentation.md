---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');

  :root {
    --bg: #0b0c0f;
    --bg-elevated: #12141a;
    --bg-card: #181b24;
    --gold: #d4af37;
    --gold-dim: rgba(212, 175, 55, 0.15);
    --gold-glow: rgba(212, 175, 55, 0.35);
    --text: #f4f1ea;
    --text-muted: #c5cad6;
    --border: rgba(212, 175, 55, 0.18);
    --success: #6ee7a0;
    --success-dim: rgba(110, 231, 160, 0.12);
    --accent-blue: #9eb4ff;
    --accent-blue-dim: rgba(100, 120, 200, 0.12);
    --space-cell-y: 0.55em;
    --space-cell-x: 1em;
    --space-row-min: 2.35em;
    --space-stack: 0.85rem;
    --space-grid: 0.85rem;
  }

  section {
    font-family: "DM Sans", system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 32px 44px 28px;
    font-size: 19px;
    line-height: 1.38;
    position: relative;
    overflow: visible;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  section::before {
    content: "";
    position: absolute;
    top: -120px;
    right: -80px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--gold-glow) 0%, transparent 68%);
    opacity: 0.4;
    pointer-events: none;
    z-index: 0;
  }
  section.dense {
    background: linear-gradient(165deg, #0b0c0f 0%, #0e1016 55%, #12141a 100%);
  }

  section > * {
    position: relative;
    z-index: 1;
  }

  section::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0.55;
  }

  h1, h2, h3 {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  h1 { font-size: 2.4em; margin: 0; line-height: 1.05; }
  h2 {
    font-size: 1.35em;
    margin: 0 0 0.65rem;
    padding-bottom: 0.4em;
    border-bottom: 1px solid var(--border);
  }
  h2 .eyebrow {
    display: block;
    font-family: "DM Sans", sans-serif;
    font-size: 0.38em;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.35em;
  }

  p, li { color: var(--text-muted); }
  strong { color: var(--text); font-weight: 600; }
  em { color: var(--gold); font-style: normal; }

  ul { margin: 0.3em 0; padding-left: 1.1em; }
  li { margin: 0.2em 0; }
  li::marker { color: var(--gold); }

  blockquote {
    margin: 0.5em 0 0;
    padding: 0.55em 0.85em;
    border: none;
    border-left: 3px solid var(--gold);
    background: var(--gold-dim);
    border-radius: 0 10px 10px 0;
    font-size: 0.9em;
    color: var(--text);
    line-height: 1.35;
  }

  .slide-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-stack);
    width: 100%;
  }

  .table-panel {
    width: 100%;
    display: block;
    box-sizing: border-box;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin: 0;
  }
  .table-panel table,
  .slide-table {
    width: 100% !important;
    max-width: 100% !important;
    display: table !important;
    table-layout: fixed !important;
    box-sizing: border-box;
    margin: 0;
    border: none !important;
    border-radius: 0;
  }
  .slide-table col.col-a,
  .slide-table col.col-b {
    width: 50%;
  }
  .slide-table th,
  .slide-table td {
    padding: var(--space-cell-y) var(--space-cell-x) !important;
    vertical-align: middle !important;
    line-height: 1.35;
    min-height: var(--space-row-min);
  }
  .table-panel .arch {
    margin: 0;
    padding: var(--space-cell-y) var(--space-cell-x);
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    justify-content: space-evenly;
    min-height: var(--space-row-min);
  }
  .table-panel .arch .node {
    background: var(--bg-card);
  }

  section table {
    width: 100% !important;
    max-width: 100% !important;
    display: table !important;
    table-layout: fixed !important;
    font-size: 0.82em;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border) !important;
    background: var(--bg-card) !important;
    color: var(--text) !important;
  }
  section table th:first-child,
  section table td:first-child,
  section table th:last-child,
  section table td:last-child {
    width: 50%;
  }
  section table tr {
    background: var(--bg-card) !important;
  }
  section table tr:nth-child(even) {
    background: var(--bg-elevated) !important;
  }
  section table th {
    background: linear-gradient(180deg, #222633, #181b24) !important;
    color: var(--gold) !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.9em;
    padding: var(--space-cell-y) var(--space-cell-x) !important;
    border: none !important;
    vertical-align: middle !important;
  }
  section table td {
    padding: var(--space-cell-y) var(--space-cell-x) !important;
    border-top: 1px solid var(--border) !important;
    border-left: none !important;
    border-right: none !important;
    background: transparent !important;
    color: var(--text) !important;
    vertical-align: middle !important;
    line-height: 1.35;
    min-height: var(--space-row-min);
  }
  section table td strong { color: var(--text) !important; }

  footer {
    color: var(--text-muted) !important;
    font-size: 0.6em;
    opacity: 0.9;
  }
  footer::after {
    color: var(--gold) !important;
    opacity: 0.9;
  }

  /* --- Layout helpers --- */
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-grid); margin: 0; }
  .cols-equal { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-grid); margin: 0; align-items: stretch; }
  .cols-equal .card { height: 100%; }
  .cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-grid); margin: 0; }
  .slide-stack .cols,
  .slide-stack .cols-equal,
  .slide-stack .cols-3,
  .slide-stack .table-panel,
  .slide-stack .card { margin: 0; }

  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: var(--space-cell-y) var(--space-cell-x);
    position: relative;
    z-index: 1;
    min-width: 0;
  }
  .card h3 {
    font-family: "DM Sans", sans-serif;
    font-size: 0.88em;
    font-weight: 700;
    margin: 0 0 0.3em;
    color: var(--gold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .card p, .card ul { font-size: 0.86em; margin: 0; color: var(--text-muted); }
  .card ul { padding-left: 1em; }

  .card-accent {
    border-color: rgba(212, 175, 55, 0.35);
    background: linear-gradient(145deg, rgba(212,175,55,0.08), var(--bg-card));
  }

  .card-success {
    border-color: rgba(110, 231, 160, 0.25);
    background: linear-gradient(145deg, var(--success-dim), var(--bg-card));
  }
  .card-success h3 { color: var(--success); }

  .num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.65em;
    height: 1.65em;
    border-radius: 50%;
    background: var(--gold);
    color: #0c0b09;
    font-family: "DM Sans", sans-serif;
    font-size: 0.75em;
    font-weight: 700;
    margin-bottom: 0.35em;
  }

  .tag {
    display: inline-block;
    font-size: 0.62em;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.25em 0.75em;
    margin-bottom: 0.6em;
  }

  .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    flex-wrap: wrap;
    margin: 0.5em 0 0;
    font-size: 0.8em;
    color: var(--text-muted);
  }
  .flow span {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.35em 0.65em;
    color: var(--text);
  }
  .flow .arrow { color: var(--gold); border: none; background: none; padding: 0; }

  .arch {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: wrap;
    gap: var(--space-grid);
    margin-top: 0;
    font-size: 0.78em;
  }
  .arch .node {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: calc(var(--space-cell-y) - 0.15em) calc(var(--space-cell-x) - 0.35em);
    color: var(--text);
  }
  .arch .node-gold {
    border-color: rgba(212,175,55,0.4);
    color: var(--gold);
  }

  .footnote {
    font-size: 0.75em;
    color: var(--text-muted);
    margin-top: 0.45em;
    font-style: italic;
    line-height: 1.35;
  }
  .compact-list {
    margin: 0;
    padding-left: 1em;
    font-size: 0.78em;
    line-height: 1.35;
    color: var(--text-muted);
  }
  .compact-list li { margin: 0.12em 0; }
  .slide-footer {
    margin: 0;
    font-size: 0.8em;
    color: var(--text);
    font-weight: 600;
    line-height: 1.35;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-grid);
    margin: 0;
  }
  .stat-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .stat-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .stat-box {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.55em 0.65em;
    text-align: center;
  }
  .stat-box.accent {
    border-color: rgba(212,175,55,0.35);
    background: linear-gradient(145deg, rgba(212,175,55,0.1), var(--bg-card));
  }
  .stat-box.success {
    border-color: rgba(110,231,160,0.3);
    background: linear-gradient(145deg, var(--success-dim), var(--bg-card));
  }
  .stat-box .val {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.55em;
    font-weight: 600;
    color: var(--text);
    line-height: 1.05;
  }
  .stat-box.accent .val { color: var(--gold); }
  .stat-box.success .val { color: var(--success); }
  .stat-box .lbl {
    font-size: 0.58em;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 0.25em;
    line-height: 1.25;
  }
  .callout {
    border-left: 3px solid var(--gold);
    background: var(--gold-dim);
    border-radius: 0 10px 10px 0;
    padding: 0.5em 0.75em;
    font-size: 0.82em;
    color: var(--text);
    line-height: 1.4;
    margin: 0;
  }
  .callout.success { border-left-color: var(--success); background: var(--success-dim); }
  .badge {
    display: inline-block;
    font-size: 0.58em;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.2em 0.55em;
    border-radius: 999px;
    margin-right: 0.35em;
  }
  .badge-met { background: var(--success-dim); color: var(--success); border: 1px solid rgba(110,231,160,0.35); }
  .badge-partial { background: var(--gold-dim); color: var(--gold); border: 1px solid rgba(212,175,55,0.35); }
  .badge-planned { background: var(--accent-blue-dim); color: var(--accent-blue); border: 1px solid rgba(100,120,200,0.35); }
  .feature-list {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 0.78em;
    line-height: 1.45;
  }
  .feature-list li {
    margin: 0.22em 0;
    padding-left: 1.1em;
    position: relative;
    color: var(--text-muted);
  }
  .feature-list li::before {
    content: "▸";
    position: absolute;
    left: 0;
    color: var(--gold);
    font-weight: 700;
  }

  /* --- Dense slides (multi-block content) --- */
  section.dense {
    display: flex;
    flex-direction: column;
    padding: 28px 44px 26px;
    font-size: 17px;
  }
  section.dense > h2 {
    flex-shrink: 0;
    font-size: 1.22em;
    margin-bottom: 0.55rem;
    padding-bottom: 0.35em;
  }
  section.dense .slide-stack {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  section.dense .slide-stack.fill > .slide-footer,
  section.dense .slide-stack.fill > .footnote,
  section.dense .slide-stack.fill > .chips {
    margin-top: auto;
    padding-top: 0.65rem;
  }
  section.closing.dense .slide-stack.fill {
    flex: 1;
  }
  section.dense .grid-2x2 {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--space-grid);
    align-items: stretch;
  }
  section.dense .grid-2x2 .card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  /* Slide 06 — HTML table keeps row heights & gaps aligned in PDF */
  section.limitations {
    padding: 26px 44px 34px;
  }
  section.limitations > h2 {
    margin-bottom: 0.7rem;
  }
  section.limitations .slide-stack.fill {
    flex: 1;
    gap: 0.85rem;
    justify-content: center;
  }
  section.limitations table.limitations-table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: separate !important;
    border-spacing: 1rem !important;
    border: none !important;
    background: transparent !important;
    margin: 0 !important;
    font-size: 1em;
  }
  section.limitations table.limitations-table tr {
    background: transparent !important;
  }
  section.limitations table.limitations-table td {
    width: 50% !important;
    vertical-align: top !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    color: inherit !important;
  }
  section.limitations table.limitations-table .card {
    height: 100%;
    min-height: 8.5em;
    margin: 0;
    padding: 0.9em 1.05em;
    box-sizing: border-box;
  }
  section.limitations table.limitations-table .card h3 {
    font-family: "DM Sans", sans-serif;
    font-size: 0.82em;
    font-weight: 700;
    margin: 0 0 0.55em;
    color: var(--gold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  section.limitations table.limitations-table .card-success h3 {
    color: var(--success);
  }
  section.limitations table.limitations-table ul {
    margin: 0;
    padding-left: 1.15em;
    font-size: 0.84em;
    line-height: 1.55;
    list-style-position: outside;
  }
  section.limitations table.limitations-table li {
    margin: 0.32em 0;
    color: var(--text-muted);
  }
  section.limitations table.limitations-table strong {
    color: var(--text);
  }
  section.limitations .slide-footer {
    margin: 0;
    padding-top: 0.85rem;
    font-size: 0.78em;
    line-height: 1.45;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  section.dense .card { padding: 0.65em 0.85em; }
  section.dense .card h3 { font-size: 0.8em; margin-bottom: 0.2em; }
  section.dense .card p,
  section.dense .card ul,
  section.dense li { font-size: 0.82em; }
  section.dense .slide-table th,
  section.dense .slide-table td,
  section.dense section table th,
  section.dense section table td {
    padding: 0.42em 0.7em !important;
    font-size: 0.76em;
    min-height: 2em;
  }
  section.dense .slide-footer { font-size: 0.8em; }
  section.dense .footnote { font-size: 0.68em; margin-top: 0.3em; }
  section.dense .arch { font-size: 0.7em; gap: 0.4em; }
  section.dense .table-panel .arch {
    padding: 0.42em 0.7em;
    min-height: 2em;
  }
  section.dense .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45em;
    margin-top: 0.45em !important;
  }
  section.dense .chip { font-size: 0.58em; padding: 0.35em 0.75em; }
  section.dense .cta { margin-top: 0.4em; font-size: 0.95em; }
  code {
    font-family: "DM Sans", monospace;
    font-size: 0.95em;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.1em 0.35em;
    color: var(--gold);
    font-style: normal;
  }

  /* --- Title slide --- */
  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background: linear-gradient(160deg, #0b0c0f 0%, #12141a 45%, #181b24 100%);
  }
  section.lead::before {
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -55%);
    width: 600px;
    height: 600px;
    opacity: 0.55;
  }
  section.lead h1 {
    font-size: 3.2em;
    color: var(--text);
    background: linear-gradient(135deg, #f4f1ea 30%, var(--gold) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    z-index: 1;
  }
  @supports not (background-clip: text) {
    section.lead h1 {
      -webkit-text-fill-color: var(--text);
      background: none;
    }
  }
  section.lead .subtitle {
    font-size: 1.05em;
    color: var(--text-muted);
    max-width: 14em;
    margin: 0.5em auto 0;
    position: relative;
    z-index: 1;
  }
  section.lead .chips {
    display: flex;
    justify-content: center;
    gap: 0.6em;
    margin-top: 1.4em;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  section.lead .chip {
    font-size: 0.68em;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.45em 1em;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(24, 27, 36, 0.8);
    color: var(--text-muted);
  }
  section.lead .chip-gold {
    border-color: rgba(212,175,55,0.45);
    color: var(--gold);
    background: var(--gold-dim);
  }

  /* --- Closing slide --- */
  section.closing {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    text-align: left;
    background: linear-gradient(160deg, #12141a, #0b0c0f);
  }
  section.closing h2 { border: none; font-size: 1.35em; margin-bottom: 0.5rem; }
  section.closing .cols { text-align: left; }
  section.closing .chips { justify-content: flex-start; }
  section.closing .cta {
    margin-top: 0.4em;
    font-size: 0.95em;
    color: var(--gold);
    font-family: "Cormorant Garamond", serif;
    font-weight: 600;
    text-align: left;
  }

  /* --- App screenshots (demo slide) --- */
  .screenshot-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 0.55em;
  }
  .screenshot-row figure {
    margin: 0;
  }
  .screenshot-row img {
    width: 100%;
    height: 185px;
    object-fit: cover;
    object-position: top center;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--bg-card);
  }
  .screenshot-row figcaption {
    margin-top: 0.35em;
    font-size: 0.58em;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gold);
    text-align: center;
  }
---

<!-- _class: lead -->

# Atelier

<p class="subtitle">Serialized audiobooks — read and listen chapter by chapter</p>

<div class="chips">
  <span class="chip chip-gold">AI Studio</span>
  <span class="chip">Reader Catalog</span>
  <span class="chip">Chapter Audio</span>
  <span class="chip">Next.js</span>
</div>

<div class="stat-grid" style="margin-top:1.1em;max-width:92%;margin-left:auto;margin-right:auto">
<div class="stat-box accent"><div class="val">~90%</div><div class="lbl">Lower prod. cost vs studio</div></div>
<div class="stat-box"><div class="val">$0.99–1.49</div><div class="lbl">Per-chapter unlock</div></div>
<div class="stat-box"><div class="val">1 stack</div><div class="lbl">Draft → audio → sell</div></div>
<div class="stat-box success"><div class="val">100%</div><div class="lbl">Client-owned catalog</div></div>
</div>

<p class="footnote" style="text-align:center;margin-top:0.85em">Level 12 solution documentation · commissioned for an independent studio operator</p>

<!--
~30 sec — Open with product name and one-line pitch.
-->

---

<!-- _class: dense -->

## <span class="eyebrow">01 · Problem</span> The Client's Challenge

<div class="slide-stack fill">

<div class="card card-accent">

### Problem statement
Independent creators who publish **serialized audio fiction** cannot move from draft manuscript to **monetized, listenable chapters** in one workflow. Writing, narration, catalog hosting, and per-chapter sales live in **separate tools**—not built for serial unlock models.

</div>

<div class="stat-grid cols-3">
<div class="stat-box"><div class="val">5+ apps</div><div class="lbl">Typical DIY toolchain</div></div>
<div class="stat-box accent"><div class="val">$200+/hr</div><div class="lbl">Human studio narration</div></div>
<div class="stat-box"><div class="val">3 steps</div><div class="lbl">Reader expects: preview · unlock · listen</div></div>
</div>

<div class="cols">
<div class="card">

### Pain points
<ul class="feature-list">
<li>Production is <strong>slow & expensive</strong> across fragmented tools</li>
<li>Readers expect <strong>preview → unlock → continue</strong> in one flow</li>
<li><strong>No owned stack</strong> built for a private studio operator</li>
<li>Aggregator platforms take <strong>margin + IP risk</strong></li>
</ul>

</div>
<div class="card card-accent">

### What the client needs
<ul class="feature-list">
<li><strong>Exclusive</strong> private production workspace (`/studio`)</li>
<li><strong>Owned catalog</strong> with chapter-by-chapter sales</li>
<li><strong>AI + TTS + payments</strong> without juggling five apps</li>
<li><strong>Pocket-FM economics</strong> on infrastructure they control</li>
</ul>

</div>
</div>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">02 · Market</span> Competitive Landscape

<div class="slide-stack fill">

<div class="table-panel">

<table class="slide-table">
<colgroup><col class="col-a" /><col class="col-b" /></colgroup>
<thead><tr><th>Alternative</th><th>Why it falls short for our client</th></tr></thead>
<tbody>
<tr><td><strong>Pocket FM</strong> &amp; serial apps</td><td>Strong listener UX — client does <strong>not</strong> own production or catalog</td></tr>
<tr><td><strong>Wattpad</strong> · Vella · Radish</td><td>Serial fiction — no integrated <strong>AI + TTS + owned</strong> workflow</td></tr>
<tr><td><strong>DIY toolchain</strong></td><td>Scrivener + ElevenLabs + payments — <strong>slow</strong>, <strong>expensive</strong>, poor unlock UX</td></tr>
<tr><td><strong>AI writers alone</strong></td><td>Fast drafting — <strong>no</strong> catalog, audio, or chapter monetization</td></tr>
</tbody>
</table>

</div>

<div class="callout"><strong>Market gap:</strong> Strong serial-fiction demand exists—but no platform gives an indie operator <em>owned production + owned catalog + AI + TTS + chapter unlocks</em> in one stack.</div>

<p class="slide-footer"><strong>Atelier</strong> — private studio → narrate → publish → unlock → listen, in one app the client controls.</p>

</div>

<!--
~45 sec — Frame the business gap, objectives, and why it matters.
-->

---

<!-- _class: dense -->

## <span class="eyebrow">03 · Audience</span> Client &amp; End Users

<div class="slide-stack fill">

<div class="cols-3">
<div class="card card-accent">

<span class="num">1</span>

### The client
Independent **studio operator** — exclusive private production workspace (not a multi-author marketplace)

`/studio` · `/library` · owns the catalog

</div>
<div class="card">

<span class="num">2</span>

### Readers
Paying customers who discover serials and unlock chapters

`/` · `/store`

</div>
<div class="card">

<span class="num">3</span>

### Listeners
Read and listen in one flow — chapter text + ElevenLabs TTS

Chapter player

</div>
</div>

<div class="stat-grid cols-3">
<div class="stat-box accent"><div class="val">Free</div><div class="lbl">Preview chapters (hook)</div></div>
<div class="stat-box"><div class="val">$0.99–1.49</div><div class="lbl">Paid unlock / chapter</div></div>
<div class="stat-box success"><div class="val">0%</div><div class="lbl">Aggregator revenue share</div></div>
</div>

<div class="card card-accent">

### Business model &amp; revenue flow
<strong>Discover</strong> on public catalog → <strong>preview</strong> free installments → <strong>unlock</strong> paid chapters → <strong>consume</strong> text + ElevenLabs audio in one player. Client <strong>owns catalog, pricing, and margin</strong>—not a multi-author marketplace.

</div>

<p class="footnote">Presentation audience: client stakeholders and technical reviewers evaluating feasibility, architecture, and delivery evidence.</p>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">04 · Solution</span> What Atelier Is &amp; How It Works

<div class="slide-stack fill">

<div class="card card-accent">

### What the solution is
<strong>Atelier</strong> is a full-stack web application unifying a <strong>private AI studio</strong>, <strong>text-to-speech narration</strong>, <strong>serial catalog publishing</strong>, and <strong>chapter-by-chapter monetization</strong> in one Next.js codebase.

</div>

<div class="cols">
<div class="card">

### Creator path
1. **Draft** — OpenAI chat + agents (`/studio`)
2. **Narrate** — Server-side ElevenLabs TTS
3. **Publish** — Story/chapter management (`/library`)

</div>
<div class="card">

### Reader path
1. **Discover** — Public catalog (`/`)
2. **Preview** — Free chapters
3. **Unlock** — Paid access (`/store`)
4. **Consume** — Chapter player (text + audio)

</div>
</div>

<div class="stat-grid">
<div class="stat-box accent"><div class="val">~$2.50</div><div class="lbl">TTS / ~10-min chapter</div></div>
<div class="stat-box"><div class="val">~$0.04</div><div class="lbl">LLM draft pass</div></div>
<div class="stat-box success"><div class="val">~3 unlocks</div><div class="lbl">Break-even @ $0.99</div></div>
<div class="stat-box accent"><div class="val">~90%</div><div class="lbl">Lower cost vs studio</div></div>
</div>

<div class="cols">
<div class="card card-accent">

### Creative guardrails (serial memory)
<ul class="feature-list">
<li><strong>Per-thread agent isolation</strong> — no cross-book bleed</li>
<li><strong>Story-controls schema</strong> — genre, mood, tension, sophistication</li>
<li><strong>Prior-chapter injection</strong> — plot continuity across 50+ chapters</li>
<li><strong>Quality retries</strong> + <strong>[Speaker]</strong> tag preservation on refine</li>
</ul>

</div>
<div class="card">

### Data sovereignty
<ul class="feature-list">
<li><strong>PostgreSQL</strong> owns manuscripts, unlock ledgers, comments</li>
<li>OpenAI &amp; ElevenLabs are <strong>swappable server adapters</strong></li>
<li>Provider change ≠ IP loss — assets stay in client DB</li>
</ul>

</div>
</div>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">05 · Product</span> What We Shipped

<div class="slide-stack fill">

<div class="screenshot-row">
<figure>
<img src="screenshots/catalog.png" alt="Reader catalog — Shadows in the Diner" />
<figcaption>1 · Reader catalog</figcaption>
</figure>
<figure>
<img src="screenshots/studio.png" alt="Creator studio — chat and manuscript" />
<figcaption>2 · Creator studio</figcaption>
</figure>
<figure>
<img src="screenshots/chapter.png" alt="Chapter player — Listen to chapter" />
<figcaption>3 · Chapter audio</figcaption>
</figure>
</div>

<div class="flow">
  <span>Catalog</span><span class="arrow">→</span>
  <span>Studio</span><span class="arrow">→</span>
  <span>Listen + unlock</span>
</div>

<div class="cols-3">
<div class="card card-accent">
<strong>AI studio</strong>
<ul class="feature-list">
<li>OpenAI chat + isolated agents</li>
<li>Live manuscript + refine loops</li>
<li>Admin-only `/studio` workspace</li>
</ul>
</div>
<div class="card">
<strong>Owned catalog</strong>
<ul class="feature-list">
<li>Publish &amp; price per chapter</li>
<li>Free preview + paid unlock rules</li>
<li>Public `/` + `/store` storefront</li>
</ul>
</div>
<div class="card">
<strong>Chapter audio</strong>
<ul class="feature-list">
<li>ElevenLabs TTS in-player</li>
<li>Lock-state UX from walkthroughs</li>
<li>Text + audio single surface</li>
</ul>
</div>
</div>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">06 · Differentiation</span> Why Atelier Wins

<div class="slide-stack fill">

<div class="table-panel">

<table class="slide-table">
<colgroup><col class="col-a" /><col class="col-b" /></colgroup>
<thead><tr><th>Atelier advantage</th><th>Product benefit</th></tr></thead>
<tbody>
<tr><td><strong>Private studio</strong> — not a marketplace</td><td>Client controls IP, voice, and release cadence</td></tr>
<tr><td><strong>Write + narrate + sell</strong> in one app</td><td>Faster chapters, lower production cost</td></tr>
<tr><td><strong>Serial unlock UX</strong> built-in</td><td>Preview → pay → continue—like Pocket FM, but owned</td></tr>
<tr><td><strong>API-first</strong> web MVP</td><td>Same backend for future iOS/Android apps</td></tr>
<tr><td><strong>Owned PostgreSQL IP layer</strong></td><td>Manuscripts, unlock ledgers, reader data—<strong>no vendor lock-in</strong></td></tr>
<tr><td><strong>Swappable AI providers</strong></td><td>OpenAI &amp; ElevenLabs are server adapters; core assets stay in client DB</td></tr>
</tbody>
</table>

</div>

<div class="callout success"><strong>Bottom line:</strong> Pocket-FM listener UX + indie-studio economics + zero aggregator lock-in — on infrastructure the client owns.</div>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">07 · Architecture</span> How We Built It

<div class="slide-stack fill">

<div class="table-panel">

<table class="slide-table">
<colgroup><col class="col-a" /><col class="col-b" /></colgroup>
<thead><tr><th>Stack</th><th>Rationale</th></tr></thead>
<tbody>
<tr><td><strong>Next.js App Router</strong></td><td>UI + API in one codebase — fast delivery for the client</td></tr>
<tr><td><strong>PostgreSQL + Drizzle</strong></td><td>System of record for IP, unlock ledgers, comments — <strong>data portability</strong></td></tr>
<tr><td><strong>Serial memory</strong></td><td>Prior chapters + story-controls schema injected into LLM context per generation</td></tr>
<tr><td><strong>OpenAI + ElevenLabs</strong></td><td>Swappable server-side adapters — keys never in the browser</td></tr>
<tr><td><strong>Auth.js</strong></td><td>Sessions, account deletion, admin studio access</td></tr>
<tr><td><strong>API-first</strong></td><td>Web MVP today · iOS/Android on same API later</td></tr>
</tbody>
</table>

<div class="arch">
  <span class="node">Client studio / Readers</span><span class="arrow">→</span>
  <span class="node node-gold">Next.js API</span><span class="arrow">→</span>
  <span class="node">PostgreSQL</span><span class="arrow">→</span>
  <span class="node node-gold">OpenAI · ElevenLabs</span>
</div>

</div>

<div class="stat-grid cols-3">
<div class="stat-box"><div class="val">6 routes</div><div class="lbl">Core API surfaces</div></div>
<div class="stat-box accent"><div class="val">Server-only</div><div class="lbl">AI keys never in browser</div></div>
<div class="stat-box success"><div class="val">API-first</div><div class="lbl">Mobile = same REST layer</div></div>
</div>

<p class="footnote">TCO: <code>docs/CLIENT_PRICING_AND_TCO.md</code> · Privacy: <code>docs/APP_PRIVACY_DATA_INVENTORY.md</code></p>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">08 · Effectiveness</span> Objectives, Evidence &amp; Feedback

<div class="slide-stack fill">

<div class="table-panel">

<table class="slide-table">
<colgroup><col class="col-a" /><col class="col-b" /><col class="col-b" /></colgroup>
<thead><tr><th>Objective</th><th>Result</th><th>Evidence</th></tr></thead>
<tbody>
<tr><td>End-to-end creator → reader pipeline</td><td><span class="badge badge-met">Met</span> MVP</td><td><code>/</code> · <code>/studio</code> · <code>/library</code> · player</td></tr>
<tr><td>LLM authoring + TTS narration</td><td><span class="badge badge-met">Met</span> MVP</td><td>OpenAI + ElevenLabs server routes</td></tr>
<tr><td>Structured feedback + smoke tests</td><td><span class="badge badge-partial">Partial</span></td><td>Walkthroughs + <code>pnpm test:smoke</code></td></tr>
<tr><td>Documented unit economics</td><td><span class="badge badge-met">Met</span></td><td><code>docs/CLIENT_PRICING_AND_TCO.md</code></td></tr>
</tbody>
</table>

</div>

<div class="table-panel">

<table class="slide-table">
<colgroup><col class="col-a" /><col class="col-b" /></colgroup>
<thead><tr><th>Feedback</th><th>Shipped fix</th></tr></thead>
<tbody>
<tr><td>Locked chapters unclear</td><td>Lock reason + value copy</td></tr>
<tr><td>Session expiry during checkout</td><td>Re-auth prompt + clear errors</td></tr>
<tr><td>Publish state confusing</td><td><strong>Published</strong> vs <strong>Draft</strong> badges</td></tr>
<tr><td>No regression safety</td><td>Smoke suite <code>pnpm test:smoke</code></td></tr>
</tbody>
</table>

</div>

<div class="callout">Validation combined <strong>structured walkthroughs</strong>, <strong>client feedback loops</strong>, and <strong>automated smoke tests</strong> on auth, catalog, studio, and checkout paths.</div>

</div>

---

<!-- _class: dense limitations -->

## <span class="eyebrow">09 · Limitations</span> Phased Rollout &amp; Risk Controls

<div class="slide-stack fill">

<table class="limitations-table">
<tbody>
<tr>
<td>
<div class="card">
<h3><span class="badge badge-met">Live</span> Phase 1 — MVP delivered</h3>
<ul>
<li>Web client · owned catalog · full studio pipeline</li>
<li>Stub checkout · TTS tier caps for <strong>cost control</strong></li>
<li>Smoke tests on auth, catalog, studio, checkout APIs</li>
<li>Documented TCO + privacy inventory for stakeholders</li>
</ul>
</div>
</td>
<td>
<div class="card card-accent">
<h3><span class="badge badge-planned">Next</span> Phase 2–3 — no DB redesign</h3>
<ul>
<li><strong>Stripe</strong> — verified per-chapter unlock revenue</li>
<li><strong>CI</strong> — broader API regression before production launch</li>
<li><strong>Mobile</strong> — React Native / Flutter on <strong>same REST endpoints</strong></li>
<li>Architecture decoupled <strong>day one</strong> — not retrofit</li>
</ul>
</div>
</td>
</tr>
<tr>
<td colspan="2">
<div class="card card-success">
<h3>Security &amp; legal</h3>
<ul>
<li>Provider API keys stored <strong>server-side only</strong> (OpenAI, ElevenLabs)</li>
<li>Privacy/data inventory: <code>docs/APP_PRIVACY_DATA_INVENTORY.md</code></li>
<li>Account deletion via Auth.js · content policy is operator-defined</li>
<li>Version history: <code>docs/CHANGELOG.md</code></li>
</ul>
</div>
</td>
</tr>
</tbody>
</table>

</div>

---

<!-- _class: dense -->

## <span class="eyebrow">10 · Roadmap</span> Post-MVP Scaling Strategy

<div class="slide-stack fill">

<div class="table-panel">

<table class="slide-table">
<colgroup><col class="col-a" /><col class="col-b" /></colgroup>
<thead><tr><th>Phase</th><th>Deliverable — same API &amp; PostgreSQL schema</th></tr></thead>
<tbody>
<tr><td><span class="badge badge-met">Phase 1</span> Now</td><td>Web MVP · studio pipeline · stub checkout · unit economics documented · smoke tests live</td></tr>
<tr><td><span class="badge badge-planned">Phase 2</span> Q-next</td><td>Stripe live revenue · expanded CI · production hardening · unlock ledger verified</td></tr>
<tr><td><span class="badge badge-planned">Phase 3</span> Scale</td><td>React Native / Flutter · same REST API · zero schema migration · reader apps on owned backend</td></tr>
</tbody>
</table>

</div>

<div class="card">

### Strategic position
Serialized audio fiction is growing; indie operators want <strong>Pocket-FM economics</strong> without <strong>aggregator lock-in</strong> — TCO, privacy inventory, and solution docs in <code>docs/</code>

</div>

</div>

<div class="chips">
  <span class="chip chip-gold">Stripe</span>
  <span class="chip">Mobile</span>
  <span class="chip">Owned catalog</span>
  <span class="chip">Chapter audio</span>
</div>

---

<!-- _class: dense -->

## <span class="eyebrow">11 · References</span> Citations &amp; Further Investigation

<div class="slide-stack fill">

<div class="cols-equal">
<div class="card">

### Sources cited
<ul class="feature-list">
<li><strong>Next.js App Router</strong> — nextjs.org/docs</li>
<li><strong>PostgreSQL</strong> + <strong>Drizzle ORM</strong> — orm.drizzle.team</li>
<li><strong>OpenAI API</strong> — platform.openai.com/docs</li>
<li><strong>ElevenLabs</strong> — elevenlabs.io/docs</li>
<li><strong>Auth.js</strong> — authjs.dev</li>
</ul>

</div>
<div class="card card-accent">

### Further investigation
<ul class="feature-list">
<li><code>SOLUTION_DOCUMENTATION.md</code> — Level 12 brief + rubric mapping</li>
<li><code>CCC_DELIVERABLE_REPORT.md</code> — plan, risks, test evidence</li>
<li><code>CLIENT_PRICING_AND_TCO.md</code> — per-chapter economics</li>
<li><code>Q_AND_A_BRIEF.md</code> — post-presentation Q&amp;A prep</li>
<li><code>CHANGELOG.md</code> — version history</li>
</ul>

</div>
</div>

</div>

---

<!-- _class: closing lead -->

## <span class="eyebrow">12 · Close</span> Summary

<div class="slide-stack fill">

<div class="stat-grid cols-2" style="margin-bottom:0.75em">
<div class="stat-box accent"><div class="val">Owned IP</div><div class="lbl">Catalog + unlock ledgers in PostgreSQL</div></div>
<div class="stat-box success"><div class="val">Phased scale</div><div class="lbl">Stripe → CI → mobile on same API</div></div>
</div>

<div class="card card-accent">

### Success check
Client-owned ecosystem with <strong>documented unit economics</strong>, <strong>creative guardrails</strong> for long-form serials, <strong>data sovereignty</strong>, and a <strong>defined post-MVP scaling path</strong>.

</div>

<div class="chips" style="justify-content:center;margin-top:1em">
  <span class="chip chip-gold">Unit economics</span>
  <span class="chip">Owned catalog</span>
  <span class="chip">No lock-in</span>
  <span class="chip">Phased scale</span>
</div>

</div>

<p class="cta">Questions?</p>
