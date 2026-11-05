const $=s=>document.querySelector(s);
const monthNames=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const today=new Date(); today.setHours(0,0,0,0);
let cursor=new Date(today.getFullYear(),today.getMonth(),1), selected=new Date(today);
let editingId=null, taskFilter='open';
const defaultCats=[
{id:'uni',name:'Universität',color:'#8eb4e8'},
{id:'learn',name:'Lernen',color:'#9bc9a8'},
{id:'private',name:'Privat',color:'#f1d27e'},
{id:'important',name:'Wichtig',color:'#e98e88'},
{id:'sport',name:'Sport',color:'#b6a0df'},
{id:'deadline',name:'Fristen',color:'#efad70'}
];
let categories=JSON.parse(localStorage.getItem('plannerCats')||'null')||defaultCats;
let entries=JSON.parse(localStorage.getItem('plannerEntries')||'[]');
function save(){localStorage.setItem('plannerCats',JSON.stringify(categories));localStorage.setItem('plannerEntries',JSON.stringify(entries));}
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){let [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function same(a,b){return dateKey(a)===dateKey(b)}
function cat(id){return categories.find(c=>c.id===id)||categories[0]}
function fmt(d,opt={day:'numeric',month:'long',year:'numeric'}){return d.toLocaleDateString('de-DE',opt)}
function render(){
 $('#monthLabel').textContent=`${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`;
 const first=new Date(cursor.getFullYear(),cursor.getMonth(),1), start=(first.getDay()+6)%7;
 const grid=$('#monthGrid');grid.innerHTML='';
 for(let i=0;i<42;i++){
  let d=new Date(first);d.setDate(1-start+i);
  const cell=document.createElement('button');cell.className='day'+(d.getMonth()!==cursor.getMonth()?' outside':'')+(same(d,today)?' today':'')+(same(d,selected)?' selected':'');
  cell.innerHTML=`<div class="day-num">${d.getDate()}</div><div class="dots"></div>`;
  const dots=cell.querySelector('.dots');
  const dayItems=entries.filter(e=>e.date===dateKey(d)).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  dayItems.slice(0,2).forEach(e=>{const chip=document.createElement('span');chip.className='event-chip';chip.style.background=cat(e.category).color+'66';chip.textContent=e.title;dots.append(chip)});
  if(dayItems.length>2){const more=document.createElement('div');more.className='more';more.textContent=`+${dayItems.length-2} weitere`;dots.append(more)}
  cell.addEventListener('click',()=>{selected=d;if(d.getMonth()!==cursor.getMonth())cursor=new Date(d.getFullYear(),d.getMonth(),1);render()});
  grid.append(cell);
 }
 $('#selectedDateLabel').textContent=fmt(selected,{weekday:'long',day:'numeric',month:'long'});
 renderDay();renderLegend();renderTasks();renderCategories();
}
function renderDay(){
 const list=$('#dayEntries');list.innerHTML='';
 const items=entries.filter(e=>e.date===dateKey(selected)).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
 if(!items.length){list.innerHTML='<div class="empty">Noch nichts geplant. Zeit, den Tag zu füllen?</div>';return}
 items.forEach(e=>list.append(entryNode(e)));
}
function entryNode(e){
 const c=cat(e.category),el=document.createElement('div');el.className='entry';
 const time=e.type==='event'?(e.start?e.start+(e.end?' – '+e.end:''):'Ganztägig'):'Aufgabe / Frist';
 el.innerHTML=`<div class="entry-bar" style="background:${c.color}"></div><div class="entry-main"><div class="entry-title"></div><div class="entry-meta">${time} · ${c.name}${e.note?' · '+e.note:''}</div></div><div class="entry-actions"><button class="small-btn edit">Bearbeiten</button></div>`;
 el.querySelector('.entry-title').textContent=e.title;
 el.querySelector('.edit').addEventListener('click',()=>openEntry(e));
 return el;
}
function renderLegend(){const l=$('#legend');l.innerHTML='';categories.forEach(c=>{const s=document.createElement('span');s.innerHTML=`<i class="swatch" style="background:${c.color}"></i>${c.name}`;l.append(s)})}
function renderTasks(){
 const list=$('#taskList');list.innerHTML='';
 let tasks=entries.filter(e=>e.type==='task');
 if(taskFilter==='open')tasks=tasks.filter(e=>!e.done);if(taskFilter==='done')tasks=tasks.filter(e=>e.done);
 tasks.sort((a,b)=>a.date.localeCompare(b.date));
 if(!tasks.length){list.innerHTML='<div class="empty">Hier ist gerade nichts zu sehen.</div>';return}
 tasks.forEach(e=>{
  const node=entryNode(e),cbox=document.createElement('button');cbox.className='small-btn';cbox.textContent=e.done?'↶':'✓';cbox.title='Status ändern';
  cbox.addEventListener('click',()=>{e.done=!e.done;save();render()});
  node.querySelector('.entry-actions').prepend(cbox);
  node.querySelector('.entry-meta').textContent=`${fmt(parseDate(e.date),{day:'numeric',month:'short',year:'numeric'})} · ${cat(e.category).name}${e.done?' · Erledigt':''}`;
  list.append(node);
 });
}
function renderCategories(){const list=$('#categoryList');list.innerHTML='';categories.forEach(c=>{const row=document.createElement('div');row.className='category-row';row.innerHTML=`<i class="category-dot" style="background:${c.color}"></i><strong></strong><span style="margin-left:auto;color:#89908a;font-size:11px"> ${c.color}</span>`;row.querySelector('strong').textContent=c.name;list.append(row)})}
function fillCats(){const s=$('#entryCategory');s.innerHTML='';categories.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.name;s.append(o)})}
function openEntry(e=null,type='event'){
 editingId=e?.id||null;fillCats();$('#dialogTitle').textContent=e?'Eintrag bearbeiten':'Neuer Eintrag';
 $('#entryTitle').value=e?.title||'';$('#entryDate').value=e?.date||dateKey(selected);$('#entryType').value=e?.type||type;
 $('#entryStart').value=e?.start||'';$('#entryEnd').value=e?.end||'';$('#entryCategory').value=e?.category||categories[0].id;$('#entryNote').value=e?.note||'';
 $('#deleteEntry').classList.toggle('hidden',!e);$('#timeRow').classList.toggle('hidden',$('#entryType').value==='task');
 $('#entryType').onchange=()=>$('#timeRow').classList.toggle('hidden',$('#entryType').value==='task');
 $('#entryDialog').showModal();
}
$('#entryForm').addEventListener('submit',ev=>{
 if(ev.submitter?.value!=='save')return;
 ev.preventDefault();
 const e={id:editingId||crypto.randomUUID(),title:$('#entryTitle').value.trim(),date:$('#entryDate').value,type:$('#entryType').value,start:$('#entryStart').value,end:$('#entryEnd').value,category:$('#entryCategory').value,note:$('#entryNote').value.trim(),done:editingId?(entries.find(x=>x.id===editingId)?.done||false):false};
 if(!e.title||!e.date)return;
 if(editingId)entries=entries.map(x=>x.id===editingId?e:x);else entries.push(e);
 selected=parseDate(e.date);cursor=new Date(selected.getFullYear(),selected.getMonth(),1);save();$('#entryDialog').close();render();
});
$('#deleteEntry').addEventListener('click',()=>{entries=entries.filter(e=>e.id!==editingId);save();$('#entryDialog').close();render()});
$('#categoryForm').addEventListener('submit',ev=>{if(ev.submitter?.value!=='save')return;ev.preventDefault();const name=$('#categoryName').value.trim();if(!name)return;categories.push({id:crypto.randomUUID(),name,color:$('#categoryColor').value});save();$('#categoryDialog').close();render()});
$('#prevMonth').onclick=()=>{cursor.setMonth(cursor.getMonth()-1);selected=new Date(cursor.getFullYear(),cursor.getMonth(),Math.min(selected.getDate(),new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate()));render()};
$('#nextMonth').onclick=()=>{cursor.setMonth(cursor.getMonth()+1);selected=new Date(cursor.getFullYear(),cursor.getMonth(),Math.min(selected.getDate(),new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate()));render()};
$('#todayBtn').onclick=()=>{selected=new Date(today);cursor=new Date(today.getFullYear(),today.getMonth(),1);render()};
$('#fab').onclick=()=>openEntry(null,'event');$('#addFromDay').onclick=()=>openEntry(null,'event');$('#addTask').onclick=()=>openEntry(null,'task');
$('#addCategory').onclick=()=>{$('#categoryName').value='';$('#categoryDialog').showModal()};
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$('#'+b.dataset.view).classList.add('active');$('#fab').style.display=b.dataset.view==='categoriesView'?'none':'block'});
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{taskFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderTasks()});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
