import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import * as I from "lucide-react";
import "./styles.css";

const NT = [
 ["Matthew",28],["Mark",16],["Luke",24],["John",21],["Acts",28],["Romans",16],
 ["1 Corinthians",16],["2 Corinthians",13],["Galatians",6],["Ephesians",6],["Philippians",4],
 ["Colossians",4],["1 Thessalonians",5],["2 Thessalonians",3],["1 Timothy",6],["2 Timothy",4],
 ["Titus",3],["Philemon",1],["Hebrews",13],["James",5],["1 Peter",5],["2 Peter",3],
 ["1 John",5],["2 John",1],["3 John",1],["Jude",1],["Revelation",22]
];
const TOTAL_NT = 357;
const qFields = [
 ["keyVerse","Key verse","Which verse stands out to you?"],
 ["summary","What happens in this chapter?","Summarize the chapter in your own words."],
 ["observations","What do you notice?","Important people, events, commands, promises, repeated words, contrasts, etc."],
 ["meaning","What does it mean?","What do you think the main message of the chapter is?"],
 ["god","What does this teach me about God?","God’s character, His will, His promises, His actions, etc."],
 ["application","How should I respond?","What can you believe, change, obey, practice, or remember?"],
 ["questions","Questions I still have","Write anything you do not understand or want to study later."]
];
const emptyChapter = () => ({
 id: crypto.randomUUID(), reference:"", keyVerse:"", summary:"", observations:"",
 meaning:"", god:"", application:"", questions:"", prayer:"",
 characterName:"", characterIdentity:"", characterTraits:"", characterActions:"",
 characterLessons:"", bookmarked:false, favorite:false
});
const today = () => new Date().toISOString().slice(0,10);
const load = (k,d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const save = (k,v) => localStorage.setItem(k,JSON.stringify(v));
function formatDate(s){ if(!s)return ""; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; }

function App(){
 const [dark,setDark] = useState(()=>load("bbs_dark",false));
 const [theme,setTheme] = useState(()=>load("bbs_theme","warm"));
 const [days,setDays] = useState(()=>load("bbs_days",[]));
 const [nt,setNt] = useState(()=>load("bbs_nt",{}));
 const [page,setPage] = useState("home");
 const [selectedDate,setSelectedDate] = useState(today());
 const [menu,setMenu] = useState(false);
 const [toast,setToast] = useState("");
 const [editorTarget,setEditorTarget] = useState(null);

 useEffect(()=>save("bbs_dark",dark),[dark]);
 useEffect(()=>save("bbs_theme",theme),[theme]);
 useEffect(()=>save("bbs_days",days),[days]);
 useEffect(()=>save("bbs_nt",nt),[nt]);
 useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(""),2200);return()=>clearTimeout(t)}},[toast]);

 const currentDay = days.find(d=>d.date===selectedDate);
 const studyDays = days.length;
 const chaptersStudied = days.reduce((n,d)=>n+d.chapters.length,0);
 const ntSelected = Object.values(nt).reduce((n,a)=>n+a.length,0);
 const progress = Math.round(ntSelected/TOTAL_NT*100);
 const streak = useMemo(()=>{
   const ds = new Set(days.map(x=>x.date)); let n=0, d=new Date();
   while(ds.has(d.toISOString().slice(0,10))){n++; d.setDate(d.getDate()-1)}
   return n;
 },[days]);

 function upsertDay(day){
   setDays(prev => { const other=prev.filter(d=>d.date!==day.date); return [...other,day].sort((a,b)=>b.date.localeCompare(a.date)); });
 }
 function editChapter(id, field, value){
   const day = days.find(d=>d.date===selectedDate); if(!day)return;
   upsertDay({...day, chapters:day.chapters.map(c=>c.id===id?{...c,[field]:value}:c)});
 }
 function addChapter(){
   const day=currentDay || {date:selectedDate,chapters:[]};
   upsertDay({...day,chapters:[...day.chapters,emptyChapter()]});
 }
 function removeChapter(id){
   if(!confirm("Remove this chapter?")) return;
   const day=currentDay; if(!day)return;
   upsertDay({...day,chapters:day.chapters.filter(c=>c.id!==id)});
 }
 function toggleNT(book, ch){
   setNt(prev=>{const a=prev[book]||[];const next=a.includes(ch)?a.filter(x=>x!==ch):[...a,ch].sort((x,y)=>x-y);return {...prev,[book]:next}});
 }
 function backup(){
   const data={app:"Bitaniya Bible Study",version:3,createdAt:new Date().toISOString(),days,nt,dark,theme};
   return JSON.stringify(data,null,2);
 }
 function restore(raw){
   try{
    const x=JSON.parse(raw);
    if(x.app!=="Bitaniya Bible Study" || !Array.isArray(x.days) || typeof x.nt!=="object") throw 0;
    setDays(x.days);setNt(x.nt);setDark(!!x.dark);setTheme(x.theme||"warm");setToast("Backup restored successfully.");
   }catch{setToast("That backup is not valid.")}
 }
 const nav = p => {setPage(p);setMenu(false);window.scrollTo(0,0)};

 return <div className={`app ${dark?"dark":"light"} theme-${theme}`}>
   <header className="topbar">
    <button className="iconbtn mobile-menu" onClick={()=>setMenu(!menu)}><I.Menu/></button>
    <button className="brand" onClick={()=>nav("home")}>Bitaniya Bible Study</button>
    <div className="top-actions">
      <button className="iconbtn" title="Search Studies" onClick={()=>nav("search")}><I.Search/></button>
      <button className="iconbtn" title="More" onClick={()=>setMenu(!menu)}><I.MoreVertical/></button>
    </div>
   </header>

   {menu && <div className="menu">
    <button onClick={()=>nav("search")}><I.Search/>Search Studies</button>
    <button onClick={()=>nav("calendar")}><I.Calendar/>Study Calendar</button>
    <button onClick={()=>nav("characters")}><I.UserRound/>Character Library</button>
    <button onClick={()=>nav("bookmarks")}><I.Bookmark/>Bookmarks</button>
    <button onClick={()=>nav("favorites")}><I.Star/>Favorites</button>
    <button onClick={()=>nav("export")}><I.Share2/>Export studies</button>
    <button onClick={()=>nav("settings")}><I.Settings/>Settings</button>
   </div>}

   <main className="content">
    {page==="home" && <Home nav={nav} progress={progress} ntSelected={ntSelected} studyDays={studyDays} chapters={chaptersStudied} streak={streak} days={days} onDelete={(date)=>{if(confirm(`Delete the study for ${formatDate(date)}?`))setDays(days.filter(d=>d.date!==date))}}/>}
    {page==="study" && <DailyStudy date={selectedDate} setDate={setSelectedDate} day={currentDay} add={addChapter} remove={removeChapter} edit={editChapter} save={()=>setToast("Study saved.")} onOpenEditor={setEditorTarget}/>}
    {page==="backup" && <Backup days={days} backup={backup} restore={restore} toast={setToast}/>}
    {page==="search" && <Search days={days}/>}
    {page==="calendar" && <Calendar days={days} select={(d)=>{setSelectedDate(d);nav("study")}}/>}
    {page==="nt" && <NTTracker nt={nt} toggle={toggleNT} progress={progress} selected={ntSelected}/>}
    {page==="settings" && <Settings dark={dark} setDark={setDark} theme={theme} setTheme={setTheme}/>}
    {page==="characters" && <Characters days={days}/>}
    {page==="bookmarks" && <Filtered days={days} type="bookmarked"/>}
    {page==="favorites" && <Filtered days={days} type="favorite"/>}
    {page==="export" && <ExportText days={days}/>}
   </main>

   <nav className="bottom">
    <button className={page==="home"?"active":""} onClick={()=>nav("home")}><I.Home/><span>Home</span></button>
    <button className={page==="study"?"active":""} onClick={()=>{setSelectedDate(today());nav("study")}}><I.BookOpen/><span>Study</span></button>
    <button className={page==="calendar"?"active":""} onClick={()=>nav("calendar")}><I.Calendar/><span>Calendar</span></button>
    <button className={page==="nt"?"active":""} onClick={()=>nav("nt")}><I.BarChart3/><span>Stats</span></button>
    <button className={page==="backup"?"active":""} onClick={()=>nav("backup")}><I.HardDriveDownload/><span>Backup</span></button>
   </nav>
   {toast && <div className="toast">{toast}</div>}
   {editorTarget && <RichEditor target={editorTarget} close={()=>setEditorTarget(null)} value={days.find(d=>d.date===selectedDate)?.chapters.find(c=>c.id===editorTarget.id)?.[editorTarget.field]||""} edit={editChapter}/>}
 </div>
}

