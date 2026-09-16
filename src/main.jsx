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
 id: crypto.randomUUID(),
 reference:"",
 keyVerse:"",
 summary:"",
 observations:"",
 meaning:"",
 god:"",
 application:"",
 questions:"",
 prayer:"",
 characterName:"",
 characterIdentity:"",
 characterTraits:"",
 characterActions:"",
 characterLessons:"",
 bookmarked:false,
 favorite:false
});

const today = () => new Date().toISOString().slice(0,10);

const load = (k,d) => {
 try {
   return JSON.parse(localStorage.getItem(k)) ?? d;
 } catch {
   return d;
 }
};

const save = (k,v) => {
 try {
   localStorage.setItem(k,JSON.stringify(v));
 } catch {}
};

function formatDate(s){
 if(!s)return "";
 const [y,m,d]=s.split("-");
 return `${d}/${m}/${y}`;
}

function App(){

 const [dark,setDark] = useState(()=>{
   try {
     return localStorage.getItem("bbs_dark") === "true";
   } catch {
     return false;
   }
 });

 const [theme,setTheme] = useState(()=>load("bbs_theme","warm"));
 const [days,setDays] = useState(()=>load("bbs_days",[]));
 const [nt,setNt] = useState(()=>load("bbs_nt",{}));
 const [page,setPage] = useState("home");
 const [selectedDate,setSelectedDate] = useState(today());
 const [menu,setMenu] = useState(false);
 const [toast,setToast] = useState("");
 const [editorTarget,setEditorTarget] = useState(null);

 useEffect(()=>{
   try {
     localStorage.setItem("bbs_dark",String(dark));
   } catch {}
 },[dark]);

 useEffect(()=>save("bbs_theme",theme),[theme]);
 useEffect(()=>save("bbs_days",days),[days]);
 useEffect(()=>save("bbs_nt",nt),[nt]);

 useEffect(()=>{
   if(toast){
     const t=setTimeout(()=>setToast(""),2200);
     return()=>clearTimeout(t);
   }
 },[toast]);

 const currentDay = days.find(d=>d.date===selectedDate);
 const studyDays = days.length;

 const chaptersStudied = days.reduce(
   (n,d)=>n+d.chapters.length,
   0
 );

 const ntSelected = Object.values(nt).reduce(
   (n,a)=>n+a.length,
   0
 );

 const progress = Math.round(
   ntSelected/TOTAL_NT*100
 );

 const streak = useMemo(()=>{
   const ds = new Set(days.map(x=>x.date));
   let n=0;
   let d=new Date();

   while(ds.has(d.toISOString().slice(0,10))){
     n++;
     d.setDate(d.getDate()-1);
   }

   return n;
 },[days]);

 function upsertDay(day){
   setDays(prev=>{
     const other=prev.filter(d=>d.date!==day.date);

     return [
       ...other,
       day
     ].sort(
       (a,b)=>b.date.localeCompare(a.date)
     );
   });
 }

 function editChapter(id,field,value){
   const day = days.find(
     d=>d.date===selectedDate
   );

   if(!day)return;

   upsertDay({
     ...day,
     chapters:day.chapters.map(
       c=>c.id===id
         ? {...c,[field]:value}
         : c
     )
   });
 }

 function addChapter(){
   const day=currentDay || {
     date:selectedDate,
     chapters:[]
   };

   upsertDay({
     ...day,
     chapters:[
       ...day.chapters,
       emptyChapter()
     ]
   });
 }

 function removeChapter(id){
   if(!confirm("Remove this chapter?")) return;

   const day=currentDay;

   if(!day)return;

   upsertDay({
     ...day,
     chapters:day.chapters.filter(
       c=>c.id!==id
     )
   });
 }

 function toggleNT(book,ch){
   setNt(prev=>{
     const a=prev[book]||[];

     const next=a.includes(ch)
       ? a.filter(x=>x!==ch)
       : [...a,ch].sort((x,y)=>x-y);

     return {
       ...prev,
       [book]:next
     };
   });
 }

 function backup(){
   const data={
     app:"Bitaniya Bible Study",
     version:3,
     createdAt:new Date().toISOString(),
     days,
     nt,
     dark,
     theme
   };

   return JSON.stringify(
     data,
     null,
     2
   );
 }

 function restore(raw){
   try{
     const x=JSON.parse(raw);

     if(
       x.app!=="Bitaniya Bible Study" ||
       !Array.isArray(x.days) ||
       typeof x.nt!=="object"
     ){
       throw 0;
     }

     setDays(x.days);
     setNt(x.nt);
     setDark(!!x.dark);
     setTheme(x.theme||"warm");

     setToast(
       "Backup restored successfully."
     );

   }catch{
     setToast(
       "That backup is not valid."
     );
   }
 }

 const nav = p => {
   setPage(p);
   setMenu(false);
   window.scrollTo(0,0);
 };

 return (
   <div
     className={`app ${dark ? "dark" : "light"} theme-${theme}`}
     data-theme-mode={dark ? "dark" : "light"}
   >

     <header className="topbar">

       <button
         className="iconbtn mobile-menu"
         onClick={()=>setMenu(!menu)}
       >
         <I.Menu/>
       </button>

       <button
         className="brand"
         onClick={()=>nav("home")}
       >
         Bitaniya Bible Study
       </button>

       <div className="top-actions">

         <button
           className="iconbtn"
           title="Search Studies"
           onClick={()=>nav("search")}
         >
           <I.Search/>
         </button>

         <button
           className="iconbtn"
           title="More"
           onClick={()=>setMenu(!menu)}
         >
           <I.MoreVertical/>
         </button>

       </div>

     </header>

     {menu && (
       <div className="menu">

         <button onClick={()=>nav("search")}>
           <I.Search/>
           Search Studies
         </button>

         <button onClick={()=>nav("calendar")}>
           <I.Calendar/>
           Study Calendar
         </button>

         <button onClick={()=>nav("characters")}>
           <I.UserRound/>
           Character Library
         </button>

         <button onClick={()=>nav("bookmarks")}>
           <I.Bookmark/>
           Bookmarks
         </button>

         <button onClick={()=>nav("favorites")}>
           <I.Star/>
           Favorites
         </button>

         <button onClick={()=>nav("export")}>
           <I.Share2/>
           Export studies
         </button>

         <button onClick={()=>nav("settings")}>
           <I.Settings/>
           Settings
         </button>

       </div>
     )}

     <main className="content">

       {page==="home" && (
         <Home
           nav={nav}
           progress={progress}
           ntSelected={ntSelected}
           studyDays={studyDays}
           chapters={chaptersStudied}
           streak={streak}
           days={days}
           onDelete={(date)=>{
             if(
               confirm(
                 `Delete the study for ${formatDate(date)}?`
               )
             ){
               setDays(
                 days.filter(
                   d=>d.date!==date
                 )
               );
             }
           }}
         />
       )}

       {page==="study" && (
         <DailyStudy
           date={selectedDate}
           setDate={setSelectedDate}
           day={currentDay}
           add={addChapter}
           remove={removeChapter}
           edit={editChapter}
           save={()=>setToast("Study saved.")}
           onOpenEditor={setEditorTarget}
         />
       )}

       {page==="backup" && (
         <Backup
           days={days}
           backup={backup}
           restore={restore}
           toast={setToast}
         />
       )}

       {page==="search" && (
         <Search days={days}/>
       )}

       {page==="calendar" && (
         <Calendar
           days={days}
           select={(d)=>{
             setSelectedDate(d);
             nav("study");
           }}
         />
       )}

       {page==="nt" && (
         <NTTracker
           nt={nt}
           toggle={toggleNT}
           progress={progress}
           selected={ntSelected}
         />
       )}

       {page==="settings" && (
         <Settings
           dark={dark}
           setDark={setDark}
           theme={theme}
           setTheme={setTheme}
         />
       )}

       {page==="characters" && (
         <Characters days={days}/>
       )}

       {page==="bookmarks" && (
         <Filtered
           days={days}
           type="bookmarked"
         />
       )}

       {page==="favorites" && (
         <Filtered
           days={days}
           type="favorite"
         />
       )}

       {page==="export" && (
         <ExportText days={days}/>
       )}

     </main>

     <nav className="bottom">

       <button
         className={page==="home"?"active":""}
         onClick={()=>nav("home")}
       >
         <I.Home/>
         <span>Home</span>
       </button>

       <button
         className={page==="study"?"active":""}
         onClick={()=>{
           setSelectedDate(today());
           nav("study");
         }}
       >
         <I.BookOpen/>
         <span>Study</span>
       </button>

       <button
         className={page==="calendar"?"active":""}
         onClick={()=>nav("calendar")}
       >
         <I.Calendar/>
         <span>Calendar</span>
       </button>

       <button
         className={page==="nt"?"active":""}
         onClick={()=>nav("nt")}
       >
         <I.BarChart3/>
         <span>Stats</span>
       </button>

       <button
         className={page==="backup"?"active":""}
         onClick={()=>nav("backup")}
       >
         <I.HardDriveDownload/>
         <span>Backup</span>
       </button>

     </nav>

     {toast && (
       <div className="toast">
         {toast}
       </div>
     )}

     {editorTarget && (
       <RichEditor
         target={editorTarget}
         close={()=>setEditorTarget(null)}
         value={
           days
             .find(
               d=>d.date===selectedDate
             )
             ?.chapters
             .find(
               c=>c.id===editorTarget.id
             )
             ?.[editorTarget.field] || ""
         }
         edit={editChapter}
       />
     )}

   </div>
 );
}

