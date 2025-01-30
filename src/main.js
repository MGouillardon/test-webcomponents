import './style.css'
import './components/user-card/user-card.js'

const app = document.querySelector('#app')

const users = [
  { name: 'Jean Dupont', role: 'Développeur Front-End', avatar: 'https://avatar.iran.liara.run/public/boy', status: 'online' },
  { name: 'Marie Martin', role: 'Designer UI/UX', avatar: 'https://avatar.iran.liara.run/public/girl', status: 'offline' }
];

users.forEach(user => {
  const card = document.createElement('user-card');
  card.setAttribute('status', user.status);

  const avatarImg = document.createElement('img');
  avatarImg.src = user.avatar;
  avatarImg.alt = `Avatar de ${user.name}`;
  avatarImg.slot = 'avatar';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = user.name;
  nameSpan.slot = 'name';

  if (user.role) {
    const roleSpan = document.createElement('span');
    roleSpan.textContent = user.role;
    roleSpan.slot = 'role';
    card.appendChild(roleSpan);
  }

  card.appendChild(avatarImg);
  card.appendChild(nameSpan);

  card.updateUserInfo({
    status: user.status,
    theme: 'light'
  });
  app.appendChild(card);

});

const toggleTheme = () => {
  document.querySelectorAll('user-card').forEach(card => {
    const currentTheme = card.getAttribute('theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    card.updateUserInfo({ theme: newTheme });
  });
};

const themeButton = document.createElement('button');
themeButton.textContent = 'Changer le thème';
themeButton.onclick = toggleTheme;
app.insertBefore(themeButton, app.firstChild);