function Home({nav,progress,ntSelected,studyDays,chapters,streak,days,onDelete}){
 return <section>
  <Card className="today-card">
   <I.BookOpen className="hero-icon"/>
   <div><div className="eyebrow">TODAY'S STUDY</div><h2>Ready to study?</h2><p>Open the Bible and write what you learn.</p></div>
   <button className="primary big" onClick={()=>nav("study")}>START TODAY'S STUDY <I.Edit3/></button>
  </Card>
  <h3 className="section-title">YOUR PROGRESS</h3>
  <Card className="stats">
   <Stat icon={<I.Calendar/>} value={studyDays} label="Study days"/>
   <Stat icon={<I.BookOpen/>} value={chapters} label="Chapters"/>
   <Stat icon={<I.Flame/>} value={streak} label="Day streak"/>
  </Card>
  <button className="nt-card" onClick={()=>nav("nt")}>
   <I.BookOpenCheck/><div className="grow"><b>New Testament progress</b><div className="progress"><span style={{width:`${progress}%`}}/></div><small>{ntSelected} of 357 chapters</small></div><strong>{progress}%</strong><I.ChevronRight/>
  </button>
  <div className="section-row"><h3 className="section-title">RECENT STUDIES</h3>{studyDays>0&&<span>{studyDays}</span>}</div>
  {!days.length?<Empty icon={<I.BookOpen/>} title="No studies yet" text="Your saved studies will appear here."/>:
   days.slice(0,3).map(d=><div className="recent" key={d.date} onClick={()=>{nav("study")}}>
    <I.BookOpen/><div className="grow"><b>{formatDate(d.date)}</b><p>{d.chapters.length} chapter{d.chapters.length!==1?"s":""} studied</p><small>{d.chapters.map(c=>c.reference||"Untitled chapter").join(" • ")}</small></div>
    <button className="iconbtn danger" onClick={e=>{e.stopPropagation();onDelete(d.date)}}><I.Trash2/></button>
   </div>)}
 </section>
}
function Stat({icon,value,label}){return <div className="stat">{icon}<b>{value}</b><span>{label}</span></div>}
function Card({children,className=""}){return <div className={"card "+className}>{children}</div>}
function Empty({icon,title,text}){return <Card className="empty">{icon}<b>{title}</b><p>{text}</p></Card>}

