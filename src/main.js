import './style.css'
import './components/user-card/user-card.js'

const app = document.querySelector('#app')

const users = [
  { name: 'Jean Dupont', role: 'Développeur Frontend', avatar: 'https://avatar.iran.liara.run/public/boy' },
  { name: 'Marie Martin', role: 'Designer UI/UX', avatar: 'https://avatar.iran.liara.run/public/girl' }
]

users.forEach(user => {
  const card = document.createElement('user-card')
  card.setAttribute('name', user.name)
  card.setAttribute('role', user.role)
  card.setAttribute('avatar', user.avatar)
  app.appendChild(card)
})