function Home({
 nav,
 progress,
 ntSelected,
 studyDays,
 chapters,
 streak,
 days,
 onDelete
}){

 return (
   <section>

     <Card className="today-card">

       <I.BookOpen className="hero-icon"/>

       <div>
         <div className="eyebrow">
           TODAY'S STUDY
         </div>

         <h2>
           Ready to study?
         </h2>

         <p>
           Open the Bible and write what you learn.
         </p>
       </div>

       <button
         className="primary big"
         onClick={()=>nav("study")}
       >
         START TODAY'S STUDY
         <I.Edit3/>
       </button>

     </Card>

     <h3 className="section-title">
       YOUR PROGRESS
     </h3>

     <Card className="stats">

       <Stat
         icon={<I.Calendar/>}
         value={studyDays}
         label="Study days"
       />

       <Stat
         icon={<I.BookOpen/>}
         value={chapters}
         label="Chapters"
       />

       <Stat
         icon={<I.Flame/>}
         value={streak}
         label="Day streak"
       />

     </Card>

     <button
       className="nt-card"
       onClick={()=>nav("nt")}
     >

       <I.BookOpenCheck/>

       <div className="grow">

         <b>
           New Testament progress
         </b>

         <div className="progress">
           <span
             style={{
               width:`${progress}%`
             }}
           />
         </div>

         <small>
           {ntSelected} of 357 chapters
         </small>

       </div>

       <strong>
         {progress}%
       </strong>

       <I.ChevronRight/>

     </button>

     <div className="section-row">

       <h3 className="section-title">
         RECENT STUDIES
       </h3>

       {studyDays>0 && (
         <span>
           {studyDays}
         </span>
       )}

     </div>

     {!days.length ? (

       <Empty
         icon={<I.BookOpen/>}
         title="No studies yet"
         text="Your saved studies will appear here."
       />

     ) : (

       days.slice(0,3).map(d=>(

         <div
           className="recent"
           key={d.date}
           onClick={()=>{
             nav("study");
           }}
         >

           <I.BookOpen/>

           <div className="grow">

             <b>
               {formatDate(d.date)}
             </b>

             <p>
               {d.chapters.length} chapter
               {d.chapters.length!==1?"s":""}
               {" "}studied
             </p>

             <small>
               {d.chapters
                 .map(
                   c=>c.reference ||
                   "Untitled chapter"
                 )
                 .join(" • ")}
             </small>

           </div>

           <button
             className="iconbtn danger"
             onClick={e=>{
               e.stopPropagation();
               onDelete(d.date);
             }}
           >
             <I.Trash2/>
           </button>

         </div>

       ))

     )}

   </section>
 );
}

