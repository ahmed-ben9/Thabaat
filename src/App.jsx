// PART 1: imports, firebase, data, utilities
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off, serverTimestamp } from "firebase/database";

// ── FIREBASE ──────────────────────────────────────────────────────────────────
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
  if (!id) { id = "user_" + Math.random().toString(36).slice(2,10); localStorage.setItem("thabaat-uid", id); }
  return id;
}
const UID = getUserId();

async function dbSet(path, value) {
  try { await set(ref(db, path), value); return true; }
  catch(e) { console.error("Firebase write error:", e); return false; }
}
function dbListen(path, cb) {
  const r = ref(db, path);
  onValue(r, s => cb(s.exists() ? s.val() : null));
  return () => off(r);
}

// ── HIJRI CALENDAR (Umm Al-Qura) ─────────────────────────────────────────────
const UMM_EPOCH = 1948438.5;
function jdFromGreg(y,m,d) {
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100), B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
}
function hijriFromGreg(gy,gm,gd) {
  const jd=jdFromGreg(gy,gm,gd), l=jd-UMM_EPOCH;
  const n=Math.floor(l/10631), r=l-n*10631;
  const j=Math.floor(r/354.367), rm=r-Math.floor(j*354.367);
  const hm=Math.min(12,Math.ceil((rm-29)/29.5)+1);
  const hd=Math.floor(rm-(hm-1)*29.5)+1;
  return {y:n*30+j+1, m:hm, d:hd};
}
const HM_AR=["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
const HM_FR=["Muharram","Safar","Rabi Al-Awwal","Rabi Al-Thani","Jumada Al-Ula","Jumada Al-Akhira","Rajab","Shaaban","Ramadan","Shawwal","Dhul Qada","Dhul Hijja"];
function todayHijri() { const d=new Date(); return hijriFromGreg(d.getFullYear(),d.getMonth()+1,d.getDate()); }
function formatHijri(dateStr) {
  if(!dateStr) return "";
  const [y,m,d]=dateStr.split("-").map(Number);
  const h=hijriFromGreg(y,m,d);
  return `${h.d} ${HM_FR[h.m-1]} ${h.y}H`;
}
function getHijriMonthKey() { const h=todayHijri(); return `H${h.y}-${String(h.m).padStart(2,"0")}`; }
function getGregMonthKey() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function getMonthKey(useHijri) { return useHijri ? getHijriMonthKey() : getGregMonthKey(); }

// ── QURAN DATA ────────────────────────────────────────────────────────────────
const SURAHS = [
  {n:1,name:"Al-Fatiha",ar:"الفاتحة",v:7,juz:1},{n:2,name:"Al-Baqara",ar:"البقرة",v:286,juz:1},
  {n:3,name:"Ali Imran",ar:"آل عمران",v:200,juz:3},{n:4,name:"An-Nisa",ar:"النساء",v:176,juz:4},
  {n:5,name:"Al-Maida",ar:"المائدة",v:120,juz:6},{n:6,name:"Al-Anam",ar:"الأنعام",v:165,juz:7},
  {n:7,name:"Al-Araf",ar:"الأعراف",v:206,juz:8},{n:8,name:"Al-Anfal",ar:"الأنفال",v:75,juz:9},
  {n:9,name:"At-Tawba",ar:"التوبة",v:129,juz:10},{n:10,name:"Yunus",ar:"يونس",v:109,juz:11},
  {n:11,name:"Hud",ar:"هود",v:123,juz:11},{n:12,name:"Yusuf",ar:"يوسف",v:111,juz:12},
  {n:13,name:"Ar-Rad",ar:"الرعد",v:43,juz:13},{n:14,name:"Ibrahim",ar:"إبراهيم",v:52,juz:13},
  {n:15,name:"Al-Hijr",ar:"الحجر",v:99,juz:14},{n:16,name:"An-Nahl",ar:"النحل",v:128,juz:14},
  {n:17,name:"Al-Isra",ar:"الإسراء",v:111,juz:15},{n:18,name:"Al-Kahf",ar:"الكهف",v:110,juz:15},
  {n:19,name:"Maryam",ar:"مريم",v:98,juz:16},{n:20,name:"Ta-Ha",ar:"طه",v:135,juz:16},
  {n:21,name:"Al-Anbiya",ar:"الأنبياء",v:112,juz:17},{n:22,name:"Al-Hajj",ar:"الحج",v:78,juz:17},
  {n:23,name:"Al-Muminun",ar:"المؤمنون",v:118,juz:18},{n:24,name:"An-Nur",ar:"النور",v:64,juz:18},
  {n:25,name:"Al-Furqan",ar:"الفرقان",v:77,juz:18},{n:26,name:"Ash-Shuara",ar:"الشعراء",v:227,juz:19},
  {n:27,name:"An-Naml",ar:"النمل",v:93,juz:19},{n:28,name:"Al-Qasas",ar:"القصص",v:88,juz:20},
  {n:29,name:"Al-Ankabut",ar:"العنكبوت",v:69,juz:20},{n:30,name:"Ar-Rum",ar:"الروم",v:60,juz:21},
  {n:31,name:"Luqman",ar:"لقمان",v:34,juz:21},{n:32,name:"As-Sajda",ar:"السجدة",v:30,juz:21},
  {n:33,name:"Al-Ahzab",ar:"الأحزاب",v:73,juz:21},{n:34,name:"Saba",ar:"سبأ",v:54,juz:22},
  {n:35,name:"Fatir",ar:"فاطر",v:45,juz:22},{n:36,name:"Ya-Sin",ar:"يس",v:83,juz:22},
  {n:37,name:"As-Saffat",ar:"الصافات",v:182,juz:23},{n:38,name:"Sad",ar:"ص",v:88,juz:23},
  {n:39,name:"Az-Zumar",ar:"الزمر",v:75,juz:23},{n:40,name:"Ghafir",ar:"غافر",v:85,juz:24},
  {n:41,name:"Fussilat",ar:"فصلت",v:54,juz:24},{n:42,name:"Ash-Shura",ar:"الشورى",v:53,juz:25},
  {n:43,name:"Az-Zukhruf",ar:"الزخرف",v:89,juz:25},{n:44,name:"Ad-Dukhan",ar:"الدخان",v:59,juz:25},
  {n:45,name:"Al-Jathiya",ar:"الجاثية",v:37,juz:25},{n:46,name:"Al-Ahqaf",ar:"الأحقاف",v:35,juz:26},
  {n:47,name:"Muhammad",ar:"محمد",v:38,juz:26},{n:48,name:"Al-Fath",ar:"الفتح",v:29,juz:26},
  {n:49,name:"Al-Hujurat",ar:"الحجرات",v:18,juz:26},{n:50,name:"Qaf",ar:"ق",v:45,juz:26},
  {n:51,name:"Adh-Dhariyat",ar:"الذاريات",v:60,juz:26},{n:52,name:"At-Tur",ar:"الطور",v:49,juz:27},
  {n:53,name:"An-Najm",ar:"النجم",v:62,juz:27},{n:54,name:"Al-Qamar",ar:"القمر",v:55,juz:27},
  {n:55,name:"Ar-Rahman",ar:"الرحمن",v:78,juz:27},{n:56,name:"Al-Waqia",ar:"الواقعة",v:96,juz:27},
  {n:57,name:"Al-Hadid",ar:"الحديد",v:29,juz:27},{n:58,name:"Al-Mujadila",ar:"المجادلة",v:22,juz:28},
  {n:59,name:"Al-Hashr",ar:"الحشر",v:24,juz:28},{n:60,name:"Al-Mumtahana",ar:"الممتحنة",v:13,juz:28},
  {n:61,name:"As-Saf",ar:"الصف",v:14,juz:28},{n:62,name:"Al-Jumua",ar:"الجمعة",v:11,juz:28},
  {n:63,name:"Al-Munafiqun",ar:"المنافقون",v:11,juz:28},{n:64,name:"At-Taghabun",ar:"التغابن",v:18,juz:28},
  {n:65,name:"At-Talaq",ar:"الطلاق",v:12,juz:28},{n:66,name:"At-Tahrim",ar:"التحريم",v:12,juz:28},
  {n:67,name:"Al-Mulk",ar:"الملك",v:30,juz:29},{n:68,name:"Al-Qalam",ar:"القلم",v:52,juz:29},
  {n:69,name:"Al-Haqqa",ar:"الحاقة",v:52,juz:29},{n:70,name:"Al-Maarij",ar:"المعارج",v:44,juz:29},
  {n:71,name:"Nuh",ar:"نوح",v:28,juz:29},{n:72,name:"Al-Jinn",ar:"الجن",v:28,juz:29},
  {n:73,name:"Al-Muzzammil",ar:"المزمل",v:20,juz:29},{n:74,name:"Al-Muddaththir",ar:"المدثر",v:56,juz:29},
  {n:75,name:"Al-Qiyama",ar:"القيامة",v:40,juz:29},{n:76,name:"Al-Insan",ar:"الإنسان",v:31,juz:29},
  {n:77,name:"Al-Mursalat",ar:"المرسلات",v:50,juz:29},{n:78,name:"An-Naba",ar:"النبأ",v:40,juz:30},
  {n:79,name:"An-Naziat",ar:"النازعات",v:46,juz:30},{n:80,name:"Abasa",ar:"عبس",v:42,juz:30},
  {n:81,name:"At-Takwir",ar:"التكوير",v:29,juz:30},{n:82,name:"Al-Infitar",ar:"الانفطار",v:19,juz:30},
  {n:83,name:"Al-Mutaffifin",ar:"المطففين",v:36,juz:30},{n:84,name:"Al-Inshiqaq",ar:"الانشقاق",v:25,juz:30},
  {n:85,name:"Al-Buruj",ar:"البروج",v:22,juz:30},{n:86,name:"At-Tariq",ar:"الطارق",v:17,juz:30},
  {n:87,name:"Al-Ala",ar:"الأعلى",v:19,juz:30},{n:88,name:"Al-Ghashiya",ar:"الغاشية",v:26,juz:30},
  {n:89,name:"Al-Fajr",ar:"الفجر",v:30,juz:30},{n:90,name:"Al-Balad",ar:"البلد",v:20,juz:30},
  {n:91,name:"Ash-Shams",ar:"الشمس",v:15,juz:30},{n:92,name:"Al-Layl",ar:"الليل",v:21,juz:30},
  {n:93,name:"Ad-Duha",ar:"الضحى",v:11,juz:30},{n:94,name:"Ash-Sharh",ar:"الشرح",v:8,juz:30},
  {n:95,name:"At-Tin",ar:"التين",v:8,juz:30},{n:96,name:"Al-Alaq",ar:"العلق",v:19,juz:30},
  {n:97,name:"Al-Qadr",ar:"القدر",v:5,juz:30},{n:98,name:"Al-Bayyina",ar:"البينة",v:8,juz:30},
  {n:99,name:"Az-Zalzala",ar:"الزلزلة",v:8,juz:30},{n:100,name:"Al-Adiyat",ar:"العاديات",v:11,juz:30},
  {n:101,name:"Al-Qaria",ar:"القارعة",v:11,juz:30},{n:102,name:"At-Takathur",ar:"التكاثر",v:8,juz:30},
  {n:103,name:"Al-Asr",ar:"العصر",v:3,juz:30},{n:104,name:"Al-Humaza",ar:"الهمزة",v:9,juz:30},
  {n:105,name:"Al-Fil",ar:"الفيل",v:5,juz:30},{n:106,name:"Quraysh",ar:"قريش",v:4,juz:30},
  {n:107,name:"Al-Maun",ar:"الماعون",v:7,juz:30},{n:108,name:"Al-Kawthar",ar:"الكوثر",v:3,juz:30},
  {n:109,name:"Al-Kafirun",ar:"الكافرون",v:6,juz:30},{n:110,name:"An-Nasr",ar:"النصر",v:3,juz:30},
  {n:111,name:"Al-Masad",ar:"المسد",v:5,juz:30},{n:112,name:"Al-Ikhlas",ar:"الإخلاص",v:4,juz:30},
  {n:113,name:"Al-Falaq",ar:"الفلق",v:5,juz:30},{n:114,name:"An-Nas",ar:"الناس",v:6,juz:30},
];

// Correct Juz boundaries (30 juz)
const JUZ_STARTS = [
  [1,1],[2,142],[2,253],[3,93],[3,200],[4,88],[4,177],[5,83],[6,111],[7,1],
  [7,88],[8,41],[9,93],[10,94],[11,6],[11,97],[12,53],[13,19],[14,53],[16,1],
  [17,1],[17,99],[18,75],[20,1],[21,57],[23,1],[24,35],[26,1],[27,56],[29,46]
];

// Correct Hizb boundaries (exactly 60 hizbs, Oum Al-Qura)
const HIZB_STARTS = [
  [1,1],[2,25],[2,49],[2,77],[2,106],[2,142],[2,177],[2,203],[2,229],[2,253],
  [3,1],[3,52],[3,93],[3,133],[3,170],[3,200],[4,24],[4,57],[4,88],[4,113],
  [4,148],[5,1],[5,42],[5,83],[6,1],[6,57],[6,111],[6,143],[7,1],[7,50],
  [7,88],[7,132],[7,170],[7,206],[8,41],[9,1],[9,43],[9,93],[10,1],[10,50],
  [11,1],[11,53],[11,97],[12,36],[12,77],[13,1],[13,19],[14,1],[15,1],[16,1],
  [16,75],[17,1],[17,55],[18,1],[18,53],[19,1],[20,1],[21,1],[21,73],[22,1],
];

const TOTAL_VERSES = SURAHS.reduce((s,x)=>s+x.v, 0); // 6236
const SURAH_OFFSETS = [];
let _off = 0;
SURAHS.forEach(s => { SURAH_OFFSETS.push(_off); _off += s.v; });
function globalVerse(sn, vn) { return SURAH_OFFSETS[sn-1] + vn; }

function getJuzInfo(n) {
  const s=JUZ_STARTS[n-1], e=n<30?JUZ_STARTS[n]:null;
  return {n, startSurah:s[0], startVerse:s[1], endSurah:e?e[0]:114, endVerse:e?e[1]-1:6};
}
function getHizbInfo(n) {
  const s=HIZB_STARTS[n-1], e=n<60?HIZB_STARTS[n]:null;
  return {n, startSurah:s[0], startVerse:s[1], endSurah:e?e[0]:114, endVerse:e?e[1]-1:6};
}
function versesInRange(ss,sv,es,ev) {
  let t=0;
  for(let sn=ss;sn<=es;sn++){
    const s=SURAHS.find(x=>x.n===sn); if(!s) continue;
    t+=Math.max(0,(sn===es?ev:s.v)-(sn===ss?sv:1)+1);
  }
  return t;
}
const JUZ_VERSES = Array.from({length:30},(_,i)=>{ const j=getJuzInfo(i+1); return versesInRange(j.startSurah,j.startVerse,j.endSurah,j.endVerse); });
const HIZB_VERSES = Array.from({length:60},(_,i)=>{ const h=getHizbInfo(i+1); return versesInRange(h.startSurah,h.startVerse,h.endSurah,h.endVerse); });

const MASTERY = {
  mubtadi:   {label:"Mubtadi",    ar:"مبتدئ",   color:"#ef4444", days:1},
  mutawassit:{label:"Mutawassit", ar:"متوسط",   color:"#f59e0b", days:3},
  mutaqaddim:{label:"Mutaqaddim", ar:"متقدم",  color:"#60a5fa", days:7},
  mutqin:    {label:"Mutqin",     ar:"متقن",    color:"#4ade80", days:14},
};
const ERROR_TYPES = {
  nisyan: {label:"Nisyan",  desc:"Oubli",        color:"#ef4444"},
  khata:  {label:"Khata",   desc:"Erreur texte", color:"#f59e0b"},
  tajweed:{label:"Tajweed", desc:"Prononciation",color:"#a78bfa"},
};
const TAJWEED_RULES = ["Madd","Idgham","Ikhfa","Qalqala","Waqf","Ghunna","Autre"];
const DUAS = [
  {ar:"رَبِّ زِدْنِي عِلْمًا", fr:"Rabbi zidni ilma"},
  {ar:"رَبِّ اشْرَحْ لِي صَدْرِي", fr:"Rabbi ishrah li sadri"},
  {ar:"اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي", fr:"Fais-moi profiter de ce que Tu m'as enseigné"},
  {ar:"اللَّهُمَّ ارْزُقْنِي حِفْظَ كِتَابِكَ", fr:"Accorde-moi la mémorisation de Ton Livre"},
  {ar:"اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي", fr:"Fais du Coran le printemps de mon cœur"},
];
const SECTIONS = {
  hifz:  {id:"hifz",  label:"Hifz",    sub:"Apprentissage", icon:"◈", color:"#60a5fa", dim:"#60a5fa20", border:"#60a5fa40"},
  muraja:{id:"muraja",label:"Muraja'a",sub:"Révision",      icon:"↺", color:"#f59e0b", dim:"#f59e0b20", border:"#f59e0b40"},
  wird:  {id:"wird",  label:"Wird",    sub:"Lecture",       icon:"☽", color:"#4ade80", dim:"#4ade8020", border:"#4ade8040"},
};
const DEFAULT_STATE = {
  surahProgress:{}, murajaSessions:[], wird:{},
  streak:{count:0, lastDate:""},
  reminders:{hifz:{enabled:false,time:"06:00"}, muraja:{enabled:false,time:"20:00"}, wird:{enabled:false,time:"21:00"}},
  profile:{}, wirdUseHijri:false, khatma:null, memGoal:null,
};

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0,10); }
function genId()  { return Math.random().toString(36).slice(2,10); }

function surahLearnedPct(ranges, totalVerses) {
  if(!ranges||!ranges.length) return 0;
  const s=new Set();
  ranges.forEach(r=>{ for(let v=r.from;v<=r.to;v++) s.add(v); });
  return Math.min(100, Math.round((s.size/totalVerses)*100));
}