function DailyStudy({date,setDate,day,add,remove,edit,save,onOpenEditor}){
 const [open,setOpen]=useState({});
 return <section>
  <div className="pagehead"><button className="iconbtn" onClick={()=>history.back()}><I.ArrowLeft/></button><h1>Daily Study</h1><button className="iconbtn" onClick={save}><I.Save/></button></div>
  <button className="date-card" onClick={()=>{const d=prompt("Choose date (YYYY-MM-DD)",date);if(d&&/^\\d{4}-\\d{2}-\\d{2}$/.test(d))setDate(d)}}><I.Calendar/><div><b>{formatDate(date)}</b><small>Choose study date</small></div><I.ChevronRight/></button>
  {!day?.chapters?.length?<Empty icon={<I.BookOpen/>} title="No chapters yet" text="Add a chapter when you are ready."/>:
   day.chapters.map((c,i)=><Chapter key={c.id} c={c} index={i} expanded={!!open[c.id]} toggle={()=>setOpen({...open,[c.id]:!open[c.id]})} edit={edit} remove={remove} onOpenEditor={onOpenEditor}/>)}
  <button className="outline full" onClick={add}><I.Plus/>Add chapter</button>
  <button className="primary full" onClick={save}><I.Save/>SAVE STUDY</button>
 </section>
}

