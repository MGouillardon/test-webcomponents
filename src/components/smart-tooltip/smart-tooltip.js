const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }

    .tooltip-trigger {
      display: inline-block;
      cursor: help;
    }

    .tooltip-content {
      position: absolute;
      z-index: 1000;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      max-width: 250px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }

    .tooltip-content.visible {
      opacity: 1;
      visibility: visible;
    }

    .tooltip-content::before {
      content: '';
      position: absolute;
      border: 6px solid transparent;
    }

    .tooltip-content[data-position="top"] {
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
    }

    .tooltip-content[data-position="top"]::before {
      border-top-color: #333;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
    }

    .tooltip-content[data-position="bottom"] {
      top: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
    }

    .tooltip-content[data-position="bottom"]::before {
      border-bottom-color: #333;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tooltip-content.animate {
      animation: fadeIn 0.2s ease-out;
    }

    ::slotted(svg) {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }
  </style>

  <div class="tooltip-trigger" role="tooltip">
    <slot name="trigger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    </slot>
  </div>

  <div class="tooltip-content" role="tooltip">
    <slot name="content">Info</slot>
  </div>
`;

class SmartTooltip extends HTMLElement {
  #position;
  #delay;
  #disabled;
  #visible;
  #resizeObserver;
  #showTimeout;
  #hideTimeout;

  static get observedAttributes() {
    return ['position', 'delay', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.#position = 'top';
    this.#delay = 200;
    this.#disabled = false;
    this.#visible = false;

    this.shadowRoot.innerHTML = template.innerHTML;
  }

  connectedCallback() {
    this.#setupEventListeners();
    this.#setupResizeObserver();
    this.#setupAccessibility();
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'position':
        this.#position = newValue || 'top';
        this.#updatePosition();
        break;
      case 'delay':
        this.#delay = parseInt(newValue) || 200;
        break;
      case 'disabled':
        this.#disabled = newValue !== null;
        this.#updateAccessibility();
        break;
    }
  }

  #setupEventListeners = () => {
    const trigger = this.shadowRoot.querySelector('.tooltip-trigger');

    trigger.addEventListener('mouseenter', () => this.#show());
    trigger.addEventListener('mouseleave', () => this.#hide());

    trigger.addEventListener('touchstart', () => this.#show(), { passive: true });
    document.addEventListener('touchstart', (e) => {
      if (!this.contains(e.target)) {
        this.#hide();
      }
    }, { passive: true });

    trigger.addEventListener('focus', () => this.#show());
    trigger.addEventListener('blur', () => this.#hide());
    this.addEventListener('keydown', (e) => this.#handleKeydown(e));
  };

  #removeEventListeners = () => {
    const trigger = this.shadowRoot.querySelector('.tooltip-trigger');
    trigger.removeEventListener('mouseenter', () => this.#show());
    trigger.removeEventListener('mouseleave', () => this.#hide());
    trigger.removeEventListener('touchstart', () => this.#show());
    trigger.removeEventListener('focus', () => this.#show());
    trigger.removeEventListener('blur', () => this.#hide());
    this.removeEventListener('keydown', (e) => this.#handleKeydown(e));
  };

  #setupResizeObserver = () => {
    this.#resizeObserver = new ResizeObserver(() => {
      if (this.#visible) {
        this.#updatePosition();
      }
    });
    this.#resizeObserver.observe(this);
  };

  #setupAccessibility = () => {
    const trigger = this.shadowRoot.querySelector('.tooltip-trigger');
    const content = this.shadowRoot.querySelector('.tooltip-content');

    trigger.setAttribute('tabindex', this.#disabled ? '-1' : '0');
    content.id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    trigger.setAttribute('aria-describedby', content.id);
  };

  #updateAccessibility = () => {
    const trigger = this.shadowRoot.querySelector('.tooltip-trigger');
    trigger.setAttribute('tabindex', this.#disabled ? '-1' : '0');
  };

  #show = () => {
    if (this.#disabled) return;

    clearTimeout(this.#hideTimeout);
    this.#showTimeout = setTimeout(() => {
      const content = this.shadowRoot.querySelector('.tooltip-content');
      content.classList.add('visible', 'animate');
      this.#visible = true;
      this.#updatePosition();

      this.dispatchEvent(new CustomEvent('tooltip-show', {
        bubbles: true,
        composed: true
      }));
    }, this.#delay);
  };

  #hide = () => {
    clearTimeout(this.#showTimeout);
    this.#hideTimeout = setTimeout(() => {
      const content = this.shadowRoot.querySelector('.tooltip-content');
      content.classList.remove('visible', 'animate');
      this.#visible = false;

      this.dispatchEvent(new CustomEvent('tooltip-hide', {
        bubbles: true,
        composed: true
      }));
    }, 100);
  };

  #handleKeydown = (event) => {
    if (event.key === 'Escape' && this.#visible) {
      this.#hide();
    }
  };

  #updatePosition = () => {
    const content = this.shadowRoot.querySelector('.tooltip-content');
    content.dataset.position = this.#position;

    const rect = content.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (this.#position === 'top' && rect.top < 0) {
      content.dataset.position = 'bottom';
    } else if (this.#position === 'bottom' && rect.bottom > viewportHeight) {
      content.dataset.position = 'top';
    }
  };

  show() {
    this.#show();
  }

  hide() {
    this.#hide();
  }

  get position() {
    return this.#position;
  }

  set position(value) {
    this.setAttribute('position', value);
  }

  get delay() {
    return this.#delay;
  }

  set delay(value) {
    this.setAttribute('delay', value);
  }

  get disabled() {
    return this.#disabled;
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
}

customElements.define('smart-tooltip', SmartTooltip);