function mergeRanges(ranges) {
  if(!ranges.length) return [];
  const sorted=[...ranges].sort((a,b)=>a.from-b.from);
  const merged=[sorted[0]];
  for(let i=1;i<sorted.length;i++){
    const last=merged[merged.length-1];
    if(sorted[i].from<=last.to+1) last.to=Math.max(last.to,sorted[i].to);
    else merged.push({...sorted[i]});
  }
  return merged;
}

function updateStreak(streak) {
  const td=today();
  if(streak?.lastDate===td) return streak; // already updated today
  const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
  const ys=yesterday.toISOString().slice(0,10);
  return {count: streak?.lastDate===ys ? (streak.count||0)+1 : 1, lastDate:td};
}

function surahErrorRate(sessions) {
  if(!sessions?.length) return 0;
  const total=sessions.reduce((s,sess)=>s+Object.keys(sess.verseErrors||{}).length, 0);
  return Math.round((total/sessions.length)*10)/10;
}

function isDueForReview(mastery, lastReviewed) {
  if(!mastery||!lastReviewed) return false;
  const days=MASTERY[mastery]?.days||3;
  const d=new Date(lastReviewed); d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10)<=today();
}

function computeGlobalMemPct(pm) {
  if(!pm) return 0;
  let totalMem=0;
  SURAHS.forEach(s=>{
    const pct=surahLearnedPct(pm[s.n]?.learnedRanges, s.v);
    totalMem += pct * s.v / 100;
  });
  return Math.round((totalMem/TOTAL_VERSES)*100);
}

// Notification support
async function requestNotificationPermission() {
  if(!("Notification" in window)) return false;
  if(Notification.permission==="granted") return true;
  const result=await Notification.requestPermission();
  return result==="granted";
}
function sendNotification(title, body) {
  if(Notification.permission==="granted") {
    const n=new Notification(title, {body, icon:"/favicon.ico"});
    if(navigator.vibrate) navigator.vibrate([200,100,200]);
    setTimeout(()=>n.close(), 8000);
  }
}

// ── GEO BACKGROUND ────────────────────────────────────────────────────────────
function GeoBg({color="#c9a84c"}) {
  return (
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.025,pointerEvents:"none",zIndex:0}} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="gp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="40,2 78,21 78,59 40,78 2,59 2,21" fill="none" stroke={color} strokeWidth="0.7"/>
        <circle cx="40" cy="40" r="5" fill="none" stroke={color} strokeWidth="0.3"/>
      </pattern></defs>
      <rect width="600" height="600" fill="url(#gp)"/>
    </svg>
  );
}