function Chapter({c,index,expanded,toggle,edit,remove,onOpenEditor}){
 return <Card className="chapter">
  <div className="chapter-head" onClick={toggle}><div><b>Chapter {index+1}</b><small>{c.reference||"No Bible reference yet"}</small></div>
   <div className="chapter-tools">
    <button className="iconbtn" title={c.bookmarked?"Remove bookmark":"Bookmark"} onClick={e=>{e.stopPropagation();edit(c.id,"bookmarked",!c.bookmarked)}}>{c.bookmarked?<I.Bookmark/>:<I.BookmarkIcon/>}</button>
    <button className="iconbtn" title={c.favorite?"Remove favorite":"Favorite"} onClick={e=>{e.stopPropagation();edit(c.id,"favorite",!c.favorite)}}>{c.favorite?<I.Star/>:<I.StarIcon/>}</button>
    {expanded?<I.ChevronUp/>:<I.ChevronDown/>}
   </div>
  </div>
  {expanded&&<div className="chapter-body">
    <Field label="Bible reference" hint="Example: Matthew 5" value={c.reference} set={v=>edit(c.id,"reference",v)} icon={<I.BookOpen/>}/>
    <div className="subhead"><I.Search/>Chapter Study</div>
    {qFields.map(([field,label,hint])=><RichField key={field} label={label} hint={hint} value={c[field]} onEdit={()=>onOpenEditor({id:c.id,field})} />)}
    <hr/>
    <details><summary><I.UserRound/>Character Study <small>Study a person from this chapter</small></summary>
      <Field label="Character name" hint="Example: Peter" value={c.characterName} set={v=>edit(c.id,"characterName",v)}/>
      <Field label="Who is this person?" hint="What do we learn about their identity and role?" value={c.characterIdentity} set={v=>edit(c.id,"characterIdentity",v)} area/>
      <Field label="What character traits do I see?" hint="Faith, courage, weakness, humility, pride, obedience, etc." value={c.characterTraits} set={v=>edit(c.id,"characterTraits",v)} area/>
      <Field label="What did this person do?" hint="Important choices, words, actions, successes, failures." value={c.characterActions} set={v=>edit(c.id,"characterActions",v)} area/>
      <Field label="What can I learn from this person?" hint="What should I imitate, avoid, or learn from their story?" value={c.characterLessons} set={v=>edit(c.id,"characterLessons",v)} area/>
    </details>
    <hr/>
    <div className="subhead"><I.Heart/>Response</div>
    <RichField label="Prayer / personal response" hint="Write a short prayer or personal response to what you studied." value={c.prayer} onEdit={()=>onOpenEditor({id:c.id,field:"prayer"})}/>
    <button className="text-danger" onClick={()=>remove(c.id)}><I.Trash2/>Remove chapter</button>
  </div>}
 </Card>
}
function Field({label,hint,value,set,area=false,icon}){return <label className="field">{label}<div className="inputwrap">{icon}{area?<textarea placeholder={hint} value={value||""} onChange={e=>set(e.target.value)}/>:<input placeholder={hint} value={value||""} onChange={e=>set(e.target.value)}/>}</div></label>}
function RichField({label,hint,value,onEdit}){return <div className="field"><span>{label}</span><button className="rich-preview" onClick={onEdit}>{value?<span dangerouslySetInnerHTML={{__html:value}}/>:<em>{hint}</em>}<small>Tap to format</small></button></div>}

