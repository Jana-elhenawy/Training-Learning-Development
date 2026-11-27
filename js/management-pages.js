(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const page=document.body.dataset.managementPage;
const routes=[['Dashboard','dashboard.html'],['Reports','management-reports.html'],['Approvals','management-approvals.html'],['Training plan','management-training-plan.html'],['Access and HR review','management-access-review.html'],['Management review','management-review.html'],['Notification','notification.html']];
const logo='<div class="logo"><img src="assets/logo-white.png" alt="RMO"></div>';
const side=$('#sidebar');
if(side){side.innerHTML=logo+'<div class="role">Management</div>'+routes.map(([n,h])=>`<a class="nav${(page==='reports'&&n==='Reports'||page==='approvals'&&n==='Approvals'||page==='training-plan'&&n==='Training plan'||page==='access-review'&&n==='Access and HR review'||page==='management-review'&&n==='Management review')?' active':''}" href="${h}">${n}</a>`).join('')+'<div class="spacer"></div><a class="nav muted" href="change-password.html">Change password</a><a class="nav muted" href="index.html" id="mgmt-logout">Log out</a>';}
$('#top-notifications')?.addEventListener('click',()=>location.href='notification.html');
$('#top-profile')?.addEventListener('click',()=>location.href='change-password.html');
$('#mgmt-logout')?.addEventListener('click',()=>{try{sessionStorage.clear()}catch(e){}});
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function activateTab(name){const buttons=$$('[data-tab]');buttons.forEach(b=>b.classList.toggle('primary',b.dataset.tab===name));
 const map={waiting:'waiting-panel',requests:'requests-panel',plan:'plan-panel',budget:'budget-panel',admins:'admins-panel',hr:'hr-panel',audit:'audit-panel',sensitive:'sensitive-panel',kpi:'kpi-panel'};
 Object.entries(map).forEach(([k,id])=>{const el=$('#'+id);if(el)el.classList.toggle('mgmt-hidden',k!==name)});
}
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.tab)));
$$('[data-decision]').forEach(b=>b.addEventListener('click',()=>{const row=b.closest('tr');if(!row)return;const decision=b.dataset.decision;row.innerHTML=`<td>Result correction</td><td>Failed</td><td>Completed</td><td>Attendance evidence received</td><td>Hossam Eid</td><td>23 Nov 2026</td><td><span class="mgmt-status ${decision==='Approved'?'good':'bad'}">${decision}</span></td>`;$('#approval-state').textContent=`Request ${decision.toLowerCase()} and recorded in the prototype audit trail.`;toast(`Request ${decision.toLowerCase()}.`)}));
$('[data-plan-approve]')?.addEventListener('click',()=>{ $('#plan-status').textContent='Approved';$('#plan-status').className='mgmt-status good';toast('Training plan approved in this prototype.') });
$('[data-plan-return]')?.addEventListener('click',()=>{const c=prompt('Add a comment explaining why the plan is being returned:');if(c===null)return;if(!c.trim()){toast('Please enter a comment before returning the plan.');return}$('#plan-status').textContent='Returned with comment';$('#plan-status').className='mgmt-status warn';localStorage.setItem('tms.management.planComment',c.trim());toast('Plan returned with your comment.')});
$('[data-access-signoff]')?.addEventListener('click',()=>{const el=$('#access-status');el.textContent='Signed off';el.className='mgmt-status good';toast('Access review signed off in this prototype.')});
$('[data-review-signoff]')?.addEventListener('click',()=>toast('Management review signed off in this prototype.'));
$$('[data-export]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.export==='pdf'){window.print();return}const rows=$$('table tr').map(tr=>$$('th,td',tr).map(c=>'"'+c.innerText.replaceAll('"','""')+'"').join(',')).join('\n');const blob=new Blob([rows],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='management-summary.csv';a.click();URL.revokeObjectURL(a.href);toast('CSV export generated.') }));
$('#mgmt-search')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();$$('tbody tr').forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(q))});
})();