function Stat({icon,value,label}){
 return (
   <div className="stat">
     {icon}
     <b>{value}</b>
     <span>{label}</span>
   </div>
 );
}

function Card({children,className=""}){
 return (
   <div className={"card "+className}>
     {children}
   </div>
 );
}

function Empty({icon,title,text}){
 return (
   <Card className="empty">
     {icon}
     <b>{title}</b>
     <p>{text}</p>
   </Card>
 );
}

function DailyStudy({
 date,
 setDate,
 day,
 add,
 remove,
 edit,
 save,
 onOpenEditor
}){

 const chapters=day?.chapters||[];

 return (
   <section>

     <div className="pagehead">

       <div>
         <h1>
           Today's Study
         </h1>

         <small>
           {formatDate(date)}
         </small>
       </div>

       <input
         className="date-input"
         type="date"
         value={date}
         onChange={e=>setDate(e.target.value)}
       />

     </div>

     {!chapters.length && (
       <Empty
         icon={<I.BookOpen/>}
         title="Ready to study?"
         text="Add a chapter to begin your Bible study."
       />
     )}

     {chapters.map((c,index)=>(
       <ChapterCard
         key={c.id}
         chapter={c}
         index={index}
         edit={edit}
         remove={remove}
         onOpenEditor={onOpenEditor}
       />
     ))}

     <button
       className="outline full"
       onClick={add}
     >
       <I.Plus/>
       ADD ANOTHER CHAPTER
     </button>

     {chapters.length>0 && (
       <button
         className="primary full"
         onClick={save}
       >
         <I.Check/>
         SAVE STUDY
       </button>
     )}

   </section>
 );
}