function RichEditor({target,close,value,edit}){
 const ref=useRef(null);
 function cmd(c,v){document.execCommand(c,false,v); ref.current?.focus(); edit(target.id,target.field,ref.current.innerHTML)}
 function color(){const c=prompt("Text color (CSS name or hex):","#5E4B8B");if(c)cmd("foreColor",c)}
 function highlight(){const c=prompt("Highlight color (CSS name or hex):","#E9E3F3");if(c)cmd("hiliteColor",c)}
 useEffect(()=>{if(ref.current){ref.current.innerHTML=value||"";ref.current.focus()}},[]);
 return <div className="editor-overlay"><div className="editor-modal">
  <div className="editor-title"><b>Edit</b><button className="iconbtn" onClick={close}><I.X/></button></div>
  <div className="toolbar">
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("bold")}><I.Bold/></button>
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("italic")}><I.Italic/></button>
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("underline")}><I.Underline/></button>
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("strikeThrough")}><I.Strikethrough/></button>
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("insertOrderedList")}><I.ListOrdered/></button>
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("insertUnorderedList")}><I.List/></button>
   <button onMouseDown={e=>e.preventDefault()} onClick={()=>cmd("insertUnorderedList")}><I.ListChecks/></button>
   <button onClick={color}><I.PenLine/></button><button onClick={highlight}><I.Highlighter/></button>
   <button onClick={()=>cmd("undo")}><I.Undo2/></button><button onClick={()=>cmd("redo")}><I.Redo2/></button>
   <button onClick={()=>cmd("removeFormat")}><I.RemoveFormatting/></button>
  </div>
  <div ref={ref} className="editor-area" contentEditable suppressContentEditableWarning onInput={e=>edit(target.id,target.field,e.currentTarget.innerHTML)}/>
  <button className="primary full" onClick={close}>DONE</button>
 </div></div>
}