// ── HEART PROGRESS ────────────────────────────────────────────────────────────
function HeartProgress({pct, color="#60a5fa"}) {
  const id = useRef("hc_" + Math.random().toString(36).slice(2,7)).current;
  const fillH = Math.round(90 * pct / 100);
  return (
    <div style={{position:"relative",width:110,height:110,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <defs>
          <clipPath id={id}>
            <path d="M55 95 C55 95 12 62 12 36 C12 22 24 12 37 16 C45 18 52 25 55 30 C58 25 65 18 73 16 C86 12 98 22 98 36 C98 62 55 95 55 95Z"/>
          </clipPath>
        </defs>
        <path d="M55 95 C55 95 12 62 12 36 C12 22 24 12 37 16 C45 18 52 25 55 30 C58 25 65 18 73 16 C86 12 98 22 98 36 C98 62 55 95 55 95Z" fill="#1a1a1a" stroke={color+"44"} strokeWidth="1.5"/>
        <rect x="0" y={110-fillH} width="110" height={fillH} fill={color} clipPath={`url(#${id})`} opacity="0.9"/>
        <path d="M55 95 C55 95 12 62 12 36 C12 22 24 12 37 16 C45 18 52 25 55 30 C58 25 65 18 73 16 C86 12 98 22 98 36 C98 62 55 95 55 95Z" fill="none" stroke={color} strokeWidth="1.5"/>
      </svg>
      <div style={{position:"absolute",display:"flex",flexDirection:"column",alignItems:"center",pointerEvents:"none"}}>
        <span style={{fontSize:15,fontWeight:800,color,fontFamily:"monospace",textShadow:"0 1px 4px #000a"}}>{pct}%</span>
      </div>
    </div>
  );
}

// ── STICKY NAV ────────────────────────────────────────────────────────────────
function StickyNav({section,onSection,subTab,onSubTab,filterMode,onFilterMode,filterVal,onFilterVal,sec,darkMode}) {
  const subTabs = section==="hifz"
    ? [{id:"dashboard",l:"Dashboard"},{id:"list",l:"Sourates"},{id:"session",l:"+ Séance"}]
    : section==="muraja"
    ? [{id:"dashboard",l:"Dashboard"},{id:"list",l:"Sourates"},{id:"session",l:"+ Révision"}]
    : [{id:"dashboard",l:"Dashboard"},{id:"list",l:"Sourates"},{id:"session",l:"+ Lecture"}];

  const bg = darkMode ? "#0c0c0cf8" : "#f5f0e8f8";
  const bd = darkMode ? "#1e1e1e" : "#ddd";
  return (
    <div style={{position:"sticky",top:52,zIndex:9,background:bg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${bd}`,padding:"8px 14px 0"}}>
      {/* Section tabs */}
      <div style={{display:"flex",gap:5,marginBottom:7}}>
        {Object.values(SECTIONS).map(s=>{
          const on=section===s.id;
          return (
            <button key={s.id} onClick={()=>onSection(s.id)} style={{flex:1,padding:"8px 3px",borderRadius:9,cursor:"pointer",border:on?`1px solid ${s.color}55`:"1px solid #222",background:on?s.dim:"#111",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <span style={{fontSize:17,color:on?s.color:"#333"}}>{s.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:on?s.color:"#444",letterSpacing:0.5}}>{s.label}</span>
              {on&&<div style={{width:14,height:1.5,borderRadius:1,background:s.color,marginTop:1}}/>}
            </button>
          );
        })}
      </div>
      {/* Sub tabs */}
      <div style={{display:"flex",gap:4,marginBottom:7}}>
        {subTabs.map(t=>(
          <button key={t.id} onClick={()=>onSubTab(t.id)} style={{flex:1,padding:"5px 3px",borderRadius:7,fontSize:11,cursor:"pointer",border:subTab===t.id?`1px solid ${sec.color}55`:"1px solid #222",background:subTab===t.id?sec.dim:"#111",color:subTab===t.id?sec.color:"#555"}}>{t.l}</button>
        ))}
      </div>
      {/* Filter bar - only on list tab */}
      {subTab==="list"&&(
        <div style={{display:"flex",gap:4,paddingBottom:8}}>
          {[{id:"surah",l:"Sourate"},{id:"juz",l:"Juz"},{id:"hizb",l:"Hizb"}].map(m=>(
            <button key={m.id} onClick={()=>{onFilterMode(m.id);onFilterVal("all");}} style={{flex:1,padding:"4px 3px",borderRadius:6,fontSize:10,cursor:"pointer",border:filterMode===m.id?`1px solid ${sec.color}44`:"1px solid #1a1a1a",background:filterMode===m.id?sec.color+"18":"#0d0d0d",color:filterMode===m.id?sec.color:"#555"}}>{m.l}</button>
          ))}
          {filterMode==="juz"&&(
            <select value={filterVal} onChange={e=>onFilterVal(e.target.value)} style={{flex:2,background:"#111",border:`1px solid ${sec.color}33`,borderRadius:6,color:"#ccc",padding:"3px 5px",fontSize:9,outline:"none"}}>
              <option value="all">Tous les Juz</option>
              {Array.from({length:30},(_,i)=>i+1).map(n=><option key={n} value={n}>Juz {n}</option>)}
            </select>
          )}
          {filterMode==="hizb"&&(
            <select value={filterVal} onChange={e=>onFilterVal(e.target.value)} style={{flex:2,background:"#111",border:`1px solid ${sec.color}33`,borderRadius:6,color:"#ccc",padding:"3px 5px",fontSize:9,outline:"none"}}>
              <option value="all">Tous les Hizb</option>
              {Array.from({length:60},(_,i)=>i+1).map(n=><option key={n} value={n}>Hizb {n}</option>)}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

// ── JUZ / HIZB DETAIL CARD ────────────────────────────────────────────────────
function JuzHizbCard({mode,n,surahProgress,color}) {
  const info = mode==="juz" ? getJuzInfo(n) : getHizbInfo(n);
  const totalV = mode==="juz" ? JUZ_VERSES[n-1] : HIZB_VERSES[n-1];
  const covered = new Set();
  for(let sn=info.startSurah;sn<=info.endSurah;sn++){
    const s=SURAHS.find(x=>x.n===sn); if(!s) continue;
    const rf=sn===info.startSurah?info.startVerse:1, rt=sn===info.endSurah?info.endVerse:s.v;
    (surahProgress[sn]?.learnedRanges||[]).forEach(r=>{
      for(let v=Math.max(r.from,rf);v<=Math.min(r.to,rt);v++) covered.add(`${sn}-${v}`);
    });
  }
  const pct = Math.min(100, Math.round((covered.size/totalV)*100));
  const surahsInUnit = SURAHS.filter(s=>s.n>=info.startSurah&&s.n<=info.endSurah);
  return (
    <div style={{background:"#111",border:`1px solid ${color}22`,borderRadius:10,padding:13,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{fontSize:14,color:"#ddd",fontWeight:700}}>{mode==="juz"?`Juz ${n}`:`Hizb ${n}`}</div>
        <span style={{fontSize:14,fontWeight:700,color:pct===100?color:pct>0?"#f59e0b":"#333",fontFamily:"monospace"}}>{pct}%</span>
      </div>
      <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden",marginBottom:7}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:3}}/>
      </div>
      <div style={{fontSize:11,color:"#555",marginBottom:8}}>{covered.size}/{totalV} versets mémorisés</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {surahsInUnit.map(s=>{
          const rf=s.n===info.startSurah?info.startVerse:1, rt=s.n===info.endSurah?info.endVerse:s.v;
          const mem=new Set();
          (surahProgress[s.n]?.learnedRanges||[]).forEach(r=>{
            for(let v=Math.max(r.from,rf);v<=Math.min(r.to,rt);v++) mem.add(v);
          });
          const sp2=Math.round((mem.size/(rt-rf+1))*100);
          return (
            <div key={s.n} style={{background:sp2>0?color+"11":"#0d0d0d",border:`1px solid ${sp2>0?color+"33":"#1a1a1a"}`,borderRadius:6,padding:"3px 9px",fontSize:11}}>
              <span style={{color:sp2===100?color:sp2>0?"#f59e0b":"#555"}}>{s.name}</span>
              {(s.n===info.startSurah||s.n===info.endSurah)&&<span style={{color:"#333",fontSize:9}}> v.{rf}-{rt}</span>}
              {sp2>0&&<span style={{color:sp2===100?color:"#f59e0b",fontSize:9}}> {sp2}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── VERSE ERROR PICKER ────────────────────────────────────────────────────────
function VerseErrorPicker({totalVerses, verseErrors, onChange, readOnly=false}) {
  const [ev,setEv] = useState(null);
  const [et,setEt] = useState("nisyan");
  const [tj,setTj] = useState("");
  const [note,setNote] = useState("");
  const toggle = v => {
    if(readOnly) return;
    if(verseErrors[v]){const n={...verseErrors};delete n[v];onChange(n);}
    else{setEv(v);setEt("nisyan");setTj("");setNote("");}
  };
  const confirm = () => { onChange({...verseErrors,[ev]:{type:et,tajweed:et==="tajweed"?tj:"",note}}); setEv(null); };
  return (
    <div>
      <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Versets ({Object.keys(verseErrors).length} erreurs)</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
        {Array.from({length:totalVerses},(_,i)=>i+1).map(v=>{
          const err=verseErrors[v]; const col=err?ERROR_TYPES[err.type]?.color||"#ef4444":"#444";
          return <button key={v} onClick={()=>toggle(v)} style={{width:34,height:34,borderRadius:7,fontSize:12,fontWeight:600,cursor:readOnly?"default":"pointer",border:err?`1.5px solid ${col}`:"1px solid #222",background:err?col+"22":"#111",color:err?col:"#555"}}>{v}</button>;
        })}
      </div>
      {ev&&(
        <div style={{background:"#0d0d0d",border:"1px solid #c9a84c44",borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{fontSize:13,color:"#c9a84c",marginBottom:10}}>Verset {ev} — Type d'erreur</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {Object.entries(ERROR_TYPES).map(([k,v])=>(
              <button key={k} onClick={()=>setEt(k)} style={{flex:1,padding:"8px 3px",borderRadius:8,fontSize:11,cursor:"pointer",textAlign:"center",border:et===k?`1px solid ${v.color}`:"1px solid #222",background:et===k?v.color+"22":"#111",color:et===k?v.color:"#555"}}>
                <div style={{fontWeight:700}}>{v.label}</div><div style={{fontSize:10,marginTop:2}}>{v.desc}</div>
              </button>
            ))}
          </div>
          {et==="tajweed"&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{TAJWEED_RULES.map(r=><button key={r} onClick={()=>setTj(r)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:tj===r?"1px solid #a78bfa":"1px solid #222",background:tj===r?"#a78bfa22":"#111",color:tj===r?"#a78bfa":"#555"}}>{r}</button>)}</div>}
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note optionnelle…" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:6,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:7}}>
            <button onClick={confirm} style={{flex:1,padding:8,background:ERROR_TYPES[et].color+"22",border:`1px solid ${ERROR_TYPES[et].color}55`,borderRadius:7,color:ERROR_TYPES[et].color,fontSize:12,cursor:"pointer",fontWeight:700}}>Confirmer</button>
            <button onClick={()=>setEv(null)} style={{flex:1,padding:8,background:"#111",border:"1px solid #222",borderRadius:7,color:"#555",fontSize:12,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SURAH PANEL ───────────────────────────────────────────────────────────────
// Opens on surah click: mark entire or by verse range, set mastery
function SurahPanel({surahN, surahProgress, onClose, onSaveHifz, sec}) {
  const s = SURAHS.find(x=>x.n===surahN);
  if(!s) return null;
  const sp = surahProgress[surahN]||{};
  const existingRanges = sp.learnedRanges||[];
  const existingSessions = sp.hifzSessions||[];
  const pct = surahLearnedPct(existingRanges, s.v);
  const [mastery,setMastery] = useState(sp.mastery||null);
  const [entireMode,setEntireMode] = useState(false);
  const [rangeMode,setRangeMode] = useState(false);
  const [rangeFrom,setRangeFrom] = useState(1);
  const [rangeTo,setRangeTo] = useState(s.v);
  const [saving,setSaving] = useState(false);
  const [saved,setSaved] = useState(false);
  const [celebration,setCelebration] = useState(false);
  const [ranges,setRanges] = useState(existingRanges);
  const errRate = surahErrorRate(existingSessions);
  const due = mastery ? isDueForReview(mastery, sp.lastReviewed) : false;

  const previewRanges = entireMode
    ? [{from:1,to:s.v}]
    : rangeMode && rangeFrom<=rangeTo && rangeFrom>=1 && rangeTo<=s.v
      ? mergeRanges([...ranges,{from:rangeFrom,to:rangeTo}])
      : ranges;
  const previewPct = surahLearnedPct(previewRanges, s.v);

  const deleteRange = (idx) => {
    const newR = ranges.filter((_,i)=>i!==idx);
    setRanges(newR);
  };

  const resetAll = async () => {
    if(!window.confirm("Supprimer toutes les données de "+s.name+" ?")) return;
    await onSaveHifz(String(surahN), {date:today(),range:{from:1,to:1},verseErrors:{},notes:"Reset"},
      {learnedRanges:[], mastery:null, lastReviewed:today(), hifzSessions:[]}, null);
    onClose();
  };

  const save = async () => {
    setSaving(true);
    let newRanges = ranges;
    if(entireMode) {
      newRanges = [{from:1, to:s.v}];
    } else if(rangeMode && rangeFrom<=rangeTo && rangeFrom>=1 && rangeTo<=s.v) {
      newRanges = mergeRanges([...ranges, {from:rangeFrom, to:rangeTo}]);
    }
    const newPct = surahLearnedPct(newRanges, s.v);
    const willCelebrate = newPct===100 && pct<100;
    const addSession = entireMode || (rangeMode && rangeFrom<=rangeTo);
    const session = addSession ? {
      date: today(), type:"solo", partner:null, verseErrors:{},
      notes: entireMode ? "Sourate entiere" : ("v."+rangeFrom+"->"+rangeTo),
      range: {from:entireMode?1:rangeFrom, to:entireMode?s.v:rangeTo}, duration:1,
    } : null;
    const surahData = {
      learnedRanges: newRanges,
      mastery: mastery||null,
      lastReviewed: today(),
      hifzSessions: session ? [session,...existingSessions] : existingSessions,
    };
    await onSaveHifz(String(surahN), session||{date:today(),range:{from:1,to:1},verseErrors:{}}, surahData, null);
    setSaving(false);
    if(willCelebrate) { setCelebration(true); setTimeout(onClose,2500); }
    else { setSaved(true); setTimeout(onClose,900); }
  };

  if(celebration) return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#000d",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,paddingTop:"env(safe-area-inset-top)"}} onClick={onClose}>
      <div style={{fontSize:60}}>🎉</div>
      <div style={{fontFamily:"'Scheherazade New',serif",fontSize:28,color:"#c9a84c"}}>{s.ar}</div>
      <div style={{fontSize:16,color:"#ddd",fontWeight:700}}>{s.name} — 100% memorisee !</div>
      <div style={{fontFamily:"'Scheherazade New',serif",fontSize:18,color:"#4ade80"}}>بارك الله فيك</div>
    </div>
  );

  if(saved) return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"#00000099",paddingTop:"env(safe-area-inset-top)"}}>
      <div style={{background:"#111",borderRadius:"16px 16px 0 0",padding:40,textAlign:"center"}}>
        <div style={{fontSize:44}}>✅</div>
        <div style={{color:sec.color,fontSize:16,marginTop:12,fontWeight:700}}>Enregistre !</div>
        <div style={{color:"#555",fontSize:12,marginTop:6}}>{s.name} — {previewPct}% memorise</div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"#00000099"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111",borderRadius:"16px 16px 0 0",border:"1px solid #222",display:"flex",flexDirection:"column",maxHeight:"75vh"}}>
        {/* Scrollable content — padding-bottom leaves room for fixed button */}
        <div style={{overflowY:"auto",padding:"16px 16px 80px",flex:1,WebkitOverflowScrolling:"touch"}}>
          {/* Header — Enregistrer visible immediatement */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,color:"#ddd",fontWeight:700}}>{s.name}</div>
              <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:"#c9a84c"}}>{s.ar}</div>
              <div style={{fontSize:11,color:"#555",marginTop:2}}>Juz {s.juz} · {s.v} versets</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,marginLeft:8}}>
              <button onClick={save} disabled={saving} style={{padding:"8px 12px",background:saving?"#1a1a1a":`linear-gradient(135deg,${sec.dim},${sec.color}40)`,border:`1px solid ${saving?"#333":sec.border}`,borderRadius:8,color:saving?"#555":sec.color,fontSize:13,cursor:saving?"not-allowed":"pointer",fontWeight:700,whiteSpace:"nowrap"}}>
                {saving ? "..." : "✓ Enreg."}
              </button>
              <button onClick={resetAll} style={{padding:"8px 9px",background:"#ef444411",border:"1px solid #ef444433",borderRadius:8,color:"#ef4444",fontSize:11,cursor:"pointer"}}>Reset</button>
              <button onClick={onClose} style={{background:"transparent",border:"none",color:"#555",fontSize:22,cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
            </div>
          </div>

          {/* Progress preview */}
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{color:"#555"}}>Memorise</span>
              <span style={{color:sec.color,fontWeight:700}}>
                {previewPct!==pct?<>{pct}% → <span style={{color:"#4ade80"}}>{previewPct}%</span></>:`${pct}%`}
              </span>
            </div>
            <div style={{height:5,background:"#1a1a1a",borderRadius:5,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${previewPct}%`,background:sec.color,borderRadius:5,transition:"width .4s"}}/>
            </div>
          </div>

          {/* Existing ranges with delete */}
          {ranges.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:6}}>Plages memorisees</div>
              {ranges.map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:7,padding:"6px 10px",marginBottom:5}}>
                  <span style={{fontSize:12,color:sec.color}}>v.{r.from} → v.{r.to} <span style={{color:"#555",fontSize:10}}>({r.to-r.from+1}v.)</span></span>
                  <button onClick={()=>deleteRange(i)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Mark options */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Marquer comme appris</div>
            <div onClick={()=>{setEntireMode(!entireMode);setRangeMode(false);}} style={{background:entireMode?sec.dim:"#0d0d0d",border:`1px solid ${entireMode?sec.color:sec.color+"33"}`,borderRadius:9,padding:11,marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sec.color}`,background:entireMode?sec.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {entireMode&&<span style={{color:"#000",fontSize:11,fontWeight:800}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:13,color:entireMode?sec.color:"#ccc",fontWeight:600}}>Sourate entiere (v.1 → v.{s.v})</div>
              </div>
            </div>
            <div onClick={()=>{setRangeMode(!rangeMode);setEntireMode(false);}} style={{background:rangeMode?sec.dim:"#0d0d0d",border:`1px solid ${rangeMode?sec.color:sec.color+"33"}`,borderRadius:9,padding:11,cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:rangeMode?7:0}}>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sec.color}`,background:rangeMode?sec.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {rangeMode&&<span style={{color:"#000",fontSize:11,fontWeight:800}}>✓</span>}
              </div>
              <div style={{fontSize:13,color:rangeMode?sec.color:"#ccc",fontWeight:600}}>Plage de versets</div>
            </div>
            {rangeMode&&(
              <div style={{background:"#0a0a0a",border:`1px solid ${sec.color}22`,borderRadius:8,padding:11}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#555",marginBottom:4}}>Du verset</div>
                    <input type="number" min="1" max={s.v} value={rangeFrom}
                      onChange={e=>setRangeFrom(Math.max(1,Math.min(s.v,Number(e.target.value))))}
                      style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:16,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{color:"#333",marginTop:14,fontSize:16}}>→</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#555",marginBottom:4}}>Au verset</div>
                    <input type="number" min={rangeFrom} max={s.v} value={rangeTo}
                      onChange={e=>setRangeTo(Math.max(rangeFrom,Math.min(s.v,Number(e.target.value))))}
                      style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:16,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>
                {rangeFrom<=rangeTo&&rangeFrom>=1&&rangeTo<=s.v&&(
                  <div style={{marginTop:7,fontSize:11,color:sec.color+"88",textAlign:"center"}}>{rangeTo-rangeFrom+1} versets · total apres : {previewPct}%</div>
                )}
              </div>
            )}
          </div>

          {/* Mastery */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>Niveau de maitrise</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
              {Object.entries(MASTERY).map(([k,m])=>(
                <button key={k} onClick={()=>setMastery(mastery===k?null:k)} style={{padding:"8px 3px",borderRadius:7,fontSize:10,cursor:"pointer",textAlign:"center",border:mastery===k?`1px solid ${m.color}`:"1px solid #222",background:mastery===k?m.color+"22":"#0d0d0d",color:mastery===k?m.color:"#555",fontWeight:mastery===k?700:400}}>
                  <div>{m.label}</div>
                  <div style={{fontFamily:"'Scheherazade New',serif",fontSize:11,marginTop:1}}>{m.ar}</div>
                </button>
              ))}
            </div>
            {mastery&&<div style={{fontSize:10,color:"#555",textAlign:"center",marginTop:5}}>Prochaine revision dans {MASTERY[mastery].days}j</div>}
          </div>

          {/* Last sessions */}
          {existingSessions.length>0&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:6}}>Dernieres seances ({existingSessions.length})</div>
              {existingSessions.slice(0,3).map((sess,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}>
                  <span style={{color:"#888"}}>{formatHijri(sess.date)} · v.{sess.range?.from}→{sess.range?.to}</span>
                  <span style={{color:Object.keys(sess.verseErrors||{}).length>0?"#ef4444":"#4ade80"}}>{Object.keys(sess.verseErrors||{}).length} err.</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}


// ── QURAN API VIEWER ──────────────────────────────────────────────────────────
// Tajweed color CSS classes from quran.com
// Tajweed CSS injected into document.head for reliable PWA support
// Colors matching quran.com official tajweed color system (verified from screenshot)
const TAJWEED_CSS_TEXT = `
  /* Silent / Hamza Wasl */
  .ham_wasl { color: #AAAAAA !important; }
  .slnt     { color: #AAAAAA !important; }
  .silent   { color: #AAAAAA !important; }

  /* Madd - Normal (2 vowels) — yellow/gold */
  .madda_normal      { color: #F5C518 !important; }

  /* Madd - Permissible/Separated (2/4/6 vowels) — orange */
  .madda_permissible { color: #F97316 !important; }

  /* Madd - Obligatory/Connected (4/5 vowels) — red */
  .madda_obligatory  { color: #DC2626 !important; }

  /* Madd - Necessary (6 vowels) — dark red */
  .madda_necessary   { color: #EF4444 !important; }

  /* Qalqala (echo) — light blue */
  .qalaqah { color: #60A5FA !important; }
  .qlq      { color: #60A5FA !important; }

  /* Tafkhim (heavy/emphasis) — dark blue */
  .laam_shamsiyah { color: #3B82F6 !important; }

  /* Ghunna (nasalization) — green */
  .ghunnah { color: #22C55E !important; }

  /* Ikhfa (concealment) — green */
  .ikhafa          { color: #22C55E !important; }
  .ikhf            { color: #22C55E !important; }

  /* Ikhfa Shafawi (with meem) — green */
  .ikhafa_shafawi  { color: #16A34A !important; }
  .ikhf_shfw       { color: #16A34A !important; }

  /* Idgham with ghunna — green */
  .idgham_ghunnah         { color: #22C55E !important; }
  .idgh_ghn               { color: #22C55E !important; }
  .idgham_with_ghunnah    { color: #22C55E !important; }
  .idgham_mutajanisain    { color: #22C55E !important; }
  .idgham_mutaqaribain    { color: #22C55E !important; }

  /* Idgham without ghunna — lighter green */
  .idgham_wo_ghunnah      { color: #4ADE80 !important; }
  .idgham_without_ghunnah { color: #4ADE80 !important; }

  /* Idgham Shafawi (with meem) — green */
  .idgham_shafawi  { color: #16A34A !important; }
  .idghm_shfw      { color: #16A34A !important; }

  /* Iqlab — purple/pink */
  .iqlb { color: #A855F7 !important; }
`;


// Inject CSS into document.head — works reliably in PWA mode
function injectTajweedCSS() {
  const id = 'tajweed-styles';
  if(!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = TAJWEED_CSS_TEXT;
    document.head.appendChild(style);
  }
}

// Audio URL format — built directly at click time (no intermediate API call)
// This guarantees iOS/Android play works synchronously with user tap
// Reciters with everyayah.com folder names (reliable CDN, good CORS)
// Reciters: everyayah.com (confirmed working) + Quran.com API (for others)
const RECITERS = [
  // Hafs — everyayah.com (confirmed working)
  {label:"Mishary Alafasy (Hafs)",    source:"everyayah", folder:"Alafasy_128kbps",  warsh:false},
  {label:"Al-Husary (Hafs)",          source:"everyayah", folder:"Husary_128kbps",   warsh:false},
  {label:"Saad Al-Ghamdi (Hafs)",     source:"everyayah", folder:"Ghamadi_40kbps",   warsh:false},
  // Hafs — Quran.com API (verified IDs)
  {label:"Al-Sudais (Hafs)",          source:"qurancom",  recitationId:9,            warsh:false},
  {label:"Maher Al-Muaiqly (Hafs)",   source:"qurancom",  recitationId:10,           warsh:false},
  // Warsh — Quran.com API (verified IDs)
  {label:"Al-Husary (Warsh)",         source:"qurancom",  recitationId:2,            warsh:true},
  {label:"Al-Minshawi (Warsh)",       source:"qurancom",  recitationId:6,            warsh:true},
];

// Build URL for everyayah.com reciters
function buildEveryayahUrl(folder, surahN, verseN) {
  const s = String(surahN).padStart(3,"0");
  const v = String(verseN).padStart(3,"0");
  return `https://everyayah.com/data/${folder}/${s}${v}.mp3`;
}

// Cache for Quran.com audio URLs {recitationId_surahN: {verseN: url}}
const audioUrlCache = {};

async function getQuranComAudioUrl(recitationId, surahN, verseN) {
  const cacheKey = `${recitationId}_${surahN}`;
  if(!audioUrlCache[cacheKey]) {
    try {
      const r = await fetch(`https://api.quran.com/api/v4/recitations/${recitationId}/by_chapter/${surahN}`);
      if(!r.ok) throw new Error("API error");
      const d = await r.json();
      audioUrlCache[cacheKey] = {};
      (d.audio_files||[]).forEach(a => {
        // verse_key format: "2:255"
        const vn = Number(a.verse_key.split(":")[1]);
        audioUrlCache[cacheKey][vn] = `https://verses.quran.com/${a.url}`;
      });
    } catch(e) {
      return null;
    }
  }
  return audioUrlCache[cacheKey][verseN] || null;
}

// Complete tajweed rules reference
const TAJWEED_RULES_MAP = {
  ham_wasl: {
    name: "Hamzat ul-Wasl",
    ar: "همزة الوصل",
    color: "#AAAAAA",
    desc: "Lettre de liaison — se prononce uniquement en début de récitation, sinon silencieuse.",
    letters: "ا",
    rule: "Wasl",
  },
  slnt: {
    name: "Lettre silencieuse",
    ar: "حرف صامت",
    color: "#AAAAAA",
    desc: "Lettre écrite mais non prononcée dans la récitation.",
    letters: "",
    rule: "Silent",
  },
  madda_normal: {
    name: "Madd Normal",
    ar: "مد طبيعي",
    color: "#F5C518",
    desc: "Prolongation naturelle de 2 temps (harakat). Présente sur les lettres de madd (ا و ي) suivies d'une voyelle.",
    letters: "ا و ي",
    rule: "Madd 2",
  },
  madda_permissible: {
    name: "Madd Permissible",
    ar: "مد جائز منفصل",
    color: "#F97316",
    desc: "Madd séparé — la lettre de madd est dans un mot et la hamza dans le suivant. Prolongation 2, 4 ou 6 temps selon le récitateur.",
    letters: "ا و ي + ء",
    rule: "Madd 2/4/6",
  },
  madda_obligatory: {
    name: "Madd Obligatoire",
    ar: "مد واجب متصل",
    color: "#DC2626",
    desc: "Madd connecté — la lettre de madd et la hamza sont dans le même mot. Prolongation obligatoire de 4 ou 5 temps.",
    letters: "ا و ي + ء (même mot)",
    rule: "Madd 4/5",
  },
  madda_necessary: {
    name: "Madd Nécessaire",
    ar: "مد لازم",
    color: "#EF4444",
    desc: "Madd nécessaire — lettre de madd suivie d'une sukun fixe. Prolongation obligatoire de 6 temps.",
    letters: "ا و ي + سكون",
    rule: "Madd 6",
  },
  qalaqah: {
    name: "Qalqala",
    ar: "قلقلة",
    color: "#60A5FA",
    desc: "Rebond sonore produit sur 5 lettres spécifiques quand elles portent un sukun. Le son rebondit légèrement.",
    letters: "ق ط ب ج د",
    rule: "Qalqala",
  },
  qlq: {
    name: "Qalqala",
    ar: "قلقلة",
    color: "#60A5FA",
    desc: "Rebond sonore produit sur 5 lettres spécifiques quand elles portent un sukun.",
    letters: "ق ط ب ج د",
    rule: "Qalqala",
  },
  ghunnah: {
    name: "Ghunna",
    ar: "غنة",
    color: "#22C55E",
    desc: "Son nasal de 2 temps produit par le nez. Présent sur le Noun et le Meem mushadda.",
    letters: "ن م (مشددة)",
    rule: "Ghunna",
  },
  ikhafa: {
    name: "Ikhfa",
    ar: "إخفاء",
    color: "#22C55E",
    desc: "Occultation — le Noun sâkin ou Tanwin est prononcé entre l'izhar et l'idgham, avec ghunna de 2 temps.",
    letters: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك",
    rule: "Ikhfa",
  },
  ikhf: {
    name: "Ikhfa",
    ar: "إخفاء",
    color: "#22C55E",
    desc: "Occultation — le Noun sâkin ou Tanwin est prononcé avec ghunna de 2 temps.",
    letters: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك",
    rule: "Ikhfa",
  },
  ikhafa_shafawi: {
    name: "Ikhfa Shafawi",
    ar: "إخفاء شفوي",
    color: "#16A34A",
    desc: "Ikhfa labial — le Meem sâkin est occulté devant le Ba, avec ghunna de 2 temps.",
    letters: "م + ب",
    rule: "Ikhfa Shafawi",
  },
  ikhf_shfw: {
    name: "Ikhfa Shafawi",
    ar: "إخفاء شفوي",
    color: "#16A34A",
    desc: "Ikhfa labial — le Meem sâkin est occulté devant le Ba, avec ghunna.",
    letters: "م + ب",
    rule: "Ikhfa Shafawi",
  },
  idgham_ghunnah: {
    name: "Idgham avec Ghunna",
    ar: "إدغام بغنة",
    color: "#22C55E",
    desc: "Fusion avec nasalisation — le Noun sâkin ou Tanwin est fusionné avec la lettre suivante, avec ghunna de 2 temps.",
    letters: "ي ن م و",
    rule: "Idgham",
  },
  idgham_wo_ghunnah: {
    name: "Idgham sans Ghunna",
    ar: "إدغام بلا غنة",
    color: "#4ADE80",
    desc: "Fusion sans nasalisation — le Noun sâkin ou Tanwin est fusionné avec la lettre suivante, sans ghunna.",
    letters: "ل ر",
    rule: "Idgham",
  },
  idgham_with_ghunnah: {
    name: "Idgham avec Ghunna",
    ar: "إدغام بغنة",
    color: "#22C55E",
    desc: "Fusion avec nasalisation de 2 temps.",
    letters: "ي ن م و",
    rule: "Idgham",
  },
  idgham_without_ghunnah: {
    name: "Idgham sans Ghunna",
    ar: "إدغام بلا غنة",
    color: "#4ADE80",
    desc: "Fusion sans nasalisation.",
    letters: "ل ر",
    rule: "Idgham",
  },
  idgham_shafawi: {
    name: "Idgham Shafawi",
    ar: "إدغام شفوي",
    color: "#16A34A",
    desc: "Fusion labiale — le Meem sâkin est fusionné avec un autre Meem, avec ghunna de 2 temps.",
    letters: "م + م",
    rule: "Idgham Shafawi",
  },
  idghm_shfw: {
    name: "Idgham Shafawi",
    ar: "إدغام شفوي",
    color: "#16A34A",
    desc: "Fusion labiale — Meem sâkin + Meem, avec ghunna.",
    letters: "م + م",
    rule: "Idgham Shafawi",
  },
  idgham_mutajanisain: {
    name: "Idgham Mutajanisayn",
    ar: "إدغام المتجانسين",
    color: "#22C55E",
    desc: "Fusion de deux lettres du même point d'articulation.",
    letters: "ت د ط / ث ذ ظ / م ب",
    rule: "Idgham",
  },
  idgham_mutaqaribain: {
    name: "Idgham Mutaqaribuyn",
    ar: "إدغام المتقاربين",
    color: "#22C55E",
    desc: "Fusion de deux lettres aux points d'articulation proches.",
    letters: "ق + ك / ل + ر",
    rule: "Idgham",
  },
  iqlb: {
    name: "Iqlab",
    ar: "إقلاب",
    color: "#A855F7",
    desc: "Transformation — le Noun sâkin ou Tanwin se transforme en Meem devant le Ba, avec ghunna de 2 temps.",
    letters: "ن / تنوين + ب",
    rule: "Iqlab",
  },
  laam_shamsiyah: {
    name: "Laam Shamsiyya",
    ar: "لام شمسية",
    color: "#3B82F6",
    desc: "Laam solaire — le 'Al' de définition, la laam est assimilée à la lettre suivante (lettre solaire).",
    letters: "ت ث د ذ ر ز س ش ص ض ط ظ ل ن",
    rule: "Laam",
  },
};

function QuranViewer({initialSurah=1, onClose, onBookmark, bookmark}) {
  const VERSES_PER_PAGE = 10;
  const [selSurah,setSelSurah] = useState(initialSurah);
  const [verses,setVerses] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [showTranslation,setShowTranslation] = useState(false);
  const [showTajweed,setShowTajweed] = useState(true);
  const [reciterIdx,setReciterIdx] = useState(0);
  const [playingVerse,setPlayingVerse] = useState(null);
  const [loopVerse,setLoopVerse] = useState(null);      // verse to loop
  const [loopCount,setLoopCount] = useState(3);          // times to repeat
  const [loopRemaining,setLoopRemaining] = useState(0);
  const [continuous,setContinuous] = useState(false);    // auto-play next verse
  const [audioError,setAudioError] = useState(null);
  const [page,setPage] = useState(1);
  const [showTajweedLegend,setShowTajweedLegend] = useState(false);
  const [tafsirVerse,setTafsirVerse] = useState(null); // {verseN, verseKey, text_ar, translation}
  const [tafsirLang,setTafsirLang] = useState('ar');   // 'ar' or 'en'
  const [tafsirText,setTafsirText] = useState(null);
  const [tafsirLoading,setTafsirLoading] = useState(false);
  const tafsirCache = useRef({});
  const audioRef = useRef(null);
  const pageRef = useRef(page);
  const continuousRef = useRef(continuous);
  const loopVerseRef = useRef(loopVerse);
  const loopRemainingRef = useRef(loopRemaining);
  const versesRef = useRef(verses);
  const selSurahRef = useRef(selSurah);

  useEffect(()=>{ pageRef.current=page; }, [page]);
  useEffect(()=>{ continuousRef.current=continuous; }, [continuous]);
  useEffect(()=>{ loopVerseRef.current=loopVerse; }, [loopVerse]);
  useEffect(()=>{ loopRemainingRef.current=loopRemaining; }, [loopRemaining]);
  useEffect(()=>{ versesRef.current=verses; }, [verses]);
  useEffect(()=>{ selSurahRef.current=selSurah; }, [selSurah]);

  const totalPages = Math.ceil((verses.length||1)/VERSES_PER_PAGE);
  const pageVerses = verses.slice((page-1)*VERSES_PER_PAGE, page*VERSES_PER_PAGE);

  const loadSurah = useCallback(async(n) => {
    setLoading(true); setError(null); setVerses([]); setPage(1);
    setPlayingVerse(null); setLoopVerse(null); setLoopRemaining(0);
    if(audioRef.current){audioRef.current.pause();audioRef.current=null;}
    try {
      const url = `https://api.quran.com/api/v4/verses/by_chapter/${n}?language=fr&words=false&per_page=300&fields=text_uthmani,text_uthmani_tajweed&translations=31`;
      const r = await fetch(url);
      if(!r.ok) throw new Error(`API error ${r.status}`);
      const d = await r.json();
      const arr = (d.verses||[]).map(v=>({
        ...v,
        _translation:(v.translations?.[0]?.text||"").replace(/<[^>]*>/g,"").trim()
      }));
      setVerses(arr);
    } catch(e) {
      setError("Impossible de charger. Verifie ta connexion internet.");
    }
    setLoading(false);
  }, []);

  // Inject tajweed CSS into document.head on mount (works in PWA)
  useEffect(()=>{ injectTajweedCSS(); }, []);
  useEffect(()=>{ loadSurah(selSurah); }, [selSurah]);
  useEffect(()=>()=>{ audioRef.current?.pause(); }, []);

  // Load tafsir for a verse from Quran.com API
  const loadTafsir = async (verseKey, lang) => {
    const cacheKey = `${verseKey}_${lang}`;
    if(tafsirCache.current[cacheKey]) {
      setTafsirText(tafsirCache.current[cacheKey]);
      return;
    }
    setTafsirLoading(true);
    setTafsirText(null);
    try {
      const tafsirId = lang === 'ar' ? 14 : 169;
      const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`;
      const r = await fetch(url);
      if(!r.ok) throw new Error('API error');
      const d = await r.json();
      const text = (d.tafsir?.text || '').replace(/<[^>]*>/g, '').trim();
      tafsirCache.current[cacheKey] = text || 'Tafsir non disponible.';
      setTafsirText(tafsirCache.current[cacheKey]);
    } catch(e) {
      setTafsirText('Impossible de charger le tafsir. Verifie ta connexion.');
    }
    setTafsirLoading(false);
  };

  const openTafsir = (verseN, verseKey, text_uthmani, translation) => {
    setTafsirVerse({verseN, verseKey, text_uthmani, translation});
    setTafsirText(null);
    loadTafsir(verseKey, tafsirLang);
  };

  const playVerseInternal = async (verseN, remaining) => {
    if(audioRef.current){audioRef.current.pause();audioRef.current=null;}
    const reciter = RECITERS[reciterIdx];
    let url;
    if(reciter.source === "everyayah") {
      url = buildEveryayahUrl(reciter.folder, selSurahRef.current, verseN);
    } else {
      // Quran.com API — fetch URLs for this surah (cached)
      url = await getQuranComAudioUrl(reciter.recitationId, selSurahRef.current, verseN);
      if(!url) {
        setPlayingVerse(null);
        setAudioError(`Impossible de charger l'audio pour ${reciter.label}`);
        return;
      }
    }
    const audio = new Audio(url);
    audio.preload = "auto";
    audioRef.current = audio;
    setPlayingVerse(verseN);
    setLoopRemaining(remaining);
    const p = audio.play();
    if(p) p.catch(err=>{
      setPlayingVerse(null);
      setAudioError(`Lecture impossible pour ${reciter.label}`);
    });
    audio.onerror = () => {
      setPlayingVerse(null);
      setAudioError(`Audio introuvable pour ${reciter.label}`);
    };
    audio.onended = () => {
      const rem = loopRemainingRef.current - 1;
      const lv = loopVerseRef.current;
      if(lv && rem > 0) {
        // Loop this verse again
        playVerseInternal(lv, rem);
      } else {
        setLoopRemaining(0);
        setLoopVerse(null);
        // Continuous: go to next verse
        if(continuousRef.current) {
          const allVerses = versesRef.current;
          const nextN = verseN + 1;
          if(nextN <= allVerses.length) {
            // Go to next page if needed
            const nextPage = Math.ceil(nextN/VERSES_PER_PAGE);
            if(nextPage !== pageRef.current) setPage(nextPage);
            setTimeout(()=>playVerseInternal(nextN, 1), 300);
          } else {
            // End of surah — go to next surah
            const nextSurahN = selSurahRef.current + 1;
            if(nextSurahN <= 114) {
              setSelSurah(nextSurahN);
              setTimeout(()=>playVerseInternal(1, 1), 1500);
            } else {
              setPlayingVerse(null);
            }
          }
        } else {
          setPlayingVerse(null);
          audioRef.current = null;
        }
      }
    };
  };

  const playVerse = (verseN) => {
    setAudioError(null);
    if(playingVerse===verseN && !loopVerse) {
      audioRef.current?.pause();
      setPlayingVerse(null);
      return;
    }
    setLoopVerse(null);
    playVerseInternal(verseN, 1);
  };

  const toggleLoop = (verseN) => {
    setAudioError(null);
    if(loopVerse===verseN) {
      // Stop loop
      audioRef.current?.pause();
      setLoopVerse(null);
      setPlayingVerse(null);
      setLoopRemaining(0);
    } else {
      setLoopVerse(verseN);
      playVerseInternal(verseN, loopCount);
    }
  };

  const surah = SURAHS.find(s=>s.n===selSurah);
  const hafsReciters = RECITERS.filter(r=>!r.warsh);
  const warshReciters = RECITERS.filter(r=>r.warsh);

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#0a0a0a",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet"/>
      

      {/* Top bar */}
      <div style={{background:"#111",borderBottom:"1px solid #222",padding:"7px 10px",paddingTop:"max(7px,env(safe-area-inset-top))",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <button onClick={onClose} style={{padding:"5px 8px",background:"#1a1a1a",border:"1px solid #333",borderRadius:7,color:"#888",fontSize:11,cursor:"pointer",flexShrink:0}}>← Fermer</button>
        <select value={selSurah} onChange={e=>setSelSurah(Number(e.target.value))} style={{flex:1,background:"#1a1a1a",border:"1px solid #333",borderRadius:7,color:"#ddd",padding:"5px 6px",fontSize:11,outline:"none"}}>
          {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name} — {s.ar}</option>)}
        </select>
        <button onClick={()=>onBookmark(selSurah)} style={{padding:"5px 7px",background:bookmark===selSurah?"#c9a84c22":"#1a1a1a",border:`1px solid ${bookmark===selSurah?"#c9a84c44":"#333"}`,borderRadius:7,color:bookmark===selSurah?"#c9a84c":"#888",fontSize:13,cursor:"pointer",flexShrink:0}}>
          {bookmark===selSurah?"★":"☆"}
        </button>
      </div>

      {/* Options bar */}
      <div style={{background:"#0d0d0d",borderBottom:"1px solid #1a1a1a",padding:"6px 10px",display:"flex",alignItems:"center",gap:6,flexShrink:0,flexWrap:"wrap"}}>
        <button onClick={()=>setShowTajweed(!showTajweed)} style={{padding:"3px 9px",borderRadius:20,fontSize:10,cursor:"pointer",border:showTajweed?"1px solid #f59e0b55":"1px solid #333",background:showTajweed?"#f59e0b18":"transparent",color:showTajweed?"#f59e0b":"#555"}}>🎨 Tajweed</button>
        {showTajweed&&<button onClick={()=>setShowTajweedLegend(!showTajweedLegend)} style={{padding:"3px 8px",borderRadius:20,fontSize:10,cursor:"pointer",border:showTajweedLegend?"1px solid #f59e0b55":"1px solid #333",background:showTajweedLegend?"#f59e0b18":"transparent",color:showTajweedLegend?"#f59e0b":"#555"}}>ℹ️</button>}
        <button onClick={()=>setShowTranslation(!showTranslation)} style={{padding:"3px 9px",borderRadius:20,fontSize:10,cursor:"pointer",border:showTranslation?"1px solid #60a5fa55":"1px solid #333",background:showTranslation?"#60a5fa18":"transparent",color:showTranslation?"#60a5fa":"#555"}}>🇫🇷 Traduction</button>
        <button onClick={()=>setContinuous(!continuous)} style={{padding:"3px 9px",borderRadius:20,fontSize:10,cursor:"pointer",border:continuous?"1px solid #4ade8055":"1px solid #333",background:continuous?"#4ade8018":"transparent",color:continuous?"#4ade80":"#555"}}>▶▶ Enchainer</button>
        {/* Reciter select grouped */}
        <select value={reciterIdx} onChange={e=>{setReciterIdx(Number(e.target.value));setAudioError(null);}} style={{flex:1,minWidth:0,background:"#1a1a1a",border:"1px solid #333",borderRadius:20,color:"#888",padding:"3px 7px",fontSize:9,outline:"none"}}>
          <optgroup label="— Hafs —">
            {hafsReciters.map((r,i)=><option key={i} value={RECITERS.indexOf(r)}>{r.label}</option>)}
          </optgroup>
          <optgroup label="— Warsh —">
            {warshReciters.map((r,i)=><option key={i} value={RECITERS.indexOf(r)}>{r.label}</option>)}
          </optgroup>
        </select>
        {/* Loop count */}
        <select value={loopCount} onChange={e=>setLoopCount(Number(e.target.value))} style={{background:"#1a1a1a",border:"1px solid #333",borderRadius:20,color:"#888",padding:"3px 6px",fontSize:9,outline:"none"}}>
          {[1,2,3,5,10].map(n=><option key={n} value={n}>🔁×{n}</option>)}
        </select>
        {bookmark&&bookmark!==selSurah&&<button onClick={()=>setSelSurah(bookmark)} style={{padding:"3px 8px",background:"#c9a84c18",border:"1px solid #c9a84c44",borderRadius:20,color:"#c9a84c",fontSize:9,cursor:"pointer",flexShrink:0}}>↩ {SURAHS.find(s=>s.n===bookmark)?.name}</button>}
      </div>

      {/* Surah header */}
      <div style={{textAlign:"center",padding:"10px 14px 8px",borderBottom:"1px solid #1a1a1a",flexShrink:0}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:24,color:"#c9a84c"}}>{surah?.ar}</div>
        <div style={{fontSize:11,color:"#555",marginTop:2}}>{surah?.name} · {surah?.v} versets · Juz {surah?.juz}</div>
      </div>

      {/* Audio error */}
      {audioError&&<div style={{background:"#ef444411",border:"1px solid #ef444433",borderRadius:0,padding:"7px 12px",fontSize:11,color:"#ef4444",flexShrink:0}}>{audioError}</div>}

      {/* Verse content */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 12px 8px",WebkitOverflowScrolling:"touch"}}>
        {loading&&<div style={{textAlign:"center",color:"#444",padding:40}}>Chargement...</div>}
        {error&&<div style={{textAlign:"center",color:"#ef4444",padding:40,fontSize:13}}>{error}</div>}
        {!loading&&!error&&(
          <>
            {page===1&&selSurah!==9&&<div style={{textAlign:"center",fontFamily:"'Scheherazade New',serif",fontSize:19,color:"#c9a84c",marginBottom:16,direction:"rtl"}}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
            {pageVerses.map((v,i)=>{
              const verseN = (page-1)*VERSES_PER_PAGE + i + 1;
              const isPlaying = playingVerse===verseN;
              const isLooping = loopVerse===verseN;
              return (
                <div key={v.id} style={{marginBottom:14,borderBottom:"1px solid #1a1a1a",paddingBottom:10}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:7,direction:"rtl"}}>
                    <div style={{flex:1,fontFamily:"'Scheherazade New',serif",fontSize:23,lineHeight:2,color:"#e8e0d0",direction:"rtl",textAlign:"right"}}>
                      {showTajweed&&v.text_uthmani_tajweed
                        ?<span dangerouslySetInnerHTML={{__html:v.text_uthmani_tajweed}}/>
                        :v.text_uthmani}
                      <span style={{color:"#c9a84c77",fontSize:16,marginRight:7}}>﴿{verseN}﴾</span>
                    </div>
                    <div style={{flexShrink:0,direction:"ltr",display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
                      {/* Play button */}
                      <button onClick={()=>playVerse(verseN)} style={{width:32,height:32,borderRadius:"50%",background:isPlaying&&!isLooping?"#60a5fa22":"#1a1a1a",border:`1.5px solid ${isPlaying&&!isLooping?"#60a5fa":"#333"}`,color:isPlaying&&!isLooping?"#60a5fa":"#666",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {isPlaying&&!isLooping?"⏸":"▶"}
                      </button>
                      {/* Loop button */}
                      <button onClick={()=>toggleLoop(verseN)} style={{width:32,height:32,borderRadius:"50%",background:isLooping?"#f59e0b22":"#1a1a1a",border:`1.5px solid ${isLooping?"#f59e0b":"#333"}`,color:isLooping?"#f59e0b":"#666",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                        🔁
                        {isLooping&&loopRemaining>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#f59e0b",color:"#000",borderRadius:"50%",width:14,height:14,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{loopRemaining}</span>}
                      </button>
                      {/* Tafsir button */}
                      <button onClick={()=>openTafsir(verseN, `${selSurah}:${verseN}`, v.text_uthmani, v._translation)} style={{width:32,height:32,borderRadius:"50%",background:tafsirVerse?.verseN===verseN?"#c9a84c22":"#1a1a1a",border:`1.5px solid ${tafsirVerse?.verseN===verseN?"#c9a84c":"#333"}`,color:tafsirVerse?.verseN===verseN?"#c9a84c":"#666",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        📖
                      </button>
                    </div>
                  </div>
                  {showTranslation&&(
                    <div style={{fontSize:12,color:v._translation?"#999":"#444",lineHeight:1.8,marginTop:7,direction:"ltr",fontStyle:"italic",borderLeft:"2px solid #60a5fa33",paddingLeft:10}}>
                      {v._translation||"Traduction non disponible"}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>


      {/* Tajweed Legend Modal */}
      {showTajweedLegend&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"#000c",display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={()=>setShowTajweedLegend(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#111",borderRadius:"16px 16px 0 0",border:"1px solid #222",maxHeight:"75vh",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:700,color:"#f59e0b"}}>🎨 Légende Tajweed</div>
              <button onClick={()=>setShowTajweedLegend(false)} style={{background:"transparent",border:"none",color:"#555",fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <div style={{overflowY:"auto",padding:"10px 16px 20px"}}>
              {[
                {color:"#AAAAAA", name:"Lettre silencieuse / Wasl", ar:"حرف صامت / همزة الوصل", desc:"Lettre non prononcée ou de liaison"},
                {color:"#F5C518", name:"Madd Normal (2 temps)", ar:"مد طبيعي", desc:"Prolongation naturelle de 2 temps"},
                {color:"#F97316", name:"Madd Permissible (2/4/6)", ar:"مد جائز منفصل", desc:"Madd séparé entre deux mots"},
                {color:"#DC2626", name:"Madd Obligatoire (4/5)", ar:"مد واجب متصل", desc:"Madd dans le même mot avec hamza"},
                {color:"#EF4444", name:"Madd Nécessaire (6)", ar:"مد لازم", desc:"Madd suivi d'un sukun fixe — 6 temps"},
                {color:"#60A5FA", name:"Qalqala", ar:"قلقلة", desc:"Rebond sonore sur ق ط ب ج د"},
                {color:"#22C55E", name:"Ghunna / Ikhfa / Idgham", ar:"غنة / إخفاء / إدغام", desc:"Son nasal de 2 temps"},
                {color:"#16A34A", name:"Ikhfa & Idgham Shafawi", ar:"إخفاء / إدغام شفوي", desc:"Avec le Meem"},
                {color:"#A855F7", name:"Iqlab", ar:"إقلاب", desc:"Noun → Meem devant Ba"},
                {color:"#3B82F6", name:"Laam Shamsiyya", ar:"لام شمسية", desc:"Laam assimilée à la lettre solaire"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a"}}>
                  <div style={{width:14,height:14,borderRadius:"50%",background:r.color,flexShrink:0,marginTop:3}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:r.color,marginBottom:2}}>{r.name}</div>
                    <div style={{fontFamily:"'Scheherazade New',serif",fontSize:14,color:r.color+"99",marginBottom:3,direction:"rtl",textAlign:"right"}}>{r.ar}</div>
                    <div style={{fontSize:11,color:"#888"}}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tafsir Panel */}
      {tafsirVerse&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"#000c",display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={()=>setTafsirVerse(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#111",borderRadius:"16px 16px 0 0",border:"1px solid #222",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            {/* Tafsir header */}
            <div style={{padding:"12px 16px 10px",borderBottom:"1px solid #1a1a1a",flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:"#c9a84c"}}>📖 Tafsir — {SURAHS.find(s=>s.n===selSurah)?.name} : {tafsirVerse.verseN}</div>
                <button onClick={()=>setTafsirVerse(null)} style={{background:"transparent",border:"none",color:"#555",fontSize:22,cursor:"pointer"}}>×</button>
              </div>
              {/* Lang selector */}
              <div style={{display:"flex",gap:6}}>
                {[{v:'ar',l:'Ibn Kathir (عربي)'},{v:'en',l:'Ibn Kathir (English)'}].map(opt=>(
                  <button key={opt.v} onClick={()=>{setTafsirLang(opt.v);loadTafsir(`${selSurah}:${tafsirVerse.verseN}`,opt.v);}} style={{flex:1,padding:"5px 8px",borderRadius:7,fontSize:10,cursor:"pointer",border:tafsirLang===opt.v?"1px solid #c9a84c44":"1px solid #222",background:tafsirLang===opt.v?"#c9a84c18":"#0d0d0d",color:tafsirLang===opt.v?"#c9a84c":"#555",fontWeight:tafsirLang===opt.v?700:400}}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            {/* Verse text */}
            <div style={{padding:"10px 16px 6px",borderBottom:"1px solid #1a1a1a",flexShrink:0}}>
              <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:"#e8e0d0",direction:"rtl",textAlign:"right",lineHeight:1.8,marginBottom:tafsirVerse.translation?6:0}}>{tafsirVerse.text_uthmani}</div>
              {tafsirVerse.translation&&<div style={{fontSize:12,color:"#888",fontStyle:"italic"}}>{tafsirVerse.translation}</div>}
            </div>
            {/* Tafsir text */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px 20px",WebkitOverflowScrolling:"touch"}}>
              {tafsirLoading&&<div style={{textAlign:"center",color:"#555",padding:20}}>Chargement du tafsir…</div>}
              {!tafsirLoading&&tafsirText&&(
                <div style={{fontSize:13,color:"#bbb",lineHeight:1.9,direction:tafsirLang==='ar'?"rtl":"ltr",textAlign:tafsirLang==='ar'?"right":"left",fontFamily:tafsirLang==='ar'?"'Scheherazade New',serif":"inherit"}}>
                  {tafsirText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading&&!error&&totalPages>1&&(
        <div style={{background:"#111",borderTop:"1px solid #1a1a1a",padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1} style={{padding:"5px 12px",background:"#1a1a1a",border:"1px solid #333",borderRadius:7,color:page===1?"#333":"#888",fontSize:12,cursor:page===1?"not-allowed":"pointer"}}>← Préc</button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:"#555"}}>Page</span>
            <select value={page} onChange={e=>setPage(Number(e.target.value))} style={{background:"#1a1a1a",border:"1px solid #333",borderRadius:6,color:"#ddd",padding:"3px 6px",fontSize:12,outline:"none"}}>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <span style={{fontSize:11,color:"#555"}}>/ {totalPages}</span>
          </div>
          <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} style={{padding:"5px 12px",background:"#1a1a1a",border:"1px solid #333",borderRadius:7,color:page===totalPages?"#333":"#888",fontSize:12,cursor:page===totalPages?"not-allowed":"pointer"}}>Suiv →</button>
        </div>
      )}
    </div>
  );
}


// ── HIFZ DASHBOARD ────────────────────────────────────────────────────────────
function HifzDashboard({state, onNewSession}) {
  const sec = SECTIONS.hifz;
  const pm = state.surahProgress||{};
  const streak = state.streak||{count:0};
  const streakWarning = streak.count>0 && streak.lastDate!==today();
  const dua = DUAS[new Date().getDate()%DUAS.length];
  const globalPct = useMemo(()=>computeGlobalMemPct(pm), [pm]);
  const totalMem = useMemo(()=>SURAHS.filter(s=>surahLearnedPct(pm[s.n]?.learnedRanges,s.v)===100).length, [pm]);
  const inProgress = useMemo(()=>SURAHS.filter(s=>{const p=pm[s.n];return p?.learnedRanges?.length>0&&surahLearnedPct(p.learnedRanges,s.v)<100;}).length, [pm]);
  const dueSurahs = useMemo(()=>SURAHS.filter(s=>pm[s.n]?.mastery&&isDueForReview(pm[s.n].mastery,pm[s.n].lastReviewed)&&surahLearnedPct(pm[s.n].learnedRanges,s.v)>0).slice(0,3), [pm]);
  const recent = useMemo(()=>{
    const arr=[];
    Object.entries(pm).forEach(([n,p])=>{(p.hifzSessions||[]).forEach(s=>arr.push({...s,surahName:SURAHS.find(x=>x.n===Number(n))?.name}));});
    return arr.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4);
  }, [pm]);
  const goal = state.memGoal||null;

  return (
    <div>
      {/* Global heart + dua */}
      <div style={{background:"linear-gradient(135deg,#0a0f1a,#0d1525)",border:`1px solid ${sec.color}22`,borderRadius:12,padding:16,marginBottom:12,display:"flex",alignItems:"center",gap:14}}>
        <HeartProgress pct={globalPct} color={sec.color}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:10,color:sec.color+"66",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Coran mémorisé</div>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:19,color:sec.color,lineHeight:1.6}}>{dua.ar}</div>
          <div style={{fontSize:11,color:sec.color+"66",fontStyle:"italic",marginTop:4}}>{dua.fr}</div>
        </div>
      </div>

      {/* Consecutive days */}
      <div style={{background:streakWarning?"linear-gradient(135deg,#1a0808,#280a0a)":"linear-gradient(135deg,#1a110a,#261800)",border:`1px solid ${streakWarning?"#ef444433":"#c9a84c33"}`,borderRadius:12,padding:"11px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>{streakWarning?"⚠️":"✨"}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:19,fontWeight:700,color:streakWarning?"#ef4444":"#f59e0b",fontFamily:"monospace"}}>{streak.count} jour{streak.count!==1?"s":""} consécutifs</div>
          <div style={{fontSize:11,color:streakWarning?"#ef444477":"#7a5a30",marginTop:2}}>{streakWarning?"Récite aujourd'hui pour ne pas perdre ta série !":"Continue ainsi — barakallahu fik"}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        {[{l:"Complètes",v:totalMem,c:sec.color},{l:"En cours",v:inProgress,c:"#f59e0b"},{l:"Sourates",v:114,c:"#333"}].map(c=>(
          <div key={c.l} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"11px 5px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.c}}/>
            <div style={{fontSize:21,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
            <div style={{fontSize:10,color:"#444",textTransform:"uppercase",marginTop:2}}>{c.l}</div>
          </div>
        ))}
      </div>

      {/* Goal */}
      {goal&&(()=>{
        const ts=SURAHS.find(s=>s.n===goal.surahN);
        if(!ts) return null;
        const vl=Math.max(0,ts.v-surahLearnedPct(pm[ts.n]?.learnedRanges,ts.v)/100*ts.v);
        const dl=Math.max(1,Math.ceil((new Date(goal.targetDate)-new Date())/86400000));
        const vpd=Math.ceil(vl/dl);
        return (
          <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:10,padding:12,marginBottom:10}}>
            <div style={{fontSize:10,color:"#c9a84c",textTransform:"uppercase",marginBottom:5}}>Objectif</div>
            <div style={{fontSize:13,color:"#ddd"}}>Finir {ts.name} · {dl} jour{dl>1?"s":""} restants</div>
            <div style={{fontSize:11,color:"#888",marginTop:3}}>~{Math.round(vl)} versets restants → <span style={{color:"#c9a84c",fontWeight:700}}>{vpd} v/jour</span></div>
          </div>
        );
      })()}

      {/* Due for review */}
      {dueSurahs.length>0&&(
        <div style={{background:"#111",border:`1px solid ${sec.color}33`,borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{fontSize:10,color:sec.color,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>À réviser aujourd'hui</div>
          {dueSurahs.map(s=>{const m=MASTERY[pm[s.n]?.mastery];return(
            <div key={s.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #1a1a1a"}}>
              <span style={{fontSize:13,color:"#ccc"}}>{s.name}</span>
              {m&&<span style={{fontSize:10,color:m.color,background:m.color+"22",borderRadius:20,padding:"2px 8px"}}>{m.label}</span>}
            </div>
          );})}
        </div>
      )}

      {/* Recent */}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:8}}>Dernières séances</div>
        {recent.length===0
          ? <div style={{textAlign:"center",color:"#333",fontSize:13,padding:"10px 0"}}>Aucune séance encore — commence !</div>
          : recent.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<recent.length-1?"1px solid #1a1a1a":"none"}}>
              <div>
                <div style={{fontSize:13,color:"#ccc"}}>{s.surahName}</div>
                <div style={{fontSize:11,color:"#444",marginTop:1}}>{formatHijri(s.date)} · v.{s.range?.from}→{s.range?.to}</div>
              </div>
              <span style={{fontSize:11,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 9px"}}>{(s.range?.to||0)-(s.range?.from||0)+1}v.</span>
            </div>
          ))
        }
      </div>

      <button onClick={onNewSession} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${sec.dim},${sec.color}30)`,border:`1px solid ${sec.border}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:700}}>
        + Nouvelle séance Hifz
      </button>
    </div>
  );
}

// ── HIFZ LIST ─────────────────────────────────────────────────────────────────
function HifzList({state, onSaveHifz, filterMode, filterVal}) {
  const sec = SECTIONS.hifz;
  const pm = state.surahProgress||{};
  const [search,setSearch] = useState("");
  const [selectedSurah,setSelectedSurah] = useState(null);

  let list = SURAHS;
  if(filterMode==="juz"&&filterVal!=="all"){const j=getJuzInfo(Number(filterVal));list=SURAHS.filter(s=>s.n>=j.startSurah&&s.n<=j.endSurah);}
  else if(filterMode==="hizb"&&filterVal!=="all"){const h=getHizbInfo(Number(filterVal));list=SURAHS.filter(s=>s.n>=h.startSurah&&s.n<=h.endSurah);}
  if(search) list=list.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.ar.includes(search)||String(s.n).includes(search));

  return (
    <div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher (nom, arabe, numéro)…" style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
      {(filterMode==="juz"||filterMode==="hizb")&&filterVal!=="all"&&<JuzHizbCard mode={filterMode} n={Number(filterVal)} surahProgress={pm} color={sec.color}/>}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {list.map(s=>{
          const ranges=pm[s.n]?.learnedRanges||[];
          const mastery=pm[s.n]?.mastery;
          const pct=surahLearnedPct(ranges,s.v);
          const due=mastery?isDueForReview(mastery,pm[s.n]?.lastReviewed):false;
          const m=mastery?MASTERY[mastery]:null;
          return (
            <div key={s.n} onClick={()=>setSelectedSurah(s.n)} style={{background:"#111",border:`1px solid ${due?"#f59e0b33":"#1a1a1a"}`,borderRadius:10,padding:"11px 13px",cursor:"pointer",transition:"border-color .2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:pct>0?7:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#444",flexShrink:0,fontFamily:"monospace"}}>{s.n}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,color:"#ddd",fontWeight:500}}>{s.name}</span>
                    <span style={{fontFamily:"'Scheherazade New',serif",fontSize:16,color:"#c9a84c99"}}>{s.ar}</span>
                    {m&&<span style={{fontSize:10,color:m.color,background:m.color+"22",borderRadius:20,padding:"1px 7px"}}>{m.label}</span>}
                    {due&&<span style={{fontSize:10,color:"#f59e0b",background:"#f59e0b11",borderRadius:20,padding:"1px 7px"}}>À réviser</span>}
                    {pct===100&&<span style={{fontSize:11,color:sec.color}}>✓</span>}
                  </div>
                  <div style={{fontSize:10,color:"#444",marginTop:2}}>Juz {s.juz} · {s.v} versets</div>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:pct===100?sec.color:pct>0?"#f59e0b":"#2a2a2a",fontFamily:"monospace",flexShrink:0}}>{pct}%</span>
              </div>
              {pct>0&&<div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:3}}/></div>}
            </div>
          );
        })}
      </div>
      {selectedSurah&&<SurahPanel surahN={selectedSurah} surahProgress={pm} onClose={()=>setSelectedSurah(null)} onSaveHifz={onSaveHifz} sec={sec}/>}
    </div>
  );
}

// ── HIFZ SESSION ──────────────────────────────────────────────────────────────
function HifzSession({state, onSave, onDone}) {
  const sec = SECTIONS.hifz;
  const pm = state.surahProgress||{};
  const [selSurah,setSelSurah] = useState("");
  const [entireSurah,setEntireSurah] = useState(false);
  const [rangeFrom,setRangeFrom] = useState(1);
  const [rangeTo,setRangeTo] = useState(1);
  const [verseErrors,setVerseErrors] = useState({});
  const [partner,setPartner] = useState("");
  const [type,setType] = useState("solo");
  const [notes,setNotes] = useState("");
  const [mastery,setMastery] = useState("mubtadi");
  const [goalSurah,setGoalSurah] = useState("");
  const [goalDate,setGoalDate] = useState("");
  const [saved,setSaved] = useState(false);
  const [shareLink,setShareLink] = useState(null);
  const [sessionId] = useState(()=>genId());
  const [startTime] = useState(()=>Date.now());
  const [dirty,setDirty] = useState(false);

  const surah = SURAHS.find(s=>s.n===Number(selSurah));
  const existingRanges = pm[selSurah]?.learnedRanges||[];
  const ef = entireSurah?1:Math.min(rangeFrom,rangeTo);
  const et = entireSurah?(surah?.v||1):Math.max(rangeFrom,rangeTo);
  const newRanges = surah ? mergeRanges([...existingRanges,{from:ef,to:et}]) : existingRanges;
  const currentPct = surahLearnedPct(existingRanges,surah?.v||1);
  const newPct = surah ? surahLearnedPct(newRanges,surah.v) : currentPct;
  const vNums = surah ? Array.from({length:surah.v},(_,i)=>i+1) : [];

  useEffect(()=>{
    if(type==="sheikh"&&selSurah&&surah){
      dbSet(`sessions/${sessionId}`,{itemKey:selSurah,itemName:surah.name,date:today(),type,partner,verseErrors:{},notes});
      setShareLink(`${window.location.origin}${window.location.pathname}?corrector=${sessionId}`);
    } else setShareLink(null);
  },[type,selSurah]);

  useEffect(()=>{
    if(type!=="sheikh"||!selSurah) return;
    const u=dbListen(`sessions/${sessionId}/verseErrors`,d=>{if(d) setVerseErrors(d);});
    return u;
  },[type,selSurah]);

  const save = async () => {
    if(!selSurah||!surah) return;
    const dur=Math.round((Date.now()-startTime)/60000);
    const newRange={from:ef,to:et};
    const session={date:today(),type,partner:type==="solo"?null:partner,verseErrors,notes,range:newRange,duration:dur||1};
    const surahData={...(pm[selSurah]||{}),learnedRanges:newRanges,hifzSessions:[session,...(pm[selSurah]?.hifzSessions||[])],mastery,lastReviewed:today()};
    await onSave(selSurah, session, surahData, goalSurah&&goalDate?{surahN:Number(goalSurah),targetDate:goalDate}:null);
    setSaved(true); setTimeout(onDone,1500);
  };

  if(saved) return (
    <div style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:48}}>✅</div>
      <div style={{color:sec.color,fontSize:16,marginTop:12,fontWeight:700}}>Séance enregistrée !</div>
      <div style={{fontFamily:"'Scheherazade New',serif",color:sec.color+"66",fontSize:20,marginTop:8}}>بارك الله فيك</div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل حفظ</div>
        <div style={{fontSize:12,color:"#555",marginTop:2}}>Nouvelle séance d'apprentissage</div>
      </div>

      {/* Surah */}
      <div>
        <label style={{fontSize:11,color:"#555",textTransform:"uppercase",display:"block",marginBottom:6}}>Sourate</label>
        <select value={selSurah} onChange={e=>{setSelSurah(e.target.value);setRangeFrom(1);setRangeTo(1);setEntireSurah(false);setVerseErrors({});setDirty(true);}} style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none"}}>
          <option value="">Sélectionner une sourate…</option>
          {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name} — {s.ar} ({s.v}v.)</option>)}
        </select>
      </div>

      {/* Verse range */}
      {surah&&(
        <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:10,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <div style={{fontSize:11,color:"#555",textTransform:"uppercase"}}>Versets appris</div>
            <button onClick={()=>{setEntireSurah(!entireSurah);setDirty(true);}} style={{padding:"4px 11px",borderRadius:20,fontSize:10,cursor:"pointer",border:entireSurah?`1px solid ${sec.color}`:"1px solid #333",background:entireSurah?sec.dim:"#111",color:entireSurah?sec.color:"#555",fontWeight:entireSurah?700:400}}>
              Sourate entière
            </button>
          </div>
          {existingRanges.length>0&&(
            <div style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#555",marginBottom:4}}><span>Déjà mémorisé</span><span style={{color:sec.color}}>{currentPct}%</span></div>
              <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${currentPct}%`,background:sec.color,borderRadius:3}}/></div>
            </div>
          )}
          {!entireSurah&&(
            <div style={{display:"flex",gap:9,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"#444",marginBottom:4}}>Du verset</div>
                <select value={rangeFrom} onChange={e=>{setRangeFrom(Number(e.target.value));setDirty(true);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:15,outline:"none"}}>
                  {vNums.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{color:"#333",marginTop:14,fontSize:16}}>→</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"#444",marginBottom:4}}>Au verset</div>
                <select value={rangeTo} onChange={e=>{setRangeTo(Number(e.target.value));setDirty(true);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:15,outline:"none"}}>
                  {vNums.filter(v=>v>=rangeFrom).map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}
          {entireSurah&&<div style={{textAlign:"center",color:sec.color,fontSize:12,padding:"7px 0"}}>Sourate entière · v.1 → v.{surah.v}</div>}
          <div style={{marginTop:8,fontSize:11,color:sec.color+"99",textAlign:"center",background:sec.color+"11",borderRadius:7,padding:6}}>Nouveau total : {newPct}% de {surah.name}</div>
        </div>
      )}

      {/* Mastery */}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:8}}>Niveau de maîtrise</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
          {Object.entries(MASTERY).map(([k,m])=>(
            <button key={k} onClick={()=>setMastery(k)} style={{padding:"7px 2px",borderRadius:7,fontSize:10,cursor:"pointer",textAlign:"center",border:mastery===k?`1px solid ${m.color}`:"1px solid #222",background:mastery===k?m.color+"22":"#0d0d0d",color:mastery===k?m.color:"#555",fontWeight:mastery===k?700:400}}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Session type */}
      <div style={{display:"flex",gap:8}}>
        {[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=>(
          <button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:10,borderRadius:8,fontSize:13,cursor:"pointer",border:type===t.k?`1px solid ${sec.color}`:"1px solid #222",background:type===t.k?sec.dim:"#111",color:type===t.k?sec.color:"#555"}}>{t.l}</button>
        ))}
      </div>
      {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom du cheikh" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
      {type==="sheikh"&&selSurah&&shareLink&&(
        <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:"#60a5fa",marginBottom:6,fontWeight:700}}>Lien correcteur</div>
          <div style={{display:"flex",gap:7}}>
            <div style={{flex:1,background:"#111",border:"1px solid #1e1e1e",borderRadius:6,padding:"7px 10px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{shareLink}</div>
            <button onClick={()=>navigator.clipboard.writeText(shareLink).catch(()=>{})} style={{padding:"7px 11px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:11,cursor:"pointer"}}>Copier</button>
          </div>
        </div>
      )}

      {/* Errors */}
      {surah&&<div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:13}}><VerseErrorPicker totalVerses={surah.v} verseErrors={verseErrors} onChange={setVerseErrors}/></div>}

      {/* Goal */}
      <div style={{background:"#111",border:"1px solid #c9a84c22",borderRadius:10,padding:12}}>
        <div style={{fontSize:10,color:"#c9a84c",textTransform:"uppercase",marginBottom:8}}>Objectif (optionnel)</div>
        <div style={{display:"flex",gap:7}}>
          <select value={goalSurah} onChange={e=>setGoalSurah(e.target.value)} style={{flex:2,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 9px",fontSize:11,outline:"none"}}>
            <option value="">Sourate cible…</option>
            {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
          </select>
          <input type="date" value={goalDate} onChange={e=>setGoalDate(e.target.value)} style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 9px",fontSize:11,outline:"none"}}/>
        </div>
      </div>

      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes…" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} disabled={!selSurah} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:700,cursor:selSurah?"pointer":"not-allowed",background:selSurah?`linear-gradient(135deg,${sec.dim},${sec.color}40)`:"#111",border:selSurah?`1px solid ${sec.border}`:"1px solid #1a1a1a",color:selSurah?sec.color:"#333"}}>
        Enregistrer la séance
      </button>
    </div>
  );
}

// ── MURAJA DASHBOARD ──────────────────────────────────────────────────────────
function MurajaDashboard({state, onNewSession}) {
  const sec = SECTIONS.muraja;
  const sessions = state.murajaSessions||[];
  const pm = state.surahProgress||{};
  const sorted = useMemo(()=>[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)), [sessions]);
  const thisWeek = useMemo(()=>sessions.filter(s=>(new Date()-new Date(s.date))/(1000*60*60*24)<=7).length, [sessions]);
  const errorRates = useMemo(()=>SURAHS.filter(s=>pm[s.n]?.hifzSessions?.length>0).map(s=>({name:s.name,n:s.n,rate:surahErrorRate(pm[s.n].hifzSessions)})).filter(x=>x.rate>0).sort((a,b)=>b.rate-a.rate).slice(0,4), [pm]);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[{l:"Total révisions",v:sessions.length,c:sec.color},{l:"Cette semaine",v:thisWeek,c:"#60a5fa"}].map(c=>(
          <div key={c.l} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"13px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.c}}/>
            <div style={{fontSize:24,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
            <div style={{fontSize:10,color:"#444",textTransform:"uppercase",marginTop:2}}>{c.l}</div>
          </div>
        ))}
      </div>
      {errorRates.length>0&&(
        <div style={{background:"#111",border:"1px solid #ef444433",borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{fontSize:10,color:"#ef4444",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Points faibles (taux d'erreur)</div>
          {errorRates.map(e=>(
            <div key={e.n} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#ccc"}}>{e.name}</span><span style={{color:e.rate>3?"#ef4444":"#f59e0b",fontFamily:"monospace",fontWeight:700}}>{e.rate} err/s</span></div>
              <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,e.rate/5*100)}%`,background:e.rate>3?"#ef4444":"#f59e0b",borderRadius:3}}/></div>
            </div>
          ))}
        </div>
      )}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:8}}>Dernières révisions</div>
        {sorted.length===0
          ? <div style={{textAlign:"center",color:"#333",fontSize:13,padding:"10px 0"}}>Aucune révision encore</div>
          : sorted.slice(0,5).map((s,i)=>{
            const fN=SURAHS.find(x=>x.n===s.range?.fromSurah)?.name||"";
            const tN=SURAHS.find(x=>x.n===s.range?.toSurah)?.name||"";
            const cnt=Math.max(0,globalVerse(s.range?.toSurah||1,s.range?.toVerse||1)-globalVerse(s.range?.fromSurah||1,s.range?.fromVerse||1)+1);
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<sorted.slice(0,5).length-1?"1px solid #1a1a1a":"none"}}>
                <div>
                  <div style={{fontSize:13,color:"#ccc"}}>{fN} {s.range?.fromVerse} → {tN} {s.range?.toVerse}</div>
                  <div style={{fontSize:11,color:"#444",marginTop:1}}>{formatHijri(s.date)}{s.quality?` · ${"★".repeat(s.quality)}`:""}</div>
                </div>
                <span style={{fontSize:11,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 9px"}}>{cnt}v.</span>
              </div>
            );
          })
        }
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${sec.dim},${sec.color}30)`,border:`1px solid ${sec.border}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:700}}>
        + Nouvelle Muraja'a
      </button>
    </div>
  );
}

// ── MURAJA LIST ───────────────────────────────────────────────────────────────
function MurajaList({state, onSaveHifz, filterMode, filterVal}) {
  const sec = SECTIONS.muraja;
  const pm = state.surahProgress||{};
  const [search,setSearch] = useState("");
  const [sel,setSel] = useState(null);
  let list = SURAHS.filter(s=>pm[s.n]?.learnedRanges?.length>0&&surahLearnedPct(pm[s.n].learnedRanges,s.v)>0);
  if(filterMode==="juz"&&filterVal!=="all"){const j=getJuzInfo(Number(filterVal));list=list.filter(s=>s.n>=j.startSurah&&s.n<=j.endSurah);}
  else if(filterMode==="hizb"&&filterVal!=="all"){const h=getHizbInfo(Number(filterVal));list=list.filter(s=>s.n>=h.startSurah&&s.n<=h.endSurah);}
  if(search) list=list.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.ar.includes(search)||String(s.n).includes(search));
  return (
    <div>
      <div style={{background:"#1a0f00",border:"1px solid #f59e0b33",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#f59e0b",marginBottom:9}}>Seules les sourates mémorisées apparaissent ici</div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…" style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:9}}/>
      {(filterMode==="juz"||filterMode==="hizb")&&filterVal!=="all"&&<JuzHizbCard mode={filterMode} n={Number(filterVal)} surahProgress={pm} color={sec.color}/>}
      {list.length===0
        ? <div style={{textAlign:"center",color:"#333",fontSize:13,padding:30}}>Aucune sourate dans ce filtre</div>
        : <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {list.map(s=>{
            const pct=surahLearnedPct(pm[s.n]?.learnedRanges,s.v);
            const mastery=pm[s.n]?.mastery; const m=mastery?MASTERY[mastery]:null;
            const due=mastery?isDueForReview(mastery,pm[s.n]?.lastReviewed):false;
            return (
              <div key={s.n} onClick={()=>setSel(s.n)} style={{background:"#111",border:`1px solid ${due?"#f59e0b33":"#1a1a1a"}`,borderRadius:10,padding:"11px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#444",flexShrink:0}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,color:"#ddd",fontWeight:500}}>{s.name}</span>
                    <span style={{fontFamily:"'Scheherazade New',serif",fontSize:16,color:"#c9a84c88"}}>{s.ar}</span>
                    {m&&<span style={{fontSize:10,color:m.color,background:m.color+"22",borderRadius:20,padding:"1px 7px"}}>{m.label}</span>}
                    {due&&<span style={{fontSize:10,color:"#f59e0b",background:"#f59e0b11",borderRadius:20,padding:"1px 7px"}}>Due</span>}
                  </div>
                  <div style={{fontSize:10,color:"#444",marginTop:2}}>{pct}% mémorisé</div>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:pct===100?sec.color:"#f59e0b",fontFamily:"monospace"}}>{pct}%</span>
              </div>
            );
          })}
        </div>
      }
      {sel&&<SurahPanel surahN={sel} surahProgress={pm} onClose={()=>setSel(null)} onSaveHifz={onSaveHifz} sec={sec}/>}
    </div>
  );
}

// ── MURAJA SESSION ────────────────────────────────────────────────────────────
function MurajaSession({state, onSave, onDone}) {
  const sec = SECTIONS.muraja;
  const pm = state.surahProgress||{};
  const learned = SURAHS.filter(s=>pm[s.n]?.learnedRanges?.length>0);
  const firstN = learned[0]?.n||1;
  const lastN = learned[learned.length-1]?.n||1;
  const [fromS,setFromS] = useState(firstN);
  const [fromV,setFromV] = useState(1);
  const [toS,setToS] = useState(lastN);
  const [toV,setToV] = useState(SURAHS.find(s=>s.n===lastN)?.v||1);
  const [type,setType] = useState("solo");
  const [partner,setPartner] = useState("");
  const [notes,setNotes] = useState("");
  const [quality,setQuality] = useState(3);
  const [saved,setSaved] = useState(false);
  const [startTime] = useState(()=>Date.now());
  const fsD = SURAHS.find(s=>s.n===fromS);
  const tsD = SURAHS.find(s=>s.n===toS);
  const cnt = Math.max(0, globalVerse(toS,toV)-globalVerse(fromS,fromV)+1);
  const save = async () => {
    const dur=Math.round((Date.now()-startTime)/60000);
    await onSave({date:today(),type,partner:type==="solo"?null:partner,quality,notes,duration:dur||1,range:{fromSurah:fromS,fromVerse:fromV,toSurah:toS,toVerse:toV,fromName:fsD?.name,toName:tsD?.name}});
    setSaved(true); setTimeout(onDone,1500);
  };
  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:48}}>✅</div><div style={{color:sec.color,fontSize:16,marginTop:12,fontWeight:700}}>Révision enregistrée !</div></div>;
  if(learned.length===0) return <div style={{textAlign:"center",padding:40,color:"#555",fontSize:13}}>Commence par mémoriser des sourates dans la section Hifz !</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل مراجعة</div>
        <div style={{fontSize:12,color:"#555",marginTop:2}}>Nouvelle séance de révision</div>
      </div>
      {cnt>0&&<div style={{background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:8,padding:"9px 13px",fontSize:12,color:sec.color+"cc",textAlign:"center"}}>{fsD?.name} {fromV} → {tsD?.name} {toV} · {cnt} versets · {Math.round(cnt/TOTAL_VERSES*100)}% du Coran</div>}
      <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:10,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:10}}>Plage révisée</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"start"}}>
          <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:9,padding:10}}>
            <div style={{fontSize:10,color:sec.color+"88",textTransform:"uppercase",marginBottom:6}}>Début</div>
            <select value={fromS} onChange={e=>{setFromS(Number(e.target.value));setFromV(1);}} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"5px 7px",fontSize:11,outline:"none",marginBottom:6}}>{learned.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}</select>
            <select value={fromV} onChange={e=>setFromV(Number(e.target.value))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"5px 7px",fontSize:13,outline:"none"}}>{Array.from({length:fsD?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}</select>
          </div>
          <div style={{color:"#333",fontSize:16,paddingTop:32,textAlign:"center"}}>→</div>
          <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:9,padding:10}}>
            <div style={{fontSize:10,color:sec.color+"88",textTransform:"uppercase",marginBottom:6}}>Fin</div>
            <select value={toS} onChange={e=>{setToS(Number(e.target.value));setToV(1);}} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"5px 7px",fontSize:11,outline:"none",marginBottom:6}}>{learned.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}</select>
            <select value={toV} onChange={e=>setToV(Number(e.target.value))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"5px 7px",fontSize:13,outline:"none"}}>{Array.from({length:tsD?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}</select>
          </div>
        </div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:8}}>Qualité</div>
        <div style={{display:"flex",gap:5}}>{[1,2,3,4,5].map(q=><button key={q} onClick={()=>setQuality(q)} style={{flex:1,padding:"9px 3px",borderRadius:7,fontSize:19,cursor:"pointer",border:quality>=q?`1px solid ${sec.color}55`:"1px solid #1a1a1a",background:quality>=q?sec.dim:"#0d0d0d",color:quality>=q?sec.color:"#2a2a2a"}}>★</button>)}</div>
        <div style={{fontSize:11,color:"#555",textAlign:"center",marginTop:5}}>{["","Très difficile","Difficile","Moyen","Bien","Excellent"][quality]}</div>
      </div>
      <div style={{display:"flex",gap:8}}>{[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=><button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:10,borderRadius:8,fontSize:13,cursor:"pointer",border:type===t.k?`1px solid ${sec.color}`:"1px solid #222",background:type===t.k?sec.dim:"#111",color:type===t.k?sec.color:"#555"}}>{t.l}</button>)}</div>
      {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes…" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:`linear-gradient(135deg,${sec.dim},${sec.color}40)`,border:`1px solid ${sec.border}`,color:sec.color}}>Enregistrer la révision</button>
    </div>
  );
}

