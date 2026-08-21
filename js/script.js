document.getElementById('year').textContent = new Date().getFullYear();

const CATEGORY_LABELS = {
  'thumbnail': 'Thumbnail',
  'photo-manipulation': 'Photo Manipulation',
  'poster': 'Poster'
};

function fmtDate(d){
  if(!d) return '';
  const dt = new Date(d);
  if(isNaN(dt)) return d;
  return dt.toLocaleDateString('en-US', {month:'short', year:'numeric'});
}

async function loadSettings(){
  try{
    const res = await fetch('content/settings.json', {cache:'no-store'});
    const s = await res.json();

    if(s.hero_eyebrow) document.getElementById('hero-eyebrow').textContent = s.hero_eyebrow;
    if(s.hero_title_line1 || s.hero_title_accent){
      document.getElementById('hero-title').innerHTML =
        (s.hero_title_line1 || '') + '<br><span class="accent">' + (s.hero_title_accent || '') + '</span>';
    }
    if(s.hero_subtext) document.getElementById('hero-sub').textContent = s.hero_subtext;
    if(s.about_text) document.getElementById('about-text').textContent = s.about_text;
    if(s.contact_text) document.getElementById('contact-text').textContent = s.contact_text;

    const skillsList = document.getElementById('skills-list');
    if(Array.isArray(s.skills)){
      skillsList.innerHTML = s.skills.map(sk =>
        `<li><span>${sk.label}</span><span>${sk.value}</span></li>`
      ).join('');
    }

    const contactLinks = document.getElementById('contact-links');
    if(Array.isArray(s.contact_links)){
      contactLinks.innerHTML = s.contact_links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`
      ).join('');
    }
  }catch(e){
    console.error('Could not load settings.json', e);
  }
}

let allProjects = [];

function renderProjects(filter){
  const grid = document.getElementById('grid');
  const filtered = filter === 'all' ? allProjects : allProjects.filter(p => p.category === filter);

  if(filtered.length === 0){
    grid.innerHTML = '<p class="empty-state">No projects in this category yet. Add one from the admin panel at /admin.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="card">
      <span class="card-tag mono">${CATEGORY_LABELS[p.category] || p.category}</span>
      <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.closest('.card').style.display='none'">
      <div class="card-info">
        <div class="spec mono">${fmtDate(p.date)}</div>
        <h3>${p.title}</h3>
      </div>
    </div>
  `).join('');
}

async function loadProjects(){
  const grid = document.getElementById('grid');
  try{
    const res = await fetch('content/projects.json', {cache:'no-store'});
    const data = await res.json();
    allProjects = (data.projects || []).sort((a,b) => new Date(b.date) - new Date(a.date));
    document.getElementById('stat-projects').textContent = allProjects.length;
    renderProjects('all');
  }catch(e){
    grid.innerHTML = '<p class="empty-state">Could not load projects.json</p>';
    console.error(e);
  }
}

document.getElementById('filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(btn.dataset.filter);
});

loadSettings();
loadProjects();
