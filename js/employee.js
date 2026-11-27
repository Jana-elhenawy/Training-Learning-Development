/* Shared shell for the Employee screens (sidebar + top bar + toast).
   Mirrors Figma "Sidebar / Employee" and "Navigation / Top". */
const EMP_NAV=[
  ['Dashboard','dashboard.html'],
  ['Program Catalog','program-catalog.html'],
  ['My Training','my-training.html'],
  ['Notification','notification.html']
];
function buildEmployeeShell(active,crumb,searchPlaceholder){
  try{sessionStorage.setItem('tms.role','employee')}catch(_){}
  const logo=`<div class="logo"><img src="assets/logo-white.png" alt="RMO" onerror="this.parentNode.innerHTML='<div><div class=wm>RMO</div><small>RIDGELINE MOUNTAIN OUTFITTERS</small></div>'"></div>`;
  document.getElementById('sidebar').innerHTML=logo+`<div class="role">Employee</div><div style="height:0"></div>`+
    EMP_NAV.map(([n,h])=>`<a class="nav${n===active?' active':''}" href="${h}"${n===active?' aria-current="page"':''}>${n}</a>`).join('')+
    `<div class="spacer"></div><a class="nav muted${active==='Change password'?' active':''}" href="change-password.html">Change password</a><a class="nav muted" href="index.html" id="logout">Log out</a>`;
  document.getElementById('topbar').innerHTML=
    `<div class="crumb">${crumb}</div>`+
    `<div class="search"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="global-search" placeholder="${searchPlaceholder||'Search…'}" aria-label="Search"></div>`+
    `<button class="icon-btn" aria-label="Notifications" onclick="location.href='notification.html'" type="button"><svg class="icon" viewBox="0 0 24 24"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg></button>`+
    `<button class="icon-btn" aria-label="Profile" onclick="location.href='change-password.html'" type="button"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></button>`;
  document.getElementById('logout').addEventListener('click',()=>{try{sessionStorage.clear()}catch(_){}});
}
function toast(message){
  const t=document.getElementById('toast');if(!t)return;
  t.textContent=message;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),2000);
}
function qs(name,def){return new URLSearchParams(location.search).get(name)||def}
/* Search box on a page: filters rows/cards that carry data-search */
function wireSearch(selector){
  const box=document.getElementById('global-search');if(!box)return;
  box.addEventListener('input',()=>{
    const q=box.value.trim().toLowerCase();
    document.querySelectorAll(selector).forEach(el=>{el.hidden=!!q&&!el.textContent.toLowerCase().includes(q)});
  });
}
