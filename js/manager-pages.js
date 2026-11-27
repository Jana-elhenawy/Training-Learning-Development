
(() => {
  'use strict';
  const page = document.body.dataset.managerPage;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role = (() => { try { return sessionStorage.getItem('tms.role') || 'employee'; } catch (_) { return 'employee'; } })();

  const nav = [
    ['Dashboard','dashboard.html'],
    ['Team dashboard','manager-team-dashboard.html'],
    ['Department employees','manager-department-employees.html'],
    ['Employee records','manager-employee-record.html'],
    ['Department reports','manager-department-reports.html'],
    ['Attendance','manager-attendance.html'],
    ['Training suggestions','manager-training-suggestions.html'],
    ['Program catalog','manager-program-catalog.html'],
    ['Notifications','notification.html'],
    ['Effectiveness reviews','manager-effectiveness-reviews.html']
  ];

  const employees = [
    {name:'Amira Hassan',role:'Financial Analyst',id:'E-1029',enrollments:4,status:'Approved',attendance:'96%',mandatory:'Complete',outcome:'Completed · Final',program:'Financial Reporting Basics'},
    {name:'Omar Farouk',role:'Accountant',id:'E-1030',enrollments:2,status:'Pending',attendance:'88%',mandatory:'Overdue',outcome:'Incomplete · Preliminary',program:'Information Security Awareness'},
    {name:'Nour El-Din',role:'Senior Accountant',id:'E-1031',enrollments:3,status:'Waitlisted',attendance:'92%',mandatory:'Complete',outcome:'Completed · Final',program:'Leadership Essentials'},
    {name:'Layla Mansour',role:'Budget Officer',id:'E-1032',enrollments:0,status:'Not enrolled',attendance:'Not available',mandatory:'Overdue',outcome:'No outcome',program:'Information Security Awareness'},
    {name:'Karim Adel',role:'Financial Analyst',id:'E-1033',enrollments:1,status:'Approved',attendance:'72%',mandatory:'Due soon',outcome:'Failed · Final',program:'Anti-Money Laundering Basics'},
    {name:'Salma Yousef',role:'Accounts Payable',id:'E-1034',enrollments:2,status:'Not enrolled',attendance:'100%',mandatory:'Complete',outcome:'Completed · Final',program:'Budget Planning Workshop'}
  ];

  const programs = [
    {name:'Trail Safety Fundamentals',category:'Safety',duration:'12h',mode:'In-person',next:'14 Nov',date:'14 Nov 2026',room:'Training Room A',sessions:'14 Nov · Training Room A',description:'Learn the core skills for staying safe on remote trails, from risk assessment to emergency response, with hands-on practice.',audience:'All outdoor guides',tag:'safety'},
    {name:'Gear Care & Maintenance',category:'Gear',duration:'3h',mode:'Online',next:'None upcoming',active:false,sessions:'No upcoming sessions',description:'Practical guidance for caring for equipment and extending its useful life.',audience:'All employees',tag:'gear'},
    {name:'Backcountry Navigation',category:'Navigation',duration:'3d',mode:'Hybrid',next:'05 Nov',sessions:'05 Nov · Field training',description:'Build navigation skills for remote environments using maps, compass and route planning.',audience:'Outdoor guides',tag:'navigation'},
    {name:'Information Security Awareness',category:'Compliance',duration:'4h',mode:'Online',next:'14 Dec',date:'14 Dec 2026',room:'Training Room A',sessions:'14 Dec · Training Room A',description:'Recognize security risks and follow safe information-handling practices.',audience:'Whole department',tag:'compliance'},
    {name:'Excel for Finance',category:'Finance',duration:'2 days',mode:'In-person',next:'21 Dec',date:'21 Dec 2026',room:'Training Room B',sessions:'21 Dec · Training Room B',description:'Improve spreadsheet analysis and reporting skills for finance teams.',audience:'Finance employees',tag:'finance'},
    {name:'Leadership Essentials',category:'Management',duration:'2 days',mode:'Online',next:'10 Jan 2027',date:'10 Jan 2027',room:'Online',sessions:'10 Jan 2027 · Online',description:'Develop practical leadership and communication skills.',audience:'Team leads',tag:'management'}
  ];

  const suggestions = [
    {program:'Information Security Awareness',date:'14 Dec 2026',room:'Training Room A',seats:6,for:'Omar Farouk · Accountant',reasons:[['Mandatory training not completed','danger'],['Program audience matches job title','neutral'],['Prerequisites met','success']],employee:'Omar Farouk'},
    {program:'Information Security Awareness',date:'14 Dec 2026',room:'Training Room A',seats:6,for:'Layla Mansour · Budget Officer',reasons:[['Mandatory training not completed','danger'],['Not already enrolled','neutral'],['Prerequisites met','success']],employee:'Layla Mansour'},
    {program:'Excel for Finance',date:'21 Dec 2026',room:'Training Room B',seats:3,for:'Whole department · 4 employees',reasons:[['Audience matches department','neutral'],['Prerequisites met','success'],['Not completed before','neutral']],employee:'Omar Farouk'},
    {program:'Leadership Essentials',date:'10 Jan 2027',room:'Online',seats:12,for:'Nour El-Din · Senior Accountant',reasons:[['Audience matches job title','neutral'],['Prerequisites met','success'],['Not already enrolled','neutral']],employee:'Nour El-Din'},
    {program:'Anti-Money Laundering Basics',date:'18 Jan 2027',room:'Training Room A',seats:8,for:'Karim Adel · Financial Analyst',reasons:[['Mandatory training not completed','danger'],['Due soon','warning'],['Prerequisites met','success']],employee:'Karim Adel'},
    {program:'Budget Planning Workshop',date:'25 Jan 2027',room:'Training Room C',seats:5,for:'Salma Yousef · Accounts Payable',reasons:[['Audience matches department','neutral'],['Prerequisites met','success']],employee:'Salma Yousef'}
  ];

  function toast(message){
    const el=$('#toast'); if(!el)return;
    el.textContent=message;el.classList.add('show');
    clearTimeout(window._managerToast);window._managerToast=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function go(url){ location.href=url; }
  function save(key,value){try{sessionStorage.setItem('tms.manager.'+key,JSON.stringify(value));}catch(_){}}
  function load(key,fallback){try{return JSON.parse(sessionStorage.getItem('tms.manager.'+key)) ?? fallback;}catch(_){return fallback;}}
  function selectedEmployee(){const name=load('employee','Amira Hassan');return employees.find(e=>e.name===name)||employees[0];}
  function selectedProgram(){const name=load('program','Trail Safety Fundamentals');return programs.find(p=>p.name===name)||programs[0];}
  function pickEmployee(name){save('employee',name);}
  function pickProgram(name){save('program',name);}
  function status(text){
    const t=String(text).toLowerCase();
    const cls=t.includes('overdue')||t.includes('failed')||t.includes('not completed')||t.includes('incomplete')||t.includes('absent')?'danger':t.includes('pending')||t.includes('due')||t.includes('late')?'warning':t.includes('complete')||t==='approved'||t==='present'?'success':t.includes('preliminary')||t.includes('waitlist')?'info':'';
    return `<span class="status-pill ${cls}">${esc(text)}</span>`;
  }
  function metric(label,value,note=''){return `<div class="metric-card"><span class="metric-label">${esc(label)}</span><strong class="metric-value">${esc(value)}</strong>${note?`<span class="metric-note">${esc(note)}</span>`:''}</div>`;}
  function header(title,subtitle,badges=[]){
    return `<div class="manager-head"><div><h1 class="page-title">${esc(title)}</h1><p class="subtitle">${esc(subtitle)}</p></div><div class="manager-badges">${badges.map((b,i)=>`<span class="badge ${i?'b-neutral':'b-info'}">${esc(b)}</span>`).join('')}</div></div>`;
  }
  function field(label,options,id,value){
    return `<div class="filter-field"><label for="${id}">${esc(label)}</label><select class="control" id="${id}">${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`;
  }
  function employeeCell(e){return `<span class="person-name">${esc(e.name)}</span><span class="person-role">${esc(e.role)}</span>`;}
  function setActiveNav(active){
    const sidebar=$('#sidebar');
    const logo=`<div class="logo"><img src="assets/logo-white.png" alt="RMO" onerror="this.parentNode.innerHTML='<div><div class=wm>RMO</div><small>RIDGELINE MOUNTAIN OUTFITTERS</small></div>'"></div>`;
    sidebar.innerHTML=logo+`<div class="role">Department Manager</div>`+
      nav.map(([label,url])=>`<a class="nav${label===active?' active':''}" href="${url}">${esc(label)}</a>`).join('')+
      `<div class="spacer"></div><a class="nav muted" href="change-password.html">Change password</a><a class="nav muted" href="index.html" id="logout">Log out</a>`;
  }
  function shell(active,title,placeholder='Search records...'){
    setActiveNav(active);
    $('#crumb').textContent='Workspace / '+title;
    const input=$('#global-search'); if(input)input.placeholder=placeholder;
    document.title='TMS – '+title;
  }
  function actionsRow(items){return `<div class="shortcuts">${items.join('')}</div>`;}
  function pageTeamDashboard(){
    shell('Team dashboard','Team dashboard');
    return header('Team Dashboard','Finance department · Read-only view of your own department',['No assessment scores shown','Own department only'])+
      `<section class="filter-panel">${field('Period',['Last 12 months','Last 6 months','Last 30 days','This quarter'],'team-period','Last 12 months')}${field('Program',['All programs',...programs.map(p=>p.name)],'team-program','All programs')}<div class="filter-actions"><button class="btn" data-action="team-reset">Reset</button><button class="btn green" data-action="team-apply">Apply filters</button></div></section>`+
      `<section class="metric-grid six">${metric('Completion rate','78%','department total')}${metric('Attendance rate','91%','department total')}${metric('Seat usage','84%','department total')}${metric('Pending requests','5','department total')}${metric('Upcoming sessions','7','department total')}${metric('Mandatory training','66%','completed')}</section>`+
      `<section class="section-card"><h2 class="section-title">Insights</h2><div class="insight-grid"><div class="insight"><span class="status-pill danger">3 employees</span><strong>Overdue mandatory training</strong></div><div class="insight"><span class="status-pill warning">4 employees</span><strong>No completed training in 12 months</strong></div><div class="insight"><span class="status-pill warning">2 employees</span><strong>Repeated no-shows</strong></div><div class="insight"><span class="status-pill info">2 requests</span><strong>Pending longer than 3 days</strong></div></div></section>`+
      `<section class="section-card"><div class="card-h"><h2 class="section-title" style="margin:0;flex:1">Employees in your department</h2><span class="metric-note">Showing 1–6 of 24</span></div><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Enrollments</th><th>Status</th><th>Attendance</th><th>Outcome</th><th>Mandatory</th><th>Action</th></tr></thead><tbody id="team-rows">${employees.map(e=>`<tr data-search="${esc([e.name,e.role,e.program,e.status].join(' ').toLowerCase())}" data-program="${esc(e.program)}"><td>${employeeCell(e)}</td><td>${e.enrollments}</td><td>${status(e.status)}</td><td>${esc(e.attendance)}</td><td>${status(e.outcome)}</td><td>${status(e.mandatory)}</td><td>${e.status==='Approved'?'<button class="btn small" disabled>Already enrolled</button>':`<button class="btn small green" data-nominate="${esc(e.name)}" data-program="${esc(e.program)}">Nominate</button>`}</td></tr>`).join('')}</tbody></table></div><div class="note-panel">Nominating creates a Pending request marked “Nominated by manager”. The L&amp;D Administrator decides.</div><div class="pagination"><button class="btn small" data-action="team-prev">Previous</button><button class="btn small green" data-action="team-next">Next</button></div></section>`;
  }
  function pageSuggestions(){
    shell('Training suggestions','Training suggestions');
    return header('Training Suggestions','Finance department · Programs and open sessions suggested by rules',['Rule-based','Suggestions never enroll anyone'])+
      `<section class="filter-panel">${field('Suggest for',['Whole department',...employees.map(e=>e.name)],'suggest-for','Whole department')}${field('Type',['All suggestions','Mandatory','Role match','Prerequisites','Upcoming sessions'],'suggest-type','All suggestions')}<div class="filter-actions"><button class="btn" data-action="suggest-reset">Reset</button><button class="btn green" data-action="suggest-apply">Apply filters</button></div></section>`+
      `<div class="card-h"><h2 style="font:600 20px/28px Inter;flex:1" id="suggest-count">6 suggestions</h2><span class="metric-note">Sorted by priority: mandatory training first</span></div><div class="suggestion-list" id="suggestion-list">${suggestions.map(s=>suggestionCard(s)).join('')}</div><div class="note-panel">Nominating creates a Pending request marked “Nominated by manager”. The L&amp;D Administrator decides as usual.</div>`;
  }
  function suggestionCard(s){
    return `<article class="suggestion-card searchable" data-suggest-employee="${esc(s.employee)}" data-suggest-program="${esc(s.program)}" data-suggest-reasons="${esc(s.reasons.map(r=>r[0]).join(' '))}"><div><h3>${esc(s.program)}</h3><p>Session ${esc(s.date)} · ${esc(s.room)} · ${s.seats} seats left</p><p>For: ${esc(s.for)}</p></div><div><b class="metric-label">Why suggested</b><div class="reason-wrap">${s.reasons.map(r=>status(r[0])).join('')}</div></div><button class="btn green" data-nominate="${esc(s.employee)}" data-program="${esc(s.program)}">Nominate</button></article>`;
  }
  function pageNominate(){
    shell('Training suggestions','Nominate for Training');
    const e=selectedEmployee(),p=selectedProgram();
    const nomination=load('nominationDraft',{});
    const employee=nomination.employee||e.name, program=nomination.program||p.name;
    const prog=programs.find(x=>x.name===program)||p;
    return header('Nominate for Training','Finance department only',['Department Manager','Pending request only'])+
      `<form class="form-card" id="nomination-form"><h2 class="section-title">Nominate for Training</h2><div class="form-grid"><div class="form-field"><label for="nominee-employee">Employee *</label><select id="nominee-employee" required>${employees.map(x=>`<option ${x.name===employee?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="form-field"><label for="nominee-program">Program *</label><select id="nominee-program" required>${programs.map(x=>`<option ${x.name===program?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="form-field"><label for="nominee-session">Open session *</label><select id="nominee-session" required><option>${esc(prog.date||'14 Dec 2026')} · ${esc(prog.room||'Training Room A')}</option><option>21 Dec 2026 · Training Room B</option><option>10 Jan 2027 · Online</option></select></div><div class="form-field"><label for="nominee-reason">Suggestion reason</label><input id="nominee-reason" value="Mandatory training not completed"></div></div><div class="note-panel" style="margin-top:18px">Prerequisites met · Not already enrolled · 6 seats left. Submitting creates a Pending request marked “Nominated by manager”. This does not approve enrollment or reserve a seat. Only employees in your own department may be nominated. An existing active enrollment blocks a duplicate nomination.</div><div class="shortcuts" style="margin-top:18px"><button class="btn green" type="submit">Submit nomination</button><button class="btn" type="button" data-go="manager-training-suggestions.html">Back to suggestions</button></div></form>`;
  }
  function pageNominationSubmitted(){
    shell('Training suggestions','Nomination Submitted');
    const n=load('lastNomination',{employee:'Omar Farouk',program:'Information Security Awareness',session:'14 Dec 2026',status:'Pending'});
    return header('Nomination Submitted',`${esc(n.employee)} / ${esc(n.program)}`,['Pending request'])+
      `<section class="section-card"><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Session</th><th>Status</th><th>Source</th></tr></thead><tbody><tr><td>${esc(n.employee)}</td><td>${esc(n.session)}</td><td>${status('Pending')}</td><td>Nominated by manager</td></tr></tbody></table></div></section><div class="note-panel">The L&amp;D Administrator will approve or reject this nomination. Follow the decision in your notifications and team dashboard. Suggestions never enroll anyone automatically; individual assessment scores are never shown to a Department Manager.</div><div class="shortcuts"><button class="btn green" data-go="manager-team-dashboard.html">Back to team dashboard</button><button class="btn" data-go="notification.html">View notifications</button></div>`;
  }
  function pageCatalog(){
    shell('Program catalog','Program catalog','Search programs...');
    return header('Program Catalog','Browse programs relevant to your department',['Department Manager','Manager view'])+
      `<div class="toggle-group"><button class="active" data-catalog-view="grid">Grid</button><button data-catalog-view="table">Table</button></div><input class="catalog-search" id="catalog-search" placeholder="Search programs by title or keyword..."><div class="catalog-toolbar">${field('Category',['All categories','Safety','Gear','Navigation','Compliance','Finance','Management'],'catalog-category','All categories')}${field('Delivery mode',['All modes','In-person','Online','Hybrid'],'catalog-mode','All modes')}${field('Sort',['Newest','A–Z','Duration'],'catalog-sort','Newest')}<span class="metric-note">Active filters</span><button class="btn small" id="online-chip" data-action="catalog-online">Online ×</button><button class="btn small" data-action="catalog-clear">Clear all</button></div><label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="active-only"> Active only <span class="category-tag">Manager view</span></label><div id="catalog-results" class="catalog-grid">${programs.slice(0,3).map(programCard).join('')}</div><div class="pagination"><span class="metric-note" style="margin-right:auto" id="catalog-count">Showing 1–3 of 50</span><button class="btn small" data-action="catalog-prev">‹</button><button class="btn small green" data-action="catalog-page-1">1</button><button class="btn small" data-action="catalog-page-2">2</button><button class="btn small" data-action="catalog-page-3">3</button><button class="btn small" data-action="catalog-next">›</button></div>`;
  }
  function programCard(p){
    return `<article class="program-card searchable" data-program-name="${esc(p.name)}" data-category="${esc(p.category)}" data-mode="${esc(p.mode)}" data-active="${p.active===false?'false':'true'}"><span class="category-tag ${esc(p.tag)}">${esc(p.category.toUpperCase())}</span><h3>${esc(p.name)}</h3><div class="program-meta"><span>Duration <b>${esc(p.duration)}</b></span><span>Mode <b>${esc(p.mode)}</b></span><span>Next session <b>${esc(p.next)}</b></span></div><button class="btn" data-program-open="${esc(p.name)}">View details</button></article>`;
  }
  function pageProgramDetails(){
    shell('Program catalog','Program details');
    const p=selectedProgram();
    return `<section class="section-card" style="background:#e1e3de;padding:24px"><span class="category-tag ${esc(p.tag)}">${esc(p.category.toUpperCase())}</span><div class="manager-head" style="margin-top:10px"><div><h1 class="page-title" style="font-size:30px">${esc(p.name)}</h1><div class="metric-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:14px"><div class="metric-card"><span class="metric-label">Duration</span><b>${esc(p.duration)}</b></div><div class="metric-card"><span class="metric-label">Mode</span><b>${esc(p.mode)}</b></div><div class="metric-card"><span class="metric-label">Audience</span><b>${esc(p.audience)}</b></div></div></div><button class="btn green" data-go="manager-nominate.html">Nominate employee</button></div></section><div class="split-grid"><div><section class="section-card"><h2 class="section-title">About this program</h2><p>${esc(p.description)}</p></section><section class="section-card" style="margin-top:16px"><h2 class="section-title">Learning objectives</h2><ul><li>Assess relevant risks and plan safe responses</li><li>Apply practical skills in the workplace</li><li>Communicate and follow the correct procedures</li></ul></section><div class="split-grid" style="margin-top:16px"><section class="section-card"><h2 class="section-title">Prerequisites</h2><p>• Program X</p>${status('Completed')}</section><section class="section-card"><h2 class="section-title">Completion criteria</h2><p>• Min attendance: 80%</p><p>• Passing score: 70</p></section></div></div><section class="section-card"><h2 class="section-title">Upcoming sessions</h2><div class="item"><div class="t"><b>14 Nov · 09:00–17:00</b><span>In-person · Sam Carter</span></div>${status('Full · Waitlist 3')}</div><div class="item"><div class="t"><b>02 Dec · 09:00–17:00</b><span>Online · Lena Ortiz</span></div>${status('12 seats left of 20')}</div><button class="btn green" data-go="manager-nominate.html">Nominate employee</button></section></div>`;
  }
  function pageEmployees(){
    shell('Department employees','Department employees','Search employee name or employee number...');
    return header('Department Employees','Finance department · Employees in your department only · Read-only employee details')+
      `<div class="filter-panel"><div class="filter-field" style="flex:1 1 320px"><label for="employee-search">Search employees</label><input class="control" id="employee-search" placeholder="Search employee name or employee number..."></div>${field('Mandatory-training status',['All mandatory-training statuses','Complete','Overdue','Due soon'],'employee-mandatory','All mandatory-training statuses')}<div class="filter-actions"><button class="btn" data-action="employee-clear">Clear filters</button></div></div>`+
      `<section class="metric-grid">${metric('Employees','24','Finance department')}${metric('Pending requests','5','Awaiting administrator')}${metric('Mandatory completion','66%','Department total')}${metric('Attendance rate','91%','Last 12 months')}</section>`+
      `<section><h2 class="section-title">Employees in Finance</h2><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Employee no.</th><th>Enrollments</th><th>Attendance</th><th>Mandatory</th><th>Actions</th></tr></thead><tbody id="employee-rows">${employees.map(e=>`<tr data-employee="${esc(e.name)}" data-mandatory="${esc(e.mandatory)}" data-search="${esc((e.name+' '+e.role+' '+e.id).toLowerCase())}"><td>${employeeCell(e)}</td><td>${e.id}</td><td>${e.enrollments}</td><td>${esc(e.attendance)}</td><td>${status(e.mandatory)}</td><td><button class="btn small" data-record="${esc(e.name)}">View record</button> ${e.attendance!=='Not available'?`<button class="btn small" data-attendance="${esc(e.name)}">Attendance</button>`:''}</td></tr>`).join('')}</tbody></table></div><div class="pagination"><span class="metric-note" style="margin-right:auto">Showing 1–6 of 24 department employees</span><button class="btn small" data-action="employees-prev">Previous</button><button class="btn small" data-action="employees-next">Next</button></div></section><div class="note-panel">Open a record to review enrollment history, attendance and training outcomes. Employee management and individual assessment scores are not available to Department Managers.</div>`;
  }
  function pageEmployeeRecord(){
    shell('Employee records','Employee training record');
    const e=selectedEmployee();
    const history=[
      ['Financial Reporting Basics','12 Nov 2026','Approved','Not started','Not final','Session details'],
      ['Excel for Analysts','15 Sep 2026','Completed','100%','Completed · Final','Attendance'],
      ['Workplace Safety','20–23 Oct 2026','Completed','100%','Completed · Final','Attendance'],
      ['Business Communication','18 Mar 2026','Completed','88%','Completed · Final','Attendance']
    ];
    return header('Employee Training Record',`${e.name} · ${e.id} · ${e.role} · Finance department`)+
      `<div class="shortcuts"><button class="btn green">Training history</button><button class="btn" data-attendance="${esc(e.name)}">Attendance record</button><button class="btn" data-go="manager-department-employees.html">Back to employees</button></div>`+
      `<section class="metric-grid">${metric('Enrollments',String(e.enrollments),'Last 12 months')}${metric('Completed training','3','Official outcomes')}${metric('Attendance rate',e.attendance,'Training history')}${metric('Mandatory training',e.mandatory,'Required training')}</section>`+
      `<section><h2 class="section-title">Enrollments and finalized history</h2><div class="table-wrap"><table><thead><tr><th>Program / session</th><th>Date</th><th>Enrollment</th><th>Attendance</th><th>Outcome</th><th>Action</th></tr></thead><tbody>${history.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${status(r[2])}</td><td>${r[3]}</td><td>${status(r[4])}</td><td><button class="btn small" data-history-action="${esc(r[5])}">${esc(r[5])}</button></td></tr>`).join('')}</tbody></table></div></section><div class="note-panel">This record is read-only and belongs to Finance. Outcomes are shown after finalization; assessment scores are not displayed. Attendance is recorded by the assigned trainer.</div><div class="shortcuts"><button class="btn green" data-attendance="${esc(e.name)}">Open attendance record</button><button class="btn" data-go="manager-training-suggestions.html">View training suggestions</button></div>`;
  }
  function pageReports(){
    shell('Department reports','Department reports');
    return header('Department Reports','Finance department · Summary for your department only · 24 employees')+
      `<section class="filter-panel">${field('Period',['Last 12 months','Last 6 months','Last 30 days','This quarter'],'report-period','Last 12 months')}${field('Program',['All department programs',...programs.map(p=>p.name)],'report-program','All department programs')}${field('Enrollment status',['All statuses','Approved','Pending','Completed'],'report-status','All statuses')}<div class="filter-actions"><button class="btn green" data-action="report-apply">Apply filters</button></div></section>`+
      `<section class="metric-grid">${metric('Completion rate','78%','Department total')}${metric('Attendance rate','91%','Department total')}${metric('Seat utilization','84%','Approved seats used')}${metric('Mandatory completion','66%','Required training')}</section>`+
      `<section class="section-card"><h2 class="section-title">Finalized training outcomes</h2><div class="progress-track"><div class="progress-fill"></div></div><div class="legend-row"><span>Completed 78%</span><span>Not completed 22%</span></div></section>`+
      `<section><h2 class="section-title">Program breakdown · Showing 4 of 12 programs</h2><div class="table-wrap"><table><thead><tr><th>Program</th><th>Completion</th><th>Attendance</th><th>Training requirement</th></tr></thead><tbody><tr data-program="Information Security Awareness" data-status="Completed"><td>Information Security Awareness</td><td>67%</td><td>90%</td><td>Mandatory</td></tr><tr data-program="Workplace Safety" data-status="Completed"><td>Workplace Safety</td><td>88%</td><td>94%</td><td>Mandatory</td></tr><tr data-program="Excel for Analysts" data-status="Completed"><td>Excel for Analysts</td><td>83%</td><td>92%</td><td>Optional</td></tr><tr data-program="Financial Reporting Basics" data-status="Completed"><td>Financial Reporting Basics</td><td>75%</td><td>88%</td><td>Optional</td></tr></tbody></table></div></section><div class="note-panel">5 requests are pending and 7 sessions are upcoming across Finance. These department summaries do not include individual assessment scores. Change the filters to review a different period or program.</div><div class="shortcuts"><button class="btn green" data-go="manager-department-employees.html">View employee records</button><button class="btn" data-go="manager-attendance.html">View department attendance</button></div>`;
  }
  function pageAttendance(){
    shell('Attendance','Department attendance');
    return header('Department Attendance','Finance department · Workplace Safety · Session attendance is read-only')+
      `<section class="filter-panel">${field('Session dates',['20–23 Oct 2026','12 Nov 2026','All session dates'],'attendance-dates','20–23 Oct 2026')}${field('Program',['Workplace Safety',...programs.map(p=>p.name)],'attendance-program','Workplace Safety')}${field('Employee',['All enrolled Finance employees',...employees.map(e=>e.name)],'attendance-employee','All enrolled Finance employees')}<div class="filter-actions"><button class="btn green" data-action="attendance-apply">Apply filters</button></div></section>`+
      `<section class="metric-grid five">${metric('Attendance rate','84.2%','16 attended / 19 eligible')}${metric('Present','15','Participant days')}${metric('Late','1','Counts as attended')}${metric('Absent','3','Participant days')}${metric('Excused','1','Excluded from denominator')}</section>`+
      `<section><h2 class="section-title">Attendance by employee and session date</h2><div class="table-wrap"><table><thead><tr><th>Employee</th><th>20 Oct</th><th>21 Oct</th><th>22 Oct</th><th>23 Oct</th><th>Attendance</th><th>Action</th></tr></thead><tbody>${[['Amira Hassan','Present','Present','Late','Present','100%'],['Omar Farouk','Present','Absent','Present','Present','75%'],['Nour El-Din','Present','Excused','Present','Present','100%'],['Karim Adel','Absent','Present','Absent','Present','50%'],['Salma Yousef','Present','Present','Present','Present','100%']].map(r=>`<tr data-employee="${esc(r[0])}"><td>${esc(r[0])}</td>${r.slice(1,5).map(v=>`<td>${status(v)}</td>`).join('')}<td>${r[5]}</td><td><button class="btn small" data-attendance="${esc(r[0])}">View record</button></td></tr>`).join('')}</tbody></table></div></section><div class="note-panel">Showing the 5 enrolled employees from Finance. Attendance = (Present + Late) / (scheduled days − Excused). Department Managers can review records but only the assigned trainer can record or change attendance.</div><div class="shortcuts"><button class="btn green" data-go="manager-department-reports.html">View department reports</button><button class="btn" data-go="manager-department-employees.html">Back to department employees</button></div>`;
  }
  function pageEmployeeAttendance(){
    shell('Attendance','Employee attendance record');
    const e=selectedEmployee();
    return header('Employee Attendance Record',`${e.name} · ${e.id} · Finance department · Workplace Safety`)+
      `<section class="filter-panel">${field('Program / session',['Workplace Safety','Excel for Analysts'],'detail-program','Workplace Safety')}${field('Session dates',['20–23 Oct 2026','12 Nov 2026'],'detail-dates','20–23 Oct 2026')}<div class="filter-actions"><button class="btn green" data-action="detail-apply">Apply filters</button></div></section>`+
      `<section class="metric-grid five">${metric('Attendance rate','100%','4 attended / 4 eligible')}${metric('Present','3','Session dates')}${metric('Late','1','Counts as attended')}${metric('Absent','0','Session dates')}${metric('Excused','0','Session dates')}</section>`+
      `<section><h2 class="section-title">Day-by-day attendance · Finalized training</h2><div class="table-wrap"><table><thead><tr><th>Session date</th><th>Status</th><th>Scheduled time</th><th>Arrival</th><th>Recorded by</th></tr></thead><tbody><tr><td>20 Oct 2026</td><td>${status('Present')}</td><td>09:00–12:00</td><td>09:00</td><td>Ahmed Maher</td></tr><tr><td>21 Oct 2026</td><td>${status('Present')}</td><td>09:00–12:00</td><td>09:00</td><td>Ahmed Maher</td></tr><tr><td>22 Oct 2026</td><td>${status('Late')}</td><td>09:00–12:00</td><td>09:15</td><td>Ahmed Maher</td></tr><tr><td>23 Oct 2026</td><td>${status('Present')}</td><td>09:00–12:00</td><td>09:00</td><td>Ahmed Maher</td></tr></tbody></table></div></section><div class="note-panel">Read-only attendance for an employee in your department. Late counts as attended; Excused dates are excluded from the attendance denominator. Training outcome: Completed · Final. Any correction must be handled by the L&amp;D Administrator.</div><div class="shortcuts"><button class="btn green" data-go="manager-employee-record.html">View employee training record</button><button class="btn" data-go="manager-attendance.html">Back to department attendance</button></div>`;
  }
  function pageEffectivenessReviews(){
    shell('Effectiveness reviews','Effectiveness reviews');
    const reviews=load('pendingReviews',[{employee:'Omar Farouk',program:'Financial Reporting Basics',completed:'22 Sep 2026'},{employee:'Mona Ali',program:'Excel for Analysts',completed:'18 Sep 2026'}]);
    return header('Effectiveness reviews','Own department only · Requested 60 days after training')+
      `<section class="section-card"><h2 class="section-title">Pending effectiveness reviews</h2>${reviews.length?reviews.map(r=>`<div class="review-row"><div>${status('Pending')}</div><div><b>${esc(r.employee)}</b><div class="muted">Completed ${esc(r.completed)}</div></div><div>${esc(r.program)}</div><button class="btn green" data-review="${esc(r.employee)}" data-program="${esc(r.program)}">Review effectiveness</button></div>`).join(''):'<div class="empty-state">There are no effectiveness reviews due.</div>'}</section>`;
  }
  function pageEffectivenessForm(){
    shell('Effectiveness reviews','Review training effectiveness');
    const review=load('currentReview',{employee:'Omar Farouk',program:'Financial Reporting Basics'});
    return header('Review training effectiveness',`${review.employee} · ${review.program}`)+
      `<form class="form-card" id="review-form"><h2 class="section-title">Is the employee applying the training?</h2><div class="form-field"><label>Rating *</label><div class="rating-options">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating" value="${n}" ${n===4?'checked':''}>${n}</label>`).join('')}</div></div><div class="form-field"><label for="review-comment">Optional comment</label><textarea id="review-comment" placeholder="Describe observed changes in work performance"></textarea></div><p class="metric-note" style="margin:20px 0 60px">No assessment score is displayed or used in this review.</p><div class="shortcuts" style="justify-content:flex-end"><button class="btn" type="button" data-go="manager-effectiveness-reviews.html">Cancel</button><button class="btn green" type="submit">Submit review</button></div></form>`;
  }
  function pageEffectivenessSubmitted(){
    shell('Effectiveness reviews','Effectiveness review submitted');
    const r=load('lastReview',{employee:'Omar Farouk',program:'Financial Reporting Basics',rating:4});
    return header('Effectiveness review submitted','The review is recorded for program effectiveness reporting')+
      `<section class="form-card"><h2 class="section-title">Confirmation</h2><div class="note-panel" style="background:var(--success-bg);color:var(--success)"><b>Review submitted successfully.</b><br><span class="metric-note">Results are aggregated by program for the L&amp;D Administrator.</span></div><p style="margin:16px 0">Employee: ${esc(r.employee)} · Program: ${esc(r.program)} · Rating: ${esc(r.rating)}/5</p><button class="btn green" data-go="manager-effectiveness-reviews.html">Return to reviews</button></section>`;
  }

  const renderers={
    'team-dashboard':pageTeamDashboard,
    'training-suggestions':pageSuggestions,
    'nominate':pageNominate,
    'nomination-submitted':pageNominationSubmitted,
    'program-catalog':pageCatalog,
    'program-details':pageProgramDetails,
    'department-employees':pageEmployees,
    'employee-record':pageEmployeeRecord,
    'department-reports':pageReports,
    'attendance':pageAttendance,
    'employee-attendance':pageEmployeeAttendance,
    'effectiveness-reviews':pageEffectivenessReviews,
    'effectiveness-review-form':pageEffectivenessForm,
    'effectiveness-review-submitted':pageEffectivenessSubmitted
  };
  const activeByPage={
    'team-dashboard':'Team dashboard','training-suggestions':'Training suggestions','nominate':'Training suggestions','nomination-submitted':'Training suggestions',
    'program-catalog':'Program catalog','program-details':'Program catalog','department-employees':'Department employees','employee-record':'Employee records',
    'department-reports':'Department reports','attendance':'Attendance','employee-attendance':'Attendance','effectiveness-reviews':'Effectiveness reviews','effectiveness-review-form':'Effectiveness reviews','effectiveness-review-submitted':'Effectiveness reviews'
  };

  if(page==='nominate' && !load('nominationDraft',null)){
    save('nominationDraft',{employee:selectedEmployee().name,program:selectedProgram().name});
  }
  const render=renderers[page];
  if(!render){$('#manager-main').innerHTML='<section class="section-card">This Manager screen is not available.</section>';}
  else $('#manager-main').innerHTML=render();

  // Top navigation is shared with the completed Dashboard, Notifications and Change Password screens.
  $('#top-notifications')?.addEventListener('click',()=>go('notification.html'));
  $('#top-profile')?.addEventListener('click',()=>go('change-password.html'));

  document.addEventListener('click',e=>{
    const goBtn=e.target.closest('[data-go]');
    if(goBtn){go(goBtn.dataset.go);return;}
    const nom=e.target.closest('[data-nominate]');
    if(nom){pickEmployee(nom.dataset.nominate);pickProgram(nom.dataset.program||'Information Security Awareness');save('nominationDraft',{employee:nom.dataset.nominate,program:nom.dataset.program||'Information Security Awareness'});go('manager-nominate.html');return;}
    const record=e.target.closest('[data-record]');
    if(record){pickEmployee(record.dataset.record);go('manager-employee-record.html');return;}
    const attendance=e.target.closest('[data-attendance]');
    if(attendance){pickEmployee(attendance.dataset.attendance);go('manager-employee-attendance.html');return;}
    const openProgram=e.target.closest('[data-program-open]');
    if(openProgram){pickProgram(openProgram.dataset.programOpen);go('manager-program-details.html');return;}
    const review=e.target.closest('[data-review]');
    if(review){save('currentReview',{employee:review.dataset.review,program:review.dataset.program});go('manager-effectiveness-review-form.html');return;}
    const action=e.target.closest('[data-action]');
    if(action){
      switch(action.dataset.action){
        case 'team-reset': $('#team-period').selectedIndex=0;$('#team-program').selectedIndex=0;$('#team-rows').querySelectorAll('tr').forEach(r=>r.hidden=false);toast('Filters reset.');break;
        case 'team-apply': {const p=$('#team-program').value;$('#team-rows').querySelectorAll('tr').forEach(r=>r.hidden=p!=='All programs'&&r.dataset.program!==p);toast('Team dashboard filters applied.');break;}
        case 'suggest-reset': $('#suggest-for').selectedIndex=0;$('#suggest-type').selectedIndex=0;$('#suggestion-list').querySelectorAll('.suggestion-card').forEach(x=>x.hidden=false);toast('Filters reset.');break;
        case 'suggest-apply': {const emp=$('#suggest-for').value,typ=$('#suggest-type').value;$('#suggestion-list').querySelectorAll('.suggestion-card').forEach(x=>{const empOk=emp==='Whole department'||x.dataset.suggestEmployee===emp;const reason=x.dataset.suggestReasons.toLowerCase();const typeOk=typ==='All suggestions'||(typ==='Mandatory'&&reason.includes('mandatory'))||(typ==='Role match'&&reason.includes('audience'))||(typ==='Prerequisites'&&reason.includes('prerequisites'))||(typ==='Upcoming sessions'&&true);x.hidden=!(empOk&&typeOk);});$('#suggest-count').textContent=[...$('#suggestion-list').querySelectorAll('.suggestion-card')].filter(x=>!x.hidden).length+' suggestions';toast('Suggestion filters applied.');break;}
        case 'employee-clear': $('#employee-search').value='';$('#employee-mandatory').selectedIndex=0;filterEmployees();toast('Filters cleared.');break;
        case 'report-apply': {const p=$('#report-program').value;$('#manager-main tbody tr').forEach(r=>{if(!r.dataset.program)return;r.hidden=p!=='All department programs'&&r.dataset.program!==p;});toast('Department report filters applied.');break;}
        case 'attendance-apply': {const emp=$('#attendance-employee').value;$('#manager-main tbody tr[data-employee]').forEach(r=>r.hidden=emp!=='All enrolled Finance employees'&&r.dataset.employee!==emp);toast('Attendance filters applied.');break;}
        case 'detail-apply': toast('Attendance record filters applied.');break;
        case 'catalog-online': $('#catalog-mode').value='Online';filterCatalog();break;
        case 'team-prev': toast('You are viewing the first sample page.');break;
        case 'team-next': toast('Additional employee pages are not included in this prototype.');break;
        case 'employees-prev': toast('You are viewing the first sample page.');break;
        case 'employees-next': toast('Additional employee pages are not included in this prototype.');break;
        case 'catalog-prev': toast('You are viewing the first catalog page.');break;
        case 'catalog-next': toast('Additional catalog pages are not included in this prototype.');break;
        case 'catalog-page-1': toast('Catalog page 1 selected.');break;
        case 'catalog-page-2': toast('Only the first sample catalog page is populated.');break;
        case 'catalog-page-3': toast('Only the first sample catalog page is populated.');break;
        case 'catalog-clear': $('#catalog-search').value='';$('#catalog-category').selectedIndex=0;$('#catalog-mode').selectedIndex=0;$('#catalog-sort').selectedIndex=0;$('#active-only').checked=false;filterCatalog();toast('Catalog filters cleared.');break;
      }
    }
    if(e.target.id==='logout'){try{sessionStorage.clear();}catch(_){}go('index.html');}
    if(e.target.closest('[data-history-action]')){const b=e.target.closest('[data-history-action]');if(b.dataset.historyAction==='Attendance'){go('manager-employee-attendance.html');}else toast('Session details are read-only in this view.');}
    if(e.target.matches('[data-catalog-view]')){
      document.querySelectorAll('[data-catalog-view]').forEach(b=>b.classList.toggle('active',b===e.target));
      filterCatalog();
    }
  });

  function filterEmployees(){
    const q=($('#employee-search')?.value||'').toLowerCase();
    const m=$('#employee-mandatory')?.value||'All mandatory-training statuses';
    $('#employee-rows')?.querySelectorAll('tr').forEach(r=>{r.hidden=!(r.dataset.search.includes(q)&&(m==='All mandatory-training statuses'||r.dataset.mandatory===m));});
  }
  $('#employee-search')?.addEventListener('input',filterEmployees);
  $('#employee-mandatory')?.addEventListener('change',filterEmployees);

  function filterCatalog(){
    const q=($('#catalog-search')?.value||'').toLowerCase(),cat=$('#catalog-category')?.value||'All categories',mode=$('#catalog-mode')?.value||'All modes',activeOnly=$('#active-only')?.checked||false;
    const sort=$('#catalog-sort')?.value||'Newest',view=document.querySelector('[data-catalog-view].active')?.dataset.catalogView||'grid';
    let list=programs.filter(p=>(!q||(p.name+' '+p.category+' '+p.description).toLowerCase().includes(q))&&(cat==='All categories'||p.category===cat)&&(mode==='All modes'||p.mode===mode)&&(!activeOnly||p.active!==false));
    if(sort==='A–Z')list.sort((a,b)=>a.name.localeCompare(b.name));
    if(sort==='Duration')list.sort((a,b)=>a.duration.localeCompare(b.duration));
    const host=$('#catalog-results');if(!host)return;
    if(view==='grid'){host.className='catalog-grid';host.innerHTML=list.map(programCard).join('');}
    else {host.className='table-wrap';host.innerHTML=`<table><thead><tr><th>Program</th><th>Category</th><th>Duration</th><th>Mode</th><th>Next session</th><th>Action</th></tr></thead><tbody>${list.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${esc(p.duration)}</td><td>${esc(p.mode)}</td><td>${esc(p.next)}</td><td><button class="btn small" data-program-open="${esc(p.name)}">View details</button></td></tr>`).join('')}</tbody></table>`;}
    $('#catalog-count').textContent=`Showing ${list.length?1:0}–${list.length} of 50`;
  }
  ['catalog-search','catalog-category','catalog-mode','catalog-sort','active-only'].forEach(id=>{
    const el=$('#'+id);el?.addEventListener(id==='catalog-search'?'input':'change',filterCatalog);
  });

  $('#nomination-form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const employee=$('#nominee-employee').value,program=$('#nominee-program').value,session=$('#nominee-session').value,reason=$('#nominee-reason').value;
    const person=employees.find(x=>x.name===employee);
    if(person && person.status==='Approved'){toast('This employee already has an active enrollment.');return;}
    const nomination={employee,program,session:session.split(' · ')[0],status:'Pending',reason,source:'Nominated by manager'};
    save('lastNomination',nomination);save('nominationDraft',null);go('manager-nomination-submitted.html');
  });
  $('#review-form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const rating=$('input[name="rating"]:checked')?.value;
    if(!rating){toast('Select a rating before submitting.');return;}
    const r=load('currentReview',{employee:'Omar Farouk',program:'Financial Reporting Basics'});
    save('lastReview',{...r,rating,comment:$('#review-comment').value});
    const pending=load('pendingReviews',[{employee:'Omar Farouk',program:'Financial Reporting Basics',completed:'22 Sep 2026'},{employee:'Mona Ali',program:'Excel for Analysts',completed:'18 Sep 2026'}]).filter(x=>x.employee!==r.employee);
    save('pendingReviews',pending);go('manager-effectiveness-review-submitted.html');
  });

  $('#global-search')?.addEventListener('input',e=>{
    const q=e.target.value.toLowerCase().trim();
    const rows=document.querySelectorAll('#manager-main tbody tr');
    rows.forEach(r=>r.hidden=!!q&&!r.innerText.toLowerCase().includes(q));
    document.querySelectorAll('#manager-main .searchable').forEach(el=>el.hidden=!!q&&!el.innerText.toLowerCase().includes(q));
  });
})();
