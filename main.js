// Terminal boot sequence — the one animated moment, contained to its panel.
(() => {
  const el = document.getElementById("termBody");
  if (!el) return;

  // Each line: segments of [text, className]. className "" = default smoke.
  const LINES = [
    [["$ ", "p"], ["./teamdub --boot", ""]],
    [["  mounting workbench ", "dim"], ["......... ", "dim"], ["ok", "ok"]],
    [["  loading enclaves ", "dim"], [".......... ", "dim"], ["ok", "ok"]],
    [["  experiments online ", "dim"], ["....... ", "dim"], ["2", "ok"]],
    [["> ", "p"], ["status: ", ""], ["nominal", "ok"]],
  ];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Render fully, optionally with a trailing cursor on the last line.
  function render(lineIdx, segIdx, charIdx, withCursor) {
    let html = "";
    for (let l = 0; l <= lineIdx; l++) {
      const line = LINES[l];
      const upTo = l < lineIdx ? line.length : segIdx + 1;
      for (let s = 0; s < upTo && s < line.length; s++) {
        let [text, cls] = line[s];
        if (l === lineIdx && s === segIdx) text = text.slice(0, charIdx);
        if (!text) continue;
        html += cls ? `<span class="${cls}">${text}</span>` : text;
      }
      if (l < lineIdx) html += "\n";
    }
    if (withCursor) html += '<span class="cur">_</span>';
    el.innerHTML = html;
  }

  function renderAll() {
    render(LINES.length - 1, LINES[LINES.length - 1].length - 1,
           LINES[LINES.length - 1].slice(-1)[0][0].length, true);
  }

  if (reduce) { renderAll(); return; }

  let li = 0, si = 0, ci = 0;
  function step() {
    const line = LINES[li];
    const seg = line[si];
    ci++;
    render(li, si, ci, true);
    if (ci >= seg[0].length) {
      si++; ci = 0;
      if (si >= line.length) {
        li++; si = 0;
        if (li >= LINES.length) { renderAll(); return; }
        setTimeout(step, 230);            // pause between lines
        return;
      }
    }
    setTimeout(step, 22 + Math.random() * 26); // per-char typing speed
  }
  setTimeout(step, 400);                  // small delay after load
})();
