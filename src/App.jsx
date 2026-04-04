import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDA8RwTylDHLOkb9wiyR_GXYYY43Wm_XS8",
  authDomain: "thabaat-67a8f.firebaseapp.com",
  databaseURL: "https://thabaat-67a8f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "thabaat-67a8f",
  storageBucket: "thabaat-67a8f.firebasestorage.app",
  messagingSenderId: "615533784510",
  appId: "1:615533784510:web:e3771660f03009256b1def",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

function getUserId() {
  let id = localStorage.getItem("thabaat-uid");
  if (!id) { id = "user_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("thabaat-uid", id); }
  return id;
}
const UID = getUserId();
async function dbSet(path, value) { await set(ref(db, path), value); }
function dbListen(path, cb) {
  const r = ref(db, path);
  onValue(r, s => cb(s.exists() ? s.val() : null));
  return () => off(r);
}

const SURAHS = [
  {n:1,name:"Al-Fatiha",ar:"الفاتحة",v:7},{n:2,name:"Al-Baqara",ar:"البقرة",v:286},
  {n:3,name:"Ali Imran",ar:"آل عمران",v:200},{n:4,name:"An-Nisa",ar:"النساء",v:176},
  {n:5,name:"Al-Maida",ar:"المائدة",v:120},{n:6,name:"Al-Anam",ar:"الأنعام",v:165},
  {n:7,name:"Al-Araf",ar:"الأعراف",v:206},{n:8,name:"Al-Anfal",ar:"الأنفال",v:75},
  {n:9,name:"At-Tawba",ar:"التوبة",v:129},{n:10,name:"Yunus",ar:"يونس",v:109},
  {n:11,name:"Hud",ar:"هود",v:123},{n:12,name:"Yusuf",ar:"يوسف",v:111},
  {n:13,name:"Ar-Rad",ar:"الرعد",v:43},{n:14,name:"Ibrahim",ar:"إبراهيم",v:52},
  {n:15,name:"Al-Hijr",ar:"الحجر",v:99},{n:16,name:"An-Nahl",ar:"النحل",v:128},
  {n:17,name:"Al-Isra",ar:"الإسراء",v:111},{n:18,name:"Al-Kahf",ar:"الكهف",v:110},
  {n:19,name:"Maryam",ar:"مريم",v:98},{n:20,name:"Ta-Ha",ar:"طه",v:135},
  {n:21,name:"Al-Anbiya",ar:"الأنبياء",v:112},{n:22,name:"Al-Hajj",ar:"الحج",v:78},
  {n:23,name:"Al-Muminun",ar:"المؤمنون",v:118},{n:24,name:"An-Nur",ar:"النور",v:64},
  {n:25,name:"Al-Furqan",ar:"الفرقان",v:77},{n:26,name:"Ash-Shuara",ar:"الشعراء",v:227},
  {n:27,name:"An-Naml",ar:"النمل",v:93},{n:28,name:"Al-Qasas",ar:"القصص",v:88},
  {n:29,name:"Al-Ankabut",ar:"العنكبوت",v:69},{n:30,name:"Ar-Rum",ar:"الروم",v:60},
  {n:31,name:"Luqman",ar:"لقمان",v:34},{n:32,name:"As-Sajda",ar:"السجدة",v:30},
  {n:33,name:"Al-Ahzab",ar:"الأحزاب",v:73},{n:34,name:"Saba",ar:"سبأ",v:54},
  {n:35,name:"Fatir",ar:"فاطر",v:45},{n:36,name:"Ya-Sin",ar:"يس",v:83},
  {n:37,name:"As-Saffat",ar:"الصافات",v:182},{n:38,name:"Sad",ar:"ص",v:88},
  {n:39,name:"Az-Zumar",ar:"الزمر",v:75},{n:40,name:"Ghafir",ar:"غافر",v:85},
  {n:41,name:"Fussilat",ar:"فصلت",v:54},{n:42,name:"Ash-Shura",ar:"الشورى",v:53},
  {n:43,name:"Az-Zukhruf",ar:"الزخرف",v:89},{n:44,name:"Ad-Dukhan",ar:"الدخان",v:59},
  {n:45,name:"Al-Jathiya",ar:"الجاثية",v:37},{n:46,name:"Al-Ahqaf",ar:"الأحقاف",v:35},
  {n:47,name:"Muhammad",ar:"محمد",v:38},{n:48,name:"Al-Fath",ar:"الفتح",v:29},
  {n:49,name:"Al-Hujurat",ar:"الحجرات",v:18},{n:50,name:"Qaf",ar:"ق",v:45},
  {n:51,name:"Adh-Dhariyat",ar:"الذاريات",v:60},{n:52,name:"At-Tur",ar:"الطور",v:49},
  {n:53,name:"An-Najm",ar:"النجم",v:62},{n:54,name:"Al-Qamar",ar:"القمر",v:55},
  {n:55,name:"Ar-Rahman",ar:"الرحمن",v:78},{n:56,name:"Al-Waqia",ar:"الواقعة",v:96},
  {n:57,name:"Al-Hadid",ar:"الحديد",v:29},{n:58,name:"Al-Mujadila",ar:"المجادلة",v:22},
  {n:59,name:"Al-Hashr",ar:"الحشر",v:24},{n:60,name:"Al-Mumtahana",ar:"الممتحنة",v:13},
  {n:61,name:"As-Saf",ar:"الصف",v:14},{n:62,name:"Al-Jumua",ar:"الجمعة",v:11},
  {n:63,name:"Al-Munafiqun",ar:"المنافقون",v:11},{n:64,name:"At-Taghabun",ar:"التغابن",v:18},
  {n:65,name:"At-Talaq",ar:"الطلاق",v:12},{n:66,name:"At-Tahrim",ar:"التحريم",v:12},
  {n:67,name:"Al-Mulk",ar:"الملك",v:30},{n:68,name:"Al-Qalam",ar:"القلم",v:52},
  {n:69,name:"Al-Haqqa",ar:"الحاقة",v:52},{n:70,name:"Al-Maarij",ar:"المعارج",v:44},
  {n:71,name:"Nuh",ar:"نوح",v:28},{n:72,name:"Al-Jinn",ar:"الجن",v:28},
  {n:73,name:"Al-Muzzammil",ar:"المزمل",v:20},{n:74,name:"Al-Muddaththir",ar:"المدثر",v:56},
  {n:75,name:"Al-Qiyama",ar:"القيامة",v:40},{n:76,name:"Al-Insan",ar:"الإنسان",v:31},
  {n:77,name:"Al-Mursalat",ar:"المرسلات",v:50},{n:78,name:"An-Naba",ar:"النبأ",v:40},
  {n:79,name:"An-Naziat",ar:"النازعات",v:46},{n:80,name:"Abasa",ar:"عبس",v:42},
  {n:81,name:"At-Takwir",ar:"التكوير",v:29},{n:82,name:"Al-Infitar",ar:"الانفطار",v:19},
  {n:83,name:"Al-Mutaffifin",ar:"المطففين",v:36},{n:84,name:"Al-Inshiqaq",ar:"الانشقاق",v:25},
  {n:85,name:"Al-Buruj",ar:"البروج",v:22},{n:86,name:"At-Tariq",ar:"الطارق",v:17},
  {n:87,name:"Al-Ala",ar:"الأعلى",v:19},{n:88,name:"Al-Ghashiya",ar:"الغاشية",v:26},
  {n:89,name:"Al-Fajr",ar:"الفجر",v:30},{n:90,name:"Al-Balad",ar:"البلد",v:20},
  {n:91,name:"Ash-Shams",ar:"الشمس",v:15},{n:92,name:"Al-Layl",ar:"الليل",v:21},
  {n:93,name:"Ad-Duha",ar:"الضحى",v:11},{n:94,name:"Ash-Sharh",ar:"الشرح",v:8},
  {n:95,name:"At-Tin",ar:"التين",v:8},{n:96,name:"Al-Alaq",ar:"العلق",v:19},
  {n:97,name:"Al-Qadr",ar:"القدر",v:5},{n:98,name:"Al-Bayyina",ar:"البينة",v:8},
  {n:99,name:"Az-Zalzala",ar:"الزلزلة",v:8},{n:100,name:"Al-Adiyat",ar:"العاديات",v:11},
  {n:101,name:"Al-Qaria",ar:"القارعة",v:11},{n:102,name:"At-Takathur",ar:"التكاثر",v:8},
  {n:103,name:"Al-Asr",ar:"العصر",v:3},{n:104,name:"Al-Humaza",ar:"الهمزة",v:9},
  {n:105,name:"Al-Fil",ar:"الفيل",v:5},{n:106,name:"Quraysh",ar:"قريش",v:4},
  {n:107,name:"Al-Maun",ar:"الماعون",v:7},{n:108,name:"Al-Kawthar",ar:"الكوثر",v:3},
  {n:109,name:"Al-Kafirun",ar:"الكافرون",v:6},{n:110,name:"An-Nasr",ar:"النصر",v:3},
  {n:111,name:"Al-Masad",ar:"المسد",v:5},{n:112,name:"Al-Ikhlas",ar:"الإخلاص",v:4},
  {n:113,name:"Al-Falaq",ar:"الفلق",v:5},{n:114,name:"An-Nas",ar:"الناس",v:6},
];

const TOTAL_VERSES = SURAHS.reduce((s,x)=>s+x.v, 0);
const SURAH_OFFSETS = [];
let _off = 0;
SURAHS.forEach(s => { SURAH_OFFSETS.push(_off); _off += s.v; });
function globalVerse(surahN, verseN) { return SURAH_OFFSETS[surahN - 1] + verseN; }

const ERROR_TYPES = {
  nisyan:  {label:"Nisyan",  desc:"Oubli",           color:"#ef4444", icon:"O"},
  khata:   {label:"Khata",   desc:"Erreur de texte", color:"#f59e0b", icon:"E"},
  tajweed: {label:"Tajweed", desc:"Prononciation",   color:"#a78bfa", icon:"T"},
};
const TAJWEED_RULES = ["Madd","Idgham","Ikhfa","Qalqala","Waqf","Ghunna","Autre"];

const DUAS = [
  {ar:"رَبِّ زِدْنِي عِلْمًا", fr:"Rabbi zidni ilma - Seigneur, accrois mes connaissances"},
  {ar:"رَبِّ اشْرَحْ لِي صَدْرِي", fr:"Rabbi ishrah li sadri - Seigneur, ouvre ma poitrine"},
  {ar:"اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي", fr:"Fais-moi profiter de ce que Tu m'as enseigne"},
  {ar:"اللَّهُمَّ ارْزُقْنِي حِفْظَ كِتَابِكَ", fr:"Accorde-moi la memorisation de Ton Livre"},
  {ar:"اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي", fr:"Fais du Coran le printemps de mon coeur"},
];

const SECTIONS = {
  hifz:   {id:"hifz",   label:"Hifz",     subLabel:"Apprentissage", icon:"◈", color:"#60a5fa", colorDim:"#60a5fa22", colorBorder:"#60a5fa44"},
  muraja: {id:"muraja", label:"Muraja'a", subLabel:"Revision",      icon:"↺", color:"#f59e0b", colorDim:"#f59e0b22", colorBorder:"#f59e0b44"},
  wird:   {id:"wird",   label:"Wird",     subLabel:"Lecture",       icon:"☽", color:"#4ade80", colorDim:"#4ade8022", colorBorder:"#4ade8044"},
};

function today() { return new Date().toISOString().slice(0,10); }
function genId()  { return Math.random().toString(36).slice(2,10); }
function getMonthKey() { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); }
function updateStreak(streak) {
  const td=today();
  if(streak?.lastDate===td) return streak;
  const y=new Date(); y.setDate(y.getDate()-1);
  const ys=y.toISOString().slice(0,10);
  return {count:streak?.lastDate===ys?(streak.count||0)+1:1, lastDate:td};
}
function surahLearnedPct(ranges, totalVerses) {
  if(!ranges||ranges.length===0) return 0;
  const covered=new Set();
  ranges.forEach(r=>{for(let v=r.from;v<=r.to;v++) covered.add(v);});
  return Math.min(100,Math.round((covered.size/totalVerses)*100));
}

