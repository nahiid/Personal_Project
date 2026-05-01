const storageKeys = {
  users: 'profilehub_users',
  posts: 'profilehub_posts',
  currentUser: 'profilehub_current',
};

const defaultUsers = {
  alex: {
    email: 'alex@example.com',
    username: 'alex',
    password: 'demo1234',
    displayName: 'Alex MovieFan',
    banner: 'Movies, series, and quotes make life fun.',
    sections: {
      'Movie Ranking': ['Inception', 'Spirited Away', 'The Matrix'],
      'Series Ranking': ['Stranger Things', 'The Office', 'The Mandalorian'],
      'Movies Recommendation': ['The Grand Budapest Hotel', 'Parasite'],
      'Fav Quotes': ['"May the Force be with you."', '"Life is like a box of chocolates."'],
    },
  },
};

const defaultPosts = [
  {
    id: crypto.randomUUID(),
    author: 'alex',
    text: 'Welcome to ProfileHub! Create your profile and share your favorite movies or quotes.',
    image: '',
    createdAt: new Date().toISOString(),
  },
];

const state = {
  users: {},
  posts: [],
  currentUser: null,
  currentProfile: null,
};

const elements = {
  mainNav: document.getElementById('mainNav'),
  pages: document.querySelectorAll('.page'),
  signInTab: document.getElementById('signInTab'),
  signUpTab: document.getElementById('signUpTab'),
  signInForm: document.getElementById('signInForm'),
  signUpForm: document.getElementById('signUpForm'),
  authMessage: document.getElementById('authMessage'),
  signUpMessage: document.getElementById('signUpMessage'),
  postForm: document.getElementById('postForm'),
  postText: document.getElementById('postText'),
  postImageUrl: document.getElementById('postImageUrl'),
  postMessage: document.getElementById('postMessage'),
  feedList: document.getElementById('feedList'),
  profileBanner: document.getElementById('profileBanner'),
  profileAvatar: document.getElementById('profileAvatar'),
  profileDisplayName: document.getElementById('profileDisplayName'),
  profileUsername: document.getElementById('profileUsername'),
  profileEmail: document.getElementById('profileEmail'),
  profileSections: document.getElementById('profileSections'),
  profileEditor: document.getElementById('profileEditor'),
  bannerText: document.getElementById('bannerText'),
  displayNameInput: document.getElementById('displayNameInput'),
  sectionSelect: document.getElementById('sectionSelect'),
  sectionItemName: document.getElementById('sectionItemName'),
  addSectionItemButton: document.getElementById('addSectionItemButton'),
  profileMessage: document.getElementById('profileMessage'),
};

function loadState() {
  const rawUsers = localStorage.getItem(storageKeys.users);
  const rawPosts = localStorage.getItem(storageKeys.posts);
  const rawCurrent = localStorage.getItem(storageKeys.currentUser);

  state.users = rawUsers ? JSON.parse(rawUsers) : { ...defaultUsers };
  state.posts = rawPosts ? JSON.parse(rawPosts) : [...defaultPosts];
  state.currentUser = rawCurrent || null;
}

function saveState() {
  localStorage.setItem(storageKeys.users, JSON.stringify(state.users));
  localStorage.setItem(storageKeys.posts, JSON.stringify(state.posts));
  localStorage.setItem(storageKeys.currentUser, state.currentUser || '');
}

function getUser(identifier) {
  const byUsername = state.users[identifier.toLowerCase()];
  if (byUsername) return byUsername;

  return Object.values(state.users).find(
    (user) => user.email.toLowerCase() === identifier.toLowerCase(),
  );
}

function getCurrentUser() {
  return state.currentUser ? state.users[state.currentUser] : null;
}

function updateNav() {
  const user = getCurrentUser();
  const links = [];

  links.push('<a href="#home">Home</a>');
  links.push('<a href="#feed">Feed</a>');

  if (user) {
    links.push(`<a href="#profile">My Profile</a>`);
    links.push(`<button type="button" id="signOutButton">Sign Out</button>`);
  } else {
    links.push('<a href="#auth">Sign In</a>');
  }

  elements.mainNav.innerHTML = links.join('');

  const signOutButton = document.getElementById('signOutButton');
  if (signOutButton) {
    signOutButton.addEventListener('click', () => {
      state.currentUser = null;
      saveState();
      render();
      showPage('home');
    });
  }
}

