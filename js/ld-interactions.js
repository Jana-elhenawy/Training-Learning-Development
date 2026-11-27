/* L&D Administrator screen interactions. Prototype data is stored locally in this browser. */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const page = (location.pathname.split('/').pop() || 'dashboard.html').replace('.html','');
  let activeRole='employee'; try{activeRole=sessionStorage.getItem('tms.role')||'employee'}catch(e){}
  if(activeRole!=='ld') return;
  let toastTimer;
  function toast(message) {
    let el = $('#toast');
    if (!el) { el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
  }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function getRows() { return $$('tbody tr').filter(r=>r.querySelectorAll('td').length); }
  function exportTable(label) {
    const table=$('main table');
    if (!table) { toast('There is no table to export on this screen.'); return; }
    const rows=$$('tr',table).map(tr=>$$('th,td',tr).map(td=>td.innerText.trim()));
    const csv=rows.map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}), url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=(label||page)+'-'+new Date().toISOString().slice(0,10)+'.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast(label+' exported as CSV.');
  }
  function ensureDialog() {
    let d=$('#ld-dialog'); if(d) return d;
    d=document.createElement('dialog'); d.id='ld-dialog'; d.className='ld-dialog';
    d.innerHTML='<form method="dialog" class="ld-dialog-card"><button class="ld-dialog-close" value="cancel" aria-label="Close">×</button><div id="ld-dialog-content"></div><div class="ld-dialog-actions"><button class="btn" value="cancel">Cancel</button><button class="btn primary" id="ld-dialog-submit" type="button">Save</button></div></form>';
    document.body.appendChild(d); return d;
  }
  function openDialog(title, fields, onSave, row) {
    const d=ensureDialog(), content=$('#ld-dialog-content',d);
    content.innerHTML='<h2>'+escapeHtml(title)+'</h2><p class="ld-dialog-hint">Changes are saved in this browser for this prototype.</p><div class="ld-dialog-fields">'+fields.map((f,i)=>{
      const value=Array.isArray(row)?(row[i]||''):'';
      if(f.type==='select') return '<label>'+escapeHtml(f.label)+'<select name="'+escapeHtml(f.name)+'" class="control">'+f.options.map(o=>'<option '+(o===value?'selected':'')+'>'+escapeHtml(o)+'</option>').join('')+'</select></label>';
      if(f.type==='textarea') return '<label>'+escapeHtml(f.label)+'<textarea name="'+escapeHtml(f.name)+'" class="control" rows="3">'+escapeHtml(value)+'</textarea></label>';
      return '<label>'+escapeHtml(f.label)+'<input name="'+escapeHtml(f.name)+'" class="control" type="'+(f.type||'text')+'" value="'+escapeHtml(value)+'" '+(f.required?'required':'')+'></label>';
    }).join('')+'</div>';
    $('#ld-dialog-submit',d).onclick=()=>{
      const form=$('form',d), data=Object.fromEntries(new FormData(form).entries());
      if(!form.reportValidity()) return;
      onSave(data); d.close();
    };
    d.showModal();
  }
  function appendRow(values) {
    const tbody=$('main table tbody'); if(!tbody) return;
    const tr=document.createElement('tr');
    const actionCell=values.map((v,i)=>'<td>'+escapeHtml(v)+'</td>').join('');
    const hasAction=$('main table thead tr th:last-child')?.innerText.toLowerCase().includes('action');
    tr.innerHTML=actionCell+(hasAction?'<td><button class="btn outline row-action" type="button">View</button></td>':'');
    tbody.prepend(tr); updateCount();
  }
  function updateCount(){const badge=$('.card-h .badge'); if(badge && getRows().length) badge.textContent=getRows().length+' records';}
  function actionFields(action) {
    const map={
      'Create User':[{label:'Full name',name:'name',required:true},{label:'Employee ID',name:'id',required:true},{label:'Role',name:'role',type:'select',options:['Employee','Trainer','Department Manager','L&D Administrator','Management']},{label:'Department',name:'department'},{label:'Account status',name:'status',type:'select',options:['Pending Activation','Active','Locked']}],
      'Import Users':[{label:'CSV file',name:'file',type:'file',required:true}],
      'Create Session':[{label:'Program',name:'program',required:true},{label:'Date',name:'date',type:'date',required:true},{label:'Start time',name:'start',type:'time'},{label:'Trainer',name:'trainer'},{label:'Location',name:'location'},{label:'Capacity',name:'capacity',type:'number'}],
      'Create Program':[{label:'Program title',name:'title',required:true},{label:'Category',name:'category'},{label:'Delivery method',name:'mode',type:'select',options:['Classroom','Online','Blended']},{label:'Duration',name:'duration'},{label:'Capacity',name:'capacity',type:'number'},{label:'Status',name:'status',type:'select',options:['Draft','Published']}],
      'Record Result':[{label:'Employee',name:'employee',required:true},{label:'Session',name:'session',required:true},{label:'Attendance (%)',name:'attendance',type:'number'},{label:'Assessment score',name:'score',type:'number'},{label:'Result status',name:'status',type:'select',options:['Preliminary','Pass','Fail']}],
      'Create Training Plan':[{label:'Plan name',name:'name',required:true},{label:'Department',name:'department'},{label:'Target participants',name:'participants',type:'number'},{label:'Planned period',name:'period'},{label:'Owner',name:'owner'}]
    };
    return map[action]||[{label:'Title',name:'title',required:true},{label:'Notes',name:'notes',type:'textarea'}];
  }
  function doAction(action) {
    if (/^Export /.test(action)) { exportTable(action); return; }
    if(action==='Refresh'){location.reload();return;}
    if(action==='Review Pending'){
      const row=getRows().find(r=>/pending|overdue|needs review/i.test(r.innerText));
      if(row){row.scrollIntoView({behavior:'smooth',block:'center'});row.classList.add('row-highlight');setTimeout(()=>row.classList.remove('row-highlight'),1800);toast('Showing the next item that needs review.');}
      else toast('There are no pending items in the current list.');
      return;
    }
    if(action==='Save Changes'){
      const values=$$('input,select,textarea').filter(el=>el.type!=='search').map(el=>({name:el.name||el.closest('.setting-row')?.innerText||el.previousSibling?.textContent||'setting',value:el.value}));
      try{localStorage.setItem('tms-ld-settings',JSON.stringify(values));}catch(e){}
      toast('Settings saved in this browser.'); return;
    }
    const fields=actionFields(action);
    openDialog(action,fields,data=>{
      if(action==='Import Users') { const file=data.file; if(!file || !file.name){toast('Select a CSV file first.');return;} file.text().then(text=>{const lines=text.split(/\r?\n/).filter(Boolean);lines.slice(1).forEach(line=>{const cols=line.split(',').map(v=>v.replace(/^\"|\"$/g,'').trim());if(cols.length>=4)appendRow([cols[0],cols[1],cols[2],cols[3],cols[4]||'Pending Activation','Imported']);});toast('CSV users imported into this browser prototype.');}).catch(()=>toast('Could not read the selected CSV file.')); return; }
      if(action==='Create User') appendRow([data.name,data.id,data.role,data.department,data.status,'Just now']);
      else if(action==='Create Session') appendRow([data.program,data.date,data.start||'—',data.trainer||'Not assigned',data.location||'—','0 / '+(data.capacity||'0'),'Draft']);
      else if(action==='Create Program') appendRow([data.title,data.category,data.mode,data.duration,data.capacity,data.status]);
      else if(action==='Record Result') appendRow([data.employee,data.session,data.attendance+'%',data.score,data.status]);
      else if(action==='Create Training Plan') appendRow([data.name,data.department,data.participants,data.period,data.owner,'Draft']);
      try{const key='tms-ld-'+page+'-drafts';const old=JSON.parse(localStorage.getItem(key)||'[]');old.push(data);localStorage.setItem(key,JSON.stringify(old));}catch(e){}
      toast(action+' saved successfully.');
    });
  }
  function reviewRow(button) {
    const row=button.closest('tr'); if(!row)return;
    const cells=$$('td',row).map(td=>td.innerText.trim());
    const isEnrollment=page==='enrollment-requests'||page==='approvals';
    const isReview=page==='access-hr-review';
    if(isEnrollment||isReview||page==='approvals'){
      openDialog('Review item',[{label:'Decision',name:'decision',type:'select',options:isReview?['Reviewed','Needs follow-up','Escalate']:['Approve','Reject','Waitlist']},{label:'Review note',name:'note',type:'textarea'}],data=>{
        const statusIndex=(page==='enrollment-requests'||page==='approvals'||page==='access-hr-review')?5:cells.findIndex(v=>/pending|needs review|overdue/i.test(v));
        if(statusIndex>=0 && row.children[statusIndex]) row.children[statusIndex].textContent=data.decision;
        row.classList.add('row-highlight'); updateCount(); toast('Decision recorded for this prototype.');
      });
    } else {
      openDialog('Record details',cells.map((v,i)=>({label:$$('th',row.closest('table'))[i]?.innerText||('Field '+(i+1)),name:'field'+i})),()=>{},cells);
      $('#ld-dialog-submit').style.display='none';
    }
  }
  // Capture phase prevents older placeholder click handlers from swallowing real actions.
  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]');
    if(action){e.preventDefault();e.stopImmediatePropagation();doAction(action.dataset.action);return;}
    const rowAction=e.target.closest('.row-action');
    if(rowAction){e.preventDefault();e.stopImmediatePropagation();reviewRow(rowAction);return;}
  },true);
  const search=$('#global-search')||$('.table-search');
  if(search) search.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    getRows().forEach(row=>row.style.display=row.innerText.toLowerCase().includes(q)?'':'none');
  });
  $$('.toolbar select').forEach(select=>select.addEventListener('change',()=>{
    const filters=$$('.toolbar select').map(s=>s.value).filter(v=>v&&!/^all/i.test(v));
    getRows().forEach(row=>row.style.display=filters.every(f=>row.innerText.toLowerCase().includes(f.toLowerCase()))?'':'none');
  }));
  const form=$('#main-form');
  if(form) form.addEventListener('submit',e=>{
    e.preventDefault(); const values=Object.fromEntries(new FormData(form).entries());
    try{const old=JSON.parse(localStorage.getItem('tms-ld-direct-enrollments')||'[]');old.push(values);localStorage.setItem('tms-ld-direct-enrollments',JSON.stringify(old));}catch(err){}
    toast('Enrollment request recorded in this browser prototype.'); form.reset();
  });
})();