// ── WIRD DASHBOARD ────────────────────────────────────────────────────────────
function WirdDashboard({state, onNewSession, persist}) {
  const sec = SECTIONS.wird;
  const useHijri = state.wirdUseHijri||false;
  const mk = getMonthKey(useHijri);
  const wird = state.wird||{};
  const monthData = wird[mk]||{};
  const sessions = monthData.sessions||[];
  const goal = monthData.goal||1;
  const lastSession = useMemo(()=>[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0], [sessions]);
  const khatma = state.khatma||null;

  const khatmaV = useMemo(()=>{
    if(!khatma) return 0;
    return (khatma.sessions||[]).reduce((s,sess)=>s+Math.max(0,(sess.toGlobal||globalVerse(sess.toSurah||1,sess.toVerse||1))-(sess.fromGlobal||globalVerse(sess.fromSurah||1,sess.fromVerse||1))+1),0);
  },[khatma]);
  const kpct = khatma ? Math.min(100,Math.round((khatmaV/TOTAL_VERSES)*100)) : 0;

  const totalRead = useMemo(()=>sessions.reduce((s,sess)=>s+Math.max(0,(sess.toGlobal||globalVerse(sess.toSurah||1,sess.toVerse||1))-(sess.fromGlobal||globalVerse(sess.fromSurah||1,sess.fromVerse||1))+1),0),[sessions]);
  const pct = Math.min(100,Math.round((totalRead/(TOTAL_VERSES*goal))*100));

  let expectedPct = 0;
  if(useHijri){const h=todayHijri();const dim=[30,29,30,29,30,29,30,29,30,29,30,29][h.m-1]||30;expectedPct=Math.round((h.d/dim)*100);}
  else{const n=new Date();expectedPct=Math.round((n.getDate()/new Date(n.getFullYear(),n.getMonth()+1,0).getDate())*100);}
  const ahead = pct>=expectedPct;

  const setGoal = async g => await persist({...state,wird:{...wird,[mk]:{...monthData,goal:g}}});
  const toggleCal = async () => await persist({...state,wirdUseHijri:!useHijri});

  let mLabel="";
  if(useHijri){const h=todayHijri();mLabel=`${HM_AR[h.m-1]} ${h.y}H`;}
  else{const n=new Date();mLabel=n.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});}

  return (
    <div>
      {/* Month card */}
      <div style={{background:"linear-gradient(135deg,#001a0a,#002510)",border:`1px solid ${sec.color}22`,borderRadius:12,padding:15,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:13}}>
          <div>
            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:sec.color}}>الورد الشهري</div>
            <div style={{fontSize:11,color:sec.color+"66",marginTop:2}}>{mLabel}</div>
            <button onClick={toggleCal} style={{marginTop:4,padding:"2px 9px",borderRadius:20,fontSize:9,cursor:"pointer",border:`1px solid ${sec.color}33`,background:"transparent",color:sec.color+"88"}}>
              {useHijri?"Calendrier Hijri":"Calendrier Grégorien"} — changer
            </button>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#444",marginBottom:5}}>Objectif (×Coran)</div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <button onClick={()=>setGoal(Math.max(1,goal-1))} style={{width:24,height:24,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",color:"#888",fontSize:14,cursor:"pointer",lineHeight:1}}>−</button>
              <span style={{fontSize:20,fontWeight:700,color:sec.color,fontFamily:"monospace",minWidth:20,textAlign:"center"}}>{goal}</span>
              <button onClick={()=>setGoal(goal+1)} style={{width:24,height:24,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",color:"#888",fontSize:14,cursor:"pointer",lineHeight:1}}>+</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}><span style={{color:"#555"}}>Progression</span><span style={{color:sec.color,fontWeight:700}}>{pct}%</span></div>
        <div style={{height:7,background:"#0a2010",borderRadius:5,overflow:"hidden",position:"relative"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:5,transition:"width .5s"}}/>
          <div style={{position:"absolute",top:0,bottom:0,left:`${expectedPct}%`,width:1,background:"#ffffff22"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:4}}>
          <span style={{color:ahead?"#4ade8077":"#ef444477"}}>{ahead?`En avance de ${pct-expectedPct}%`:`En retard de ${expectedPct-pct}%`}</span>
          <span style={{color:"#333"}}>Attendu : {expectedPct}%</span>
        </div>
        {lastSession&&<div style={{background:"#ffffff08",borderRadius:8,padding:"7px 11px",fontSize:11,marginTop:9}}><span style={{color:"#444"}}>Dernière position : </span><span style={{color:sec.color,fontWeight:600}}>{SURAHS.find(s=>s.n===lastSession.toSurah)?.name} — v.{lastSession.toVerse}</span></div>}
      </div>

      {/* Khatma */}
      <div style={{background:"#111",border:`1px solid ${sec.color}33`,borderRadius:10,padding:13,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:khatma?8:0}}>
          <div style={{fontSize:11,color:sec.color,textTransform:"uppercase",letterSpacing:1}}>Mode Khatma</div>
          {khatma&&<span style={{fontSize:12,color:sec.color,fontWeight:700,fontFamily:"monospace"}}>{kpct}%</span>}
        </div>
        {khatma?(
          <>
            <div style={{height:5,background:"#0a2010",borderRadius:4,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:`${kpct}%`,background:sec.color,borderRadius:4}}/></div>
            <div style={{fontSize:11,color:"#555"}}>{khatmaV.toLocaleString()}/{TOTAL_VERSES.toLocaleString()} versets lus</div>
            {kpct===100&&<div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:sec.color,textAlign:"center",marginTop:9}}>تمت الختمة بحمد الله 🎉</div>}
          </>
        ):(
          <button onClick={async()=>await persist({...state,khatma:{startDate:today(),sessions:[]}})} style={{width:"100%",padding:9,background:sec.color+"11",border:`1px dashed ${sec.color}33`,borderRadius:7,color:sec.color+"88",fontSize:12,cursor:"pointer",marginTop:7}}>
            + Démarrer une Khatma
          </button>
        )}
      </div>

      {/* Sessions */}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:8}}>Séances de lecture</div>
        {sessions.length===0
          ? <div style={{textAlign:"center",color:"#333",fontSize:13,padding:"8px 0"}}>Aucune lecture ce mois</div>
          : [...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map((s,i)=>{
            const cnt=Math.max(0,(s.toGlobal||globalVerse(s.toSurah||1,s.toVerse||1))-(s.fromGlobal||globalVerse(s.fromSurah||1,s.fromVerse||1))+1);
            const fN=s.juzMode?`Juz ${s.juzN}`:s.hizbMode?`Hizb ${s.hizbN}`:SURAHS.find(x=>x.n===s.fromSurah)?.name||"";
            const tN=SURAHS.find(x=>x.n===s.toSurah)?.name||"";
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<5?"1px solid #1a1a1a":"none"}}>
                <div>
                  <div style={{fontSize:13,color:"#ccc"}}>{s.juzMode?`Juz ${s.juzN}`:s.hizbMode?`Hizb ${s.hizbN}`:s.mode==="point"?`Jusqu'à ${tN} v.${s.toVerse}`:`${fN} v.${s.fromVerse} → ${tN} v.${s.toVerse}`}</div>
                  <div style={{fontSize:11,color:"#444",marginTop:1}}>{formatHijri(s.date)}</div>
                </div>
                <span style={{fontSize:11,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 9px"}}>{cnt}v.</span>
              </div>
            );
          })
        }
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${sec.dim},${sec.color}30)`,border:`1px solid ${sec.border}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:700}}>
        + Enregistrer une lecture
      </button>
    </div>
  );
}