function showPage(pageId) {
  elements.pages.forEach((page) => {
    page.classList.toggle('hidden', page.id !== pageId);
  });
}

function route() {
  const hash = window.location.hash || '#home';

  if (hash.startsWith('#user/')) {
    const username = hash.replace('#user/', '');
    renderProfile(username);
    return;
  }

  switch (hash) {
    case '#home':
      renderHome();
      break;
    case '#auth':
      renderAuth();
      break;
    case '#feed':
      renderFeed();
      break;
    case '#profile':
      if (getCurrentUser()) {
        renderProfile(state.currentUser);
      } else {
        showPage('auth');
      }
      break;
    default:
      showPage('home');
  }
}

function renderHome() {
  showPage('home');
}

function renderAuth() {
  showPage('auth');
  elements.signInTab.classList.add('active');
  elements.signUpTab.classList.remove('active');
  elements.signInForm.classList.remove('hidden');
  elements.signUpForm.classList.add('hidden');
  elements.authMessage.textContent = '';
  elements.signUpMessage.textContent = '';
}

function renderFeed() {
  showPage('feed');
  elements.postMessage.textContent = '';
  renderFeedList();
}

function renderProfile(username) {
  const user = state.users[username.toLowerCase()];
  if (!user) {
    showPage('home');
    return;
  }

  state.currentProfile = user;
  showPage('profile');
  elements.profileBanner.textContent = user.banner || 'A personal banner is a great start.';
  elements.profileAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
  elements.profileDisplayName.textContent = user.displayName;
  elements.profileUsername.textContent = `@${user.username}`;
  elements.profileEmail.textContent = user.email;
  renderSections(user);

  const currentUser = getCurrentUser();
  const isOwner = currentUser && currentUser.username === user.username;

  elements.profileEditor.classList.toggle('hidden', !isOwner);
  if (isOwner) {
    elements.bannerText.value = user.banner || '';
    elements.displayNameInput.value = user.displayName || '';
    elements.sectionItemName.value = '';
    elements.profileMessage.textContent = '';
  }
}

function renderSections(user) {
  const sectionElements = Object.entries(user.sections || {}).map(([sectionName, items]) => {
    const listItems = items.length
      ? items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li class="muted">Add a few items to show here.</li>';
    return `
      <section class="section-card">
        <h3>${escapeHtml(sectionName)}</h3>
        <ul class="section-list">${listItems}</ul>
      </section>
    `;
  }).join('');

  elements.profileSections.innerHTML = sectionElements;
}

