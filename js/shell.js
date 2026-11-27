/* Shared sidebar for the existing shared screens. Role-specific destinations stay isolated. */
const NAV={
 employee:['Dashboard','Program Catalog','My Training','Notification'],
 trainer:['Dashboard','Program Catalog','My Training','My Sessions','Notification'],
 ld:['Dashboard','Users','Program Catalog','Sessions','Enrollment Requests','Direct Enrollment','Results','Employee History','Reports','Audit and Security Log','System Settings','Notification'],
 manager:['Dashboard','Team dashboard','Department employees','Employee records','Department reports','Attendance','Training suggestions','Program catalog','Notifications','Effectiveness reviews'],
 management:['Dashboard','Reports','Approvals','Training plan','Access and HR review','Management review','Notification']
};
const ROLE_LABEL={employee:'Employee',trainer:'Trainer',ld:'L&D Administrator',manager:'Department Manager',management:'Management'};
const HREF={
 'Dashboard':'dashboard.html',
 'Users':'users.html',
 'Program Catalog':'program-catalog.html',
 'Sessions':'sessions.html',
 'Enrollment Requests':'enrollment-requests.html',
 'Direct Enrollment':'direct-enrollment.html',
 'Results':'results.html',
 'Employee History':'employee-history.html',
 'Reports':'reports.html',
 'Audit and Security Log':'audit-security-log.html',
 'System Settings':'system-settings.html',
 'Notification':'notification.html',
 'Notifications':'notification.html',
 'Team dashboard':'manager-team-dashboard.html',
 'Department employees':'manager-department-employees.html',
 'Employee records':'manager-employee-record.html',
 'Department reports':'manager-department-reports.html',
 'Attendance':'manager-attendance.html',
 'Training suggestions':'manager-training-suggestions.html',
 'Program catalog':'manager-program-catalog.html',
 'Effectiveness reviews':'manager-effectiveness-reviews.html',
 'Management Reports':'management-reports.html', 'Approvals':'management-approvals.html', 'Training plan':'management-training-plan.html', 'Access and HR review':'management-access-review.html', 'Management review':'management-review.html'
};
function buildSidebar(active){
  let k='employee';try{k=sessionStorage.getItem('tms.role')||'employee'}catch(_){}
  if(!NAV[k])k='employee';
  const logo=`<div class="logo"><img src="assets/logo-white.png" alt="RMO" onerror="this.parentNode.innerHTML='<div><div class=wm>RMO</div><small>RIDGELINE MOUNTAIN OUTFITTERS</small></div>'"></div>`;
  document.getElementById('sidebar').innerHTML=logo+`<div class="role">${ROLE_LABEL[k].replace(/&/g,'&amp;')}</div><div></div>`+
    NAV[k].map(n=>(k==='management'&&n==='Reports'?'management-reports.html':HREF[n])?`<a class="nav${n===active?' cur':''}" href="${k==='management'&&n==='Reports'?'management-reports.html':HREF[n]}">${n.replace(/&/g,'&amp;')}</a>`:`<button class="nav${n===active?' cur':''}" data-toast="${n} screen – to be built by the team">${n.replace(/&/g,'&amp;')}</button>`).join('')+
    `<div class="spacer"></div><a class="nav muted${active==='Change password'?' cur':''}" href="change-password.html">Change password</a><a class="nav muted" href="index.html" id="logout">Log out</a>`;
}
document.addEventListener('click',e=>{
  if(e.target.closest('#logout')){try{sessionStorage.clear()}catch(_){}return;}
  const t=e.target.closest('[data-toast]');if(!t)return;
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=t.dataset.toast;el.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>el.classList.remove('show'),1800);
});