// ── WIRD LIST ─────────────────────────────────────────────────────────────────
function WirdList({state, filterMode, filterVal}) {
  const sec = SECTIONS.wird;
  const pm = state.surahProgress||{};
  const [search,setSearch] = useState("");
  let list = SURAHS;
  if(filterMode==="juz"&&filterVal!=="all"){const j=getJuzInfo(Number(filterVal));list=SURAHS.filter(s=>s.n>=j.startSurah&&s.n<=j.endSurah);}
  else if(filterMode==="hizb"&&filterVal!=="all"){const h=getHizbInfo(Number(filterVal));list=SURAHS.filter(s=>s.n>=h.startSurah&&s.n<=h.endSurah);}
  if(search) list=list.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.ar.includes(search)||String(s.n).includes(search));
  return (
    <div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…" style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:9}}/>
      {(filterMode==="juz"||filterMode==="hizb")&&filterVal!=="all"&&<JuzHizbCard mode={filterMode} n={Number(filterVal)} surahProgress={pm} color={sec.color}/>}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {list.map(s=>{const pct=surahLearnedPct(pm[s.n]?.learnedRanges,s.v);return(
          <div key={s.n} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 13px",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#444",flexShrink:0}}>{s.n}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:"#ccc"}}>{s.name} <span style={{fontFamily:"'Scheherazade New',serif",fontSize:16,color:"#c9a84c77"}}>{s.ar}</span></div>
              <div style={{fontSize:10,color:"#444",marginTop:1}}>Juz {s.juz} · {s.v}v.</div>
            </div>
            {pct>0&&<span style={{fontSize:11,color:sec.color,fontFamily:"monospace"}}>{pct}% hifz</span>}
          </div>
        );})}
      </div>
    </div>
  );
}

