document.getElementById('year').textContent = new Date().getFullYear();

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

    if(s.hero_stat_disciplines) document.getElementById('stat-disciplines').textContent = s.hero_stat_disciplines;
    if(s.hero_stat_availability) document.getElementById('stat-availability').textContent = s.hero_stat_availability;

    if(s.hero_background_image){
      const hero = document.querySelector('.hero');
      hero.style.backgroundImage =
        `linear-gradient(rgba(24,24,24,0.55), rgba(24,24,24,0.75)), url("${s.hero_background_image}")`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    }

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
let activeFilter = 'all';

function renderFilters(){
  const container = document.getElementById('filters');
  // Build the list of categories straight from whatever's actually in the data —
  // whoever is editing content decides the categories, not the code.
  const categories = [...new Set(allProjects.map(p => (p.category || '').trim()).filter(Boolean))];

  const buttons = ['all', ...categories];
  container.innerHTML = buttons.map(cat => `
    <button class="filter-btn ${cat === activeFilter ? 'active' : ''}" data-filter="${cat}">
      ${cat === 'all' ? 'All' : cat}
    </button>
  `).join('');
}

function renderProjects(filter){
  activeFilter = filter;
  const grid = document.getElementById('grid');
  const filtered = filter === 'all' ? allProjects : allProjects.filter(p => p.category === filter);

  if(filtered.length === 0){
    grid.innerHTML = '<p class="empty-state">No projects in this category yet. Add one from the admin panel at /admin.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="card">
      <span class="card-tag mono">${p.category || ''}</span>
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
    renderFilters();
    renderProjects('all');
  }catch(e){
    grid.innerHTML = '<p class="empty-state">Could not load projects.json</p>';
    console.error(e);
  }
}

document.getElementById('filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  renderProjects(btn.dataset.filter);
  renderFilters();
});

loadSettings();
loadProjects();
