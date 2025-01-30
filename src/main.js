import './style.css'
import './components/user-card/user-card.js'
import './components/smart-tooltip/smart-tooltip.js'

const app = document.querySelector('#app')

const createSection = (className) => {
  const section = document.createElement('section');
  section.classList.add(className);
  return section;
};

const usersSection = createSection('users-section');
const toolsSection = createSection('tools-section');

app.appendChild(toolsSection);
app.appendChild(usersSection);

const toggleTheme = () => {
  document.querySelectorAll('user-card').forEach(card => {
    const currentTheme = card.getAttribute('theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    card.updateUserInfo({ theme: newTheme });
  });
};

const createButton = (text, onClick) => {
  const button = document.createElement('button');
  button.textContent = text;
  button.onclick = onClick;
  return button;
};

const themeButton = createButton('Changer le thème', toggleTheme);
toolsSection.appendChild(themeButton);

const createSmartTooltip = (position, delay, triggerText, contentText) => {
  const smartTooltip = document.createElement('smart-tooltip');
  smartTooltip.setAttribute('position', position);
  smartTooltip.setAttribute('delay', delay);

  const trigger = document.createElement('button');
  trigger.textContent = triggerText;
  trigger.slot = 'trigger';

  const content = document.createElement('div');
  content.textContent = contentText;
  content.slot = 'content';

  smartTooltip.appendChild(trigger);
  smartTooltip.appendChild(content);

  return smartTooltip;
};

const smartTooltip = createSmartTooltip('top', '300', 'Hover me', 'Ceci est un tooltip intelligent');
toolsSection.appendChild(smartTooltip);

const users = [
  { name: 'Jean Dupont', role: 'Développeur Front-End', avatar: 'https://avatar.iran.liara.run/public/boy', status: 'online' },
  { name: 'Marie Martin', role: 'Designer UI/UX', avatar: 'https://avatar.iran.liara.run/public/girl', status: 'offline' }
];

const createUserCard = (user) => {
  const card = document.createElement('user-card');
  card.setAttribute('status', user.status);

  const avatarImg = document.createElement('img');
  avatarImg.src = user.avatar;
  avatarImg.alt = `Avatar de ${user.name}`;
  avatarImg.slot = 'avatar';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = user.name;
  nameSpan.slot = 'name';

  card.appendChild(avatarImg);
  card.appendChild(nameSpan);

  if (user.role) {
    const roleSpan = document.createElement('span');
    roleSpan.textContent = user.role;
    roleSpan.slot = 'role';
    card.appendChild(roleSpan);
  }

  card.updateUserInfo({
    status: user.status,
    theme: 'light'
  });

  card.addEventListener('user-selected', (event) => {
    console.log('Carte sélectionnée:', event.detail);
  });

  card.addEventListener('user-updated', (event) => {
    console.log('Informations mises à jour:', event.detail.info);
  });

  return card;
};

const fragment = document.createDocumentFragment();
users.forEach(user => {
  const card = createUserCard(user);
  fragment.appendChild(card);
});
usersSection.appendChild(fragment);