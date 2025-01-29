import styles from './user-card.css?inline'

class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="card">
        <img class="avatar">
        <h2 class="name"></h2>
        <div class="role"></div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['name', 'role', 'avatar'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'name':
          this.shadowRoot.querySelector('.name').textContent = newValue;
          break;
        case 'role':
          this.shadowRoot.querySelector('.role').textContent = newValue;
          break;
        case 'avatar':
          this.shadowRoot.querySelector('.avatar').src = newValue;
          break;
      }
    }
  }
}

customElements.define('user-card', UserCard);