// ── WIRD SESSION ──────────────────────────────────────────────────────────────
function WirdSession({state, onSave, onDone}) {
  const sec = SECTIONS.wird;
  const useHijri = state.wirdUseHijri||false;
  const mk = getMonthKey(useHijri);
  const sessions = (state.wird||{})[mk]?.sessions||[];
  const last = useMemo(()=>[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0],[sessions]);
  const [mode,setMode] = useState("point");
  const [toS,setToS] = useState(last?.toSurah||1);
  const [toV,setToV] = useState(last?.toVerse||1);
  const [fromS,setFromS] = useState(last?.toSurah||1);
  const [fromV,setFromV] = useState(last?.toVerse||1);
  const [juz,setJuz] = useState(1);
  const [hizb,setHizb] = useState(1);
  const [notes,setNotes] = useState("");
  const [saved,setSaved] = useState(false);
  const toSD = SURAHS.find(s=>s.n===toS);
  const fromSD = SURAHS.find(s=>s.n===fromS);

  const save = async () => {
    let sess = {date:today(),mode,notes};
    if(mode==="juz"){const j=getJuzInfo(juz);sess={...sess,juzMode:true,juzN:juz,fromSurah:j.startSurah,fromVerse:j.startVerse,toSurah:j.endSurah,toVerse:j.endVerse,fromGlobal:globalVerse(j.startSurah,j.startVerse),toGlobal:globalVerse(j.endSurah,j.endVerse)};}
    else if(mode==="hizb"){const h=getHizbInfo(hizb);sess={...sess,hizbMode:true,hizbN:hizb,fromSurah:h.startSurah,fromVerse:h.startVerse,toSurah:h.endSurah,toVerse:h.endVerse,fromGlobal:globalVerse(h.startSurah,h.startVerse),toGlobal:globalVerse(h.endSurah,h.endVerse)};}
    else if(mode==="point"){sess={...sess,fromSurah:last?.toSurah||1,fromVerse:last?.toVerse||1,toSurah:toS,toVerse:toV,fromGlobal:globalVerse(last?.toSurah||1,last?.toVerse||1),toGlobal:globalVerse(toS,toV)};}
    else{sess={...sess,fromSurah:fromS,fromVerse:fromV,toSurah:toS,toVerse:toV,fromGlobal:globalVerse(fromS,fromV),toGlobal:globalVerse(toS,toV)};}
    await onSave(sess, state.khatma);
    setSaved(true); setTimeout(onDone,1500);
  };

  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:48}}>✅</div><div style={{color:sec.color,fontSize:16,marginTop:12,fontWeight:700}}>Lecture enregistrée !</div></div>;
  const modes=[{k:"point",l:"Jusqu'à…"},{k:"range",l:"Plage libre"},{k:"juz",l:"Par Juz"},{k:"hizb",l:"Par Hizb"}];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل ورد</div>
        <div style={{fontSize:12,color:"#555",marginTop:2}}>Enregistrer une lecture</div>
      </div>
      {last&&<div style={{background:sec.dim,border:`1px solid ${sec.border}`,borderRadius:8,padding:"9px 13px",fontSize:12}}><span style={{color:"#555"}}>Dernière position : </span><span style={{color:sec.color,fontWeight:600}}>{SURAHS.find(s=>s.n===last.toSurah)?.name} — v.{last.toVerse}</span></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
        {modes.map(m=><button key={m.k} onClick={()=>setMode(m.k)} style={{padding:"8px 3px",borderRadius:7,fontSize:10,cursor:"pointer",textAlign:"center",border:mode===m.k?`1px solid ${sec.color}`:"1px solid #222",background:mode===m.k?sec.dim:"#111",color:mode===m.k?sec.color:"#555",fontWeight:mode===m.k?700:400}}>{m.l}</button>)}
      </div>
      {mode==="juz"&&<div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:9,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:7}}>Sélectionner le Juz</div>
        <select value={juz} onChange={e=>setJuz(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"9px 11px",fontSize:14,outline:"none",marginBottom:7}}>
          {Array.from({length:30},(_,i)=>i+1).map(n=><option key={n} value={n}>Juz {n} ({JUZ_VERSES[n-1]}v.)</option>)}
        </select>
        <div style={{fontSize:11,color:sec.color+"88",textAlign:"center"}}>{JUZ_VERSES[juz-1]}v. · {Math.round(JUZ_VERSES[juz-1]/TOTAL_VERSES*100)}% du Coran</div>
      </div>}
      {mode==="hizb"&&<div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:9,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:7}}>Sélectionner le Hizb</div>
        <select value={hizb} onChange={e=>setHizb(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"9px 11px",fontSize:14,outline:"none",marginBottom:7}}>
          {Array.from({length:60},(_,i)=>i+1).map(n=><option key={n} value={n}>Hizb {n} ({HIZB_VERSES[n-1]}v.)</option>)}
        </select>
        <div style={{fontSize:11,color:sec.color+"88",textAlign:"center"}}>{HIZB_VERSES[hizb-1]}v. · {Math.round(HIZB_VERSES[hizb-1]/TOTAL_VERSES*100)}% du Coran</div>
      </div>}
      {mode==="range"&&<div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:9,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:7}}>Début</div>
        <div style={{display:"flex",gap:8}}>
          <select value={fromS} onChange={e=>{setFromS(Number(e.target.value));setFromV(1);}} style={{flex:2,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none"}}>{SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}</select>
          <select value={fromV} onChange={e=>setFromV(Number(e.target.value))} style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:14,outline:"none"}}>{Array.from({length:fromSD?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}</select>
        </div>
      </div>}
      {(mode==="point"||mode==="range")&&<div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:9,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:7}}>{mode==="point"?"Je me suis arrêté à…":"Fin"}</div>
        <div style={{display:"flex",gap:8}}>
          <select value={toS} onChange={e=>{setToS(Number(e.target.value));setToV(1);}} style={{flex:2,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:12,outline:"none"}}>{SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}</select>
          <select value={toV} onChange={e=>setToV(Number(e.target.value))} style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"8px 10px",fontSize:14,outline:"none"}}>{Array.from({length:toSD?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}</select>
        </div>
        <div style={{marginTop:9,background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:7,padding:"7px 11px",fontSize:12,color:sec.color+"cc",textAlign:"center",fontWeight:600}}>{SURAHS.find(s=>s.n===toS)?.name} — verset {toV} / {toSD?.v}</div>
      </div>}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes…" style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:`linear-gradient(135deg,${sec.dim},${sec.color}40)`,border:`1px solid ${sec.border}`,color:sec.color}}>Enregistrer la lecture</button>
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsView({state}) {
  const pm = state.surahProgress||{};
  const ms = state.murajaSessions||[];
  const months = useMemo(()=>{
    const arr=[];
    for(let w=7;w>=0;w--){const d=new Date();d.setDate(d.getDate()-w*7);const ws=d.toISOString().slice(0,7);let cnt=0;Object.values(pm).forEach(p=>{(p.hifzSessions||[]).forEach(s=>{if(s.date?.slice(0,7)===ws) cnt++;});});arr.push({label:ws.slice(5),count:cnt});}
    return arr;
  },[pm]);
  let totalMin=0;Object.values(pm).forEach(p=>{(p.hifzSessions||[]).forEach(s=>{totalMin+=(s.duration||0);});});ms.forEach(s=>{totalMin+=(s.duration||0);});
  const errorRates = useMemo(()=>SURAHS.filter(s=>pm[s.n]?.hifzSessions?.length>0).map(s=>({name:s.name,rate:surahErrorRate(pm[s.n].hifzSessions)})).filter(x=>x.rate>0).sort((a,b)=>b.rate-a.rate),[pm]);
  const wd=new Date();wd.setDate(wd.getDate()-7);const wds=wd.toISOString().slice(0,10);
  const thisWeekS=[];Object.values(pm).forEach(p=>{(p.hifzSessions||[]).forEach(s=>{if(s.date>=wds) thisWeekS.push(s);});});
  const twV=thisWeekS.reduce((s,sess)=>s+(sess.range?sess.range.to-sess.range.from+1:0),0);
  const maxC=Math.max(...months.map(w=>w.count),1);
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>الإحصائيات</div>
        <div style={{fontSize:12,color:"#555",marginTop:2}}>Statistiques et progression</div>
      </div>
      <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:10,padding:13,marginBottom:12}}>
        <div style={{fontSize:10,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Résumé de la semaine</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{l:"Séances",v:thisWeekS.length,c:"#60a5fa"},{l:"Versets",v:twV,c:"#4ade80"},{l:"Temps total",v:`${Math.round(totalMin/60)}h`,c:"#f59e0b"}].map(c=>(
            <div key={c.l} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"10px 5px",textAlign:"center"}}>
              <div style={{fontSize:17,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
              <div style={{fontSize:10,color:"#444",textTransform:"uppercase",marginTop:2}}>{c.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:11}}>Séances par mois (8 derniers)</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:60}}>
          {months.map((w,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:"100%",background:"#60a5fa",borderRadius:"3px 3px 0 0",height:`${Math.max(4,(w.count/maxC)*52)}px`,opacity:0.8}}/>
              <div style={{fontSize:8,color:"#444"}}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>
      {errorRates.length>0&&<div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:9}}>Taux d'erreurs par sourate</div>
        {errorRates.slice(0,7).map(e=>(
          <div key={e.name} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#ccc"}}>{e.name}</span><span style={{color:e.rate>3?"#ef4444":e.rate>1?"#f59e0b":"#4ade80",fontFamily:"monospace",fontWeight:700}}>{e.rate}</span></div>
            <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,e.rate/5*100)}%`,background:e.rate>3?"#ef4444":e.rate>1?"#f59e0b":"#4ade80",borderRadius:3}}/></div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
function Leaderboard({state, persist}) {
  const [friends,setFriends] = useState([]);
  const [myGroups,setMyGroups] = useState([]);
  const [loading,setLoading] = useState(true);
  const [newGroupName,setNewGroupName] = useState("");
  const [joinCode,setJoinCode] = useState("");
  useEffect(()=>{
    const u=dbListen("leaderboard",d=>{if(d) setFriends(Object.entries(d).map(([uid,v])=>({uid,...v})).sort((a,b)=>(b.memorized||0)-(a.memorized||0)));setLoading(false);});
    const u2=dbListen(`userGroups/${UID}`,d=>{setMyGroups(d?Object.values(d):[]);});
    return()=>{u();u2();};
  },[]);
  useEffect(()=>{
    if(!state.profile?.name) return;
    const pm=state.surahProgress||{};
    const mem=SURAHS.filter(s=>surahLearnedPct(pm[s.n]?.learnedRanges,s.v)===100).length;
    dbSet(`leaderboard/${UID}`,{name:state.profile.name,memorized:mem,streak:state.streak?.count||0,updatedAt:today()});
  },[state.profile,state.surahProgress]);
  const createGroup=async()=>{if(!newGroupName.trim()) return;const gid=genId();await dbSet(`groups/${gid}`,{name:newGroupName,creator:UID,members:{[UID]:state.profile?.name||"Moi"},code:gid});await dbSet(`userGroups/${UID}/${gid}`,{gid,name:newGroupName});setNewGroupName("");};
  const joinGroup=async()=>{if(!joinCode.trim()) return;const r2=ref(db,`groups/${joinCode}`);onValue(r2,async s=>{if(s.exists()){const g=s.val();await dbSet(`groups/${joinCode}/members/${UID}`,state.profile?.name||"Moi");await dbSet(`userGroups/${UID}/${joinCode}`,{gid:joinCode,name:g.name});setJoinCode("");}},{onlyOnce:true});};
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:14}}><div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>المتسابقون</div><div style={{fontSize:12,color:"#555",marginTop:2}}>Classement & groupes</div></div>
      <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:11,color:"#60a5fa",marginBottom:5,fontWeight:700}}>Partage Thabaat</div>
        <div style={{display:"flex",gap:7}}><div style={{flex:1,background:"#111",border:"1px solid #1e1e1e",borderRadius:6,padding:"7px 10px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{window.location.origin+window.location.pathname}</div><button onClick={()=>navigator.clipboard.writeText(window.location.origin+window.location.pathname).catch(()=>{})} style={{padding:"7px 11px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:11,cursor:"pointer"}}>Copier</button></div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:9}}>Mes groupes</div>
        {myGroups.map(g=><div key={g.gid} style={{background:"#0d0d0d",border:"1px solid #222",borderRadius:7,padding:"7px 11px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#ccc"}}>{g.name}</span><button onClick={()=>navigator.clipboard.writeText(g.gid).catch(()=>{})} style={{padding:"2px 8px",background:"#c9a84c22",border:"1px solid #c9a84c44",borderRadius:20,color:"#c9a84c",fontSize:9,cursor:"pointer"}}>Copier code</button></div>)}
        <div style={{display:"flex",gap:6,marginBottom:6}}><input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Nom du groupe…" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 10px",fontSize:12,outline:"none"}}/><button onClick={createGroup} style={{padding:"7px 12px",background:"#c9a84c22",border:"1px solid #c9a84c44",borderRadius:7,color:"#c9a84c",fontSize:12,cursor:"pointer"}}>Créer</button></div>
        <div style={{display:"flex",gap:6}}><input value={joinCode} onChange={e=>setJoinCode(e.target.value)} placeholder="Code du groupe…" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 10px",fontSize:12,outline:"none"}}/><button onClick={joinGroup} style={{padding:"7px 12px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:7,color:"#60a5fa",fontSize:12,cursor:"pointer"}}>Rejoindre</button></div>
      </div>
      {!state.profile?.name&&<div style={{background:"#1a1a0a",border:"1px solid #f59e0b33",borderRadius:9,padding:10,marginBottom:10,fontSize:12,color:"#f59e0b"}}>Configure ton prénom dans Profil pour apparaître ici.</div>}
      {loading?<div style={{textAlign:"center",color:"#444",padding:20}}>Chargement…</div>:
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {friends.map((f,i)=>(
          <div key={f.uid} style={{background:f.uid===UID?"#111822":"#111",border:`1px solid ${f.uid===UID?"#60a5fa33":"#1a1a1a"}`,borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#c9a84c22":i===1?"#88888822":"#0d0d0d",border:`1px solid ${i===0?"#c9a84c":i===1?"#888":"#222"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:i===0?"#c9a84c":i===1?"#aaa":"#444",flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontSize:13,color:f.uid===UID?"#60a5fa":"#ccc",fontWeight:500}}>{f.name}{f.uid===UID?" (moi)":""}</div><div style={{fontSize:10,color:"#444",marginTop:1}}>✨ {f.streak||0}j consécutifs</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700,color:"#60a5fa",fontFamily:"monospace"}}>{f.memorized||0}</div><div style={{fontSize:9,color:"#444",textTransform:"uppercase"}}>mémorisées</div></div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function ProfileView({state, persist, darkMode, setDarkMode}) {
  const [name,setName] = useState(state.profile?.name||"");
  const [saved,setSaved] = useState(false);
  const [notifGranted,setNotifGranted] = useState(Notification?.permission==="granted");
  const save = async () => { await persist({...state,profile:{...state.profile,name}}); setSaved(true); setTimeout(()=>setSaved(false),1500); };
  const reqNotif = async () => { const ok=await requestNotificationPermission(); setNotifGranted(ok); if(ok) sendNotification("Thabaat ✨","Notifications activées !"); };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>الملف الشخصي</div><div style={{fontSize:12,color:"#555",marginTop:2}}>Profil & Paramètres</div></div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13}}>
        <label style={{fontSize:11,color:"#555",textTransform:"uppercase",display:"block",marginBottom:7}}>Ton prénom</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ahmed, Ibrahim…" style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,color:"#ddd"}}>Mode {darkMode?"sombre":"clair"}</div>
          <div onClick={()=>setDarkMode(!darkMode)} style={{width:40,height:22,borderRadius:11,background:darkMode?"#333":"#c9a84c",position:"relative",cursor:"pointer",transition:"background .3s"}}>
            <div style={{position:"absolute",top:2,left:darkMode?2:20,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
          </div>
        </div>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:5}}>Notifications</div>
        {notifGranted
          ? <div style={{fontSize:12,color:"#4ade80"}}>✓ Notifications activées</div>
          : <button onClick={reqNotif} style={{width:"100%",padding:10,background:"#4ade8022",border:"1px solid #4ade8044",borderRadius:8,color:"#4ade80",fontSize:12,cursor:"pointer",fontWeight:700}}>Activer les notifications & vibrations</button>
        }
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:13}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",marginBottom:11}}>Rappels</div>
        {[{key:"hifz",title:"Rappel Hifz",color:"#60a5fa"},{key:"muraja",title:"Rappel Muraja'a",color:"#f59e0b"},{key:"wird",title:"Rappel Wird",color:"#4ade80"}].map(rem=>{
          const r=state.reminders?.[rem.key]||{enabled:false,time:"06:00"};
          const upd=async(f,v)=>await persist({...state,reminders:{...state.reminders,[rem.key]:{...r,[f]:v}}});
          return (
            <div key={rem.key} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:r.enabled?8:0}}>
                <div style={{fontSize:13,color:rem.color,fontWeight:500}}>{rem.title}</div>
                <div onClick={()=>upd("enabled",!r.enabled)} style={{width:40,height:21,borderRadius:11,background:r.enabled?rem.color:"#222",position:"relative",cursor:"pointer",transition:"background .3s"}}>
                  <div style={{position:"absolute",top:2,left:r.enabled?19:2,width:17,height:17,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
                </div>
              </div>
              {r.enabled&&<input type="time" value={r.time||"06:00"} onChange={e=>upd("time",e.target.value)} style={{background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"7px 12px",fontSize:18,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"monospace"}}/>}
            </div>
          );
        })}
      </div>
      <button onClick={save} style={{padding:13,borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:saved?"#4ade8022":"linear-gradient(135deg,#c9a84c22,#c9a84c40)",border:saved?"1px solid #4ade8055":"1px solid #c9a84c55",color:saved?"#4ade80":"#c9a84c",transition:"all .3s"}}>
        {saved?"Sauvegardé ✓":"Sauvegarder"}
      </button>
    </div>
  );
}