function ChapterCard({
 chapter,
 index,
 edit,
 remove,
 onOpenEditor
}){

 return (
   <Card className="chapter-card">

     <div className="chapter-head">

       <div>
         <span className="chapter-number">
           Chapter {index+1}
         </span>

         <input
           className="reference-input"
           placeholder="Bible reference, e.g. John 1"
           value={chapter.reference}
           onChange={e=>
             edit(
               chapter.id,
               "reference",
               e.target.value
             )
           }
         />
       </div>

       <div className="chapter-actions">

         <button
           className={
             `iconbtn ${
               chapter.bookmarked
                 ?"selected-action"
                 :""
             }`
           }
           title="Bookmark"
           onClick={()=>
             edit(
               chapter.id,
               "bookmarked",
               !chapter.bookmarked
             )
           }
         >
           <I.Bookmark/>
         </button>

         <button
           className={
             `iconbtn ${
               chapter.favorite
                 ?"selected-action"
                 :""
             }`
           }
           title="Favorite"
           onClick={()=>
             edit(
               chapter.id,
               "favorite",
               !chapter.favorite
             )
           }
         >
           <I.Star/>
         </button>

         <button
           className="iconbtn danger"
           title="Remove chapter"
           onClick={()=>
             remove(chapter.id)
           }
         >
           <I.Trash2/>
         </button>

       </div>

     </div>

     {qFields.map(
       ([field,label,hint])=>(
         <div
           className="question"
           key={field}
         >

           <label>
             {label}
           </label>

           <button
             className="answer-preview"
             onClick={()=>
               onOpenEditor({
                 id:chapter.id,
                 field
               })
             }
           >

             {chapter[field]
               ? (
                 <span
                   dangerouslySetInnerHTML={{
                     __html:chapter[field]
                   }}
                 />
               )
               : (
                 <span className="placeholder">
                   {hint}
                 </span>
               )
             }

             <I.ChevronRight/>

           </button>

         </div>
       )
     )}

     <div className="character-section">

       <div className="subheading">
         <I.UserRound/>
         Character Study
       </div>

       <input
         placeholder="Character name"
         value={chapter.characterName}
         onChange={e=>
           edit(
             chapter.id,
             "characterName",
             e.target.value
           )
         }
       />

       <textarea
         placeholder="Who is this person?"
         value={chapter.characterIdentity}
         onChange={e=>
           edit(
             chapter.id,
             "characterIdentity",
             e.target.value
           )
         }
       />

       <textarea
         placeholder="Character traits"
         value={chapter.characterTraits}
         onChange={e=>
           edit(
             chapter.id,
             "characterTraits",
             e.target.value
           )
         }
       />

       <textarea
         placeholder="What did this person do?"
         value={chapter.characterActions}
         onChange={e=>
           edit(
             chapter.id,
             "characterActions",
             e.target.value
           )
         }
       />

       <textarea
         placeholder="What can I learn from this character?"
         value={chapter.characterLessons}
         onChange={e=>
           edit(
             chapter.id,
             "characterLessons",
             e.target.value
           )
         }
       />

     </div>

     <div className="prayer-section">

       <div className="subheading">
         <I.HeartHandshake/>
         Prayer
       </div>

       <textarea
         placeholder="Write your prayer..."
         value={chapter.prayer}
         onChange={e=>
           edit(
             chapter.id,
             "prayer",
             e.target.value
           )
         }
       />

     </div>

   </Card>
 );
}

