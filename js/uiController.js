/**
 * UIController owns all DOM reads/writes.
 * It listens to 'routechange' events from RouteState and updates the sidebar.
 */
export class UIController {
  constructor() {
    this.#elements = {
      countStart:     document.getElementById('countStart'),
      countFoot:      document.getElementById('countFoot'),
      countHand:      document.getElementById('countHand'),
      countTop:       document.getElementById('countTop'),
      validationMsg:  document.getElementById('validationMsg'),
      predictBtn:     document.getElementById('predictBtn'),
      gradeValue:     document.getElementById('gradeValue'),
      gradeBadge:     document.getElementById('gradeBadge'),
      tensorPanel:    document.getElementById('tensorPanel'),
      tensorOutput:   document.getElementById('tensorOutput'),
    };

    window.addEventListener('routechange', () => this.#onRouteChange());
  }

  /** Highlights the active tool in the legend. */
  setActiveTool(tool) {
    document.querySelectorAll('.legend-item').forEach(el => {
      el.classList.toggle('active-tool', el.dataset.tool === tool);
    });
  }

  /** Shows grade returned by the API. */
  showGrade(data) {
    const grade = data.grade ?? data.difficulty ?? JSON.stringify(data);
    this.#elements.gradeValue.textContent = grade;
    this.#elements.gradeBadge.className   = 'grade-badge has-grade';
  }

  showGradeError() {
    this.#elements.gradeValue.textContent = 'err';
    this.#elements.gradeBadge.className   = 'grade-badge';
  }

  /** Shows the serialised payload + response in the debug panel. */
  showTensorDebug(payload, response = null) {
    const el = this.#elements.tensorPanel;
    const out = this.#elements.tensorOutput;
    el.style.display = 'block';

    let html = `<span class="t-label">POST /predict</span>${JSON.stringify(payload, null, 2)}`;
    if (response) {
      html += `\n\n<span class="t-label">RESPONSE</span>${JSON.stringify(response, null, 2)}`;
    }
    out.innerHTML = html;
  }

  setPredictLoading(isLoading) {
    const btn = this.#elements.predictBtn;
    btn.textContent = isLoading ? '...' : 'Oceń trudność';
    if (isLoading) btn.disabled = true;
  }

  resetDisplay() {
    this.#elements.gradeValue.textContent  = '—';
    this.#elements.gradeBadge.className    = 'grade-badge';
    this.#elements.tensorPanel.style.display = 'none';
  }

  // ─── private ────────────────────────────────────────────────────────────────

  #elements;

  /** Syncs counts + validation text + predict button state. */
  #onRouteChange() {
    // counts are emitted by the event; re-read from the DOM caller via callback
    // Instead we dispatch a 'routechange' that carries the counts via detail.
    // See note in routeState.js — for simplicity we let main.js call refresh().
  }

  /**
   * Called explicitly by main.js after each route change.
   * @param {{ start: number, foot: number, hand: number, top: number }} counts
   * @param {boolean} isValid
   */
  refresh(counts, isValid) {
    this.#elements.countStart.textContent = counts.start;
    this.#elements.countFoot.textContent  = counts.foot;
    this.#elements.countHand.textContent  = counts.hand;
    this.#elements.countTop.textContent   = counts.top;

    const vm  = this.#elements.validationMsg;
    const btn = this.#elements.predictBtn;

    if (counts.start === 0) {
      this.#setValidation(vm, '⚠ Dodaj chwyt startowy', false);
      btn.disabled = true;
    } else if (counts.top === 0) {
      this.#setValidation(vm, '⚠ Dodaj chwyt topowy', false);
      btn.disabled = true;
    } else if (counts.start > 2) {
      this.#setValidation(vm, '⚠ Max 2 chwyty startowe', false);
      btn.disabled = false;
    } else {
      this.#setValidation(vm, '✓ Droga gotowa', true);
      btn.disabled = false;
    }
  }

  #setValidation(el, text, isOk) {
    el.textContent = text;
    el.className   = isOk ? 'validation-msg ok' : 'validation-msg';
  }
}