function renderFeedList() {
  if (!elements.feedList) return;
  if (state.posts.length === 0) {
    elements.feedList.innerHTML = '<div class="card"><p>No posts yet. Start the conversation!</p></div>';
    return;
  }

  elements.feedList.innerHTML = state.posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => {
      const user = state.users[post.author] || { displayName: post.author, username: post.author };
      return `
        <article class="card post-card">
          <div class="post-header">
            <div class="post-author">
              <div class="avatar">${escapeHtml(user.displayName?.charAt(0) || user.username.charAt(0))}</div>
              <div>
                <strong><a class="post-user-link" href="#user/${user.username}">${escapeHtml(user.displayName)}</a></strong>
                <p class="muted">@${escapeHtml(user.username)} · ${new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div>
            <p>${escapeHtml(post.text)}</p>
            ${post.image ? `<img class="post-image" src="${escapeHtml(post.image)}" alt="Post image" />` : ''}
          </div>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('.post-user-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = event.currentTarget.getAttribute('href');
      window.location.hash = href;
    });
  });
}

function escapeHtml(value) {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function handleTabSwitch() {
  elements.signInTab.addEventListener('click', () => {
    elements.signInTab.classList.add('active');
    elements.signUpTab.classList.remove('active');
    elements.signInForm.classList.remove('hidden');
    elements.signUpForm.classList.add('hidden');
    elements.authMessage.textContent = '';
    elements.signUpMessage.textContent = '';
  });

  elements.signUpTab.addEventListener('click', () => {
    elements.signUpTab.classList.add('active');
    elements.signInTab.classList.remove('active');
    elements.signUpForm.classList.remove('hidden');
    elements.signInForm.classList.add('hidden');
    elements.authMessage.textContent = '';
    elements.signUpMessage.textContent = '';
  });
}

function handleAuthForms() {
  elements.signInForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const identifier = document.getElementById('signInIdentifier').value.trim();
    const password = document.getElementById('signInPassword').value;
    const user = getUser(identifier);

    if (!user || user.password !== password) {
      elements.authMessage.textContent = 'Invalid username/email or password.';
      return;
    }

    state.currentUser = user.username;
    saveState();
    state.currentProfile = user;
    elements.authMessage.textContent = '';
    updateNav();
    window.location.hash = '#profile';
  });

  elements.signUpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('signUpEmail').value.trim();
    const username = document.getElementById('signUpUsername').value.trim().toLowerCase();
    const displayName = document.getElementById('signUpDisplayName').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpPasswordConfirm').value;

    if (!email || !username || !displayName || !password) {
      elements.signUpMessage.textContent = 'Fill in every field to continue.';
      return;
    }

    if (password !== confirmPassword) {
      elements.signUpMessage.textContent = 'Passwords do not match.';
      return;
    }

    if (state.users[username]) {
      elements.signUpMessage.textContent = 'That username is already taken. Choose another.';
      return;
    }

    if (Object.values(state.users).some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      elements.signUpMessage.textContent = 'An account with that email already exists.';
      return;
    }

    state.users[username] = {
      email,
      username,
      password,
      displayName,
      banner: 'Welcome to my profile!',
      sections: {
        'Movie Ranking': [],
        'Series Ranking': [],
        'Movies Recommendation': [],
        'Fav Quotes': [],
      },
    };

    state.currentUser = username;
    saveState();
    elements.signUpMessage.textContent = '';
    updateNav();
    window.location.hash = '#profile';
  });
}

function handlePostCreation() {
  elements.postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = elements.postText.value.trim();
    const image = elements.postImageUrl.value.trim();
    const user = getCurrentUser();

    if (!user) {
      elements.postMessage.textContent = 'Sign in first to publish a post.';
      return;
    }

    if (!text && !image) {
      elements.postMessage.textContent = 'Add text or an image to create a post.';
      return;
    }

    state.posts.unshift({
      id: crypto.randomUUID(),
      author: user.username,
      text,
      image,
      createdAt: new Date().toISOString(),
    });

    saveState();
    elements.postText.value = '';
    elements.postImageUrl.value = '';
    elements.postMessage.textContent = 'Post published.';
    renderFeedList();
  });
}

function handleProfileEditor() {
  elements.bannerText.addEventListener('change', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    currentUser.banner = elements.bannerText.value.trim();
    saveState();
    renderProfile(currentUser.username);
  });

  elements.displayNameInput.addEventListener('change', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    currentUser.displayName = elements.displayNameInput.value.trim() || currentUser.username;
    saveState();
    renderProfile(currentUser.username);
    renderFeedList();
  });

  elements.addSectionItemButton.addEventListener('click', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const section = elements.sectionSelect.value;
    const item = elements.sectionItemName.value.trim();

    if (!item) {
      elements.profileMessage.textContent = 'Type an item or quote before adding.';
      return;
    }

    currentUser.sections[section].push(item);
    elements.sectionItemName.value = '';
    elements.profileMessage.textContent = 'Item added to your profile.';
    saveState();
    renderProfile(currentUser.username);
  });
}

function render() {
  loadState();
  updateNav();
  route();
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  loadState();
  updateNav();
  handleTabSwitch();
  handleAuthForms();
  handlePostCreation();
  handleProfileEditor();
  route();
});