function RichEditor({
 target,
 close,
 value,
 edit
}){

 const ref=useRef(null);

 useEffect(()=>{
   if(ref.current){
     ref.current.innerHTML=value||"";
   }
 },[target.id,target.field]);

 function cmd(command){
   document.execCommand(
     command,
     false,
     null
   );

   ref.current?.focus();

   if(ref.current){
     edit(
       target.id,
       target.field,
       ref.current.innerHTML
     );
   }
 }

 function color(){
   const c=prompt(
     "Enter a text color, e.g. #5E4B8B"
   );

   if(!c)return;

   document.execCommand(
     "foreColor",
     false,
     c
   );

   ref.current?.focus();

   if(ref.current){
     edit(
       target.id,
       target.field,
       ref.current.innerHTML
     );
   }
 }

 function highlight(){
   const c=prompt(
     "Enter a highlight color, e.g. #FFF2A8"
   );

   if(!c)return;

   document.execCommand(
     "hiliteColor",
     false,
     c
   );

   ref.current?.focus();

   if(ref.current){
     edit(
       target.id,
       target.field,
       ref.current.innerHTML
     );
   }
 }

 return (
   <div className="editor-overlay">

     <div className="editor-modal">

       <div className="editor-head">

         <b>
           Write your answer
         </b>

         <button
           className="iconbtn"
           onClick={close}
         >
           <I.X/>
         </button>

       </div>

       <div className="toolbar">

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("bold")}
         >
           <I.Bold/>
         </button>

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("italic")}
         >
           <I.Italic/>
         </button>

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("underline")}
         >
           <I.Underline/>
         </button>

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("strikeThrough")}
         >
           <I.Strikethrough/>
         </button>

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("insertOrderedList")}
         >
           <I.ListOrdered/>
         </button>

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("insertUnorderedList")}
         >
           <I.List/>
         </button>

         <button
           onMouseDown={e=>e.preventDefault()}
           onClick={()=>cmd("insertUnorderedList")}
         >
           <I.ListChecks/>
         </button>

         <button onClick={color}>
           <I.PenLine/>
         </button>

         <button onClick={highlight}>
           <I.Highlighter/>
         </button>

         <button onClick={()=>cmd("undo")}>
           <I.Undo2/>
         </button>

         <button onClick={()=>cmd("redo")}>
           <I.Redo2/>
         </button>

         <button onClick={()=>cmd("removeFormat")}>
           <I.RemoveFormatting/>
         </button>

       </div>

       <div
         ref={ref}
         className="editor-area"
         contentEditable
         suppressContentEditableWarning
         onInput={e=>
           edit(
             target.id,
             target.field,
             e.currentTarget.innerHTML
           )
         }
       />

       <button
         className="primary full"
         onClick={close}
       >
         DONE
       </button>

     </div>

   </div>
 );
}

function Backup({
 days,
 backup,
 restore,
 toast
}){

 const [raw,setRaw]=useState("");
 const [out,setOut]=useState("");

 function create(){
   setOut(backup());
   toast("Backup created.");
 }

 async function copy(text){
   try{
     await navigator.clipboard.writeText(text);
     toast("Backup copied to clipboard.");
   }catch{
     toast(
       "Copy is not available in this browser."
     );
   }
 }

 return (
   <section>

     <div className="pagehead">
       <h1>
         Backup & Restore
       </h1>
     </div>

     <Card>

       <I.ShieldCheck className="hero-icon"/>

       <h2>
         Protect your Bible studies
       </h2>

       <p>
         You currently have{" "}
         <b>{days.length}</b>{" "}
         saved study days. Create a backup and store the text somewhere safe.
       </p>

       <button
         className="primary full"
         onClick={create}
       >
         <I.HardDriveDownload/>
         CREATE BACKUP
       </button>

       {out && (
         <>
           <textarea
             className="backupbox"
             value={out}
             readOnly
           />

           <button
             className="outline full"
             onClick={()=>copy(out)}
           >
             <I.Copy/>
             COPY BACKUP
           </button>
         </>
       )}

     </Card>

     <h3 className="section-title">
       Restore
     </h3>

     <p>
       Paste a backup below, then press Restore.
     </p>

     <textarea
       className="backupbox"
       placeholder="Paste your backup here"
       value={raw}
       onChange={e=>
         setRaw(e.target.value)
       }
     />

     <button
       className="primary full"
       onClick={()=>{
         if(!raw){
           return toast(
             "Paste your backup first."
           );
         }

         if(
           confirm(
             "Restoring will replace the current study data with the backup data."
           )
         ){
           restore(raw);
         }
       }}
     >
       <I.RotateCcw/>
       RESTORE BACKUP
     </button>

   </section>
 );
}