// ── CORRECTOR ─────────────────────────────────────────────────────────────────
function CorrectorView({sessionId}) {
  const [session,setSession] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ const u=dbListen(`sessions/${sessionId}`,d=>{setSession(d);setLoading(false);}); return u; },[sessionId]);
  const updateErrors=async ve=>await dbSet(`sessions/${sessionId}/verseErrors`,ve);
  if(loading) return <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#c9a84c",fontFamily:"'Scheherazade New',serif",fontSize:22}}>ثبات…</div></div>;
  if(!session) return <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#666",fontSize:14}}>Session introuvable</div></div>;
  const item=SURAHS.find(i=>i.n===Number(session.itemKey));
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#ddd",fontFamily:"'DM Sans',sans-serif",padding:"18px 14px 40px",paddingTop:"max(18px,env(safe-area-inset-top))",maxWidth:500,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>وضع المصحح</div>
          <div style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Mode Correcteur</div>
        </div>
        <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:10,padding:13,marginBottom:13}}>
          <div style={{fontSize:15,color:"#ddd",fontWeight:700}}>{session.itemName}</div>
          <div style={{fontSize:12,color:"#555",marginTop:2}}>{session.date}</div>
        </div>
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:13,marginBottom:13}}>
          <VerseErrorPicker totalVerses={item?.v||10} verseErrors={session.verseErrors||{}} onChange={updateErrors}/>
        </div>
        <div style={{background:"#0d3320",border:"1px solid #4ade8033",borderRadius:9,padding:11,fontSize:12,color:"#4ade80",textAlign:"center"}}>✓ Synchronisation en temps réel</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [state,setState] = useState(null);
  const [section,setSection] = useState("hifz");
  const [subTab,setSubTab] = useState("dashboard");
  const [globalTab,setGlobalTab] = useState("main");
  const [filterMode,setFilterMode] = useState("surah");
  const [filterVal,setFilterVal] = useState("all");
  const [loading,setLoading] = useState(true);
  const [darkMode,setDarkMode] = useState(true);
  const [connOk,setConnOk] = useState(true);
  const [showQuran,setShowQuran] = useState(false);
  const [quranBookmark,setQuranBookmark] = useState(null);

  const correctorId = new URLSearchParams(window.location.search).get("corrector");
  if(correctorId) return <CorrectorView sessionId={correctorId}/>;

  // Firebase connection monitor
  useEffect(()=>{
    const connRef=ref(db,".info/connected");
    const u=onValue(connRef,s=>setConnOk(s.val()===true));
    return()=>off(connRef);
  },[]);

  // Load state
  useEffect(()=>{
    const u=dbListen(`users/${UID}`,data=>{
      setState(data||DEFAULT_STATE);
      setLoading(false);
    });
    return u;
  },[]);

  // Notification timer
  useEffect(()=>{
    if(!state) return;
    const interval=setInterval(()=>{
      const now=new Date();
      const hhmm=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const r=state.reminders||{};
      if(r.hifz?.enabled&&r.hifz.time===hhmm) sendNotification("Thabaat — Hifz ◈","C'est l'heure de ta séance d'apprentissage !");
      if(r.muraja?.enabled&&r.muraja.time===hhmm) sendNotification("Thabaat — Muraja'a ↺","C'est l'heure de ta révision !");
      if(r.wird?.enabled&&r.wird.time===hhmm) sendNotification("Thabaat — Wird ☽","C'est l'heure de ta lecture du Coran !");
    },60000);
    return ()=>clearInterval(interval);
  },[state]);

  const persist = async ns => { setState(ns); await dbSet(`users/${UID}`,ns); };

  const onSaveHifz = async (surahKey, session, surahData, goal) => {
    const pm=state.surahProgress||{};
    const ns=updateStreak(state.streak||{});
    const newState={...state,streak:ns,surahProgress:{...pm,[surahKey]:{...(pm[surahKey]||{}),...surahData}}};
    if(goal) newState.memGoal=goal;
    await persist(newState);
  };
  const onSaveMuraja = async session => {
    const ns=updateStreak(state.streak||{});
    await persist({...state,streak:ns,murajaSessions:[session,...(state.murajaSessions||[])]});
  };
  const onSaveWird = async (session, khatma) => {
    const mk=getMonthKey(state.wirdUseHijri||false);
    const wird=state.wird||{};
    const md=wird[mk]||{goal:1,sessions:[]};
    const ns=updateStreak(state.streak||{});
    let newState={...state,streak:ns,wird:{...wird,[mk]:{...md,sessions:[session,...(md.sessions||[])]}}};
    if(khatma&&state.khatma) newState.khatma={...state.khatma,sessions:[session,...(state.khatma.sessions||[])]};
    await persist(newState);
  };

  const changeSection = s => { setSection(s); setSubTab("dashboard"); setFilterMode("surah"); setFilterVal("all"); };
  const changeSubTab  = t => { setSubTab(t); if(t!=="list"){setFilterMode("surah");setFilterVal("all");} };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,paddingTop:"env(safe-area-inset-top)"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={{fontFamily:"'Scheherazade New',serif",fontSize:44,color:"#c9a84c"}}>ثبات</div>
      <div style={{fontSize:10,color:"#333",letterSpacing:3,textTransform:"uppercase"}}>Chargement…</div>
    </div>
  );

  if(showQuran) return <QuranViewer initialSurah={quranBookmark||1} onClose={()=>setShowQuran(false)} onBookmark={n=>{setQuranBookmark(n);persist({...state,quranBookmark:n});}} bookmark={state.quranBookmark||quranBookmark}/>;

  const sec = SECTIONS[section];
  const streak = state.streak||{count:0};
  const streakWarning = streak.count>0 && streak.lastDate!==today();
  const bg = darkMode ? "#0a0a0a" : "#f5f0e8";
  const hBg = darkMode ? "#0c0c0cf8" : "#f5f0e8f8";
  const bd = darkMode ? "#1e1e1e" : "#ddd";
  const textColor = darkMode ? "#ddd" : "#222";

  return (
    <div style={{minHeight:"100vh",background:bg,color:textColor,fontFamily:"'DM Sans',sans-serif",position:"relative",transition:"background .3s"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg color={sec.color}/>

      {/* TOP HEADER */}
      <div style={{position:"sticky",top:0,zIndex:10,background:hBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${bd}`,padding:"8px 14px",paddingTop:"max(8px,env(safe-area-inset-top))",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:19,color:"#c9a84c",lineHeight:1}}>ثبات</div>
          <div style={{fontSize:8,color:"#666",letterSpacing:2,textTransform:"uppercase",marginTop:1}}>Thabaat</div>
        </div>
        {/* Connection + streak */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {!connOk&&<div style={{fontSize:9,color:"#ef4444",background:"#ef444411",border:"1px solid #ef444433",borderRadius:20,padding:"2px 8px"}}>Hors ligne</div>}
          <div style={{display:"flex",alignItems:"center",gap:4,background:streakWarning?"#1a0808":"#111",border:`1px solid ${streakWarning?"#ef444433":"#c9a84c22"}`,borderRadius:18,padding:"3px 9px"}}>
            <span style={{fontSize:12}}>{streakWarning?"⚠️":"✨"}</span>
            <span style={{fontFamily:"monospace",fontWeight:700,color:streakWarning?"#ef4444":"#f59e0b",fontSize:12}}>{streak.count}j</span>
          </div>
        </div>
        {/* Nav buttons */}
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>{setShowQuran(true);}} style={{width:29,height:29,borderRadius:7,background:"#111",border:"1px solid #222",color:"#c9a84c",fontSize:16,cursor:"pointer"}}>📖</button>
          <button onClick={()=>setGlobalTab(globalTab==="stats"?"main":"stats")} style={{width:29,height:29,borderRadius:7,background:globalTab==="stats"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="stats"?"#c9a84c44":"#222"}`,color:globalTab==="stats"?"#c9a84c":"#444",fontSize:11,cursor:"pointer",fontWeight:700}}>S</button>
          <button onClick={()=>setGlobalTab(globalTab==="leaderboard"?"main":"leaderboard")} style={{width:29,height:29,borderRadius:7,background:globalTab==="leaderboard"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="leaderboard"?"#c9a84c44":"#222"}`,color:globalTab==="leaderboard"?"#c9a84c":"#444",fontSize:11,cursor:"pointer",fontWeight:700}}>C</button>
          <button onClick={()=>setGlobalTab(globalTab==="profile"?"main":"profile")} style={{width:29,height:29,borderRadius:7,background:globalTab==="profile"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="profile"?"#c9a84c44":"#222"}`,color:globalTab==="profile"?"#c9a84c":"#444",fontSize:11,cursor:"pointer",fontWeight:700}}>P</button>
        </div>
      </div>

      {/* STICKY NAV */}
      {globalTab==="main"&&<StickyNav section={section} onSection={changeSection} subTab={subTab} onSubTab={changeSubTab} filterMode={filterMode} onFilterMode={setFilterMode} filterVal={filterVal} onFilterVal={setFilterVal} sec={sec} darkMode={darkMode}/>}

      {/* CONTENT */}
      <div style={{padding:"12px 14px 130px",maxWidth:600,margin:"0 auto",position:"relative",zIndex:1}}>
        {globalTab!=="main"?(
          <>
            <button onClick={()=>setGlobalTab("main")} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:13,padding:0}}>
              ← Retour
            </button>
            {globalTab==="stats"&&<StatsView state={state}/>}
            {globalTab==="leaderboard"&&<Leaderboard state={state} persist={persist}/>}
            {globalTab==="profile"&&<ProfileView state={state} persist={persist} darkMode={darkMode} setDarkMode={setDarkMode}/>}
          </>
        ):(
          <>
            {subTab==="session"&&(
              <button onClick={()=>setSubTab("dashboard")} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:13,padding:0}}>← Retour</button>
            )}

            {section==="hifz"&&subTab==="dashboard"&&<HifzDashboard state={state} onNewSession={()=>changeSubTab("session")}/>}
            {section==="hifz"&&subTab==="list"&&<HifzList state={state} onSaveHifz={onSaveHifz} filterMode={filterMode} filterVal={filterVal}/>}
            {section==="hifz"&&subTab==="session"&&<HifzSession state={state} onSave={onSaveHifz} onDone={()=>changeSubTab("dashboard")}/>}

            {section==="muraja"&&subTab==="dashboard"&&<MurajaDashboard state={state} onNewSession={()=>changeSubTab("session")}/>}
            {section==="muraja"&&subTab==="list"&&<MurajaList state={state} onSaveHifz={onSaveHifz} filterMode={filterMode} filterVal={filterVal}/>}
            {section==="muraja"&&subTab==="session"&&<MurajaSession state={state} onSave={onSaveMuraja} onDone={()=>changeSubTab("dashboard")}/>}

            {section==="wird"&&subTab==="dashboard"&&<WirdDashboard state={state} onNewSession={()=>changeSubTab("session")} persist={persist}/>}
            {section==="wird"&&subTab==="list"&&<WirdList state={state} filterMode={filterMode} filterVal={filterVal}/>}
            {section==="wird"&&subTab==="session"&&<WirdSession state={state} onSave={onSaveWird} onDone={()=>changeSubTab("dashboard")}/>}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,background:darkMode?"#0d0d0df5":"#f5f0e8f5",backdropFilter:"blur(12px)",borderTop:`1px solid ${bd}`,padding:"7px 14px 20px"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",justifyContent:"space-around"}}>
          {Object.values(SECTIONS).map(s=>(
            <button key={s.id} onClick={()=>{changeSection(s.id);setGlobalTab("main");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",padding:"3px 18px",color:section===s.id&&globalTab==="main"?s.color:darkMode?"#2a2a2a":"#bbb",transition:"color .2s"}}>
              <span style={{fontSize:20}}>{s.icon}</span>
              <span style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{s.label}</span>
              {section===s.id&&globalTab==="main"&&<div style={{width:16,height:1.5,borderRadius:1,background:s.color}}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
