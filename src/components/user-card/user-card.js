const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      --user-card-bg: var(--card-bg, #fff);
      --user-card-text: var(--card-text, #333);
      --user-card-border: var(--card-border, #ccc);
    }

    .card {
      border: 1px solid var(--user-card-border);
      border-radius: 8px;
      padding: 16px;
      max-width: 300px;
      background-color: var(--user-card-bg);
      color: var(--user-card-text);
      transition: all 0.3s ease;
    }

    .card.theme-light {
    --user-card-bg: #ffffff;
    --user-card-text: #333333;
    --user-card-border: #e0e0e0;
  }

  .card.theme-dark {
    --user-card-bg: #2d2d2d;
    --user-card-text: #ffffff;
    --user-card-border: #404040;
  }


    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .avatar-container {
      position: relative;
      width: 64px;
      height: 64px;
      margin: 0 auto 8px;
    }

    ::slotted(img) {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .name {
      margin: 8px 0;
      color: var(--user-card-text);
    }

    .role {
      color: var(--user-card-text);
      opacity: 0.8;
      font-size: 0.9em;
    }

    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      margin-top: 8px;
    }

    .status[data-status="online"] {
      background-color: #4caf50;
      color: white;
    }

    .status[data-status="offline"] {
      background-color: #9e9e9e;
      color: white;
    }
  </style>

  <div class="card" part="card">
    <div class="avatar-container" part="avatar-container">
      <slot name="avatar">
        <div class="avatar-fallback" part="avatar-fallback">
          <span>?</span>
        </div>
      </slot>
    </div>
    <h2 class="name" part="name">
      <slot name="name">Inconnu</slot>
    </h2>
    <div class="role" part="role">
      <slot name="role">Rôle non spécifié</slot>
    </div>
    <div class="status" part="status"></div>
  </div>
`;

class UserCard extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'role', 'status', 'theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Bind methods
    this._handleClick = this._handleClick.bind(this);
    this._handleSlotChange = this._handleSlotChange.bind(this);
  }

  connectedCallback() {
    this.addEventListener('click', this._handleClick);

    const slots = this.shadowRoot.querySelectorAll('slot');
    slots.forEach(slot => {
      slot.addEventListener('slotchange', this._handleSlotChange);
    });

    this._updateStatus(this.getAttribute('status'));

    this.setAttribute('aria-role', 'article');
    this.setAttribute('tabindex', '0');
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
    const slots = this.shadowRoot.querySelectorAll('slot');
    slots.forEach(slot => {
      slot.removeEventListener('slotchange', this._handleSlotChange);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'status':
        this._updateStatus(newValue);
        break;
      case 'theme':
        this._updateTheme(newValue);
        break;
    }
  }

  updateUserInfo(info = {}) {
    const { name, role, status, theme } = info;
    if (name) this.setAttribute('name', name);
    if (role) this.setAttribute('role', role);
    if (status) this.setAttribute('status', status);
    if (theme) this.setAttribute('theme', theme);

    this.dispatchEvent(new CustomEvent('user-updated', {
      bubbles: true,
      composed: true,
      detail: { info }
    }));
  }

  resetCard() {
    ['name', 'role', 'status', 'theme'].forEach(attr => {
      this.removeAttribute(attr);
    });
  }

  _handleClick(event) {
    const nameSlot = this.shadowRoot.querySelector('slot[name="name"]');
    const roleSlot = this.shadowRoot.querySelector('slot[name="role"]');

    const name = nameSlot.assignedNodes()[0]?.textContent || null;
    const role = roleSlot.assignedNodes()[0]?.textContent || null;

    this.dispatchEvent(new CustomEvent('user-selected', {
      bubbles: true,
      composed: true,
      detail: {
        name: name,
        role: role,
        status: this.getAttribute('status')
      }
    }));
  }

  _handleSlotChange(event) {
    const slot = event.target;
    const nodes = slot.assignedNodes();

    if (slot.name === 'avatar' && nodes.length === 0) {
      const fallback = this.shadowRoot.querySelector('.avatar-fallback');
      if (fallback) fallback.style.display = 'flex';
    }
  }

  _updateStatus(status) {
    const statusElement = this.shadowRoot.querySelector('.status');
    if (!statusElement) return;

    if (status === 'online' || status === 'offline') {
      statusElement.textContent = status === 'online' ? 'En ligne' : 'Hors ligne';
      statusElement.dataset.status = status;
      statusElement.style.display = 'inline-block';
    } else {
      statusElement.style.display = 'none';
    }
  }

  _updateTheme(theme) {
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

    card.className = 'card';

    if (theme) {
      card.classList.add(`theme-${theme}`);
    }
  }
}

customElements.define('user-card', UserCard);