function ExportText({days}){

 const [copied,setCopied]=useState(false);

 const text=exportStudies(days);

 return (
   <section>

     <div className="pagehead">
       <h1>
         Export your studies
       </h1>
     </div>

     <textarea
       className="backupbox export"
       value={text}
       readOnly
     />

     <button
       className="primary full"
       onClick={async()=>{
         try{
           await navigator.clipboard?.writeText(text);
           setCopied(true);
         }catch{}
       }}
     >
       <I.Copy/>
       {
         copied
           ? "Study export copied to clipboard."
           : "Copy"
       }
     </button>

   </section>
 );
}

function exportStudies(days){

 return days
   .map(d=>
     `DATE: ${formatDate(d.date)}
${d.chapters.map(c=>
`BIBLE REFERENCE: ${c.reference}
KEY VERSE: ${strip(c.keyVerse)}
SUMMARY: ${strip(c.summary)}
OBSERVATIONS: ${strip(c.observations)}
MEANING: ${strip(c.meaning)}
LESSONS / GOD: ${strip(c.god)}
APPLICATION: ${strip(c.application)}
QUESTIONS: ${strip(c.questions)}
PRAYER: ${strip(c.prayer)}
CHARACTER: ${c.characterName}
CHARACTER LESSONS: ${strip(c.characterLessons)}
`
     ).join("\n")}`
   )
   .join("\n--------------------\n");
}

function strip(x){
 return (x||"")
   .replace(/<[^>]*>/g," ")
   .replace(/\s+/g," ")
   .trim();
}

function Search({days}){

 const [q,setQ]=useState("");

 const results=days
   .flatMap(
     d=>d.chapters.map(
       c=>({d,c})
     )
   )
   .filter(
     ({d,c})=>
       !q ||
       JSON.stringify({d,c})
         .toLowerCase()
         .includes(
           q.toLowerCase()
         )
   );

 return (
   <section>

     <div className="pagehead">
       <h1>
         Search your studies
       </h1>
     </div>

     <div className="searchbox">

       <I.Search/>

       <input
         autoFocus
         placeholder="Search notes, verses, people, questions…"
         value={q}
         onChange={e=>
           setQ(e.target.value)
         }
       />

       {q && (
         <button
           onClick={()=>setQ("")}
         >
           ×
         </button>
       )}

     </div>

     {!q ? (

       <Empty
         icon={<I.Search/>}
         title="Search across all your saved studies."
         text="Search Bible references, notes, verses, people, questions, and more."
       />

     ) : results.length ? (

       results.map(x=>

         <Card key={x.c.id}>

           <b>
             {x.c.reference ||
              "Untitled chapter"}
           </b>

           <small>
             {formatDate(x.d.date)}
           </small>

           <p>
             {strip(
               x.c.summary ||
               x.c.keyVerse ||
               x.c.prayer
             ).slice(0,220)}
           </p>

         </Card>

       )

     ) : (

       <Empty
         icon={<I.SearchX/>}
         title="No matching studies found."
         text="Try another word or phrase."
       />

     )}

   </section>
 );
}

