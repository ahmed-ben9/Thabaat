import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, off } from "firebase/database";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDA8RwTylDHLOkb9wiyR_GXYYY43Wm_XS8",
  authDomain: "thabaat-67a8f.firebaseapp.com",
  databaseURL: "https://thabaat-67a8f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "thabaat-67a8f",
  storageBucket: "thabaat-67a8f.firebasestorage.app",
  messagingSenderId: "615533784510",
  appId: "1:615533784510:web:e3771660f03009256b1def",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── DB HELPERS ───────────────────────────────────────────────────────────────
// Each user gets a unique ID stored in localStorage
function getUserId() {
  let id = localStorage.getItem("thabaat-uid");
  if (!id) { id = "user_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("thabaat-uid", id); }
  return id;
}
const UID = getUserId();

async function dbGet(path) {
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}
async function dbSet(path, value) {
  await set(ref(db, path), value);
}
function dbListen(path, cb) {
  const r = ref(db, path);
  onValue(r, snap => cb(snap.exists() ? snap.val() : null));
  return () => off(r);
}

// ─── SURAH DATA ───────────────────────────────────────────────────────────────
const SURAHS = [
  { n:1,  name:"Al-Fatiha",      ar:"الفاتحة",    v:7   },
  { n:2,  name:"Al-Baqara",      ar:"البقرة",     v:286 },
  { n:3,  name:"Ali 'Imran",     ar:"آل عمران",   v:200 },
  { n:4,  name:"An-Nisa",        ar:"النساء",     v:176 },
  { n:5,  name:"Al-Ma'ida",      ar:"المائدة",    v:120 },
  { n:6,  name:"Al-An'am",       ar:"الأنعام",    v:165 },
  { n:7,  name:"Al-A'raf",       ar:"الأعراف",    v:206 },
  { n:8,  name:"Al-Anfal",       ar:"الأنفال",    v:75  },
  { n:9,  name:"At-Tawba",       ar:"التوبة",     v:129 },
  { n:10, name:"Yunus",          ar:"يونس",       v:109 },
  { n:11, name:"Hud",            ar:"هود",        v:123 },
  { n:12, name:"Yusuf",          ar:"يوسف",       v:111 },
  { n:13, name:"Ar-Ra'd",        ar:"الرعد",      v:43  },
  { n:14, name:"Ibrahim",        ar:"إبراهيم",    v:52  },
  { n:15, name:"Al-Hijr",        ar:"الحجر",      v:99  },
  { n:16, name:"An-Nahl",        ar:"النحل",      v:128 },
  { n:17, name:"Al-Isra",        ar:"الإسراء",    v:111 },
  { n:18, name:"Al-Kahf",        ar:"الكهف",      v:110 },
  { n:19, name:"Maryam",         ar:"مريم",       v:98  },
  { n:20, name:"Ta-Ha",          ar:"طه",         v:135 },
  { n:21, name:"Al-Anbiya",      ar:"الأنبياء",   v:112 },
  { n:22, name:"Al-Hajj",        ar:"الحج",       v:78  },
  { n:23, name:"Al-Mu'minun",    ar:"المؤمنون",   v:118 },
  { n:24, name:"An-Nur",         ar:"النور",      v:64  },
  { n:25, name:"Al-Furqan",      ar:"الفرقان",    v:77  },
  { n:26, name:"Ash-Shu'ara",    ar:"الشعراء",    v:227 },
  { n:27, name:"An-Naml",        ar:"النمل",      v:93  },
  { n:28, name:"Al-Qasas",       ar:"القصص",      v:88  },
  { n:29, name:"Al-'Ankabut",    ar:"العنكبوت",   v:69  },
  { n:30, name:"Ar-Rum",         ar:"الروم",      v:60  },
  { n:31, name:"Luqman",         ar:"لقمان",      v:34  },
  { n:32, name:"As-Sajda",       ar:"السجدة",     v:30  },
  { n:33, name:"Al-Ahzab",       ar:"الأحزاب",    v:73  },
  { n:34, name:"Saba",           ar:"سبأ",        v:54  },
  { n:35, name:"Fatir",          ar:"فاطر",       v:45  },
  { n:36, name:"Ya-Sin",         ar:"يس",         v:83  },
  { n:37, name:"As-Saffat",      ar:"الصافات",    v:182 },
  { n:38, name:"Sad",            ar:"ص",          v:88  },
  { n:39, name:"Az-Zumar",       ar:"الزمر",      v:75  },
  { n:40, name:"Ghafir",         ar:"غافر",       v:85  },
  { n:41, name:"Fussilat",       ar:"فصلت",       v:54  },
  { n:42, name:"Ash-Shura",      ar:"الشورى",     v:53  },
  { n:43, name:"Az-Zukhruf",     ar:"الزخرف",     v:89  },
  { n:44, name:"Ad-Dukhan",      ar:"الدخان",     v:59  },
  { n:45, name:"Al-Jathiya",     ar:"الجاثية",    v:37  },
  { n:46, name:"Al-Ahqaf",       ar:"الأحقاف",    v:35  },
  { n:47, name:"Muhammad",       ar:"محمد",       v:38  },
  { n:48, name:"Al-Fath",        ar:"الفتح",      v:29  },
  { n:49, name:"Al-Hujurat",     ar:"الحجرات",    v:18  },
  { n:50, name:"Qaf",            ar:"ق",          v:45  },
  { n:51, name:"Adh-Dhariyat",   ar:"الذاريات",   v:60  },
  { n:52, name:"At-Tur",         ar:"الطور",      v:49  },
  { n:53, name:"An-Najm",        ar:"النجم",      v:62  },
  { n:54, name:"Al-Qamar",       ar:"القمر",      v:55  },
  { n:55, name:"Ar-Rahman",      ar:"الرحمن",     v:78  },
  { n:56, name:"Al-Waqi'a",      ar:"الواقعة",    v:96  },
  { n:57, name:"Al-Hadid",       ar:"الحديد",     v:29  },
  { n:58, name:"Al-Mujadila",    ar:"المجادلة",   v:22  },
  { n:59, name:"Al-Hashr",       ar:"الحشر",      v:24  },
  { n:60, name:"Al-Mumtahana",   ar:"الممتحنة",   v:13  },
  { n:61, name:"As-Saf",         ar:"الصف",       v:14  },
  { n:62, name:"Al-Jumu'a",      ar:"الجمعة",     v:11  },
  { n:63, name:"Al-Munafiqun",   ar:"المنافقون",  v:11  },
  { n:64, name:"At-Taghabun",    ar:"التغابن",    v:18  },
  { n:65, name:"At-Talaq",       ar:"الطلاق",     v:12  },
  { n:66, name:"At-Tahrim",      ar:"التحريم",    v:12  },
  { n:67, name:"Al-Mulk",        ar:"الملك",      v:30  },
  { n:68, name:"Al-Qalam",       ar:"القلم",      v:52  },
  { n:69, name:"Al-Haqqa",       ar:"الحاقة",     v:52  },
  { n:70, name:"Al-Ma'arij",     ar:"المعارج",    v:44  },
  { n:71, name:"Nuh",            ar:"نوح",        v:28  },
  { n:72, name:"Al-Jinn",        ar:"الجن",       v:28  },
  { n:73, name:"Al-Muzzammil",   ar:"المزمل",     v:20  },
  { n:74, name:"Al-Muddaththir", ar:"المدثر",     v:56  },
  { n:75, name:"Al-Qiyama",      ar:"القيامة",    v:40  },
  { n:76, name:"Al-Insan",       ar:"الإنسان",    v:31  },
  { n:77, name:"Al-Mursalat",    ar:"المرسلات",   v:50  },
  { n:78, name:"An-Naba",        ar:"النبأ",      v:40  },
  { n:79, name:"An-Nazi'at",     ar:"النازعات",   v:46  },
  { n:80, name:"Abasa",          ar:"عبس",        v:42  },
  { n:81, name:"At-Takwir",      ar:"التكوير",    v:29  },
  { n:82, name:"Al-Infitar",     ar:"الانفطار",   v:19  },
  { n:83, name:"Al-Mutaffifin",  ar:"المطففين",   v:36  },
  { n:84, name:"Al-Inshiqaq",    ar:"الانشقاق",   v:25  },
  { n:85, name:"Al-Buruj",       ar:"البروج",     v:22  },
  { n:86, name:"At-Tariq",       ar:"الطارق",     v:17  },
  { n:87, name:"Al-A'la",        ar:"الأعلى",     v:19  },
  { n:88, name:"Al-Ghashiya",    ar:"الغاشية",    v:26  },
  { n:89, name:"Al-Fajr",        ar:"الفجر",      v:30  },
  { n:90, name:"Al-Balad",       ar:"البلد",      v:20  },
  { n:91, name:"Ash-Shams",      ar:"الشمس",      v:15  },
  { n:92, name:"Al-Layl",        ar:"الليل",      v:21  },
  { n:93, name:"Ad-Duha",        ar:"الضحى",      v:11  },
  { n:94, name:"Ash-Sharh",      ar:"الشرح",      v:8   },
  { n:95, name:"At-Tin",         ar:"التين",      v:8   },
  { n:96, name:"Al-'Alaq",       ar:"العلق",      v:19  },
  { n:97, name:"Al-Qadr",        ar:"القدر",      v:5   },
  { n:98, name:"Al-Bayyina",     ar:"البينة",     v:8   },
  { n:99, name:"Az-Zalzala",     ar:"الزلزلة",    v:8   },
  { n:100,name:"Al-'Adiyat",     ar:"العاديات",   v:11  },
  { n:101,name:"Al-Qari'a",      ar:"القارعة",    v:11  },
  { n:102,name:"At-Takathur",    ar:"التكاثر",    v:8   },
  { n:103,name:"Al-'Asr",        ar:"العصر",      v:3   },
  { n:104,name:"Al-Humaza",      ar:"الهمزة",     v:9   },
  { n:105,name:"Al-Fil",         ar:"الفيل",      v:5   },
  { n:106,name:"Quraysh",        ar:"قريش",       v:4   },
  { n:107,name:"Al-Ma'un",       ar:"الماعون",    v:7   },
  { n:108,name:"Al-Kawthar",     ar:"الكوثر",     v:3   },
  { n:109,name:"Al-Kafirun",     ar:"الكافرون",   v:6   },
  { n:110,name:"An-Nasr",        ar:"النصر",      v:3   },
  { n:111,name:"Al-Masad",       ar:"المسد",      v:5   },
  { n:112,name:"Al-Ikhlas",      ar:"الإخلاص",    v:4   },
  { n:113,name:"Al-Falaq",       ar:"الفلق",      v:5   },
  { n:114,name:"An-Nas",         ar:"الناس",      v:6   },
];

const HIZBS = Array.from({length:60},(_,i)=>({ n:i+1, name:`Hizb ${i+1}`, ar:`الحزب ${i+1}`, v:64 }));

const STATUS = {
  none:      { label:"Non commencé",  dot:"#333"    },
  learning:  { label:"Hifz en cours", dot:"#4ade80" },
  memorized: { label:"Mémorisé ✓",    dot:"#60a5fa" },
  reviewing: { label:"Muraja'a",      dot:"#f59e0b" },
};
const MASTERY = {
  low:    { label:"Faible", color:"#ef4444" },
  medium: { label:"Moyen",  color:"#f59e0b" },
  high:   { label:"Fort",   color:"#4ade80" },
};

function today() { return new Date().toISOString().slice(0,10); }
function genId()  { return Math.random().toString(36).slice(2,10); }

function getAllSessions(pm) {
  const s=[];
  Object.entries(pm||{}).forEach(([k,v])=>(v.sessions||[]).forEach(x=>s.push({...x,itemKey:k})));
  return s.sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function updateStreak(streak) {
  const td=today();
  if(streak?.lastDate===td) return streak;
  const y=new Date(); y.setDate(y.getDate()-1);
  const ys=y.toISOString().slice(0,10);
  return { count: streak?.lastDate===ys ? (streak.count||0)+1 : 1, lastDate:td };
}
function getWeekly(pm) {
  const days=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10));}
  return days.map(d=>{
    const ss=getAllSessions(pm).filter(s=>s.date===d);
    return {d:d.slice(5), sessions:ss.length, errors:ss.reduce((a,s)=>a+Object.keys(s.verseErrors||{}).length,0)};
  });
}

