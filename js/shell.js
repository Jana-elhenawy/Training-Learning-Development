/* Shared sidebar for sub-pages. Team: reuse buildSidebar() on every new screen so the menu stays identical. */
const NAV={
 employee:['Dashboard','Program Catalog','My Training','Notification'],
 trainer:['Dashboard','Program Catalog','My Training','My Sessions','Notification'],
 ld:['Dashboard','Users','Program Catalog','Sessions','Enrollment Requests','Direct Enrollment','Results','Employee History','Reports','Audit and Security Log','System Settings','Notification'],
 manager:['Dashboard','Team dashboard','Department employees','Employee records','Department reports','Attendance','Training suggestions','Program catalog','Notifications'],
 management:['Dashboard','Reports','Notification']
};
const ROLE_LABEL={employee:'Employee',trainer:'Trainer',ld:'L&D Administrator',manager:'Department Manager',management:'Management'};
const PAGES={'Dashboard':'dashboard.html','Program Catalog':'program-catalog.html','Notification':'notification.html','Notifications':'notification.html','Users':'users.html','Sessions':'sessions.html','Enrollment Requests':'enrollment-requests.html','Direct Enrollment':'direct-enrollment.html','Results':'results.html','Employee History':'employee-history.html','Reports':'reports.html','Audit and Security Log':'audit-security-log.html','System Settings':'system-settings.html'};
function hrefFor(n,role){if(n==='My Training')return role==='employee'?'my-training.html':'';if(n==='Program Catalog'||n==='Program catalog')return PAGES['Program Catalog'];return PAGES[n]||''}
function buildSidebar(active){
  let k='employee';try{k=sessionStorage.getItem('tms.role')||'employee'}catch(_){}
  if(!NAV[k])k='employee';
  const logo=`<div class="logo"><img src="assets/logo-white.png" alt="RMO" onerror="this.parentNode.innerHTML='<div><div class=wm>RMO</div><small>RIDGELINE MOUNTAIN OUTFITTERS</small></div>'"></div>`;
  document.getElementById('sidebar').innerHTML=logo+`<div class="role">${ROLE_LABEL[k].replace(/&/g,'&amp;')}</div><div></div>`+
    NAV[k].map(n=>`<button class="nav${n===active?' cur':''}" data-href="${hrefFor(n,k)}" data-toast="${n} screen – to be built by the team">${n.replace(/&/g,'&amp;')}</button>`).join('')+
    `<div class="spacer"></div><button class="nav muted${active==='Change password'?' cur':''}" data-href="change-password.html">Change password</button><button class="nav muted" id="logout">Log out</button>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-href]');
  if(b&&b.dataset.href){location.href=b.dataset.href;return}
  if(e.target.id==='logout'){try{sessionStorage.clear()}catch(_){}location.href='index.html';return}
  const t=e.target.closest('[data-toast]');if(!t)return;
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=t.dataset.toast;el.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>el.classList.remove('show'),1800);
});