function Calendar({days,select}){

 const [cursor,setCursor]=useState(
   new Date()
 );

 const [sel,setSel]=useState(null);

 const y=cursor.getFullYear();
 const m=cursor.getMonth();

 const first=(
   new Date(y,m,1).getDay()+6
 )%7;

 const count=new Date(
   y,
   m+1,
   0
 ).getDate();

 const studied=new Set(
   days.map(d=>d.date)
 );

 const dates=Array.from(
   {length:first+count},
   (_,i)=>
     i<first
       ? null
       : i-first+1
 );

 return (
   <section>

     <div className="pagehead">
       <h1>
         Study calendar
       </h1>
     </div>

     <Card>

       <div className="cal-head">

         <button
           className="iconbtn"
           onClick={()=>
             setCursor(
               new Date(y,m-1,1)
             )
           }
         >
           <I.ChevronLeft/>
         </button>

         <b>
           {cursor.toLocaleString(
             "en",
             {month:"long"}
           )}{" "}
           {y}
         </b>

         <button
           className="iconbtn"
           onClick={()=>
             setCursor(
               new Date(y,m+1,1)
             )
           }
         >
           <I.ChevronRight/>
         </button>

       </div>

       <div className="week">

         {[
           "M",
           "T",
           "W",
           "T",
           "F",
           "S",
           "S"
         ].map(x=>
           <b key={x}>
             {x}
           </b>
         )}

       </div>

       <div className="calendar-grid">

         {dates.map((d,i)=>{

           if(!d){
             return <span key={i}/>;
           }

           const key=
             `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

           return (
             <button
               key={key}
               className={
                 studied.has(key)
                   ?"studied"
                   :""
               }
               onClick={()=>{
                 setSel(key);
               }}
             >
               {d}
             </button>
           );

         })}

       </div>

     </Card>

     {sel ? (

       <Card>

         <b>
           {formatDate(sel)}
         </b>

         <h3>
           {
             days.find(
               d=>d.date===sel
             )?.chapters.length || 0
           }{" "}
           chapters studied
         </h3>

         {
           days.find(
             d=>d.date===sel
           )?.chapters.map(c=>
             <button
               className="list-row"
               key={c.id}
               onClick={()=>
                 select(sel)
               }
             >
               <I.BookOpen/>
               {c.reference ||
                "Untitled chapter"}
               <I.ChevronRight/>
             </button>
           )
           ||
           <p>
             No study saved for this day.
           </p>
         }

       </Card>

     ) : (

       <Empty
         icon={<I.MousePointerClick/>}
         title="Choose a day"
         text="Tap a date to see what you studied."
       />

     )}

   </section>
 );
}

function NTTracker({
 nt,
 toggle,
 progress,
 selected
}){

 const [open,setOpen]=useState({});

 return (
   <section>

     <div className="pagehead">

       <h1>
         New Testament Tracker
       </h1>

       <button
         className="iconbtn"
         title="Choose date"
       >
         <I.Calendar/>
       </button>

     </div>

     <Card className="reading">

       <I.BookOpenCheck/>

       <div className="grow">

         <b>
           Reading progress
         </b>

         <div className="progress">
           <span
             style={{
               width:`${progress}%`
             }}
           />
         </div>

         <small>
           {selected} of 357 chapters selected
         </small>

       </div>

       <strong>
         {progress}%
       </strong>

     </Card>

     {NT.map(([book,n])=>

       <Card
         className="nt-book"
         key={book}
       >

         <button
           className="nt-title"
           onClick={()=>
             setOpen({
               ...open,
               [book]:!open[book]
             })
           }
         >

           <span className="circle">
             {(nt[book]||[]).length}
           </span>

           <b>
             {book}
           </b>

           <small>
             {(nt[book]||[]).length}
             {" / "}
             {n}
             {" "}chapters
           </small>

           {
             open[book]
               ? <I.ChevronUp/>
               : <I.ChevronDown/>
           }

         </button>

         {open[book] && (

           <div className="chapter-grid">

             {Array.from(
               {length:n},
               (_,i)=>i+1
             ).map(c=>

               <button
                 key={c}
                 className={
                   (nt[book]||[])
                     .includes(c)
                     ?"chosen"
                     :""
                 }
                 onClick={()=>
                   toggle(book,c)
                 }
               >
                 {c}
               </button>

             )}

           </div>

         )}

       </Card>

     )}

   </section>
 );
}

const THEME_OPTIONS=[
 ["warm","Warm Bible","Beige • Brown • Cream","🤎"],
 ["sage","Sage","Sage Green • Cream","🌿"],
 ["navy","Navy & Gold","Navy • Cream • Gold","💙"],
 ["midnight","Midnight Gold","Black • Cream • Gold","🖤"],
 ["blue","Peaceful Blue","Soft Blue • White","🩵"],
 ["terracotta","Terracotta","Terracotta • Cream","🧡"],
 ["plum","Classic Plum","Purple • Plum • Cream","🟣"]
];

function Settings({
 dark,
 setDark,
 theme,
 setTheme
}){

 return (
   <section>

     <div className="pagehead">
       <h1>
         Settings
       </h1>
     </div>

     <Card className="setting">

       <div className="setting-icon">
         {dark
           ? <I.Moon/>
           : <I.SunMedium/>
         }
       </div>

       <div className="grow">

         <b>
           Dark mode
         </b>

         <small>
           {
             dark
               ? "Dark theme is currently enabled"
               : "Light theme is currently enabled"
           }
         </small>

       </div>

       <button
         className={
           `mode-toggle ${
             dark
               ?"is-dark"
               :""
           }`
         }
         onClick={()=>{
           setDark(
             current=>!current
           );
         }}
         aria-label="Toggle light and dark mode"
       >

         <span>
           {
             dark
               ? <I.Moon/>
               : <I.SunMedium/>
           }
         </span>

         <span>
           {
             dark
               ? "Dark"
               : "Light"
           }
         </span>

       </button>

     </Card>

     <div className="theme-heading">

       <h2>
         Theme
       </h2>

       <p>
         Choose the colors for your Bible Study. Theme and mode work independently.
       </p>

     </div>

     <div className="theme-grid">

       {THEME_OPTIONS.map(
         ([id,name,desc,emoji])=>

           <button
             key={id}
             className={
               `theme-option ${
                 theme===id
                   ?"selected"
                   :""
               }`
             }
             onClick={()=>
               setTheme(id)
             }
           >

             <span
               className={
                 `theme-swatch theme-swatch-${id}`
               }
             >
               <span>
                 {emoji}
               </span>
             </span>

             <span className="theme-copy">

               <b>
                 {name}
               </b>

               <small>
                 {desc}
               </small>

             </span>

             <span className="theme-check">

               {
                 theme===id
                   ? <I.CheckCircle2/>
                   : <I.Circle/>
               }

             </span>

           </button>

       )}

     </div>

   </section>
 );
}

function Characters({days}){

 const chars=days
   .flatMap(
     d=>d.chapters.map(
       c=>({d,c})
     )
   )
   .filter(
     x=>x.c.characterName
   );

 return (
   <section>

     <div className="pagehead">
       <h1>
         Character Library
       </h1>
     </div>

     {chars.length ? (

       chars.map(x=>

         <Card key={x.c.id}>

           <div className="list-row">

             <I.UserRound/>

             <div className="grow">

               <b>
                 {x.c.characterName}
               </b>

               <small>
                 {x.c.reference ||
                  "Chapter"}
                 {" • "}
                 {formatDate(x.d.date)}
               </small>

               <p>
                 {strip(
                   x.c.characterLessons ||
                   x.c.characterIdentity
                 ).slice(0,180)}
               </p>

             </div>

           </div>

         </Card>

       )

     ) : (

       <Empty
         icon={<I.UserRound/>}
         title="No characters yet"
         text="Characters recorded in saved studies will appear here."
       />

     )}

   </section>
 );
}

function Filtered({
 days,
 type
}){

 const all=days
   .flatMap(
     d=>d.chapters.map(
       c=>({d,c})
     )
   )
   .filter(
     x=>
       type==="bookmarked"
         ? x.c.bookmarked
         : x.c.favorite
   );

 return (
   <section>

     <div className="pagehead">

       <h1>
         {
           type==="bookmarked"
             ? "Bookmarks"
             : "Favorites"
         }
       </h1>

     </div>

     {all.length ? (

       all.map(x=>

         <Card key={x.c.id}>

           <b>
             {x.c.reference ||
              "Untitled chapter"}
           </b>

           <small>
             {formatDate(x.d.date)}
           </small>

           <p>
             {strip(
               x.c.summary ||
               x.c.keyVerse
             ).slice(0,180)}
           </p>

         </Card>

       )

     ) : (

       <Empty
         icon={
           type==="bookmarked"
             ? <I.Bookmark/>
             : <I.Star/>
         }
         title={
           type==="bookmarked"
             ? "No bookmarks yet"
             : "No favorites yet"
         }
         text="Saved chapters will appear here."
       />

     )}

   </section>
 );
}

createRoot(
 document.getElementById("root")
).render(
 <App/>
);