function GeoBg({color="#c9a84c"}) {
  return (
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.025,pointerEvents:"none",zIndex:0}} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="g" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="40,2 78,21 78,59 40,78 2,59 2,21" fill="none" stroke={color} strokeWidth="0.7"/>
        <circle cx="40" cy="40" r="5" fill="none" stroke={color} strokeWidth="0.3"/>
      </pattern></defs>
      <rect width="600" height="600" fill="url(#g)"/>
    </svg>
  );
}

function SectionTabs({active,onChange}) {
  return (
    <div style={{display:"flex",gap:6,marginBottom:20}}>
      {Object.values(SECTIONS).map(s=>{
        const isActive=active===s.id;
        return (
          <button key={s.id} onClick={()=>onChange(s.id)} style={{flex:1,padding:"12px 4px",borderRadius:10,cursor:"pointer",border:isActive?`1px solid ${s.color}55`:"1px solid #1e1e1e",background:isActive?s.colorDim:"#111",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all .2s"}}>
            <span style={{fontSize:18,color:isActive?s.color:"#333"}}>{s.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:isActive?s.color:"#444"}}>{s.label}</span>
            <span style={{fontSize:8,color:isActive?s.color+"88":"#2a2a2a",textTransform:"uppercase",letterSpacing:1}}>{s.subLabel}</span>
            {isActive&&<div style={{width:20,height:2,borderRadius:1,background:s.color,marginTop:2}}/>}
          </button>
        );
      })}
    </div>
  );
}

function VerseErrorPicker({totalVerses,verseErrors,onChange,readOnly=false}) {
  const [editingVerse,setEditingVerse]=useState(null);
  const [errorType,setErrorType]=useState("nisyan");
  const [tajweedRule,setTajweedRule]=useState("");
  const [noteText,setNoteText]=useState("");
  const toggle=(v)=>{
    if(readOnly) return;
    if(verseErrors[v]){const n={...verseErrors};delete n[v];onChange(n);}
    else{setEditingVerse(v);setErrorType("nisyan");setTajweedRule("");setNoteText("");}
  };
  const confirm=()=>{
    onChange({...verseErrors,[editingVerse]:{type:errorType,tajweed:errorType==="tajweed"?tajweedRule:"",note:noteText}});
    setEditingVerse(null);
  };
  return (
    <div>
      <div style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Versets ({Object.keys(verseErrors).length} erreurs)</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
        {Array.from({length:totalVerses},(_,i)=>i+1).map(v=>{
          const err=verseErrors[v];
          const col=err?ERROR_TYPES[err.type]?.color||"#ef4444":"#444";
          return <button key={v} onClick={()=>toggle(v)} style={{width:32,height:32,borderRadius:6,fontSize:11,fontWeight:600,cursor:readOnly?"default":"pointer",border:err?`1.5px solid ${col}`:"1px solid #222",background:err?col+"22":"#111",color:err?col:"#444"}}>{v}</button>;
        })}
      </div>
      {editingVerse&&(
        <div style={{background:"#0d0d0d",border:"1px solid #c9a84c44",borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{fontSize:12,color:"#c9a84c",marginBottom:10}}>Verset {editingVerse}</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {Object.entries(ERROR_TYPES).map(([k,v])=>(
              <button key={k} onClick={()=>setErrorType(k)} style={{flex:1,padding:"8px 4px",borderRadius:8,fontSize:10,cursor:"pointer",textAlign:"center",border:errorType===k?`1px solid ${v.color}`:"1px solid #222",background:errorType===k?v.color+"22":"#111",color:errorType===k?v.color:"#555"}}>
                <div style={{fontWeight:600}}>{v.label}</div><div style={{fontSize:9}}>{v.desc}</div>
              </button>
            ))}
          </div>
          {errorType==="tajweed"&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {TAJWEED_RULES.map(r=><button key={r} onClick={()=>setTajweedRule(r)} style={{padding:"5px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:tajweedRule===r?"1px solid #a78bfa":"1px solid #222",background:tajweedRule===r?"#a78bfa22":"#111",color:tajweedRule===r?"#a78bfa":"#555"}}>{r}</button>)}
            </div>
          )}
          <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Note optionnelle..." style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:6,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={confirm} style={{flex:1,padding:8,background:ERROR_TYPES[errorType].color+"22",border:`1px solid ${ERROR_TYPES[errorType].color}55`,borderRadius:6,color:ERROR_TYPES[errorType].color,fontSize:12,cursor:"pointer"}}>Confirmer</button>
            <button onClick={()=>setEditingVerse(null)} style={{flex:1,padding:8,background:"#111",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:12,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CorrectorView({sessionId}) {
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const u=dbListen(`sessions/${sessionId}`,d=>{setSession(d);setLoading(false);});return u;},[sessionId]);
  const updateErrors=async(ve)=>{await dbSet(`sessions/${sessionId}/verseErrors`,ve);};
  if(loading) return <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#c9a84c",fontSize:20}}>ثبات...</div></div>;
  if(!session) return <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#666"}}>Session introuvable</div></div>;
  const item=SURAHS.find(i=>i.n===Number(session.itemKey));
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#ddd",fontFamily:"'DM Sans',sans-serif",padding:"20px 16px 40px",maxWidth:500,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>وضع المصحح</div>
          <div style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Mode Correcteur - Thabaat</div>
        </div>
        <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:16,color:"#ddd",fontWeight:600}}>{session.itemName}</div>
          <div style={{fontSize:11,color:"#555"}}>{session.date}</div>
        </div>
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:12,padding:16,marginBottom:16}}>
          <VerseErrorPicker totalVerses={item?.v||10} verseErrors={session.verseErrors||{}} onChange={updateErrors}/>
        </div>
        <div style={{background:"#0d3320",border:"1px solid #4ade8033",borderRadius:10,padding:14,fontSize:12,color:"#4ade80",textAlign:"center"}}>Synchronisation en temps reel</div>
      </div>
    </div>
  );
}

// HIFZ
function HifzDashboard({state,onNewSession}) {
  const sec=SECTIONS.hifz;
  const pm=state.surahProgress||{};
  const totalMem=SURAHS.filter(s=>surahLearnedPct(pm[s.n]?.learnedRanges,s.v)===100).length;
  const inProgress=SURAHS.filter(s=>{const p=pm[s.n];return p?.learnedRanges?.length>0&&surahLearnedPct(p.learnedRanges,s.v)<100;}).length;
  const recent=[];
  Object.entries(pm).forEach(([n,p])=>{(p.hifzSessions||[]).forEach(s=>recent.push({...s,surahN:Number(n),surahName:SURAHS.find(x=>x.n===Number(n))?.name}));});
  recent.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const dua=DUAS[new Date().getDate()%DUAS.length];
  const streak=state.streak||{count:0};
  const streakWarning=streak.count>0&&streak.lastDate!==today();
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#0a0f1a,#0d1525)",border:`1px solid ${sec.color}22`,borderRadius:12,padding:16,marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:9,color:sec.color+"66",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Du'a du jour</div>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:sec.color,marginBottom:5,lineHeight:1.6}}>{dua.ar}</div>
        <div style={{fontSize:10,color:sec.color+"77",fontStyle:"italic"}}>{dua.fr}</div>
      </div>
      <div style={{background:streakWarning?"linear-gradient(135deg,#1a0a0a,#2a1010)":"linear-gradient(135deg,#1a110a,#2a1a0a)",border:`1px solid ${streakWarning?"#ef444433":"#c9a84c33"}`,borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:26}}>{streakWarning?"⚠️":"🔥"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:streakWarning?"#ef4444":"#f59e0b",fontFamily:"monospace"}}>{streak.count} jour{streak.count!==1?"s":""}</div>
          <div style={{fontSize:10,color:streakWarning?"#ef444477":"#7a5a30"}}>{streakWarning?"Recite aujourd'hui !":"Streak - Istimrariya"}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"Completes",val:totalMem,color:sec.color},{label:"En cours",val:inProgress,color:"#f59e0b"},{label:"Sourates",val:SURAHS.length,color:"#444"}].map(c=>(
          <div key={c.label} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"12px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.color}}/>
            <div style={{fontSize:22,fontWeight:700,color:c.color,fontFamily:"monospace"}}>{c.val}</div>
            <div style={{fontSize:9,color:"#444",marginTop:2,textTransform:"uppercase"}}>{c.label}</div>
          </div>
        ))}
      </div>
      {inProgress>0&&(
        <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>En cours</div>
          {SURAHS.filter(s=>{const p=pm[s.n];return p?.learnedRanges?.length>0&&surahLearnedPct(p.learnedRanges,s.v)<100;}).slice(0,5).map(s=>{
            const pct=surahLearnedPct(pm[s.n]?.learnedRanges,s.v);
            return (
              <div key={s.n} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                  <span style={{color:"#ccc"}}>{s.name}</span>
                  <span style={{color:sec.color,fontWeight:700,fontFamily:"monospace"}}>{pct}%</span>
                </div>
                <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:3}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Dernieres seances</div>
        {recent.length===0?<div style={{textAlign:"center",color:"#333",fontSize:13,padding:"10px 0"}}>Aucune seance encore</div>:
        recent.slice(0,4).map((s,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<3?"1px solid #1a1a1a":"none"}}>
            <div>
              <div style={{fontSize:12,color:"#ccc"}}>{s.surahName}</div>
              <div style={{fontSize:10,color:"#444"}}>{s.date} · v.{s.range?.from}→v.{s.range?.to}</div>
            </div>
            <span style={{fontSize:10,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 8px"}}>{(s.range?.to||0)-(s.range?.from||0)+1} v.</span>
          </div>
        ))}
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${sec.colorDim},${sec.color}30)`,border:`1px solid ${sec.colorBorder}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:600}}>
        + Nouvelle seance Hifz
      </button>
    </div>
  );
}

function HifzSession({state,onSave,onDone}) {
  const sec=SECTIONS.hifz;
  const pm=state.surahProgress||{};
  const [selSurah,setSelSurah]=useState("");
  const [rangeFrom,setRangeFrom]=useState(1);
  const [rangeTo,setRangeTo]=useState(1);
  const [verseErrors,setVerseErrors]=useState({});
  const [partner,setPartner]=useState("");
  const [type,setType]=useState("solo");
  const [notes,setNotes]=useState("");
  const [saved,setSaved]=useState(false);
  const [shareLink,setShareLink]=useState(null);
  const [sessionId]=useState(()=>genId());
  const [startTime]=useState(()=>Date.now());
  const surah=SURAHS.find(s=>s.n===Number(selSurah));
  const existingRanges=pm[selSurah]?.learnedRanges||[];
  const currentPct=surahLearnedPct(existingRanges,surah?.v||1);
  const newPct=surah?surahLearnedPct([...existingRanges,{from:Math.min(rangeFrom,rangeTo),to:Math.max(rangeFrom,rangeTo)}],surah.v):currentPct;

  useEffect(()=>{
    if(type==="sheikh"&&selSurah&&surah){
      dbSet(`sessions/${sessionId}`,{itemKey:selSurah,itemName:surah.name,mode:"surah",date:today(),type,partner,verseErrors:{},notes});
      setShareLink(`${window.location.origin}${window.location.pathname}?corrector=${sessionId}`);
    } else setShareLink(null);
  },[type,selSurah]);

  useEffect(()=>{
    if(type!=="sheikh"||!selSurah) return;
    const u=dbListen(`sessions/${sessionId}/verseErrors`,d=>{if(d) setVerseErrors(d);});
    return u;
  },[type,selSurah]);

  const save=async()=>{
    if(!selSurah||!surah) return;
    const dur=Math.round((Date.now()-startTime)/60000);
    const newRange={from:Math.min(rangeFrom,rangeTo),to:Math.max(rangeFrom,rangeTo)};
    const session={date:today(),type,partner:type==="solo"?null:partner,verseErrors,notes,range:newRange,duration:dur||1};
    await onSave(selSurah,session,[...existingRanges,newRange]);
    setSaved(true);setTimeout(onDone,1400);
  };

  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:44}}>✅</div><div style={{color:sec.color,fontSize:16,marginTop:12}}>Seance enregistree !</div></div>;
  const vNums=surah?Array.from({length:surah.v},(_,i)=>i+1):[];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:15}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل حفظ</div>
        <div style={{fontSize:11,color:"#555"}}>Nouvelle seance d'apprentissage</div>
      </div>
      <div>
        <label style={{fontSize:10,color:"#555",textTransform:"uppercase",display:"block",marginBottom:6}}>Sourate</label>
        <select value={selSurah} onChange={e=>{setSelSurah(e.target.value);setRangeFrom(1);setRangeTo(1);setVerseErrors({});}} style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none"}}>
          <option value="">Selectionner...</option>
          {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name} ({s.v} versets)</option>)}
        </select>
      </div>
      {surah&&(
        <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:10,padding:14}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>Versets appris aujourd'hui</div>
          {existingRanges.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#555",marginBottom:4}}><span>Deja memorise</span><span style={{color:sec.color}}>{currentPct}%</span></div>
              <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${currentPct}%`,background:sec.color,borderRadius:3}}/></div>
            </div>
          )}
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Du verset</div>
              <select value={rangeFrom} onChange={e=>setRangeFrom(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:14,outline:"none"}}>
                {vNums.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{color:"#333",marginTop:14,fontSize:18}}>→</div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Au verset</div>
              <select value={rangeTo} onChange={e=>setRangeTo(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:14,outline:"none"}}>
                {vNums.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          {rangeFrom<=rangeTo&&<div style={{marginTop:10,fontSize:11,color:sec.color+"99",textAlign:"center",background:sec.color+"11",borderRadius:7,padding:8}}>{rangeTo-rangeFrom+1} versets · Nouveau total: {newPct}%</div>}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        {[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=>(
          <button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:10,borderRadius:8,fontSize:13,cursor:"pointer",border:type===t.k?`1px solid ${sec.color}`:"1px solid #222",background:type===t.k?sec.colorDim:"#111",color:type===t.k?sec.color:"#555"}}>{t.l}</button>
        ))}
      </div>
      {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom du cheikh" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
      {type==="sheikh"&&selSurah&&shareLink&&(
        <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:10,padding:14}}>
          <div style={{fontSize:11,color:"#60a5fa",marginBottom:6,fontWeight:600}}>Lien correcteur</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"#111",border:"1px solid #1e1e1e",borderRadius:6,padding:"8px 10px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{shareLink}</div>
            <button onClick={()=>navigator.clipboard.writeText(shareLink).catch(()=>{})} style={{padding:"8px 12px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:11,cursor:"pointer"}}>Copier</button>
          </div>
        </div>
      )}
      {surah&&<div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:14}}><VerseErrorPicker totalVerses={surah.v} verseErrors={verseErrors} onChange={setVerseErrors}/></div>}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..." style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} disabled={!selSurah} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:selSurah?"pointer":"not-allowed",background:selSurah?`linear-gradient(135deg,${sec.colorDim},${sec.color}40)`:"#111",border:selSurah?`1px solid ${sec.colorBorder}`:"1px solid #1a1a1a",color:selSurah?sec.color:"#333"}}>
        Enregistrer la seance
      </button>
    </div>
  );
}

function HifzList({state}) {
  const sec=SECTIONS.hifz;
  const pm=state.surahProgress||{};
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const filtered=SURAHS.filter(s=>{
    const match=s.name.toLowerCase().includes(search.toLowerCase())||String(s.n).includes(search);
    const pct=surahLearnedPct(pm[s.n]?.learnedRanges,s.v);
    if(filter==="complete") return match&&pct===100;
    if(filter==="progress") return match&&pct>0&&pct<100;
    if(filter==="none") return match&&pct===0;
    return match;
  });
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"8px 12px",fontSize:13,outline:"none"}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{background:"#111",border:"1px solid #222",borderRadius:8,color:"#888",padding:"8px",fontSize:11,outline:"none"}}>
          <option value="all">Toutes</option><option value="complete">Completes</option><option value="progress">En cours</option><option value="none">Non commencees</option>
        </select>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {filtered.map(s=>{
          const ranges=pm[s.n]?.learnedRanges||[];
          const pct=surahLearnedPct(ranges,s.v);
          return (
            <div key={s.n} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:pct>0?8:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#444",flexShrink:0}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <span style={{fontSize:13,color:"#ccc",fontWeight:500}}>{s.name}</span>
                    <span style={{fontFamily:"'Scheherazade New',serif",fontSize:13,color:"#c9a84c33"}}>{s.ar}</span>
                  </div>
                  <div style={{fontSize:9,color:"#444"}}>{s.v} versets</div>
                </div>
                <div style={{fontSize:16,fontWeight:700,color:pct===100?sec.color:pct>0?"#f59e0b":"#2a2a2a",fontFamily:"monospace"}}>{pct}%</div>
              </div>
              {pct>0&&<><div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:3}}/></div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{ranges.map((r,i)=><span key={i} style={{fontSize:9,color:sec.color+"88",background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:20,padding:"1px 7px"}}>v.{r.from}→{r.to}</span>)}</div></>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// MURAJA
function MurajaDashboard({state,onNewSession}) {
  const sec=SECTIONS.muraja;
  const sessions=state.murajaSessions||[];
  const sorted=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const thisWeek=sessions.filter(s=>(new Date()-new Date(s.date))/(1000*60*60*24)<=7).length;
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"Total revisions",val:sessions.length,color:sec.color},{label:"Cette semaine",val:thisWeek,color:"#60a5fa"}].map(c=>(
          <div key={c.label} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"14px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.color}}/>
            <div style={{fontSize:26,fontWeight:700,color:c.color,fontFamily:"monospace"}}>{c.val}</div>
            <div style={{fontSize:9,color:"#444",marginTop:2,textTransform:"uppercase"}}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Dernieres revisions</div>
        {sorted.length===0?<div style={{textAlign:"center",color:"#333",fontSize:13,padding:"10px 0"}}>Aucune revision encore</div>:
        sorted.slice(0,5).map((s,i)=>{
          const fName=SURAHS.find(x=>x.n===s.range?.fromSurah)?.name||"";
          const tName=SURAHS.find(x=>x.n===s.range?.toSurah)?.name||"";
          const gFrom=globalVerse(s.range?.fromSurah||1,s.range?.fromVerse||1);
          const gTo=globalVerse(s.range?.toSurah||1,s.range?.toVerse||1);
          const cnt=Math.max(0,gTo-gFrom+1);
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<4?"1px solid #1a1a1a":"none"}}>
              <div>
                <div style={{fontSize:12,color:"#ccc"}}>{fName} {s.range?.fromVerse} → {tName} {s.range?.toVerse}</div>
                <div style={{fontSize:10,color:"#444"}}>{s.date}{s.quality?` · ${"★".repeat(s.quality)}`:""}</div>
              </div>
              <span style={{fontSize:10,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 8px"}}>{cnt} v.</span>
            </div>
          );
        })}
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${sec.colorDim},${sec.color}30)`,border:`1px solid ${sec.colorBorder}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:600}}>
        + Nouvelle seance Muraja'a
      </button>
    </div>
  );
}

function MurajaSession({state,onSave,onDone}) {
  const sec=SECTIONS.muraja;
  const [fromSurah,setFromSurah]=useState(78);
  const [fromVerse,setFromVerse]=useState(1);
  const [toSurah,setToSurah]=useState(114);
  const [toVerse,setToVerse]=useState(6);
  const [type,setType]=useState("solo");
  const [partner,setPartner]=useState("");
  const [notes,setNotes]=useState("");
  const [quality,setQuality]=useState(3);
  const [saved,setSaved]=useState(false);
  const [startTime]=useState(()=>Date.now());
  const fsData=SURAHS.find(s=>s.n===fromSurah);
  const tsData=SURAHS.find(s=>s.n===toSurah);
  const gFrom=globalVerse(fromSurah,fromVerse);
  const gTo=globalVerse(toSurah,toVerse);
  const totalInRange=Math.max(0,gTo-gFrom+1);
  const pct=Math.round((totalInRange/TOTAL_VERSES)*100);
  const save=async()=>{
    const dur=Math.round((Date.now()-startTime)/60000);
    const session={date:today(),type,partner:type==="solo"?null:partner,quality,notes,duration:dur||1,range:{fromSurah,fromVerse,toSurah,toVerse,fromName:fsData?.name,toName:tsData?.name}};
    await onSave(session);setSaved(true);setTimeout(onDone,1400);
  };
  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:44}}>✅</div><div style={{color:sec.color,fontSize:16,marginTop:12}}>Muraja'a enregistree !</div></div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:15}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل مراجعة</div>
        <div style={{fontSize:11,color:"#555"}}>Nouvelle seance de revision</div>
      </div>
      {totalInRange>0&&<div style={{background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:8,padding:"10px 14px",fontSize:11,color:sec.color+"cc",textAlign:"center"}}>{fsData?.name} {fromVerse} → {tsData?.name} {toVerse} · {totalInRange} versets · {pct}% du Coran</div>}
      <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>Plage revisee</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"start"}}>
          <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:sec.color+"88",textTransform:"uppercase",marginBottom:8}}>Debut</div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Sourate</div>
              <select value={fromSurah} onChange={e=>{setFromSurah(Number(e.target.value));setFromVerse(1);}} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"6px 8px",fontSize:11,outline:"none"}}>
                {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Aya</div>
              <select value={fromVerse} onChange={e=>setFromVerse(Number(e.target.value))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"6px 8px",fontSize:12,outline:"none"}}>
                {Array.from({length:fsData?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{color:"#333",fontSize:18,paddingTop:36,textAlign:"center"}}>→</div>
          <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:sec.color+"88",textTransform:"uppercase",marginBottom:8}}>Fin</div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Sourate</div>
              <select value={toSurah} onChange={e=>{setToSurah(Number(e.target.value));setToVerse(1);}} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"6px 8px",fontSize:11,outline:"none"}}>
                {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Aya</div>
              <select value={toVerse} onChange={e=>setToVerse(Number(e.target.value))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"6px 8px",fontSize:12,outline:"none"}}>
                {Array.from({length:tsData?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>Qualite</div>
        <div style={{display:"flex",gap:6}}>
          {[1,2,3,4,5].map(q=><button key={q} onClick={()=>setQuality(q)} style={{flex:1,padding:"10px 4px",borderRadius:8,fontSize:18,cursor:"pointer",border:quality>=q?`1px solid ${sec.color}55`:"1px solid #1a1a1a",background:quality>=q?sec.colorDim:"#0d0d0d",color:quality>=q?sec.color:"#2a2a2a"}}>★</button>)}
        </div>
        <div style={{fontSize:10,color:"#555",textAlign:"center",marginTop:6}}>{["","Tres difficile","Difficile","Moyen","Bien","Excellent"][quality]}</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=><button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:10,borderRadius:8,fontSize:13,cursor:"pointer",border:type===t.k?`1px solid ${sec.color}`:"1px solid #222",background:type===t.k?sec.colorDim:"#111",color:type===t.k?sec.color:"#555"}}>{t.l}</button>)}
      </div>
      {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..." style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",background:`linear-gradient(135deg,${sec.colorDim},${sec.color}40)`,border:`1px solid ${sec.colorBorder}`,color:sec.color}}>Enregistrer la revision</button>
    </div>
  );
}

// WIRD
function WirdDashboard({state,onNewSession,persist}) {
  const sec=SECTIONS.wird;
  const mk=getMonthKey();
  const wird=state.wird||{};
  const monthData=wird[mk]||{};
  const sessions=monthData.sessions||[];
  const goal=monthData.goal||1;
  const lastSession=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  let totalRead=0;
  sessions.forEach(s=>{
    const gFrom=globalVerse(s.fromSurah||1,s.fromVerse||1);
    const gTo=globalVerse(s.toSurah||1,s.toVerse||1);
    totalRead+=Math.max(0,gTo-gFrom+1);
  });
  const TOTAL=TOTAL_VERSES*goal;
  const pct=Math.min(100,Math.round((totalRead/TOTAL)*100));
  const now=new Date();
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const expectedPct=Math.round((now.getDate()/daysInMonth)*100);
  const ahead=pct>=expectedPct;
  const setGoal=async(g)=>{await persist({...state,wird:{...wird,[mk]:{...monthData,goal:g}}});};
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#001a0a,#002510)",border:`1px solid ${sec.color}22`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>الورد الشهري</div>
            <div style={{fontSize:10,color:sec.color+"66",textTransform:"uppercase",letterSpacing:1}}>{now.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#444",marginBottom:6}}>Objectif (x Coran)</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setGoal(Math.max(1,goal-1))} style={{width:26,height:26,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",color:"#888",fontSize:16,cursor:"pointer",lineHeight:1}}>-</button>
              <span style={{fontSize:22,fontWeight:700,color:sec.color,fontFamily:"monospace",minWidth:24,textAlign:"center"}}>{goal}</span>
              <button onClick={()=>setGoal(goal+1)} style={{width:26,height:26,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",color:"#888",fontSize:16,cursor:"pointer",lineHeight:1}}>+</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:5}}>
          <span style={{color:"#555"}}>Progression</span><span style={{color:sec.color,fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{height:7,background:"#0a2010",borderRadius:6,overflow:"hidden",position:"relative"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:6,transition:"width .5s"}}/>
          <div style={{position:"absolute",top:0,bottom:0,left:`${expectedPct}%`,width:1,background:"#ffffff22"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginTop:4}}>
          <span style={{color:ahead?"#4ade8077":"#ef444477"}}>{ahead?`En avance de ${pct-expectedPct}%`:`En retard de ${expectedPct-pct}%`}</span>
          <span style={{color:"#333"}}>Attendu: {expectedPct}%</span>
        </div>
        {lastSession&&<div style={{background:"#ffffff08",borderRadius:8,padding:"8px 12px",fontSize:11,marginTop:10}}><span style={{color:"#444"}}>Derniere position: </span><span style={{color:sec.color,fontWeight:600}}>{SURAHS.find(s=>s.n===lastSession.toSurah)?.name} - verset {lastSession.toVerse}</span></div>}
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Seances de lecture</div>
        {sessions.length===0?<div style={{textAlign:"center",color:"#333",fontSize:13,padding:"10px 0"}}>Aucune lecture ce mois</div>:
        [...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map((s,i)=>{
          const gFrom=globalVerse(s.fromSurah||1,s.fromVerse||1);
          const gTo=globalVerse(s.toSurah||1,s.toVerse||1);
          const cnt=Math.max(0,gTo-gFrom+1);
          const fName=SURAHS.find(x=>x.n===s.fromSurah)?.name||"";
          const tName=SURAHS.find(x=>x.n===s.toSurah)?.name||"";
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<5?"1px solid #1a1a1a":"none"}}>
              <div>
                <div style={{fontSize:12,color:"#ccc"}}>{s.mode==="point"?`Jusqu'a ${tName} ${s.toVerse}`:`${fName} ${s.fromVerse} → ${tName} ${s.toVerse}`}</div>
                <div style={{fontSize:10,color:"#444"}}>{s.date}</div>
              </div>
              <span style={{fontSize:10,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 8px"}}>{cnt} v.</span>
            </div>
          );
        })}
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${sec.colorDim},${sec.color}30)`,border:`1px solid ${sec.colorBorder}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:600}}>
        + Enregistrer une lecture
      </button>
    </div>
  );
}