function Backup({days,backup,restore,toast}){
 const [raw,setRaw]=useState("");
 const [out,setOut]=useState("");
 function create(){setOut(backup());toast("Backup created.")}
 async function copy(text){try{await navigator.clipboard.writeText(text);toast("Backup copied to clipboard.")}catch{toast("Copy is not available in this browser.")}}
 return <section>
  <div className="pagehead"><h1>Backup & Restore</h1></div>
  <Card><I.ShieldCheck className="hero-icon"/><h2>Protect your Bible studies</h2><p>You currently have <b>{days.length}</b> saved study days. Create a backup and store the text somewhere safe.</p><button className="primary full" onClick={create}><I.HardDriveDownload/>CREATE BACKUP</button>{out&&<><textarea className="backupbox" value={out} readOnly/><button className="outline full" onClick={()=>copy(out)}><I.Copy/>COPY BACKUP</button></>}</Card>
  <h3 className="section-title">Restore</h3><p>Paste a backup below, then press Restore.</p>
  <textarea className="backupbox" placeholder="Paste your backup here" value={raw} onChange={e=>setRaw(e.target.value)}/>
  <button className="primary full" onClick={()=>{if(!raw)return toast("Paste your backup first.");if(confirm("Restoring will replace the current study data with the backup data."))restore(raw)}}><I.RotateCcw/>RESTORE BACKUP</button>
 </section>
}
function ExportText({days}){const [copied,setCopied]=useState(false);const text=exportStudies(days);return <section><div className="pagehead"><h1>Export your studies</h1></div><textarea className="backupbox export" value={text} readOnly/><button className="primary full" onClick={async()=>{await navigator.clipboard?.writeText(text);setCopied(true)}}><I.Copy/> {copied?"Study export copied to clipboard.":"Copy"}</button></section>}
function exportStudies(days){return days.map(d=>`DATE: ${formatDate(d.date)}\n${d.chapters.map(c=>`BIBLE REFERENCE: ${c.reference}\nKEY VERSE: ${strip(c.keyVerse)}\nSUMMARY: ${strip(c.summary)}\nOBSERVATIONS: ${strip(c.observations)}\nMEANING: ${strip(c.meaning)}\nLESSONS / GOD: ${strip(c.god)}\nAPPLICATION: ${strip(c.application)}\nQUESTIONS: ${strip(c.questions)}\nPRAYER: ${strip(c.prayer)}\nCHARACTER: ${c.characterName}\nCHARACTER LESSONS: ${strip(c.characterLessons)}\n`).join("\n")}`).join("\n--------------------\n");}
function strip(x){return (x||"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim()}

function Search({days}){const [q,setQ]=useState("");const results=days.flatMap(d=>d.chapters.map(c=>({d,c}))).filter(({d,c})=>!q||JSON.stringify({d,c}).toLowerCase().includes(q.toLowerCase()));return <section><div className="pagehead"><h1>Search your studies</h1></div><div className="searchbox"><I.Search/><input autoFocus placeholder="Search notes, verses, people, questions…" value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button onClick={()=>setQ("")}>×</button>}</div>{!q?<Empty icon={<I.Search/>} title="Search across all your saved studies." text="Search Bible references, notes, verses, people, questions, and more."/>:results.length?results.map(x=><Card key={x.c.id}><b>{x.c.reference||"Untitled chapter"}</b><small>{formatDate(x.d.date)}</small><p>{strip(x.c.summary||x.c.keyVerse||x.c.prayer).slice(0,220)}</p></Card>):<Empty icon={<I.SearchX/>} title="No matching studies found." text="Try another word or phrase."/>}</section>}

function Calendar({days,select}){const [cursor,setCursor]=useState(new Date());const [sel,setSel]=useState(null);const y=cursor.getFullYear(),m=cursor.getMonth();const first=(new Date(y,m,1).getDay()+6)%7;const count=new Date(y,m+1,0).getDate();const studied=new Set(days.map(d=>d.date));const dates=Array.from({length:first+count},(_,i)=>i<first?null:i-first+1);return <section><div className="pagehead"><h1>Study calendar</h1></div><Card><div className="cal-head"><button className="iconbtn" onClick={()=>setCursor(new Date(y,m-1,1))}><I.ChevronLeft/></button><b>{cursor.toLocaleString("en",{month:"long"})} {y}</b><button className="iconbtn" onClick={()=>setCursor(new Date(y,m+1,1))}><I.ChevronRight/></button></div><div className="week">{["M","T","W","T","F","S","S"].map(x=><b key={x}>{x}</b>)}</div><div className="calendar-grid">{dates.map((d,i)=>{if(!d)return <span key={i}/>;const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;return <button key={key} className={studied.has(key)?"studied":""} onClick={()=>{setSel(key);}}>{d}</button>})}</div></Card>{sel?<Card><b>{formatDate(sel)}</b><h3>{days.find(d=>d.date===sel)?.chapters.length||0} chapters studied</h3>{days.find(d=>d.date===sel)?.chapters.map(c=><button className="list-row" key={c.id} onClick={()=>select(sel)}><I.BookOpen/>{c.reference||"Untitled chapter"}<I.ChevronRight/></button>)||<p>No study saved for this day.</p>}</Card>:<Empty icon={<I.MousePointerClick/>} title="Choose a day" text="Tap a date to see what you studied."/>}</section>}

function NTTracker({nt,toggle,progress,selected}){const [open,setOpen]=useState({});return <section><div className="pagehead"><h1>New Testament Tracker</h1><button className="iconbtn" title="Choose date"><I.Calendar/></button></div><Card className="reading"><I.BookOpenCheck/><div className="grow"><b>Reading progress</b><div className="progress"><span style={{width:`${progress}%`}}/></div><small>{selected} of 357 chapters selected</small></div><strong>{progress}%</strong></Card>{NT.map(([book,n])=><Card className="nt-book" key={book}><button className="nt-title" onClick={()=>setOpen({...open,[book]:!open[book]})}><span className="circle">{(nt[book]||[]).length}</span><b>{book}</b><small>{(nt[book]||[]).length} / {n} chapters</small>{open[book]?<I.ChevronUp/>:<I.ChevronDown/>}</button>{open[book]&&<div className="chapter-grid">{Array.from({length:n},(_,i)=>i+1).map(c=><button key={c} className={(nt[book]||[]).includes(c)?"chosen":""} onClick={()=>toggle(book,c)}>{c}</button>)}</div>}</Card>)}</section>}

const THEME_OPTIONS=[
 ["warm","Warm Bible","Beige • Brown • Cream","🤎"],
 ["sage","Sage","Sage Green • Cream","🌿"],
 ["navy","Navy & Gold","Navy • Cream • Gold","💙"],
 ["midnight","Midnight Gold","Black • Cream • Gold","🖤"],
 ["blue","Peaceful Blue","Soft Blue • White","🩵"],
 ["terracotta","Terracotta","Terracotta • Cream","🧡"],
 ["plum","Classic Plum","Purple • Plum • Cream","🟣"]
];
function Settings({dark,setDark,theme,setTheme}){return <section><div className="pagehead"><h1>Settings</h1></div><Card className="setting"><div className="setting-icon">{dark?<I.Moon/>:<I.SunMedium/>}</div><div className="grow"><b>Appearance</b><small>{dark?"Dark mode is enabled":"Light mode is enabled"}</small></div><button className={`mode-toggle ${dark?"is-dark":""}`} onClick={()=>setDark(v=>!v)} aria-label="Toggle light and dark mode"><span>{dark?<I.Moon/>:<I.SunMedium/>}</span><span>{dark?"Dark":"Light"}</span></button></Card><div className="theme-heading"><h2>Theme</h2><p>Choose the colors for your Bible Study. Theme and mode work independently.</p></div><div className="theme-grid">{THEME_OPTIONS.map(([id,name,desc,emoji])=><button key={id} className={`theme-option ${theme===id?"selected":""}`} onClick={()=>setTheme(id)}><span className={`theme-swatch theme-swatch-${id}`}><span>{emoji}</span></span><span className="theme-copy"><b>{name}</b><small>{desc}</small></span><span className="theme-check">{theme===id?<I.CheckCircle2/>:<I.Circle/>}</span></button>)}</div></section>}

function Characters({days}){const chars=days.flatMap(d=>d.chapters.map(c=>({d,c}))).filter(x=>x.c.characterName);return <section><div className="pagehead"><h1>Character Library</h1></div>{chars.length?chars.map(x=><Card key={x.c.id}><div className="list-row"><I.UserRound/><div className="grow"><b>{x.c.characterName}</b><small>{x.c.reference||"Chapter"} • {formatDate(x.d.date)}</small><p>{strip(x.c.characterLessons||x.c.characterIdentity).slice(0,180)}</p></div></div></Card>):<Empty icon={<I.UserRound/>} title="No characters yet" text="Characters recorded in saved studies will appear here."/>}</section>}
function Filtered({days,type}){const all=days.flatMap(d=>d.chapters.map(c=>({d,c}))).filter(x=>type==="bookmarked"?x.c.bookmarked:x.c.favorite);return <section><div className="pagehead"><h1>{type==="bookmarked"?"Bookmarks":"Favorites"}</h1></div>{all.length?all.map(x=><Card key={x.c.id}><b>{x.c.reference||"Untitled chapter"}</b><small>{formatDate(x.d.date)}</small><p>{strip(x.c.summary||x.c.keyVerse).slice(0,180)}</p></Card>):<Empty icon={type==="bookmarked"?<I.Bookmark/>:<I.Star/>} title={type==="bookmarked"?"No bookmarks yet":"No favorites yet"} text="Saved chapters will appear here."/>}</section>}

createRoot(document.getElementById("root")).render(<App/>);