// ─── GEO BG ───────────────────────────────────────────────────────────────────
function GeoBg() {
  return (
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.03,pointerEvents:"none",zIndex:0}} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="g" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="40,2 78,21 78,59 40,78 2,59 2,21" fill="none" stroke="#c9a84c" strokeWidth="0.7"/>
        <polygon points="40,14 66,28 66,52 40,66 14,52 14,28" fill="none" stroke="#c9a84c" strokeWidth="0.3"/>
        <circle cx="40" cy="40" r="5" fill="none" stroke="#c9a84c" strokeWidth="0.3"/>
      </pattern></defs>
      <rect width="600" height="600" fill="url(#g)"/>
    </svg>
  );
}

// ─── VERSE ERROR PICKER ───────────────────────────────────────────────────────
function VerseErrorPicker({ totalVerses, verseErrors, onChange, readOnly=false }) {
  const [editingVerse, setEditingVerse] = useState(null);
  const [noteText, setNoteText] = useState("");
  const toggle = (v) => {
    if(readOnly) return;
    if(verseErrors[v]) { const n={...verseErrors}; delete n[v]; onChange(n); }
    else { setEditingVerse(v); setNoteText(""); }
  };
  const confirmNote = () => { onChange({...verseErrors,[editingVerse]:noteText}); setEditingVerse(null); };
  return (
    <div>
      <div style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>
        Versets — touche pour marquer une erreur ({Object.keys(verseErrors).length} akhtaa)
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
        {Array.from({length:totalVerses},(_,i)=>i+1).map(v=>{
          const has=!!verseErrors[v];
          return (
            <button key={v} onClick={()=>toggle(v)} style={{
              width:34,height:34,borderRadius:6,fontSize:11,fontWeight:600,
              cursor:readOnly?"default":"pointer",
              border:has?"1.5px solid #ef4444":"1px solid #222",
              background:has?"#ef444422":"#111",
              color:has?"#ef4444":"#444", position:"relative",
            }}>
              {v}
              {has&&verseErrors[v]&&<span style={{position:"absolute",top:-3,right:-3,width:6,height:6,borderRadius:"50%",background:"#f59e0b"}}/>}
            </button>
          );
        })}
      </div>
      {editingVerse&&(
        <div style={{background:"#0d0d0d",border:"1px solid #c9a84c44",borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{fontSize:12,color:"#c9a84c",marginBottom:8}}>Note pour le verset {editingVerse} (optionnel)</div>
          <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="ex: tajwid, oublié, hésitation…"
            style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:6,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box"}}
          />
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={confirmNote} style={{flex:1,padding:7,background:"#ef444422",border:"1px solid #ef444455",borderRadius:6,color:"#ef4444",fontSize:12,cursor:"pointer"}}>Marquer ✗</button>
            <button onClick={()=>setEditingVerse(null)} style={{flex:1,padding:7,background:"#111",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:12,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
      {Object.keys(verseErrors).length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {Object.entries(verseErrors).sort((a,b)=>Number(a[0])-Number(b[0])).map(([v,note])=>(
            <div key={v} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#111",border:"1px solid #1a1a1a",borderRadius:7,padding:"6px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#ef4444",fontWeight:700,fontFamily:"monospace",fontSize:12}}>v.{v}</span>
                {note&&<span style={{fontSize:11,color:"#888",fontStyle:"italic"}}>{note}</span>}
              </div>
              {!readOnly&&<button onClick={()=>{const n={...verseErrors};delete n[v];onChange(n);}} style={{background:"transparent",border:"none",color:"#444",cursor:"pointer",fontSize:16}}>×</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CORRECTOR VIEW ───────────────────────────────────────────────────────────
function CorrectorView({ sessionId }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const unsub = dbListen(`sessions/${sessionId}`, data => {
      setSession(data);
      setLoading(false);
    });
    return unsub;
  },[sessionId]);

  const updateErrors = async (verseErrors) => {
    await dbSet(`sessions/${sessionId}/verseErrors`, verseErrors);
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"#c9a84c",fontFamily:"'Scheherazade New',serif",fontSize:24}}>بِسْمِ اللَّهِ…</div>
    </div>
  );
  if(!session) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:40}}>❌</div>
      <div style={{color:"#666",fontSize:14}}>Session introuvable</div>
    </div>
  );

  const items = session.mode==="surah" ? SURAHS : HIZBS;
  const item = items.find(i=>i.n===Number(session.itemKey));

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#ddd",fontFamily:"'DM Sans','Segoe UI',sans-serif",padding:"20px 16px 40px",maxWidth:500,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>وضع المصحح</div>
          <div style={{fontSize:11,color:"#555",marginTop:2,letterSpacing:2,textTransform:"uppercase"}}>Mode Correcteur — Thabaat</div>
        </div>
        <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:16,color:"#ddd",fontWeight:600}}>{session.itemName}</div>
          <div style={{fontSize:11,color:"#555",marginTop:2}}>{session.date} · {session.type==="solo"?"Solo":`Avec ${session.partner||"quelqu'un"}`}</div>
        </div>
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:12,padding:16,marginBottom:16}}>
          <VerseErrorPicker totalVerses={item?.v||10} verseErrors={session.verseErrors||{}} onChange={updateErrors}/>
        </div>
        <div style={{background:"#0d3320",border:"1px solid #4ade8033",borderRadius:10,padding:14,fontSize:12,color:"#4ade80",textAlign:"center"}}>
          ✓ Synchronisation en temps réel — Barakallahu fik
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ state, onNav }) {
  const items=state.mode==="surah"?SURAHS:HIZBS;
  const pm=state.mode==="surah"?state.surahProgress:state.hizbProgress;
  const total=items.length;
  const memorized=items.filter(i=>pm[i.n]?.status==="memorized").length;
  const learning=items.filter(i=>pm[i.n]?.status==="learning").length;
  const reviewing=items.filter(i=>pm[i.n]?.status==="reviewing").length;
  const pct=Math.round((memorized/total)*100);
  const streak=state.streak||{count:0};
  const weekly=getWeekly(pm);
  const recent=getAllSessions(pm).slice(0,4);
  const verseFreq={};
  getAllSessions(pm).forEach(s=>Object.keys(s.verseErrors||{}).forEach(v=>{
    verseFreq[`${s.itemName} v.${v}`]=(verseFreq[`${s.itemName} v.${v}`]||0)+1;
  }));
  const topIssues=Object.entries(verseFreq).sort((a,b)=>b[1]-a[1]).slice(0,3);

  return (
    <div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c",letterSpacing:1}}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
        <div style={{fontSize:10,color:"#444",marginTop:4,letterSpacing:3,textTransform:"uppercase"}}>Thabaat — ثبات</div>
      </div>
      <div style={{background:"linear-gradient(135deg,#1a110a,#2a1a0a)",border:"1px solid #c9a84c33",borderRadius:12,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:30}}>🔥</div>
        <div>
          <div style={{fontSize:22,fontWeight:700,color:"#f59e0b",fontFamily:"monospace"}}>{streak.count} jour{streak.count!==1?"s":""}</div>
          <div style={{fontSize:11,color:"#7a5a30",marginTop:1}}>Streak — Istimrâriya</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"Mémorisés",val:memorized,color:"#60a5fa"},{label:"Hifz",val:learning,color:"#4ade80"},{label:"Muraja'a",val:reviewing,color:"#f59e0b"},{label:"Taqaddum",val:`${pct}%`,color:"#c9a84c"}].map(c=>(
          <div key={c.label} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.color}}/>
            <div style={{fontSize:20,fontWeight:700,color:c.color,fontFamily:"monospace"}}>{c.val}</div>
            <div style={{fontSize:9,color:"#444",marginTop:2,textTransform:"uppercase",letterSpacing:0.5}}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#555",marginBottom:4}}><span>Taqaddum</span><span style={{color:"#c9a84c"}}>{pct}%</span></div>
        <div style={{height:4,background:"#1a1a1a",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#c9a84c,#f0d080)",borderRadius:4,transition:"width .6s"}}/></div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:14,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",marginBottom:10,letterSpacing:2,textTransform:"uppercase"}}>Résumé hebdomadaire</div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={weekly} barSize={12}>
            <XAxis dataKey="d" tick={{fontSize:8,fill:"#444"}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#0d0d0d",border:"1px solid #222",borderRadius:6,fontSize:10}}/>
            <Bar dataKey="sessions" fill="#c9a84c55" radius={[3,3,0,0]} name="Séances"/>
            <Bar dataKey="errors" fill="#ef444433" radius={[3,3,0,0]} name="Akhtaa"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {topIssues.length>0&&(
        <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{fontSize:10,color:"#555",marginBottom:10,letterSpacing:2,textTransform:"uppercase"}}>Versets récurrents</div>
          {topIssues.map(([k,count],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<topIssues.length-1?"1px solid #1a1a1a":"none"}}>
              <span style={{fontSize:12,color:"#ccc"}}>{k}</span>
              <span style={{fontSize:11,color:"#ef4444",fontFamily:"monospace"}}>{count}×</span>
            </div>
          ))}
        </div>
      )}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:14,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",marginBottom:10,letterSpacing:2,textTransform:"uppercase"}}>Derniers Majalis</div>
        {recent.length===0?<div style={{textAlign:"center",color:"#333",fontSize:13,padding:"12px 0"}}>Aucune séance encore 📖</div>:
        recent.map((s,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<recent.length-1?"1px solid #1a1a1a":"none"}}>
            <div>
              <div style={{fontSize:12,color:"#ccc"}}>{s.itemName}</div>
              <div style={{fontSize:10,color:"#444",marginTop:1}}>{s.date} · {s.type==="solo"?"Solo":`Avec ${s.partner||"cheikh"}`}</div>
            </div>
            <span style={{fontSize:12,color:Object.keys(s.verseErrors||{}).length>0?"#f59e0b":"#4ade80",fontFamily:"monospace"}}>{Object.keys(s.verseErrors||{}).length} ✗</span>
          </div>
        ))}
      </div>
      <button onClick={()=>onNav("session")} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#c9a84c15,#c9a84c30)",border:"1px solid #c9a84c44",borderRadius:10,color:"#c9a84c",fontSize:14,cursor:"pointer",fontWeight:600,letterSpacing:1}}>
        + Nouveau Majlis
      </button>
    </div>
  );
}