function WirdSession({state,onSave,onDone}) {
  const sec=SECTIONS.wird;
  const mk=getMonthKey();
  const sessions=(state.wird||{})[mk]?.sessions||[];
  const lastSession=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const [mode,setMode]=useState("point");
  const [toSurah,setToSurah]=useState(lastSession?.toSurah||1);
  const [toVerse,setToVerse]=useState(lastSession?.toVerse||1);
  const [fromSurah,setFromSurah]=useState(lastSession?.toSurah||1);
  const [fromVerse,setFromVerse]=useState(lastSession?.toVerse||1);
  const [notes,setNotes]=useState("");
  const [saved,setSaved]=useState(false);
  const toSurahData=SURAHS.find(s=>s.n===toSurah);
  const fromSurahData=SURAHS.find(s=>s.n===fromSurah);
  const save=async()=>{
    const session={date:today(),mode,fromSurah:mode==="point"?(lastSession?.toSurah||1):fromSurah,fromVerse:mode==="point"?(lastSession?.toVerse||1):fromVerse,toSurah,toVerse,notes};
    await onSave(session);setSaved(true);setTimeout(onDone,1400);
  };
  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:44}}>✅</div><div style={{color:sec.color,fontSize:16,marginTop:12}}>Lecture enregistree !</div></div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:15}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل ورد</div>
        <div style={{fontSize:11,color:"#555"}}>Enregistrer une lecture</div>
      </div>
      {lastSession&&<div style={{background:sec.colorDim,border:`1px solid ${sec.colorBorder}`,borderRadius:8,padding:"10px 14px",fontSize:11}}><span style={{color:"#555"}}>Derniere position: </span><span style={{color:sec.color,fontWeight:600}}>{SURAHS.find(s=>s.n===lastSession.toSurah)?.name} - verset {lastSession.toVerse}</span></div>}
      <div style={{display:"flex",gap:8}}>
        {[{k:"point",l:"J'ai lu jusqu'a..."},{k:"range",l:"Du verset... au verset..."}].map(m=>(
          <button key={m.k} onClick={()=>setMode(m.k)} style={{flex:1,padding:"10px 8px",borderRadius:8,fontSize:11,cursor:"pointer",textAlign:"center",border:mode===m.k?`1px solid ${sec.color}`:"1px solid #222",background:mode===m.k?sec.colorDim:"#111",color:mode===m.k?sec.color:"#555",fontWeight:600}}>{m.l}</button>
        ))}
      </div>
      {mode==="range"&&(
        <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:10,padding:14}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>Debut de la lecture</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:2}}>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Sourate</div>
              <select value={fromSurah} onChange={e=>{setFromSurah(Number(e.target.value));setFromVerse(1);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none"}}>
                {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#444",marginBottom:4}}>Aya</div>
              <select value={fromVerse} onChange={e=>setFromVerse(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:14,outline:"none"}}>
                {Array.from({length:fromSurahData?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
      <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>{mode==="point"?"Je me suis arrete a...":"Fin de la lecture"}</div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:2}}>
            <div style={{fontSize:9,color:"#444",marginBottom:4}}>Sourate</div>
            <select value={toSurah} onChange={e=>{setToSurah(Number(e.target.value));setToVerse(1);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none"}}>
              {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:"#444",marginBottom:4}}>Aya</div>
            <select value={toVerse} onChange={e=>setToVerse(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:14,outline:"none"}}>
              {Array.from({length:toSurahData?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginTop:10,background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:8,padding:"8px 12px",fontSize:12,color:sec.color+"cc",textAlign:"center",fontWeight:600}}>
          {SURAHS.find(s=>s.n===toSurah)?.name} - verset {toVerse} / {toSurahData?.v}
        </div>
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..." style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",background:`linear-gradient(135deg,${sec.colorDim},${sec.color}40)`,border:`1px solid ${sec.colorBorder}`,color:sec.color}}>Enregistrer la lecture</button>
    </div>
  );
}

// LEADERBOARD & PROFILE
function Leaderboard({state}) {
  const [friends,setFriends]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const u=dbListen("leaderboard",data=>{if(data){const list=Object.entries(data).map(([uid,d])=>({uid,...d})).sort((a,b)=>(b.memorized||0)-(a.memorized||0));setFriends(list);}setLoading(false);});return u;},[]);
  useEffect(()=>{
    if(!state.profile?.name) return;
    const pm=state.surahProgress||{};
    const memorized=SURAHS.filter(s=>surahLearnedPct(pm[s.n]?.learnedRanges,s.v)===100).length;
    dbSet(`leaderboard/${UID}`,{name:state.profile.name,memorized,streak:state.streak?.count||0,updatedAt:today()});
  },[state.profile,state.surahProgress]);
  const shareLink=`${window.location.origin}${window.location.pathname}`;
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>المتسابقون</div>
        <div style={{fontSize:11,color:"#555"}}>Classement des freres</div>
      </div>
      <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:10,padding:14,marginBottom:16}}>
        <div style={{fontSize:11,color:"#60a5fa",marginBottom:6,fontWeight:600}}>Partage Thabaat</div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:"#111",border:"1px solid #1e1e1e",borderRadius:6,padding:"8px 10px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{shareLink}</div>
          <button onClick={()=>navigator.clipboard.writeText(shareLink).catch(()=>{})} style={{padding:"8px 12px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:11,cursor:"pointer"}}>Copier</button>
        </div>
      </div>
      {!state.profile?.name&&<div style={{background:"#1a1a0a",border:"1px solid #f59e0b33",borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:"#f59e0b"}}>Configure ton prenom dans Profil.</div>}
      {loading?<div style={{textAlign:"center",color:"#444",padding:30}}>Chargement...</div>:
      friends.length===0?<div style={{textAlign:"center",color:"#333",padding:30,fontSize:13}}>Aucun ami encore</div>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {friends.map((f,i)=>(
          <div key={f.uid} style={{background:f.uid===UID?"#111822":"#111",border:`1px solid ${f.uid===UID?"#60a5fa33":"#1a1a1a"}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:i===0?"#c9a84c22":i===1?"#88888822":"#0d0d0d",border:`1px solid ${i===0?"#c9a84c":i===1?"#888":"#222"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:i===0?"#c9a84c":i===1?"#aaa":"#444",flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:f.uid===UID?"#60a5fa":"#ccc",fontWeight:500}}>{f.name}{f.uid===UID?" (moi)":""}</div>
              <div style={{fontSize:10,color:"#444"}}>Streak: {f.streak||0} jours</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#60a5fa",fontFamily:"monospace"}}>{f.memorized||0}</div>
              <div style={{fontSize:9,color:"#444",textTransform:"uppercase"}}>memorisees</div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function ProfileView({state,persist}) {
  const profile=state.profile||{};
  const [name,setName]=useState(profile.name||"");
  const [saved,setSaved]=useState(false);
  const save=async()=>{await persist({...state,profile:{...profile,name}});setSaved(true);setTimeout(()=>setSaved(false),1500);};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>الملف الشخصي</div>
        <div style={{fontSize:11,color:"#555"}}>Profil et Parametres</div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:12,padding:16}}>
        <label style={{fontSize:10,color:"#555",textTransform:"uppercase",display:"block",marginBottom:8}}>Ton prenom</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ahmed, Ibrahim..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:12}}>Rappels</div>
        {[{key:"hifz",title:"Rappel Hifz",color:"#60a5fa"},{key:"muraja",title:"Rappel Muraja'a",color:"#f59e0b"},{key:"wird",title:"Rappel Wird",color:"#4ade80"}].map(rem=>{
          const r=state.reminders?.[rem.key]||{enabled:false,time:"06:00"};
          const upd=async(field,val)=>await persist({...state,reminders:{...state.reminders,[rem.key]:{...r,[field]:val}}});
          return (
            <div key={rem.key} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:r.enabled?10:0}}>
                <div style={{fontSize:13,color:"#ddd",fontWeight:500}}>{rem.title}</div>
                <div onClick={()=>upd("enabled",!r.enabled)} style={{width:40,height:22,borderRadius:11,background:r.enabled?rem.color:"#222",position:"relative",cursor:"pointer",transition:"background .3s"}}>
                  <div style={{position:"absolute",top:2,left:r.enabled?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
                </div>
              </div>
              {r.enabled&&<input type="time" value={r.time||"06:00"} onChange={e=>upd("time",e.target.value)} style={{background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"8px 12px",fontSize:18,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"monospace"}}/>}
            </div>
          );
        })}
      </div>
      <button onClick={save} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",background:saved?"#4ade8022":"linear-gradient(135deg,#c9a84c22,#c9a84c40)",border:saved?"1px solid #4ade8055":"1px solid #c9a84c55",color:saved?"#4ade80":"#c9a84c",transition:"all .3s"}}>
        {saved?"Sauvegarde !":"Sauvegarder"}
      </button>
    </div>
  );
}

// MAIN APP
export default function App() {
  const [state,setState]=useState(null);
  const [section,setSection]=useState("hifz");
  const [subTab,setSubTab]=useState("dashboard");
  const [globalTab,setGlobalTab]=useState("main");
  const [loading,setLoading]=useState(true);
  const correctorId=new URLSearchParams(window.location.search).get("corrector");
  if(correctorId) return <CorrectorView sessionId={correctorId}/>;
  useEffect(()=>{
    const u=dbListen(`users/${UID}`,data=>{
      setState(data||{surahProgress:{},murajaSessions:[],wird:{},streak:{count:0,lastDate:""},reminders:{hifz:{enabled:false,time:"06:00"},muraja:{enabled:false,time:"20:00"},wird:{enabled:false,time:"21:00"}},profile:{}});
      setLoading(false);
    });
    return u;
  },[]);
  const persist=async(ns)=>{setState(ns);await dbSet(`users/${UID}`,ns);};
  const onSaveHifz=async(surahKey,session,allRanges)=>{
    const pm=state.surahProgress||{};
    const existing=pm[surahKey]||{hifzSessions:[]};
    const newStreak=updateStreak(state.streak||{});
    await persist({...state,streak:newStreak,surahProgress:{...pm,[surahKey]:{...existing,learnedRanges:allRanges,hifzSessions:[session,...(existing.hifzSessions||[])]}}});
  };
  const onSaveMuraja=async(session)=>{
    const newStreak=updateStreak(state.streak||{});
    await persist({...state,streak:newStreak,murajaSessions:[session,...(state.murajaSessions||[])]});
  };
  const onSaveWird=async(session)=>{
    const mk=getMonthKey();
    const wird=state.wird||{};
    const monthData=wird[mk]||{goal:1,sessions:[]};
    const newStreak=updateStreak(state.streak||{});
    await persist({...state,streak:newStreak,wird:{...wird,[mk]:{...monthData,sessions:[session,...(monthData.sessions||[])]}}});
  };
  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={{fontFamily:"'Scheherazade New',serif",fontSize:40,color:"#c9a84c"}}>ثبات</div>
      <div style={{fontSize:11,color:"#333",letterSpacing:3,textTransform:"uppercase"}}>Chargement...</div>
    </div>
  );
  const sec=SECTIONS[section];
  const streak=state.streak||{count:0};
  const streakWarning=streak.count>0&&streak.lastDate!==today();
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#ddd",fontFamily:"'DM Sans',sans-serif",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg color={sec.color}/>
      <div style={{position:"sticky",top:0,zIndex:10,background:"#0a0a0aee",backdropFilter:"blur(10px)",borderBottom:"1px solid #181818",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:"#c9a84c",lineHeight:1}}>ثبات</div>
          <div style={{fontSize:9,color:"#444",letterSpacing:3,textTransform:"uppercase",marginTop:2}}>Thabaat</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:streakWarning?"#1a0a0a":"#111",border:`1px solid ${streakWarning?"#ef444433":"#c9a84c22"}`,borderRadius:20,padding:"5px 12px"}}>
          <span style={{fontSize:12}}>{streakWarning?"⚠":"🔥"}</span>
          <span style={{fontFamily:"monospace",fontWeight:700,color:streakWarning?"#ef4444":"#f59e0b",fontSize:13}}>{streak.count}j</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setGlobalTab(globalTab==="leaderboard"?"main":"leaderboard")} style={{width:32,height:32,borderRadius:8,background:globalTab==="leaderboard"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="leaderboard"?"#c9a84c44":"#222"}`,color:globalTab==="leaderboard"?"#c9a84c":"#444",fontSize:12,cursor:"pointer",fontWeight:700}}>C</button>
          <button onClick={()=>setGlobalTab(globalTab==="profile"?"main":"profile")} style={{width:32,height:32,borderRadius:8,background:globalTab==="profile"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="profile"?"#c9a84c44":"#222"}`,color:globalTab==="profile"?"#c9a84c":"#444",fontSize:12,cursor:"pointer",fontWeight:700}}>P</button>
        </div>
      </div>
      <div style={{padding:"16px 16px 120px",maxWidth:600,margin:"0 auto",position:"relative",zIndex:1}}>
        {globalTab!=="main"?(
          <>
            <button onClick={()=>setGlobalTab("main")} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:16,padding:0}}>← Retour</button>
            {globalTab==="leaderboard"&&<Leaderboard state={state}/>}
            {globalTab==="profile"&&<ProfileView state={state} persist={persist}/>}
          </>
        ):(
          <>
            <SectionTabs active={section} onChange={(s)=>{setSection(s);setSubTab("dashboard");}}/>
            {section==="hifz"&&subTab!=="session"&&(
              <div style={{display:"flex",gap:6,marginBottom:16}}>
                {[{id:"dashboard",l:"Tableau de bord"},{id:"list",l:"Toutes les sourates"}].map(t=>(
                  <button key={t.id} onClick={()=>setSubTab(t.id)} style={{flex:1,padding:"7px 10px",borderRadius:8,fontSize:11,cursor:"pointer",border:subTab===t.id?`1px solid ${sec.color}55`:"1px solid #1e1e1e",background:subTab===t.id?sec.colorDim:"#111",color:subTab===t.id?sec.color:"#444"}}>{t.l}</button>
                ))}
              </div>
            )}
            {section==="hifz"&&(
              <>
                {subTab==="dashboard"&&<HifzDashboard state={state} onNewSession={()=>setSubTab("session")}/>}
                {subTab==="list"&&<HifzList state={state}/>}
                {subTab==="session"&&(<><button onClick={()=>setSubTab("dashboard")} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:16,padding:0}}>← Retour</button><HifzSession state={state} onSave={onSaveHifz} onDone={()=>setSubTab("dashboard")}/></>)}
              </>
            )}
            {section==="muraja"&&(
              <>
                {subTab==="dashboard"&&<MurajaDashboard state={state} onNewSession={()=>setSubTab("session")}/>}
                {subTab==="session"&&(<><button onClick={()=>setSubTab("dashboard")} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:16,padding:0}}>← Retour</button><MurajaSession state={state} onSave={onSaveMuraja} onDone={()=>setSubTab("dashboard")}/></>)}
              </>
            )}
            {section==="wird"&&(
              <>
                {subTab==="dashboard"&&<WirdDashboard state={state} onNewSession={()=>setSubTab("session")} persist={persist}/>}
                {subTab==="session"&&(<><button onClick={()=>setSubTab("dashboard")} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:16,padding:0}}>← Retour</button><WirdSession state={state} onSave={onSaveWird} onDone={()=>setSubTab("dashboard")}/></>)}
              </>
            )}
          </>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,background:"#0d0d0df0",backdropFilter:"blur(12px)",borderTop:"1px solid #181818",padding:"10px 16px 22px"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",justifyContent:"space-around"}}>
          {Object.values(SECTIONS).map(s=>(
            <button key={s.id} onClick={()=>{setSection(s.id);setSubTab("dashboard");setGlobalTab("main");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 20px",color:section===s.id&&globalTab==="main"?s.color:"#2a2a2a",transition:"color .2s"}}>
              <span style={{fontSize:20}}>{s.icon}</span>
              <span style={{fontSize:8,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{s.label}</span>
              {section===s.id&&globalTab==="main"&&<div style={{width:20,height:2,borderRadius:1,background:s.color,marginTop:1}}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