// ─── ITEM LIST ────────────────────────────────────────────────────────────────
function ItemList({ state, updateField }) {
  const items=state.mode==="surah"?SURAHS:HIZBS;
  const pk=state.mode==="surah"?"surahProgress":"hizbProgress";
  const pm=state[pk]||{};
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const filtered=items.filter(item=>{
    const ms=item.name.toLowerCase().includes(search.toLowerCase())||String(item.n).includes(search);
    const st=pm[item.n]?.status||"none";
    return ms&&(filter==="all"||st===filter);
  });
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"
          style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"8px 12px",fontSize:13,outline:"none"}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{background:"#111",border:"1px solid #222",borderRadius:8,color:"#888",padding:"8px",fontSize:11,outline:"none"}}>
          <option value="all">Tous</option>
          {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {filtered.map(item=>{
          const entry=pm[item.n]||{};
          const st=entry.status||"none";
          const mastery=entry.mastery||"";
          const ns=entry.sessions?.length||0;
          const s=STATUS[st];
          return (
            <div key={item.n} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"11px 12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#444",flexShrink:0}}>{item.n}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <span style={{fontSize:13,color:"#ccc",fontWeight:500}}>{item.name}</span>
                    <span style={{fontFamily:"'Scheherazade New',serif",fontSize:13,color:"#c9a84c33"}}>{item.ar}</span>
                  </div>
                  <div style={{display:"flex",gap:5,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:9,color:"#555",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:20,padding:"1px 7px"}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:s.dot}}/>{s.label}
                    </span>
                    {mastery&&<span style={{fontSize:9,color:MASTERY[mastery].color,background:MASTERY[mastery].color+"11",border:`1px solid ${MASTERY[mastery].color}33`,borderRadius:20,padding:"1px 7px"}}>{MASTERY[mastery].label}</span>}
                    {ns>0&&<span style={{fontSize:9,color:"#333"}}>{ns} séance{ns>1?"s":""}</span>}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <select value={st} onChange={e=>updateField(pk,item.n,"status",e.target.value)}
                  style={{flex:2,background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:6,color:"#777",fontSize:10,padding:"5px 6px",outline:"none",cursor:"pointer"}}>
                  {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={mastery} onChange={e=>updateField(pk,item.n,"mastery",e.target.value||null)}
                  style={{flex:1,background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:6,color:"#777",fontSize:10,padding:"5px 6px",outline:"none",cursor:"pointer"}}>
                  <option value="">Maîtrise</option>
                  {Object.entries(MASTERY).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SESSION LOGGER ───────────────────────────────────────────────────────────
function SessionLogger({ state, onSave, onDone }) {
  const items=state.mode==="surah"?SURAHS:HIZBS;
  const [sel,setSel]=useState("");
  const [type,setType]=useState("solo");
  const [partner,setPartner]=useState("");
  const [verseErrors,setVerseErrors]=useState({});
  const [notes,setNotes]=useState("");
  const [saved,setSaved]=useState(false);
  const [shareLink,setShareLink]=useState(null);
  const [sessionId]=useState(()=>genId());
  const item=items.find(i=>i.n===Number(sel));

  useEffect(()=>{
    if(type==="sheikh"&&sel&&item){
      const sessionData={ itemKey:sel, itemName:item.name, mode:state.mode, date:today(), type, partner, verseErrors:{}, notes };
      dbSet(`sessions/${sessionId}`, sessionData);
      setShareLink(`${window.location.origin}${window.location.pathname}?corrector=${sessionId}`);
    } else { setShareLink(null); }
  },[type,sel]);

  // Poll Firebase for corrector updates
  useEffect(()=>{
    if(type!=="sheikh"||!sel) return;
    const unsub=dbListen(`sessions/${sessionId}/verseErrors`, data => {
      if(data) setVerseErrors(data);
    });
    return unsub;
  },[type,sel]);

  const save = async () => {
    if(!sel) return;
    const session={ date:today(), type, partner:type==="solo"?null:partner, errors:Object.keys(verseErrors).length, verseErrors, notes, itemName:item.name };
    await onSave(sel, session);
    setSaved(true);
    setTimeout(onDone, 1400);
  };

  if(saved) return (
    <div style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:44}}>✅</div>
      <div style={{color:"#4ade80",fontSize:16,marginTop:12}}>Majlis enregistré !</div>
      <div style={{fontFamily:"'Scheherazade New',serif",color:"#c9a84c66",fontSize:20,marginTop:8}}>بارك الله فيك</div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:15}}>
      <div style={{textAlign:"center",marginBottom:4}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>تسجيل مجلس</div>
        <div style={{fontSize:11,color:"#555",marginTop:2}}>Enregistrer une séance</div>
      </div>
      <div>
        <label style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>{state.mode==="surah"?"Sourate":"Hizb"}</label>
        <select value={sel} onChange={e=>{setSel(e.target.value);setVerseErrors({});}} style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none"}}>
          <option value="">Sélectionner…</option>
          {items.map(i=><option key={i.n} value={i.n}>{i.n}. {i.name}</option>)}
        </select>
      </div>
      <div>
        <label style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Type de Majlis</label>
        <div style={{display:"flex",gap:8}}>
          {[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=>(
            <button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:10,borderRadius:8,fontSize:13,cursor:"pointer",border:type===t.k?"1px solid #c9a84c":"1px solid #222",background:type===t.k?"#c9a84c22":"#111",color:type===t.k?"#c9a84c":"#555"}}>{t.l}</button>
          ))}
        </div>
        {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom du cheikh / de la personne"
          style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",marginTop:8,boxSizing:"border-box"}}/>}
      </div>
      {type==="sheikh"&&sel&&shareLink&&(
        <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:10,padding:14}}>
          <div style={{fontSize:11,color:"#60a5fa",marginBottom:6,fontWeight:600}}>🔗 Lien pour le correcteur</div>
          <div style={{fontSize:10,color:"#555",marginBottom:8}}>Partage ce lien — il peut noter les erreurs directement sans créer de compte. Synchronisation en temps réel.</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"#111",border:"1px solid #1e1e1e",borderRadius:6,padding:"8px 10px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{shareLink}</div>
            <button onClick={()=>navigator.clipboard.writeText(shareLink).catch(()=>{})} style={{padding:"8px 12px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:11,cursor:"pointer",flexShrink:0}}>Copier</button>
          </div>
        </div>
      )}
      {sel&&(
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:14}}>
          <VerseErrorPicker totalVerses={item?.v||10} verseErrors={verseErrors} onChange={setVerseErrors}/>
        </div>
      )}
      <div>
        <label style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Notes (facultatif)</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Observations générales…"
          style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      </div>
      <button onClick={save} disabled={!sel} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:600,letterSpacing:1,cursor:sel?"pointer":"not-allowed",background:sel?"linear-gradient(135deg,#c9a84c22,#c9a84c40)":"#111",border:sel?"1px solid #c9a84c55":"1px solid #1a1a1a",color:sel?"#c9a84c":"#333"}}>
        Enregistrer le Majlis ✓
      </button>
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function History({ state, updateSession }) {
  const pk=state.mode==="surah"?"surahProgress":"hizbProgress";
  const pm=state[pk]||{};
  const sessions=getAllSessions(pm);
  const items=state.mode==="surah"?SURAHS:HIZBS;
  const [editing,setEditing]=useState(null);
  const [editErrors,setEditErrors]=useState({});
  const [editNotes,setEditNotes]=useState("");
  const startEdit=s=>{setEditing(s);setEditErrors(s.verseErrors||{});setEditNotes(s.notes||"");};
  const saveEdit=async()=>{
    await updateSession(pk,editing,editErrors,editNotes);
    setEditing(null);
  };
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>المجالس</div>
        <div style={{fontSize:11,color:"#555",marginTop:2}}>Al-Majalis — Historique</div>
      </div>
      {sessions.length===0?<div style={{textAlign:"center",color:"#333",padding:40,fontSize:13}}>Aucune séance enregistrée</div>:
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {sessions.map((s,i)=>{
          const errCount=Object.keys(s.verseErrors||{}).length||0;
          const itm=items.find(x=>x.n===Number(s.itemKey));
          return (
            <div key={i} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:14}}>
              {editing&&editing.date===s.date&&editing.itemName===s.itemName?(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{fontSize:13,color:"#ccc",fontWeight:500}}>{s.itemName}</div>
                  <VerseErrorPicker totalVerses={itm?.v||10} verseErrors={editErrors} onChange={setEditErrors}/>
                  <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={2}
                    style={{background:"#0d0d0d",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:8,fontSize:12,outline:"none",resize:"none",fontFamily:"inherit"}}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={saveEdit} style={{flex:1,padding:8,background:"#c9a84c22",border:"1px solid #c9a84c44",borderRadius:6,color:"#c9a84c",fontSize:12,cursor:"pointer"}}>Sauvegarder</button>
                    <button onClick={()=>setEditing(null)} style={{flex:1,padding:8,background:"#111",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:12,cursor:"pointer"}}>Annuler</button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:"#ccc",fontWeight:500}}>{s.itemName}</div>
                      <div style={{fontSize:10,color:"#444",marginTop:2}}>{s.date} · {s.type==="solo"?"Solo":`Avec ${s.partner||"quelqu'un"}`}</div>
                      {s.notes&&<div style={{fontSize:10,color:"#555",marginTop:4,fontStyle:"italic"}}>{s.notes}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                      <span style={{fontSize:13,color:errCount>0?"#f59e0b":"#4ade80",fontFamily:"monospace",fontWeight:700}}>{errCount} ✗</span>
                      <button onClick={()=>startEdit(s)} style={{background:"transparent",border:"1px solid #222",borderRadius:5,color:"#444",fontSize:10,padding:"2px 8px",cursor:"pointer"}}>Éditer</button>
                    </div>
                  </div>
                  {Object.keys(s.verseErrors||{}).length>0&&(
                    <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4}}>
                      {Object.entries(s.verseErrors||{}).sort((a,b)=>Number(a[0])-Number(b[0])).map(([v,note])=>(
                        <span key={v} title={note||""} style={{background:"#ef444422",border:"1px solid #ef444433",borderRadius:5,padding:"2px 7px",fontSize:10,color:"#ef4444"}}>v.{v}{note?" 📝":""}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>}
    </div>
  );
}

// ─── REMINDERS ────────────────────────────────────────────────────────────────
function Reminders({ state, updateReminder }) {
  const r=state.reminders||{hifz:{enabled:false,time:"06:00"},muraja:{enabled:false,time:"20:00"}};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{textAlign:"center",marginBottom:4}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>تذكير</div>
        <div style={{fontSize:11,color:"#555",marginTop:2}}>Tathkir — Rappels quotidiens</div>
      </div>
      {[{key:"hifz",title:"Rappel Hifz",sub:"Nouvelle mémorisation",icon:"📖",color:"#60a5fa"},{key:"muraja",title:"Rappel Muraja'a",sub:"Révision quotidienne",icon:"🔄",color:"#f59e0b"}].map(rem=>(
        <div key={rem.key} style={{background:"#111",border:`1px solid ${r[rem.key]?.enabled?rem.color+"44":"#1e1e1e"}`,borderRadius:14,padding:20,transition:"border-color .3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{rem.icon}</span><span style={{fontSize:15,color:"#ddd",fontWeight:600}}>{rem.title}</span></div>
              <div style={{fontSize:11,color:"#555",marginTop:2,paddingLeft:28}}>{rem.sub}</div>
            </div>
            <div onClick={()=>updateReminder(rem.key,"enabled",!r[rem.key]?.enabled)} style={{width:44,height:24,borderRadius:12,background:r[rem.key]?.enabled?rem.color:"#222",position:"relative",cursor:"pointer",transition:"background .3s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:r[rem.key]?.enabled?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .3s",boxShadow:"0 1px 4px #0009"}}/>
            </div>
          </div>
          <input type="time" value={r[rem.key]?.time||"06:00"} onChange={e=>updateReminder(rem.key,"time",e.target.value)} disabled={!r[rem.key]?.enabled}
            style={{background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:r[rem.key]?.enabled?"#ddd":"#333",padding:"10px 14px",fontSize:20,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"monospace",cursor:r[rem.key]?.enabled?"pointer":"not-allowed"}}
          />
          {r[rem.key]?.enabled&&<div style={{marginTop:10,padding:"8px 12px",background:rem.color+"11",border:`1px solid ${rem.color}22`,borderRadius:8,fontSize:12,color:rem.color+"cc"}}>✓ Rappel activé à {r[rem.key].time} chaque jour</div>}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const correctorId = new URLSearchParams(window.location.search).get("corrector");
  if(correctorId) return <CorrectorView sessionId={correctorId}/>;

  // Load user data from Firebase on mount
  useEffect(()=>{
    const unsub = dbListen(`users/${UID}`, data => {
      if(data) setState(data);
      else setState({
        mode:"surah", surahProgress:{}, hizbProgress:{},
        streak:{count:0,lastDate:""}, reminders:{hifz:{enabled:false,time:"06:00"},muraja:{enabled:false,time:"20:00"}}
      });
      setLoading(false);
    });
    return unsub;
  },[]);

  const persist = async (newState) => {
    setState(newState);
    await dbSet(`users/${UID}`, newState);
  };

  const updateField = async (pk, itemN, field, val) => {
    const newState = { ...state, [pk]: { ...state[pk], [itemN]: { ...state[pk]?.[itemN], [field]: val } } };
    await persist(newState);
  };

  const onSaveSession = async (sel, session) => {
    const pk = state.mode==="surah"?"surahProgress":"hizbProgress";
    const existing = state[pk]?.[sel] || { status:"learning", sessions:[] };
    const newStreak = updateStreak(state.streak||{});
    const newState = {
      ...state, streak: newStreak,
      [pk]: { ...state[pk], [sel]: { ...existing, sessions:[session,...(existing.sessions||[])] } }
    };
    await persist(newState);
  };

  const updateSession = async (pk, editing, editErrors, editNotes) => {
    const itemEntry = state[pk]?.[editing.itemKey];
    const newSessions = (itemEntry?.sessions||[]).map(s =>
      s.date===editing.date && s.itemName===editing.itemName
        ? {...s, verseErrors:editErrors, errors:Object.keys(editErrors).length, notes:editNotes} : s
    );
    const newState = { ...state, [pk]: { ...state[pk], [editing.itemKey]: { ...itemEntry, sessions:newSessions } } };
    await persist(newState);
  };

  const updateReminder = async (key, field, val) => {
    const newState = { ...state, reminders: { ...state.reminders, [key]: { ...state.reminders?.[key], [field]: val } } };
    await persist(newState);
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontFamily:"'Scheherazade New',serif",fontSize:32,color:"#c9a84c"}}>ثبات</div>
      <div style={{fontSize:11,color:"#444",letterSpacing:3,textTransform:"uppercase"}}>Chargement…</div>
    </div>
  );

  const tabs=[
    {id:"dashboard",label:"Tableau",icon:"◈"},
    {id:"list",label:state.mode==="surah"?"Sourates":"Hizbs",icon:"☰"},
    {id:"session",label:"Majlis",icon:"✎"},
    {id:"history",label:"Historique",icon:"◷"},
    {id:"reminders",label:"Tathkir",icon:"◉"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#ddd",fontFamily:"'DM Sans','Segoe UI',sans-serif",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg/>
      <div style={{position:"sticky",top:0,zIndex:10,background:"#0a0a0aee",backdropFilter:"blur(10px)",borderBottom:"1px solid #181818",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:"#c9a84c",lineHeight:1}}>ثبات</div>
          <div style={{fontSize:9,color:"#444",letterSpacing:3,textTransform:"uppercase",marginTop:2}}>Thabaat — Hifz Tracker</div>
        </div>
        <div style={{display:"flex",background:"#111",border:"1px solid #1e1e1e",borderRadius:7,padding:3,gap:3}}>
          {["surah","hizb"].map(m=>(
            <button key={m} onClick={()=>persist({...state,mode:m})} style={{padding:"5px 11px",borderRadius:5,fontSize:10,cursor:"pointer",border:"none",background:state.mode===m?"#c9a84c22":"transparent",color:state.mode===m?"#c9a84c":"#444",fontWeight:state.mode===m?600:400}}>
              {m==="surah"?"Sourate":"Hizb"}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"20px 16px 100px",maxWidth:600,margin:"0 auto",position:"relative",zIndex:1}}>
        {tab==="dashboard" && <Dashboard state={state} onNav={setTab}/>}
        {tab==="list"      && <ItemList state={state} updateField={updateField}/>}
        {tab==="session"   && <SessionLogger state={state} onSave={onSaveSession} onDone={()=>setTab("dashboard")}/>}
        {tab==="history"   && <History state={state} updateSession={updateSession}/>}
        {tab==="reminders" && <Reminders state={state} updateReminder={updateReminder}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,background:"#0d0d0df0",backdropFilter:"blur(12px)",borderTop:"1px solid #181818",display:"flex",justifyContent:"space-around",padding:"8px 0 14px"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 10px",color:tab===t.id?"#c9a84c":"#3a3a3a"}}>
            <span style={{fontSize:15}}>{t.icon}</span>
            <span style={{fontSize:9,letterSpacing:0.5,textTransform:"uppercase"}}>{t.label}</span>
            {tab===t.id&&<div style={{width:3,height:3,borderRadius:"50%",background:"#c9a84c"}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
