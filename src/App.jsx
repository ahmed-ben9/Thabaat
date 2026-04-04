import { useState, useEffect, useRef } from "react";
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
  if (!id) { id = "user_" + Math.random().toString(36).slice(2,10); localStorage.setItem("thabaat-uid", id); }
  return id;
}
const UID = getUserId();
async function dbSet(path, value) { await set(ref(db, path), value); }
function dbListen(path, cb) {
  const r = ref(db, path);
  onValue(r, s => cb(s.exists() ? s.val() : null));
  return () => off(r);
}

// ── HIJRI (Umm Al-Qura) ───────────────────────────────────────────────────────
const UMM_EPOCH = 1948438.5;
function jdFromGreg(y,m,d){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
}
function hijriFromGreg(gy,gm,gd){
  const jd=jdFromGreg(gy,gm,gd);
  const l=jd-UMM_EPOCH;
  const n=Math.floor(l/10631);
  const r=l-n*10631;
  const j=Math.floor(r/354.367);
  const rm=r-Math.floor(j*354.367);
  const hm=Math.min(12,Math.ceil((rm-29)/29.5)+1);
  const hd=Math.floor(rm-(hm-1)*29.5)+1;
  return {y:n*30+j+1,m:hm,d:hd};
}
const HIJRI_MONTHS_AR=["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
const HIJRI_MONTHS_FR=["Muharram","Safar","Rabi Al-Awwal","Rabi Al-Thani","Jumada Al-Ula","Jumada Al-Akhira","Rajab","Shaaban","Ramadan","Shawwal","Dhul Qada","Dhul Hijja"];
function todayHijri(){const d=new Date();return hijriFromGreg(d.getFullYear(),d.getMonth()+1,d.getDate());}
function formatDateHijri(dateStr){
  if(!dateStr) return "";
  const [y,m,d]=dateStr.split("-").map(Number);
  const h=hijriFromGreg(y,m,d);
  return `${h.d} ${HIJRI_MONTHS_FR[h.m-1]} ${h.y}H`;
}
function getHijriMonthKey(){const h=todayHijri();return `H${h.y}-${String(h.m).padStart(2,"0")}`;}
function getGregorianMonthKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;}

// ── WARSH PDF INDEX ───────────────────────────────────────────────────────────
// Page numbers for each surah in the Warsh Mushaf (offset=0, verified)
const SURAH_PDF_PAGES = {
  1:1,2:2,3:50,4:77,5:106,6:128,7:151,8:177,9:187,10:208,
  11:221,12:235,13:249,14:255,15:262,16:267,17:282,18:293,
  19:305,20:312,21:322,22:332,23:342,24:350,25:359,26:367,
  27:377,28:385,29:396,30:404,31:411,32:415,33:418,34:428,
  35:434,36:440,37:446,38:453,39:458,40:467,41:477,42:483,
  43:489,44:496,45:499,46:502,47:507,48:511,49:515,50:518,
  51:520,52:523,53:526,54:528,55:531,56:534,57:537,58:542,
  59:545,60:549,61:551,62:553,63:554,64:556,65:558,66:560,
  67:562,68:564,69:566,70:568,71:570,72:572,73:574,74:575,
  75:577,76:578,77:580,78:582,79:583,80:585,81:586,82:587,
  83:587,84:589,85:590,86:591,87:591,88:592,89:593,90:594,
  91:595,92:595,93:596,94:596,95:597,96:597,97:598,98:598,
  99:599,100:599,101:600,102:601,103:601,104:601,105:602,
  106:602,107:602,108:603,109:603,110:603,111:603,112:604,
  113:604,114:604
};
// Key verse -> page
const VERSE_PDF_PAGES = {
  "1:1":1,"2:1":2,"2:255":42,"2:285":49,"2:286":49,
  "3:1":50,"4:1":77,"5:1":106,"5:3":106,"6:1":128,
  "7:1":151,"8:1":177,"9:1":187,"10:1":208,"12:1":235,
  "13:1":249,"14:1":255,"15:1":262,"16:1":267,"17:1":282,
  "18:1":293,"18:107":303,"19:1":305,"20:1":312,"21:1":322,
  "22:1":332,"23:1":342,"24:1":350,"24:35":354,"25:1":359,
  "26:1":367,"27:1":377,"28:1":385,"29:1":396,"30:1":404,
  "31:1":411,"32:1":415,"33:1":418,"34:1":428,"35:1":434,
  "36:1":440,"37:1":446,"38:1":453,"39:1":458,"39:53":464,
  "40:1":467,"41:1":477,"42:1":483,"43:1":489,"44:1":496,
  "45:1":499,"46:1":502,"47:1":507,"48:1":511,"49:1":515,
  "50:1":518,"51:1":520,"52:1":523,"53:1":526,"54:1":528,
  "55:1":531,"56:1":534,"57:1":537,"58:1":542,"59:1":545,
  "59:22":548,"60:1":549,"61:1":551,"62:1":553,"63:1":554,
  "64:1":556,"65:1":558,"66:1":560,"67:1":562,"68:1":564,
  "69:1":566,"70:1":568,"71:1":570,"72:1":572,"73:1":574,
  "74:1":575,"75:1":577,"76:1":578,"77:1":580,"78:1":582,
  "79:1":583,"80:1":585,"81:1":586,"82:1":587,"83:1":587,
  "84:1":589,"85:1":590,"86:1":591,"87:1":591,"88:1":592,
  "89:1":593,"90:1":594,"91:1":595,"92:1":595,"93:1":596,
  "94:1":596,"95:1":597,"96:1":597,"97:1":598,"98:1":598,
  "99:1":599,"100:1":599,"101:1":600,"102:1":601,"103:1":601,
  "104:1":601,"105:1":602,"106:1":602,"107:1":602,"108:1":603,
  "109:1":603,"110:1":603,"111:1":603,"112:1":604,"113:1":604,"114:1":604
};
function getSurahPage(surahN){return SURAH_PDF_PAGES[surahN]||1;}
function getVersePage(surahN,verseN){
  const key=`${surahN}:${verseN}`;
  if(VERSE_PDF_PAGES[key]) return VERSE_PDF_PAGES[key];
  return SURAH_PDF_PAGES[surahN]||1;
}

// ── QURAN DATA ────────────────────────────────────────────────────────────────
const SURAHS = [
  {n:1,name:"Al-Fatiha",ar:"الفاتحة",v:7,juz:1,hizb:1},
  {n:2,name:"Al-Baqara",ar:"البقرة",v:286,juz:1,hizb:1},
  {n:3,name:"Ali Imran",ar:"آل عمران",v:200,juz:3,hizb:5},
  {n:4,name:"An-Nisa",ar:"النساء",v:176,juz:4,hizb:8},
  {n:5,name:"Al-Maida",ar:"المائدة",v:120,juz:6,hizb:11},
  {n:6,name:"Al-Anam",ar:"الأنعام",v:165,juz:7,hizb:13},
  {n:7,name:"Al-Araf",ar:"الأعراف",v:206,juz:8,hizb:15},
  {n:8,name:"Al-Anfal",ar:"الأنفال",v:75,juz:9,hizb:18},
  {n:9,name:"At-Tawba",ar:"التوبة",v:129,juz:10,hizb:19},
  {n:10,name:"Yunus",ar:"يونس",v:109,juz:11,hizb:21},
  {n:11,name:"Hud",ar:"هود",v:123,juz:11,hizb:22},
  {n:12,name:"Yusuf",ar:"يوسف",v:111,juz:12,hizb:23},
  {n:13,name:"Ar-Rad",ar:"الرعد",v:43,juz:13,hizb:25},
  {n:14,name:"Ibrahim",ar:"إبراهيم",v:52,juz:13,hizb:26},
  {n:15,name:"Al-Hijr",ar:"الحجر",v:99,juz:14,hizb:26},
  {n:16,name:"An-Nahl",ar:"النحل",v:128,juz:14,hizb:27},
  {n:17,name:"Al-Isra",ar:"الإسراء",v:111,juz:15,hizb:29},
  {n:18,name:"Al-Kahf",ar:"الكهف",v:110,juz:15,hizb:30},
  {n:19,name:"Maryam",ar:"مريم",v:98,juz:16,hizb:31},
  {n:20,name:"Ta-Ha",ar:"طه",v:135,juz:16,hizb:32},
  {n:21,name:"Al-Anbiya",ar:"الأنبياء",v:112,juz:17,hizb:33},
  {n:22,name:"Al-Hajj",ar:"الحج",v:78,juz:17,hizb:34},
  {n:23,name:"Al-Muminun",ar:"المؤمنون",v:118,juz:18,hizb:35},
  {n:24,name:"An-Nur",ar:"النور",v:64,juz:18,hizb:36},
  {n:25,name:"Al-Furqan",ar:"الفرقان",v:77,juz:19,hizb:37},
  {n:26,name:"Ash-Shuara",ar:"الشعراء",v:227,juz:19,hizb:37},
  {n:27,name:"An-Naml",ar:"النمل",v:93,juz:19,hizb:38},
  {n:28,name:"Al-Qasas",ar:"القصص",v:88,juz:20,hizb:39},
  {n:29,name:"Al-Ankabut",ar:"العنكبوت",v:69,juz:20,hizb:40},
  {n:30,name:"Ar-Rum",ar:"الروم",v:60,juz:21,hizb:41},
  {n:31,name:"Luqman",ar:"لقمان",v:34,juz:21,hizb:41},
  {n:32,name:"As-Sajda",ar:"السجدة",v:30,juz:21,hizb:42},
  {n:33,name:"Al-Ahzab",ar:"الأحزاب",v:73,juz:21,hizb:42},
  {n:34,name:"Saba",ar:"سبأ",v:54,juz:22,hizb:43},
  {n:35,name:"Fatir",ar:"فاطر",v:45,juz:22,hizb:44},
  {n:36,name:"Ya-Sin",ar:"يس",v:83,juz:22,hizb:44},
  {n:37,name:"As-Saffat",ar:"الصافات",v:182,juz:23,hizb:45},
  {n:38,name:"Sad",ar:"ص",v:88,juz:23,hizb:46},
  {n:39,name:"Az-Zumar",ar:"الزمر",v:75,juz:23,hizb:46},
  {n:40,name:"Ghafir",ar:"غافر",v:85,juz:24,hizb:47},
  {n:41,name:"Fussilat",ar:"فصلت",v:54,juz:24,hizb:48},
  {n:42,name:"Ash-Shura",ar:"الشورى",v:53,juz:25,hizb:49},
  {n:43,name:"Az-Zukhruf",ar:"الزخرف",v:89,juz:25,hizb:49},
  {n:44,name:"Ad-Dukhan",ar:"الدخان",v:59,juz:25,hizb:50},
  {n:45,name:"Al-Jathiya",ar:"الجاثية",v:37,juz:25,hizb:50},
  {n:46,name:"Al-Ahqaf",ar:"الأحقاف",v:35,juz:26,hizb:51},
  {n:47,name:"Muhammad",ar:"محمد",v:38,juz:26,hizb:51},
  {n:48,name:"Al-Fath",ar:"الفتح",v:29,juz:26,hizb:52},
  {n:49,name:"Al-Hujurat",ar:"الحجرات",v:18,juz:26,hizb:52},
  {n:50,name:"Qaf",ar:"ق",v:45,juz:26,hizb:52},
  {n:51,name:"Adh-Dhariyat",ar:"الذاريات",v:60,juz:26,hizb:52},
  {n:52,name:"At-Tur",ar:"الطور",v:49,juz:27,hizb:53},
  {n:53,name:"An-Najm",ar:"النجم",v:62,juz:27,hizb:53},
  {n:54,name:"Al-Qamar",ar:"القمر",v:55,juz:27,hizb:54},
  {n:55,name:"Ar-Rahman",ar:"الرحمن",v:78,juz:27,hizb:54},
  {n:56,name:"Al-Waqia",ar:"الواقعة",v:96,juz:27,hizb:54},
  {n:57,name:"Al-Hadid",ar:"الحديد",v:29,juz:27,hizb:54},
  {n:58,name:"Al-Mujadila",ar:"المجادلة",v:22,juz:28,hizb:55},
  {n:59,name:"Al-Hashr",ar:"الحشر",v:24,juz:28,hizb:55},
  {n:60,name:"Al-Mumtahana",ar:"الممتحنة",v:13,juz:28,hizb:56},
  {n:61,name:"As-Saf",ar:"الصف",v:14,juz:28,hizb:56},
  {n:62,name:"Al-Jumua",ar:"الجمعة",v:11,juz:28,hizb:56},
  {n:63,name:"Al-Munafiqun",ar:"المنافقون",v:11,juz:28,hizb:56},
  {n:64,name:"At-Taghabun",ar:"التغابن",v:18,juz:28,hizb:56},
  {n:65,name:"At-Talaq",ar:"الطلاق",v:12,juz:28,hizb:56},
  {n:66,name:"At-Tahrim",ar:"التحريم",v:12,juz:28,hizb:56},
  {n:67,name:"Al-Mulk",ar:"الملك",v:30,juz:29,hizb:57},
  {n:68,name:"Al-Qalam",ar:"القلم",v:52,juz:29,hizb:57},
  {n:69,name:"Al-Haqqa",ar:"الحاقة",v:52,juz:29,hizb:57},
  {n:70,name:"Al-Maarij",ar:"المعارج",v:44,juz:29,hizb:58},
  {n:71,name:"Nuh",ar:"نوح",v:28,juz:29,hizb:58},
  {n:72,name:"Al-Jinn",ar:"الجن",v:28,juz:29,hizb:58},
  {n:73,name:"Al-Muzzammil",ar:"المزمل",v:20,juz:29,hizb:58},
  {n:74,name:"Al-Muddaththir",ar:"المدثر",v:56,juz:29,hizb:58},
  {n:75,name:"Al-Qiyama",ar:"القيامة",v:40,juz:29,hizb:58},
  {n:76,name:"Al-Insan",ar:"الإنسان",v:31,juz:29,hizb:58},
  {n:77,name:"Al-Mursalat",ar:"المرسلات",v:50,juz:29,hizb:58},
  {n:78,name:"An-Naba",ar:"النبأ",v:40,juz:30,hizb:59},
  {n:79,name:"An-Naziat",ar:"النازعات",v:46,juz:30,hizb:59},
  {n:80,name:"Abasa",ar:"عبس",v:42,juz:30,hizb:59},
  {n:81,name:"At-Takwir",ar:"التكوير",v:29,juz:30,hizb:60},
  {n:82,name:"Al-Infitar",ar:"الانفطار",v:19,juz:30,hizb:60},
  {n:83,name:"Al-Mutaffifin",ar:"المطففين",v:36,juz:30,hizb:59},
  {n:84,name:"Al-Inshiqaq",ar:"الانشقاق",v:25,juz:30,hizb:60},
  {n:85,name:"Al-Buruj",ar:"البروج",v:22,juz:30,hizb:60},
  {n:86,name:"At-Tariq",ar:"الطارق",v:17,juz:30,hizb:60},
  {n:87,name:"Al-Ala",ar:"الأعلى",v:19,juz:30,hizb:60},
  {n:88,name:"Al-Ghashiya",ar:"الغاشية",v:26,juz:30,hizb:60},
  {n:89,name:"Al-Fajr",ar:"الفجر",v:30,juz:30,hizb:60},
  {n:90,name:"Al-Balad",ar:"البلد",v:20,juz:30,hizb:60},
  {n:91,name:"Ash-Shams",ar:"الشمس",v:15,juz:30,hizb:60},
  {n:92,name:"Al-Layl",ar:"الليل",v:21,juz:30,hizb:60},
  {n:93,name:"Ad-Duha",ar:"الضحى",v:11,juz:30,hizb:60},
  {n:94,name:"Ash-Sharh",ar:"الشرح",v:8,juz:30,hizb:60},
  {n:95,name:"At-Tin",ar:"التين",v:8,juz:30,hizb:60},
  {n:96,name:"Al-Alaq",ar:"العلق",v:19,juz:30,hizb:60},
  {n:97,name:"Al-Qadr",ar:"القدر",v:5,juz:30,hizb:60},
  {n:98,name:"Al-Bayyina",ar:"البينة",v:8,juz:30,hizb:60},
  {n:99,name:"Az-Zalzala",ar:"الزلزلة",v:8,juz:30,hizb:60},
  {n:100,name:"Al-Adiyat",ar:"العاديات",v:11,juz:30,hizb:60},
  {n:101,name:"Al-Qaria",ar:"القارعة",v:11,juz:30,hizb:60},
  {n:102,name:"At-Takathur",ar:"التكاثر",v:8,juz:30,hizb:60},
  {n:103,name:"Al-Asr",ar:"العصر",v:3,juz:30,hizb:60},
  {n:104,name:"Al-Humaza",ar:"الهمزة",v:9,juz:30,hizb:60},
  {n:105,name:"Al-Fil",ar:"الفيل",v:5,juz:30,hizb:60},
  {n:106,name:"Quraysh",ar:"قريش",v:4,juz:30,hizb:60},
  {n:107,name:"Al-Maun",ar:"الماعون",v:7,juz:30,hizb:60},
  {n:108,name:"Al-Kawthar",ar:"الكوثر",v:3,juz:30,hizb:60},
  {n:109,name:"Al-Kafirun",ar:"الكافرون",v:6,juz:30,hizb:60},
  {n:110,name:"An-Nasr",ar:"النصر",v:3,juz:30,hizb:60},
  {n:111,name:"Al-Masad",ar:"المسد",v:5,juz:30,hizb:60},
  {n:112,name:"Al-Ikhlas",ar:"الإخلاص",v:4,juz:30,hizb:60},
  {n:113,name:"Al-Falaq",ar:"الفلق",v:5,juz:30,hizb:60},
  {n:114,name:"An-Nas",ar:"الناس",v:6,juz:30,hizb:60},
];

// ── CORRECTED HIZB BOUNDARIES (Oum Al-Qura, 60 hizbs) ────────────────────────
// Each hizb = [surahN, verseN] start
const HIZB_STARTS = [
  [1,1],[2,75],[2,142],[2,203],[2,253],[3,56],[3,93],[3,133],
  [3,170],[3,200],[4,24],[4,88],[4,148],[5,1],[5,83],[6,1],
  [6,111],[7,1],[7,88],[7,188],[8,1],[8,41],[9,1],[9,93],
  [10,1],[10,94],[11,6],[11,97],[12,53],[13,19],[14,1],[14,53],
  [15,1],[16,1],[16,129],[17,1],[17,99],[18,1],[18,75],[19,59],
  [20,1],[20,130],[21,1],[21,57],[22,1],[22,79],[23,1],[24,1],
  [24,35],[25,21],[26,1],[26,112],[27,1],[27,56],[28,51],[29,1],
  [29,46],[31,1],[32,1],[33,31],[34,1],[35,1],[36,1],[36,28],
  [37,1],[38,1],[39,1],[39,32],[40,1],[40,41],[41,1],[42,1],
  [43,1],[44,1],[45,1],[46,1],[47,1],[48,1],[49,1],[50,1],
  [51,1],[52,1],[53,1],[54,1],[55,1],[56,1],[57,1],[58,1],
  [59,1],[60,1],[61,1],[62,1],[63,1],[64,1],[65,1],[66,1],
  [67,1],[68,1],[69,1],[70,1],[71,1],[72,1],[73,1],[74,1],
  [75,1],[76,1],[77,1],[78,1],[79,1],[80,1],[81,1],[82,1],
  [83,1],[84,1],[85,1],[86,1],[87,1],[88,1],[89,1],[90,1],
];

// Juz boundaries
const JUZ_STARTS = [
  [1,1],[2,142],[2,253],[3,93],[3,200],[4,88],[4,177],[5,83],
  [6,111],[7,1],[7,88],[8,41],[9,93],[10,94],[11,6],[11,97],
  [12,53],[13,19],[14,53],[16,1],[17,1],[17,99],[18,75],[20,1],
  [21,57],[23,1],[24,35],[26,1],[27,56],[29,46]
];

function getJuzInfo(n){
  const s=JUZ_STARTS[n-1];const e=n<30?JUZ_STARTS[n]:null;
  return {n,startSurah:s[0],startVerse:s[1],endSurah:e?e[0]:114,endVerse:e?e[1]-1:6};
}
function getHizbInfo(n){
  const s=HIZB_STARTS[n-1];const e=n<60?HIZB_STARTS[n]:null;
  return {n,startSurah:s[0],startVerse:s[1],endSurah:e?e[0]:114,endVerse:e?e[1]-1:6};
}
function versesInRange(ss,sv,es,ev){
  let t=0;
  for(let sn=ss;sn<=es;sn++){
    const s=SURAHS.find(x=>x.n===sn);if(!s) continue;
    const f=sn===ss?sv:1,to=sn===es?ev:s.v;
    t+=Math.max(0,to-f+1);
  }
  return t;
}
const TOTAL_VERSES=SURAHS.reduce((s,x)=>s+x.v,0);
const SURAH_OFFSETS=[];let _off=0;
SURAHS.forEach(s=>{SURAH_OFFSETS.push(_off);_off+=s.v;});
function globalVerse(sn,vn){return SURAH_OFFSETS[sn-1]+vn;}
const JUZ_VERSES=Array.from({length:30},(_,i)=>{const j=getJuzInfo(i+1);return versesInRange(j.startSurah,j.startVerse,j.endSurah,j.endVerse);});
const HIZB_VERSES=Array.from({length:60},(_,i)=>{const h=getHizbInfo(i+1);return versesInRange(h.startSurah,h.startVerse,h.endSurah,h.endVerse);});

const MASTERY={
  mubtadi:   {label:"Mubtadi",    ar:"مبتدئ",   color:"#ef4444",rank:1},
  mutawassit:{label:"Mutawassit", ar:"متوسط",  color:"#f59e0b",rank:2},
  mutaqaddim:{label:"Mutaqaddim", ar:"متقدم", color:"#60a5fa",rank:3},
  mutqin:    {label:"Mutqin",     ar:"متقن",       color:"#4ade80",rank:4},
};
const SR_INTERVALS={mubtadi:1,mutawassit:3,mutaqaddim:7,mutqin:14};
const ERROR_TYPES={
  nisyan:{label:"Nisyan",desc:"Oubli",color:"#ef4444"},
  khata:{label:"Khata",desc:"Erreur de texte",color:"#f59e0b"},
  tajweed:{label:"Tajweed",desc:"Prononciation",color:"#a78bfa"},
};
const TAJWEED_RULES=["Madd","Idgham","Ikhfa","Qalqala","Waqf","Ghunna","Autre"];
const DUAS=[
  {ar:"رَبِّ زِدْنِي عِلْمًا",fr:"Rabbi zidni ilma - Seigneur, accrois mes connaissances"},
  {ar:"رَبِّ اشْرَحْ لِي صَدْرِي",fr:"Rabbi ishrah li sadri - Seigneur, ouvre ma poitrine"},
  {ar:"اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي",fr:"Fais-moi profiter de ce que Tu m'as enseigne"},
  {ar:"اللَّهُمَّ ارْزُقْنِي حِفْظَ كِتَابِكَ",fr:"Accorde-moi la memorisation de Ton Livre"},
  {ar:"اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي",fr:"Fais du Coran le printemps de mon coeur"},
];
const SECTIONS={
  hifz:  {id:"hifz",  label:"Hifz",    subLabel:"Apprentissage",icon:"◈",color:"#60a5fa",colorDim:"#60a5fa22",colorBorder:"#60a5fa44"},
  muraja:{id:"muraja",label:"Muraja'a",subLabel:"Revision",     icon:"↺",color:"#f59e0b",colorDim:"#f59e0b22",colorBorder:"#f59e0b44"},
  wird:  {id:"wird",  label:"Wird",    subLabel:"Lecture",      icon:"☽",color:"#4ade80",colorDim:"#4ade8022",colorBorder:"#4ade8044"},
};
function today(){return new Date().toISOString().slice(0,10);}
function genId(){return Math.random().toString(36).slice(2,10);}
function getMonthKey(useHijri){return useHijri?getHijriMonthKey():getGregorianMonthKey();}
function updateStreak(streak){
  const td=today();
  if(streak?.lastDate===td) return streak;
  const y=new Date();y.setDate(y.getDate()-1);
  return {count:streak?.lastDate===y.toISOString().slice(0,10)?(streak.count||0)+1:1,lastDate:td};
}
function surahLearnedPct(ranges,totalVerses){
  if(!ranges||!ranges.length) return 0;
  const s=new Set();ranges.forEach(r=>{for(let v=r.from;v<=r.to;v++) s.add(v);});
  return Math.min(100,Math.round((s.size/totalVerses)*100));
}
function surahErrorRate(sessions){
  if(!sessions||!sessions.length) return 0;
  const t=sessions.reduce((s,sess)=>s+Object.keys(sess.verseErrors||{}).length,0);
  return Math.round((t/sessions.length)*10)/10;
}
function isDueForReview(mastery,lastReviewed){
  if(!mastery||!lastReviewed) return false;
  const days=SR_INTERVALS[mastery]||3;
  const d=new Date(lastReviewed);d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10)<=today();
}
// Global hifz % across all surahs
function globalHifzPct(surahProgress){
  let totalMem=0;
  SURAHS.forEach(s=>{
    const ranges=surahProgress[s.n]?.learnedRanges||[];
    const covered=new Set();
    ranges.forEach(r=>{for(let v=r.from;v<=r.to;v++) covered.add(v);});
    totalMem+=covered.size;
  });
  return Math.min(100,Math.round((totalMem/TOTAL_VERSES)*100));
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function GeoBg({color="#c9a84c"}){
  return(
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.025,pointerEvents:"none",zIndex:0}} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="g" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="40,2 78,21 78,59 40,78 2,59 2,21" fill="none" stroke={color} strokeWidth="0.7"/>
        <circle cx="40" cy="40" r="5" fill="none" stroke={color} strokeWidth="0.3"/>
      </pattern></defs>
      <rect width="600" height="600" fill="url(#g)"/>
    </svg>
  );
}

// Heart SVG that fills based on percentage
function HeartProgress({pct,color}){
  const id=`hg${Math.random().toString(36).slice(2,6)}`;
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:120,height:110}}>
      <svg viewBox="0 0 100 90" width="120" height="110">
        <defs>
          <clipPath id={id}>
            <rect x="0" y={90-(pct/100*90)} width="100" height={pct/100*90}/>
          </clipPath>
        </defs>
        {/* Empty heart outline */}
        <path d="M50 80 C50 80 10 55 10 30 C10 15 22 5 35 5 C42 5 48 9 50 13 C52 9 58 5 65 5 C78 5 90 15 90 30 C90 55 50 80 50 80Z" fill="none" stroke={color} strokeWidth="2" opacity="0.3"/>
        {/* Filled heart */}
        <path d="M50 80 C50 80 10 55 10 30 C10 15 22 5 35 5 C42 5 48 9 50 13 C52 9 58 5 65 5 C78 5 90 15 90 30 C90 55 50 80 50 80Z" fill={color} clipPath={`url(#${id})`} opacity="0.85"/>
      </svg>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-45%)",textAlign:"center"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:"monospace",textShadow:"0 1px 3px rgba(0,0,0,0.8)"}}>{pct}%</div>
      </div>
    </div>
  );
}

function SectionTabs({active,onChange}){
  return(
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      {Object.values(SECTIONS).map(s=>{
        const on=active===s.id;
        return(
          <button key={s.id} onClick={()=>onChange(s.id)} style={{flex:1,padding:"10px 4px",borderRadius:10,cursor:"pointer",border:on?`1px solid ${s.color}55`:"1px solid #1e1e1e",background:on?s.colorDim:"#0d0d0d",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all .2s"}}>
            <span style={{fontSize:18,color:on?s.color:"#333"}}>{s.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:on?s.color:"#444"}}>{s.label}</span>
            <span style={{fontSize:8,color:on?s.color+"88":"#2a2a2a",textTransform:"uppercase",letterSpacing:1}}>{s.subLabel}</span>
            {on&&<div style={{width:18,height:2,borderRadius:1,background:s.color,marginTop:2}}/>}
          </button>
        );
      })}
    </div>
  );
}

function SubTabs({tabs,active,onChange,color}){
  return(
    <div style={{display:"flex",gap:5,marginBottom:10}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:"7px 6px",borderRadius:7,fontSize:11,cursor:"pointer",border:active===t.id?`1px solid ${color}55`:"1px solid #1a1a1a",background:active===t.id?color+"22":"#0d0d0d",color:active===t.id?color:"#444",fontWeight:active===t.id?700:400}}>{t.label}</button>
      ))}
    </div>
  );
}

function MasteryBadge({level,onClick}){
  if(!level) return null;
  const m=MASTERY[level];
  return <span onClick={onClick} style={{fontSize:9,color:m.color,background:m.color+"22",border:`1px solid ${m.color}44`,borderRadius:20,padding:"2px 7px",cursor:onClick?"pointer":"default",flexShrink:0}}>{m.label}</span>;
}

function FilterBar({filterMode,setFilterMode,filterVal,setFilterVal,color}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",gap:5,marginBottom:7}}>
        {[{id:"surah",l:"Sourate"},{id:"juz",l:"Juz"},{id:"hizb",l:"Hizb"}].map(m=>(
          <button key={m.id} onClick={()=>{setFilterMode(m.id);setFilterVal("all");}} style={{flex:1,padding:"5px 4px",borderRadius:7,fontSize:10,cursor:"pointer",border:filterMode===m.id?`1px solid ${color}55`:"1px solid #1a1a1a",background:filterMode===m.id?color+"22":"#0d0d0d",color:filterMode===m.id?color:"#444"}}>{m.l}</button>
        ))}
      </div>
      {filterMode==="juz"&&(
        <select value={filterVal} onChange={e=>setFilterVal(e.target.value)} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 10px",fontSize:12,outline:"none"}}>
          <option value="all">Tous les Juz</option>
          {Array.from({length:30},(_,i)=>i+1).map(n=><option key={n} value={n}>Juz {n}</option>)}
        </select>
      )}
      {filterMode==="hizb"&&(
        <select value={filterVal} onChange={e=>setFilterVal(e.target.value)} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 10px",fontSize:12,outline:"none"}}>
          <option value="all">Tous les Hizb</option>
          {Array.from({length:60},(_,i)=>i+1).map(n=><option key={n} value={n}>Hizb {n}</option>)}
        </select>
      )}
    </div>
  );
}

function JuzHizbCard({mode,n,surahProgress,color}){
  const info=mode==="juz"?getJuzInfo(n):getHizbInfo(n);
  const totalV=mode==="juz"?JUZ_VERSES[n-1]:HIZB_VERSES[n-1];
  const covered=new Set();
  for(let sn=info.startSurah;sn<=info.endSurah;sn++){
    const s=SURAHS.find(x=>x.n===sn);if(!s) continue;
    const rf=sn===info.startSurah?info.startVerse:1,rt=sn===info.endSurah?info.endVerse:s.v;
    const ranges=(surahProgress[sn]?.learnedRanges)||[];
    ranges.forEach(r=>{for(let v=Math.max(r.from,rf);v<=Math.min(r.to,rt);v++) covered.add(`${sn}-${v}`);});
  }
  const memV=covered.size;
  const pct=Math.min(100,Math.round((memV/totalV)*100));
  const surahsInUnit=SURAHS.filter(s=>s.n>=info.startSurah&&s.n<=info.endSurah);
  return(
    <div style={{background:"#0d0d0d",border:`1px solid ${color}22`,borderRadius:10,padding:12,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{fontSize:13,color:"#ddd",fontWeight:600}}>{mode==="juz"?`Juz ${n}`:`Hizb ${n}`}</div>
        <span style={{fontSize:13,fontWeight:700,color:pct===100?color:pct>0?"#f59e0b":"#333",fontFamily:"monospace"}}>{pct}%</span>
      </div>
      <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden",marginBottom:6}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:3}}/>
      </div>
      <div style={{fontSize:10,color:"#555",marginBottom:6}}>{memV}/{totalV} versets</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {surahsInUnit.map(s=>{
          const rf=s.n===info.startSurah?info.startVerse:1,rt=s.n===info.endSurah?info.endVerse:s.v;
          const cnt=rt-rf+1;
          const memS=new Set();
          (surahProgress[s.n]?.learnedRanges||[]).forEach(r=>{for(let v=Math.max(r.from,rf);v<=Math.min(r.to,rt);v++) memS.add(v);});
          const sp=Math.round((memS.size/cnt)*100);
          return(
            <div key={s.n} style={{background:sp>0?color+"11":"#111",border:`1px solid ${sp>0?color+"33":"#1a1a1a"}`,borderRadius:6,padding:"3px 8px",fontSize:10}}>
              <span style={{color:sp===100?color:sp>0?"#f59e0b":"#444"}}>{s.name}</span>
              {(s.n===info.startSurah&&info.startVerse>1)||(s.n===info.endSurah&&info.endVerse<s.v)?<span style={{color:"#333",fontSize:9}}> v.{rf}-{rt}</span>:null}
              {sp>0&&<span style={{color:sp===100?color:"#f59e0b",fontSize:9}}> {sp}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerseErrorPicker({totalVerses,verseErrors,onChange,readOnly=false}){
  const [editVerse,setEditVerse]=useState(null);
  const [errType,setErrType]=useState("nisyan");
  const [tajRule,setTajRule]=useState("");
  const [note,setNote]=useState("");
  const toggle=v=>{
    if(readOnly) return;
    if(verseErrors[v]){const n={...verseErrors};delete n[v];onChange(n);}
    else{setEditVerse(v);setErrType("nisyan");setTajRule("");setNote("");}
  };
  const confirm=()=>{
    onChange({...verseErrors,[editVerse]:{type:errType,tajweed:errType==="tajweed"?tajRule:"",note}});
    setEditVerse(null);
  };
  return(
    <div>
      <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Versets ({Object.keys(verseErrors).length} erreurs)</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
        {Array.from({length:totalVerses},(_,i)=>i+1).map(v=>{
          const err=verseErrors[v];const col=err?ERROR_TYPES[err.type]?.color||"#ef4444":"#444";
          return <button key={v} onClick={()=>toggle(v)} style={{width:30,height:30,borderRadius:6,fontSize:10,fontWeight:600,cursor:readOnly?"default":"pointer",border:err?`1.5px solid ${col}`:"1px solid #222",background:err?col+"22":"#0d0d0d",color:err?col:"#444"}}>{v}</button>;
        })}
      </div>
      {editVerse&&(
        <div style={{background:"#0a0a0a",border:"1px solid #c9a84c44",borderRadius:10,padding:12,marginBottom:8}}>
          <div style={{fontSize:11,color:"#c9a84c",marginBottom:8}}>Verset {editVerse}</div>
          <div style={{display:"flex",gap:5,marginBottom:10}}>
            {Object.entries(ERROR_TYPES).map(([k,v])=>(
              <button key={k} onClick={()=>setErrType(k)} style={{flex:1,padding:"7px 4px",borderRadius:7,fontSize:9,cursor:"pointer",textAlign:"center",border:errType===k?`1px solid ${v.color}`:"1px solid #222",background:errType===k?v.color+"22":"#111",color:errType===k?v.color:"#555"}}>
                <div style={{fontWeight:700}}>{v.label}</div>
              </button>
            ))}
          </div>
          {errType==="tajweed"&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{TAJWEED_RULES.map(r=><button key={r} onClick={()=>setTajRule(r)} style={{padding:"4px 8px",borderRadius:20,fontSize:10,cursor:"pointer",border:tajRule===r?"1px solid #a78bfa":"1px solid #222",background:tajRule===r?"#a78bfa22":"#111",color:tajRule===r?"#a78bfa":"#555"}}>{r}</button>)}</div>}
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note..." style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:6,color:"#ddd",padding:"7px 10px",fontSize:11,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <div style={{display:"flex",gap:7}}>
            <button onClick={confirm} style={{flex:1,padding:7,background:ERROR_TYPES[errType].color+"22",border:`1px solid ${ERROR_TYPES[errType].color}55`,borderRadius:6,color:ERROR_TYPES[errType].color,fontSize:11,cursor:"pointer"}}>Confirmer</button>
            <button onClick={()=>setEditVerse(null)} style={{flex:1,padding:7,background:"#111",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:11,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick mastery + mark learned panel (click on surah row)
function QuickSurahPanel({surahN,surahProgress,onClose,onSave,color}){
  const s=SURAHS.find(x=>x.n===surahN);if(!s) return null;
  const sp=surahProgress[surahN]||{};
  const ranges=sp.learnedRanges||[];
  const pct=surahLearnedPct(ranges,s.v);
  const [mastery,setMastery]=useState(sp.mastery||null);
  const [wholeSurah,setWholeSurah]=useState(false);
  const errRate=surahErrorRate(sp.hifzSessions);
  const due=sp.mastery?isDueForReview(sp.mastery,sp.lastReviewed):false;

  const save=async()=>{
    let newRanges=ranges;
    if(wholeSurah){
      const combined=[...ranges,{from:1,to:s.v}];
      const covered=new Set();combined.forEach(r=>{for(let v=r.from;v<=r.to;v++) covered.add(v);});
      if(covered.size===s.v) newRanges=[{from:1,to:s.v}];
      else newRanges=combined;
    }
    await onSave(surahN,{...sp,mastery,learnedRanges:newRanges,lastReviewed:today()});
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"#00000088",display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111",borderRadius:"16px 16px 0 0",border:"1px solid #222",padding:18,maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:15,color:"#ddd",fontWeight:700}}>{s.name}</div>
            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:18,color:"#c9a84c"}}>{s.ar}</div>
            <div style={{fontSize:10,color:"#555",marginTop:2}}>Juz {s.juz} · Hizb {s.hizb} · {s.v} versets · p.{getSurahPage(s.n)}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#555",fontSize:20,cursor:"pointer",padding:0,lineHeight:1}}>x</button>
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
            <span style={{color:"#555"}}>Memorise</span>
            <span style={{color,fontWeight:700}}>{pct}%</span>
          </div>
          <div style={{height:5,background:"#1a1a1a",borderRadius:5,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:5}}/>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
          {[{l:"Seances",v:sp.hifzSessions?.length||0,c:"#60a5fa"},{l:"Err/seance",v:errRate,c:errRate>2?"#ef4444":"#4ade80"},{l:"Revue due",v:due?"Oui":"Non",c:due?"#ef4444":"#4ade80"}].map(c=>(
            <div key={c.l} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:7,padding:"7px 5px",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
              <div style={{fontSize:9,color:"#444",textTransform:"uppercase"}}>{c.l}</div>
            </div>
          ))}
        </div>

        {/* Mark whole surah */}
        {pct<100&&(
          <div style={{marginBottom:12}}>
            <button onClick={()=>setWholeSurah(!wholeSurah)} style={{width:"100%",padding:"9px 12px",borderRadius:8,fontSize:12,cursor:"pointer",border:wholeSurah?`1px solid ${color}`:"1px solid #333",background:wholeSurah?color+"22":"#0d0d0d",color:wholeSurah?color:"#666",fontWeight:600,textAlign:"left"}}>
              {wholeSurah?"✓ ":"  "} Marquer sourate entiere comme apprise
            </button>
          </div>
        )}

        {/* Mastery */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Niveau de maitrise</div>
          <div style={{display:"flex",gap:5}}>
            {Object.entries(MASTERY).map(([k,m])=>(
              <button key={k} onClick={()=>setMastery(k)} style={{flex:1,padding:"8px 2px",borderRadius:7,fontSize:9,cursor:"pointer",textAlign:"center",border:mastery===k?`1px solid ${m.color}`:"1px solid #222",background:mastery===k?m.color+"22":"#0d0d0d",color:mastery===k?m.color:"#555",fontWeight:mastery===k?700:400}}>
                <div>{m.label}</div>
                <div style={{fontFamily:"'Scheherazade New',serif",fontSize:10,marginTop:1,opacity:0.7}}>{m.ar}</div>
              </button>
            ))}
          </div>
          {mastery&&<div style={{fontSize:9,color:"#444",marginTop:5,textAlign:"center"}}>Prochaine revue dans {SR_INTERVALS[mastery]} jour{SR_INTERVALS[mastery]>1?"s":""}</div>}
        </div>

        {/* Learned ranges */}
        {ranges.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:5}}>Plages memorisees</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {ranges.map((r,i)=><span key={i} style={{fontSize:10,color,background:color+"11",border:`1px solid ${color}22`,borderRadius:20,padding:"2px 8px"}}>v.{r.from}→{r.to}</span>)}
            </div>
          </div>
        )}

        {/* PDF link */}
        <div style={{background:"#0a0f1a",border:"1px solid #60a5fa22",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#60a5fa"}}>
          Mushaf Warsh · page {getSurahPage(s.n)}
        </div>

        <button onClick={save} style={{width:"100%",padding:11,background:`linear-gradient(135deg,${color}22,${color}40)`,border:`1px solid ${color}55`,borderRadius:9,color,fontSize:13,cursor:"pointer",fontWeight:700}}>
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ── WARSH PDF READER ───────────────────────────────────────────────────────────
function WarshReader({pdfUrl,initialPage,onClose}){
  const [currentPage,setCurrentPage]=useState(initialPage||1);
  const [inputPage,setInputPage]=useState(String(initialPage||1));
  const [selSurah,setSelSurah]=useState("");
  const [bookmark,setBookmark]=useState(()=>{
    try{return Number(localStorage.getItem("warsh-bookmark"))||1;}catch(e){return 1;}
  });
  const TOTAL_PAGES=609;

  const goTo=p=>{
    const n=Math.max(1,Math.min(TOTAL_PAGES,Number(p)||1));
    setCurrentPage(n);setInputPage(String(n));
  };
  const saveBookmark=()=>{
    localStorage.setItem("warsh-bookmark",currentPage);
    setBookmark(currentPage);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#050505",display:"flex",flexDirection:"column"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#0d0d0d",borderBottom:"1px solid #1a1a1a",flexShrink:0}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#888",cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>&#8592;</button>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Scheherazade New',serif",fontSize:14,color:"#c9a84c"}}>مصحف ورش</span>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <button onClick={()=>goTo(currentPage-1)} style={{width:26,height:26,borderRadius:6,background:"#111",border:"1px solid #222",color:"#888",cursor:"pointer",fontSize:14}}>&#8249;</button>
            <input value={inputPage} onChange={e=>setInputPage(e.target.value)} onBlur={()=>goTo(inputPage)} onKeyDown={e=>{if(e.key==="Enter") goTo(inputPage);}} style={{width:46,background:"#111",border:"1px solid #333",borderRadius:6,color:"#ddd",padding:"3px 6px",fontSize:12,textAlign:"center",outline:"none"}}/>
            <span style={{fontSize:11,color:"#444"}}>/ {TOTAL_PAGES}</span>
            <button onClick={()=>goTo(currentPage+1)} style={{width:26,height:26,borderRadius:6,background:"#111",border:"1px solid #222",color:"#888",cursor:"pointer",fontSize:14}}>&#8250;</button>
          </div>
          <select value={selSurah} onChange={e=>{setSelSurah(e.target.value);if(e.target.value) goTo(getSurahPage(Number(e.target.value)));}} style={{background:"#111",border:"1px solid #222",borderRadius:6,color:"#aaa",padding:"3px 6px",fontSize:11,outline:"none",maxWidth:130}}>
            <option value="">Aller a la sourate...</option>
            {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name} (p.{getSurahPage(s.n)})</option>)}
          </select>
        </div>
        <button onClick={saveBookmark} title="Sauvegarder marque-page" style={{background:"#c9a84c22",border:"1px solid #c9a84c44",borderRadius:7,color:"#c9a84c",cursor:"pointer",fontSize:13,padding:"4px 8px"}}>&#128278;</button>
        {bookmark!==currentPage&&(
          <button onClick={()=>goTo(bookmark)} title={`Reprendre page ${bookmark}`} style={{background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:7,color:"#60a5fa",cursor:"pointer",fontSize:10,padding:"4px 8px"}}>p.{bookmark}</button>
        )}
      </div>

      {/* PDF iframe */}
      <div style={{flex:1,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#111"}}>
        <iframe
          src={`${pdfUrl}#page=${currentPage}&view=FitH`}
          style={{width:"100%",height:"100%",border:"none"}}
          title={`Mushaf Warsh page ${currentPage}`}
        />
      </div>

      {/* Bottom quick nav */}
      <div style={{display:"flex",justifyContent:"space-around",padding:"6px 12px",background:"#0d0d0d",borderTop:"1px solid #1a1a1a",flexShrink:0}}>
        {[{l:"Fatiha",p:1},{l:"Baqara",p:2},{l:"Kahf",p:293},{l:"Yasin",p:440},{l:"Mulk",p:562},{l:"Ikhlas",p:604}].map(x=>(
          <button key={x.l} onClick={()=>goTo(x.p)} style={{background:"transparent",border:"none",color:currentPage===x.p?"#c9a84c":"#444",cursor:"pointer",fontSize:10,padding:"2px 4px"}}>{x.l}</button>
        ))}
      </div>
    </div>
  );
}

// ── HIFZ ──────────────────────────────────────────────────────────────────────
function HifzDashboard({state,onNewSession}){
  const sec=SECTIONS.hifz;
  const pm=state.surahProgress||{};
  const streak=state.streak||{count:0};
  const streakWarning=streak.count>0&&streak.lastDate!==today();
  const dua=DUAS[new Date().getDate()%DUAS.length];
  const totalMem=SURAHS.filter(s=>surahLearnedPct(pm[s.n]?.learnedRanges,s.v)===100).length;
  const inProgress=SURAHS.filter(s=>{const p=pm[s.n];return p?.learnedRanges?.length>0&&surahLearnedPct(p.learnedRanges,s.v)<100;}).length;
  const hifzPct=globalHifzPct(pm);
  const dueSurahs=SURAHS.filter(s=>pm[s.n]?.mastery&&isDueForReview(pm[s.n].mastery,pm[s.n].lastReviewed)&&surahLearnedPct(pm[s.n]?.learnedRanges,s.v)>0).slice(0,3);
  const goal=state.memGoal||null;
  let goalInfo=null;
  if(goal){
    const ts=SURAHS.find(s=>s.n===goal.surahN);
    if(ts){
      const pctDone=surahLearnedPct(pm[ts.n]?.learnedRanges,ts.v);
      const vLeft=Math.round(ts.v*(1-pctDone/100));
      const dLeft=Math.max(1,Math.ceil((new Date(goal.targetDate)-new Date())/86400000));
      goalInfo={name:ts.name,vLeft,dLeft,vpd:Math.ceil(vLeft/dLeft)};
    }
  }
  const recent=[];
  Object.entries(pm).forEach(([n,p])=>{(p.hifzSessions||[]).forEach(s=>recent.push({...s,surahN:Number(n),surahName:SURAHS.find(x=>x.n===Number(n))?.name}));});
  recent.sort((a,b)=>new Date(b.date)-new Date(a.date));

  return(
    <div>
      {/* Dua */}
      <div style={{background:"linear-gradient(135deg,#0a0f1a,#0d1525)",border:`1px solid ${sec.color}22`,borderRadius:12,padding:14,marginBottom:10,textAlign:"center"}}>
        <div style={{fontSize:9,color:sec.color+"66",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Du'a du jour</div>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:sec.color,lineHeight:1.6}}>{dua.ar}</div>
        <div style={{fontSize:10,color:sec.color+"77",fontStyle:"italic",marginTop:3}}>{dua.fr}</div>
      </div>

      {/* Streak + Heart */}
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:10,alignItems:"center"}}>
        <div style={{background:streakWarning?"linear-gradient(135deg,#1a0a0a,#2a1010)":"linear-gradient(135deg,#1a110a,#2a1a0a)",border:`1px solid ${streakWarning?"#ef444433":"#c9a84c33"}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:22}}>&#10024;</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:streakWarning?"#ef4444":"#f59e0b",fontFamily:"monospace"}}>{streak.count} jour{streak.count!==1?"s":""}</div>
            <div style={{fontSize:10,color:streakWarning?"#ef444477":"#7a5a30"}}>{streakWarning?"Recite aujourd'hui !":"Jours consecutifs"}</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <HeartProgress pct={hifzPct} color={sec.color}/>
          <div style={{fontSize:9,color:sec.color+"66",textTransform:"uppercase",letterSpacing:1}}>du Coran</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
        {[{l:"Completes",v:totalMem,c:sec.color},{l:"En cours",v:inProgress,c:"#f59e0b"},{l:"Sourates",v:114,c:"#333"}].map(c=>(
          <div key={c.l} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.c}}/>
            <div style={{fontSize:20,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
            <div style={{fontSize:9,color:"#444",textTransform:"uppercase"}}>{c.l}</div>
          </div>
        ))}
      </div>

      {/* Memorization goal */}
      {goalInfo&&(
        <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{fontSize:10,color:"#c9a84c",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Objectif</div>
          <div style={{fontSize:12,color:"#ddd",marginBottom:4}}>Finir {goalInfo.name} en {goalInfo.dLeft} jour{goalInfo.dLeft!==1?"s":""}</div>
          <div style={{fontSize:11,color:"#888"}}>Il reste {goalInfo.vLeft} v. → <span style={{color:"#c9a84c",fontWeight:700}}>{goalInfo.vpd} versets/jour</span></div>
        </div>
      )}

      {/* Due for review */}
      {dueSurahs.length>0&&(
        <div style={{background:"#111",border:`1px solid ${sec.color}33`,borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{fontSize:10,color:sec.color,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>A reviser aujourd'hui</div>
          {dueSurahs.map(s=>(
            <div key={s.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}>
              <span style={{fontSize:12,color:"#ccc"}}>{s.name}</span>
              <MasteryBadge level={pm[s.n]?.mastery}/>
            </div>
          ))}
        </div>
      )}

      {/* In progress */}
      {inProgress>0&&(
        <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:8}}>En cours</div>
          {SURAHS.filter(s=>{const p=pm[s.n];return p?.learnedRanges?.length>0&&surahLearnedPct(p.learnedRanges,s.v)<100;}).slice(0,4).map(s=>{
            const pct=surahLearnedPct(pm[s.n].learnedRanges,s.v);
            return(
              <div key={s.n} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:"#ccc"}}>{s.name}</span>
                  <span style={{color:sec.color,fontWeight:700,fontFamily:"monospace"}}>{pct}%</span>
                </div>
                <div style={{height:3,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:sec.color,borderRadius:3}}/></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent */}
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>Dernieres seances</div>
        {recent.length===0?<div style={{textAlign:"center",color:"#333",fontSize:12,padding:"8px 0"}}>Aucune seance encore</div>:
        recent.slice(0,4).map((s,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<3?"1px solid #1a1a1a":"none"}}>
            <div>
              <div style={{fontSize:11,color:"#ccc"}}>{s.surahName}</div>
              <div style={{fontSize:9,color:"#444"}}>{formatDateHijri(s.date)} · v.{s.range?.from}→{s.range?.to}</div>
            </div>
            <span style={{fontSize:9,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 7px"}}>{(s.range?.to||0)-(s.range?.from||0)+1} v.</span>
          </div>
        ))}
      </div>

      <button onClick={onNewSession} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${sec.colorDim},${sec.color}30)`,border:`1px solid ${sec.colorBorder}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:600}}>
        + Nouvelle seance Hifz
      </button>
    </div>
  );
}

function HifzList({state,persist,pdfUrl,onOpenPdf}){
  const sec=SECTIONS.hifz;
  const pm=state.surahProgress||{};
  const [search,setSearch]=useState("");
  const [filterMode,setFilterMode]=useState("surah");
  const [filterVal,setFilterVal]=useState("all");
  const [selectedSurah,setSelectedSurah]=useState(null);

  const saveSurahData=async(surahN,data)=>{
    await persist({...state,surahProgress:{...pm,[surahN]:{...(pm[surahN]||{}),...data}}});
  };

  let displaySurahs=SURAHS;
  if(filterMode==="juz"&&filterVal!=="all"){const j=getJuzInfo(Number(filterVal));displaySurahs=SURAHS.filter(s=>s.n>=j.startSurah&&s.n<=j.endSurah);}
  else if(filterMode==="hizb"&&filterVal!=="all"){const h=getHizbInfo(Number(filterVal));displaySurahs=SURAHS.filter(s=>s.n>=h.startSurah&&s.n<=h.endSurah);}
  if(search) displaySurahs=displaySurahs.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||String(s.n).includes(search));

  return(
    <div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"8px 12px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
      <FilterBar filterMode={filterMode} setFilterMode={setFilterMode} filterVal={filterVal} setFilterVal={setFilterVal} color={sec.color}/>
      {(filterMode==="juz"||filterMode==="hizb")&&filterVal!=="all"&&<JuzHizbCard mode={filterMode} n={Number(filterVal)} surahProgress={pm} color={sec.color}/>}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {displaySurahs.map(s=>{
          const ranges=pm[s.n]?.learnedRanges||[];
          const mastery=pm[s.n]?.mastery||null;
          const pct=surahLearnedPct(ranges,s.v);
          const errRate=surahErrorRate(pm[s.n]?.hifzSessions);
          const due=mastery?isDueForReview(mastery,pm[s.n]?.lastReviewed):false;
          return(
            <div key={s.n} onClick={()=>setSelectedSurah(s.n)} style={{background:"#0d0d0d",border:`1px solid ${due?"#f59e0b33":"#1a1a1a"}`,borderRadius:9,padding:"10px 12px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:pct>0?7:0}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#111",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#444",flexShrink:0}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:"#ccc",fontWeight:500}}>{s.name}</span>
                    <span style={{fontFamily:"'Scheherazade New',serif",fontSize:13,color:"#c9a84c33"}}>{s.ar}</span>
                    {mastery&&<MasteryBadge level={mastery}/>}
                    {due&&<span style={{fontSize:8,color:"#f59e0b",background:"#f59e0b11",borderRadius:20,padding:"1px 5px"}}>Due</span>}
                  </div>
                  <div style={{fontSize:9,color:"#444",marginTop:1}}>Juz {s.juz} · p.{getSurahPage(s.n)}{errRate>0?` · ${errRate} err/s`:""}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:pct===100?sec.color:pct>0?"#f59e0b":"#2a2a2a",fontFamily:"monospace"}}>{pct}%</div>
              </div>
              {pct>0&&<div style={{height:2,background:"#1a1a1a",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:2}}/></div>}
            </div>
          );
        })}
      </div>
      {selectedSurah&&<QuickSurahPanel surahN={selectedSurah} surahProgress={pm} onClose={()=>setSelectedSurah(null)} onSave={saveSurahData} color={sec.color}/>}
    </div>
  );
}

function HifzSession({state,onSave,onDone}){
  const sec=SECTIONS.hifz;
  const pm=state.surahProgress||{};
  const [selSurah,setSelSurah]=useState("");
  const [entireSurah,setEntireSurah]=useState(false);
  const [rangeFrom,setRangeFrom]=useState(1);
  const [rangeTo,setRangeTo]=useState(1);
  const [verseErrors,setVerseErrors]=useState({});
  const [partner,setPartner]=useState("");
  const [type,setType]=useState("solo");
  const [notes,setNotes]=useState("");
  const [mastery,setMastery]=useState("mubtadi");
  const [goalSurah,setGoalSurah]=useState("");
  const [goalDate,setGoalDate]=useState("");
  const [saved,setSaved]=useState(false);
  const [shareLink,setShareLink]=useState(null);
  const [sessionId]=useState(()=>genId());
  const [startTime]=useState(()=>Date.now());
  const surah=SURAHS.find(s=>s.n===Number(selSurah));
  const existingRanges=pm[selSurah]?.learnedRanges||[];
  const ef=entireSurah?1:rangeFrom,et=entireSurah?(surah?.v||1):rangeTo;
  const newRanges=surah?[...existingRanges,{from:Math.min(ef,et),to:Math.max(ef,et)}]:existingRanges;
  const newPct=surah?surahLearnedPct(newRanges,surah.v):0;

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
    const newRange={from:Math.min(ef,et),to:Math.max(ef,et)};
    const session={date:today(),type,partner:type==="solo"?null:partner,verseErrors,notes,range:newRange,duration:dur||1};
    const surahData={learnedRanges:newRanges,hifzSessions:[session,...(existingRanges?pm[selSurah]?.hifzSessions||[]:[])],mastery,lastReviewed:today()};
    await onSave(selSurah,session,surahData,goalSurah&&goalDate?{surahN:Number(goalSurah),targetDate:goalDate}:null);
    setSaved(true);setTimeout(onDone,1400);
  };

  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:44}}>&#10003;</div><div style={{color:sec.color,fontSize:16,marginTop:12}}>Seance enregistree !</div></div>;
  const vNums=surah?Array.from({length:surah.v},(_,i)=>i+1):[];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل حفظ</div>
        <div style={{fontSize:11,color:"#555"}}>Nouvelle seance d'apprentissage</div>
      </div>
      <select value={selSurah} onChange={e=>{setSelSurah(e.target.value);setRangeFrom(1);setRangeTo(1);setEntireSurah(false);setVerseErrors({});}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"10px 12px",fontSize:13,outline:"none"}}>
        <option value="">Sourate...</option>
        {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name} ({s.v} v.)</option>)}
      </select>
      {surah&&(
        <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:10,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase"}}>Versets aujourd'hui</div>
            <button onClick={()=>setEntireSurah(!entireSurah)} style={{padding:"3px 10px",borderRadius:20,fontSize:10,cursor:"pointer",border:entireSurah?`1px solid ${sec.color}`:"1px solid #333",background:entireSurah?sec.colorDim:"#111",color:entireSurah?sec.color:"#555"}}>Sourate entiere</button>
          </div>
          {!entireSurah&&(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select value={rangeFrom} onChange={e=>setRangeFrom(Number(e.target.value))} style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 8px",fontSize:13,outline:"none"}}>
                {vNums.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <span style={{color:"#333"}}>→</span>
              <select value={rangeTo} onChange={e=>setRangeTo(Number(e.target.value))} style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 8px",fontSize:13,outline:"none"}}>
                {vNums.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          )}
          {entireSurah&&<div style={{textAlign:"center",color:sec.color,fontSize:11,padding:"6px 0"}}>v.1 → v.{surah.v} (sourate complete)</div>}
          <div style={{marginTop:7,fontSize:10,color:sec.color+"88",textAlign:"center",background:sec.color+"11",borderRadius:6,padding:5}}>{newPct}% de {surah.name}</div>
        </div>
      )}
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:9,padding:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:6}}>Niveau de maitrise</div>
        <div style={{display:"flex",gap:4}}>
          {Object.entries(MASTERY).map(([k,m])=>(
            <button key={k} onClick={()=>setMastery(k)} style={{flex:1,padding:"6px 2px",borderRadius:6,fontSize:9,cursor:"pointer",border:mastery===k?`1px solid ${m.color}`:"1px solid #222",background:mastery===k?m.color+"22":"#111",color:mastery===k?m.color:"#555",fontWeight:mastery===k?700:400}}>{m.label}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:7}}>
        {[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=>(
          <button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:9,borderRadius:8,fontSize:12,cursor:"pointer",border:type===t.k?`1px solid ${sec.color}`:"1px solid #222",background:type===t.k?sec.colorDim:"#0d0d0d",color:type===t.k?sec.color:"#555"}}>{t.l}</button>
        ))}
      </div>
      {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom du cheikh" style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:12,outline:"none",boxSizing:"border-box"}}/>}
      {type==="sheikh"&&selSurah&&shareLink&&(
        <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:9,padding:11}}>
          <div style={{fontSize:10,color:"#60a5fa",marginBottom:5,fontWeight:700}}>Lien correcteur</div>
          <div style={{display:"flex",gap:7}}>
            <div style={{flex:1,background:"#111",border:"1px solid #1e1e1e",borderRadius:6,padding:"6px 9px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{shareLink}</div>
            <button onClick={()=>navigator.clipboard.writeText(shareLink).catch(()=>{})} style={{padding:"6px 10px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:10,cursor:"pointer"}}>Copier</button>
          </div>
        </div>
      )}
      {surah&&<div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:9,padding:11}}><VerseErrorPicker totalVerses={surah.v} verseErrors={verseErrors} onChange={setVerseErrors}/></div>}
      <div style={{background:"#0d0d0d",border:"1px solid #c9a84c22",borderRadius:9,padding:11}}>
        <div style={{fontSize:10,color:"#c9a84c",textTransform:"uppercase",marginBottom:6}}>Objectif (optionnel)</div>
        <div style={{display:"flex",gap:7}}>
          <select value={goalSurah} onChange={e=>setGoalSurah(e.target.value)} style={{flex:2,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"6px 8px",fontSize:11,outline:"none"}}>
            <option value="">Sourate cible...</option>
            {SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
          </select>
          <input type="date" value={goalDate} onChange={e=>setGoalDate(e.target.value)} style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"6px 8px",fontSize:11,outline:"none"}}/>
        </div>
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} disabled={!selSurah} style={{padding:12,borderRadius:10,fontSize:13,fontWeight:700,cursor:selSurah?"pointer":"not-allowed",background:selSurah?`linear-gradient(135deg,${sec.colorDim},${sec.color}40)`:"#0d0d0d",border:selSurah?`1px solid ${sec.colorBorder}`:"1px solid #1a1a1a",color:selSurah?sec.color:"#333"}}>
        Enregistrer la seance
      </button>
    </div>
  );
}

// ── MURAJA ─────────────────────────────────────────────────────────────────────
function MurajaDashboard({state,onNewSession}){
  const sec=SECTIONS.muraja;
  const sessions=state.murajaSessions||[];
  const pm=state.surahProgress||{};
  const sorted=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const thisWeek=sessions.filter(s=>(new Date()-new Date(s.date))/(1000*60*60*24)<=7).length;
  const errorRates=SURAHS.filter(s=>pm[s.n]?.hifzSessions?.length>0).map(s=>({name:s.name,n:s.n,rate:surahErrorRate(pm[s.n].hifzSessions)})).filter(x=>x.rate>0).sort((a,b)=>b.rate-a.rate).slice(0,3);
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        {[{l:"Total revisions",v:sessions.length,c:sec.color},{l:"Cette semaine",v:thisWeek,c:"#60a5fa"}].map(c=>(
          <div key={c.l} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:9,padding:"12px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.c}}/>
            <div style={{fontSize:24,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
            <div style={{fontSize:9,color:"#444",textTransform:"uppercase"}}>{c.l}</div>
          </div>
        ))}
      </div>
      {errorRates.length>0&&(
        <div style={{background:"#0d0d0d",border:"1px solid #ef444433",borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{fontSize:10,color:"#ef4444",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Points faibles</div>
          {errorRates.map(e=>(
            <div key={e.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}>
              <span style={{fontSize:12,color:"#ccc"}}>{e.name}</span>
              <span style={{fontSize:11,color:"#ef4444",fontFamily:"monospace",fontWeight:700}}>{e.rate} err/s</span>
            </div>
          ))}
        </div>
      )}
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>Dernieres revisions</div>
        {sorted.length===0?<div style={{textAlign:"center",color:"#333",fontSize:12,padding:"8px 0"}}>Aucune revision encore</div>:
        sorted.slice(0,5).map((s,i)=>{
          const fN=SURAHS.find(x=>x.n===s.range?.fromSurah)?.name||"";
          const tN=SURAHS.find(x=>x.n===s.range?.toSurah)?.name||"";
          const cnt=Math.max(0,globalVerse(s.range?.toSurah||1,s.range?.toVerse||1)-globalVerse(s.range?.fromSurah||1,s.range?.fromVerse||1)+1);
          return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<4?"1px solid #1a1a1a":"none"}}>
              <div>
                <div style={{fontSize:11,color:"#ccc"}}>{fN} {s.range?.fromVerse} → {tN} {s.range?.toVerse}</div>
                <div style={{fontSize:9,color:"#444"}}>{formatDateHijri(s.date)}{s.quality?` · ${"★".repeat(s.quality)}`:""}</div>
              </div>
              <span style={{fontSize:9,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 7px"}}>{cnt} v.</span>
            </div>
          );
        })}
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${sec.colorDim},${sec.color}30)`,border:`1px solid ${sec.colorBorder}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:600}}>
        + Nouvelle revision
      </button>
    </div>
  );
}

function MurajaList({state,persist}){
  const sec=SECTIONS.muraja;
  const pm=state.surahProgress||{};
  const [search,setSearch]=useState("");
  const [filterMode,setFilterMode]=useState("surah");
  const [filterVal,setFilterVal]=useState("all");
  const [selectedSurah,setSelectedSurah]=useState(null);
  const saveSurahData=async(surahN,data)=>await persist({...state,surahProgress:{...pm,[surahN]:{...(pm[surahN]||{}),...data}}});
  let displaySurahs=SURAHS.filter(s=>pm[s.n]?.learnedRanges?.length>0&&surahLearnedPct(pm[s.n].learnedRanges,s.v)>0);
  if(filterMode==="juz"&&filterVal!=="all"){const j=getJuzInfo(Number(filterVal));displaySurahs=displaySurahs.filter(s=>s.n>=j.startSurah&&s.n<=j.endSurah);}
  else if(filterMode==="hizb"&&filterVal!=="all"){const h=getHizbInfo(Number(filterVal));displaySurahs=displaySurahs.filter(s=>s.n>=h.startSurah&&s.n<=h.endSurah);}
  if(search) displaySurahs=displaySurahs.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||String(s.n).includes(search));
  return(
    <div>
      <div style={{background:"#1a100a",border:"1px solid #f59e0b33",borderRadius:7,padding:"7px 10px",fontSize:10,color:"#f59e0b",marginBottom:8}}>Sourates memorisees uniquement</div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"7px 12px",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
      <FilterBar filterMode={filterMode} setFilterMode={setFilterMode} filterVal={filterVal} setFilterVal={setFilterVal} color={sec.color}/>
      {(filterMode==="juz"||filterMode==="hizb")&&filterVal!=="all"&&<JuzHizbCard mode={filterMode} n={Number(filterVal)} surahProgress={pm} color={sec.color}/>}
      {displaySurahs.length===0?<div style={{textAlign:"center",color:"#333",fontSize:12,padding:20}}>Aucune sourate memorisee</div>:
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {displaySurahs.map(s=>{
          const pct=surahLearnedPct(pm[s.n]?.learnedRanges,s.v);
          const mastery=pm[s.n]?.mastery;
          const due=mastery?isDueForReview(mastery,pm[s.n]?.lastReviewed):false;
          return(
            <div key={s.n} onClick={()=>setSelectedSurah(s.n)} style={{background:"#0d0d0d",border:`1px solid ${due?"#f59e0b33":"#1a1a1a"}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#111",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#444",flexShrink:0}}>{s.n}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:"#ccc",fontWeight:500}}>{s.name}</span>
                  {mastery&&<MasteryBadge level={mastery}/>}
                  {due&&<span style={{fontSize:8,color:"#f59e0b",background:"#f59e0b11",borderRadius:20,padding:"1px 5px"}}>Due</span>}
                </div>
                <div style={{fontSize:9,color:"#444",marginTop:1}}>{pct}% memorise</div>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:pct===100?sec.color:"#f59e0b",fontFamily:"monospace"}}>{pct}%</span>
            </div>
          );
        })}
      </div>}
      {selectedSurah&&<QuickSurahPanel surahN={selectedSurah} surahProgress={pm} onClose={()=>setSelectedSurah(null)} onSave={saveSurahData} color={sec.color}/>}
    </div>
  );
}

function MurajaSession({state,onSave,onDone}){
  const sec=SECTIONS.muraja;
  const pm=state.surahProgress||{};
  const learnedSurahs=SURAHS.filter(s=>pm[s.n]?.learnedRanges?.length>0);
  const def1=learnedSurahs[0]?.n||1,defLast=learnedSurahs[learnedSurahs.length-1]?.n||1;
  const [fromSurah,setFromSurah]=useState(def1);
  const [fromVerse,setFromVerse]=useState(1);
  const [toSurah,setToSurah]=useState(defLast);
  const [toVerse,setToVerse]=useState(SURAHS.find(s=>s.n===defLast)?.v||1);
  const [type,setType]=useState("solo");
  const [partner,setPartner]=useState("");
  const [notes,setNotes]=useState("");
  const [quality,setQuality]=useState(3);
  const [saved,setSaved]=useState(false);
  const [startTime]=useState(()=>Date.now());
  const fs=SURAHS.find(s=>s.n===fromSurah),ts=SURAHS.find(s=>s.n===toSurah);
  const cnt=Math.max(0,globalVerse(toSurah,toVerse)-globalVerse(fromSurah,fromVerse)+1);
  const pct=Math.round((cnt/TOTAL_VERSES)*100);
  const save=async()=>{
    const dur=Math.round((Date.now()-startTime)/60000);
    await onSave({date:today(),type,partner:type==="solo"?null:partner,quality,notes,duration:dur||1,range:{fromSurah,fromVerse,toSurah,toVerse,fromName:fs?.name,toName:ts?.name}});
    setSaved(true);setTimeout(onDone,1400);
  };
  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:44}}>&#10003;</div><div style={{color:sec.color,fontSize:16,marginTop:12}}>Revision enregistree !</div></div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل مراجعة</div>
        <div style={{fontSize:11,color:"#555"}}>Nouvelle seance de revision</div>
      </div>
      {cnt>0&&<div style={{background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:7,padding:"8px 12px",fontSize:11,color:sec.color+"cc",textAlign:"center"}}>{fs?.name} {fromVerse} → {ts?.name} {toVerse} · {cnt} versets · {pct}% du Coran</div>}
      <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:10,padding:12}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:8}}>Plage</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:7,alignItems:"start"}}>
          <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:8,padding:9}}>
            <div style={{fontSize:9,color:sec.color+"88",textTransform:"uppercase",marginBottom:5}}>Debut</div>
            <select value={fromSurah} onChange={e=>{setFromSurah(Number(e.target.value));setFromVerse(1);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:5,color:"#ddd",padding:"5px 6px",fontSize:10,outline:"none",marginBottom:5}}>
              {learnedSurahs.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
            <select value={fromVerse} onChange={e=>setFromVerse(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:5,color:"#ddd",padding:"5px 6px",fontSize:12,outline:"none"}}>
              {Array.from({length:fs?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{color:"#333",fontSize:14,paddingTop:28,textAlign:"center"}}>→</div>
          <div style={{background:"#111",border:`1px solid ${sec.color}22`,borderRadius:8,padding:9}}>
            <div style={{fontSize:9,color:sec.color+"88",textTransform:"uppercase",marginBottom:5}}>Fin</div>
            <select value={toSurah} onChange={e=>{setToSurah(Number(e.target.value));setToVerse(1);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:5,color:"#ddd",padding:"5px 6px",fontSize:10,outline:"none",marginBottom:5}}>
              {learnedSurahs.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
            <select value={toVerse} onChange={e=>setToVerse(Number(e.target.value))} style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:5,color:"#ddd",padding:"5px 6px",fontSize:12,outline:"none"}}>
              {Array.from({length:ts?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:9,padding:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>Qualite</div>
        <div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(q=><button key={q} onClick={()=>setQuality(q)} style={{flex:1,padding:"8px 2px",borderRadius:6,fontSize:16,cursor:"pointer",border:quality>=q?`1px solid ${sec.color}55`:"1px solid #1a1a1a",background:quality>=q?sec.colorDim:"#111",color:quality>=q?sec.color:"#2a2a2a"}}>&#9733;</button>)}</div>
        <div style={{fontSize:10,color:"#555",textAlign:"center",marginTop:4}}>{["","Tres difficile","Difficile","Moyen","Bien","Excellent"][quality]}</div>
      </div>
      <div style={{display:"flex",gap:7}}>
        {[{k:"solo",l:"Solo"},{k:"sheikh",l:"Avec quelqu'un"}].map(t=><button key={t.k} onClick={()=>setType(t.k)} style={{flex:1,padding:9,borderRadius:8,fontSize:12,cursor:"pointer",border:type===t.k?`1px solid ${sec.color}`:"1px solid #222",background:type===t.k?sec.colorDim:"#0d0d0d",color:type===t.k?sec.color:"#555"}}>{t.l}</button>)}
      </div>
      {type==="sheikh"&&<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nom" style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:12,outline:"none",boxSizing:"border-box"}}/>}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} style={{padding:12,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",background:`linear-gradient(135deg,${sec.colorDim},${sec.color}40)`,border:`1px solid ${sec.colorBorder}`,color:sec.color}}>Enregistrer la revision</button>
    </div>
  );
}

// ── WIRD ───────────────────────────────────────────────────────────────────────
function WirdDashboard({state,onNewSession,persist}){
  const sec=SECTIONS.wird;
  const useHijri=state.wirdUseHijri||false;
  const mk=getMonthKey(useHijri);
  const wird=state.wird||{};
  const monthData=wird[mk]||{};
  const sessions=monthData.sessions||[];
  const goal=monthData.goal||1;
  const lastSession=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  let totalRead=0;
  sessions.forEach(s=>{
    const gF=s.fromGlobal||globalVerse(s.fromSurah||1,s.fromVerse||1);
    const gT=s.toGlobal||globalVerse(s.toSurah||1,s.toVerse||1);
    totalRead+=Math.max(0,gT-gF+1);
  });
  const pct=Math.min(100,Math.round((totalRead/(TOTAL_VERSES*goal))*100));
  const now=new Date();
  let expectedPct=0;
  if(useHijri){const h=todayHijri();const dim=[30,29,30,29,30,29,30,29,30,29,30,29][h.m-1]||30;expectedPct=Math.round((h.d/dim)*100);}
  else{const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();expectedPct=Math.round((now.getDate()/dim)*100);}
  const ahead=pct>=expectedPct;
  const setGoal=async g=>await persist({...state,wird:{...wird,[mk]:{...monthData,goal:g}}});
  const khatma=state.khatma||null;
  let kPct=0;
  if(khatma){let kr=0;(khatma.sessions||[]).forEach(s=>{kr+=Math.max(0,(s.toGlobal||globalVerse(s.toSurah||1,s.toVerse||1))-(s.fromGlobal||globalVerse(s.fromSurah||1,s.fromVerse||1))+1);});kPct=Math.min(100,Math.round((kr/TOTAL_VERSES)*100));}
  let mLabel="";
  if(useHijri){const h=todayHijri();mLabel=`${HIJRI_MONTHS_AR[h.m-1]} ${h.y}هـ`;}
  else mLabel=now.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  return(
    <div>
      <div style={{background:"linear-gradient(135deg,#001a0a,#002510)",border:`1px solid ${sec.color}22`,borderRadius:12,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:20,color:sec.color}}>الورد الشهري</div>
            <div style={{fontSize:10,color:sec.color+"66",marginTop:1}}>{mLabel}</div>
            <button onClick={async()=>await persist({...state,wirdUseHijri:!useHijri})} style={{marginTop:4,padding:"2px 8px",borderRadius:20,fontSize:9,cursor:"pointer",border:`1px solid ${sec.color}33`,background:"transparent",color:sec.color+"88"}}>{useHijri?"Hijri (actif)":"Gregorien (actif)"}</button>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#444",marginBottom:5}}>Objectif</div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <button onClick={()=>setGoal(Math.max(1,goal-1))} style={{width:22,height:22,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",color:"#888",fontSize:14,cursor:"pointer",lineHeight:1}}>-</button>
              <span style={{fontSize:20,fontWeight:700,color:sec.color,fontFamily:"monospace"}}>{goal}</span>
              <button onClick={()=>setGoal(goal+1)} style={{width:22,height:22,borderRadius:"50%",background:"#0d0d0d",border:"1px solid #222",color:"#888",fontSize:14,cursor:"pointer",lineHeight:1}}>+</button>
            </div>
            <div style={{fontSize:9,color:"#444"}}>x Coran</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:4}}><span style={{color:"#555"}}>Progression</span><span style={{color:sec.color,fontWeight:700}}>{pct}%</span></div>
        <div style={{height:6,background:"#0a2010",borderRadius:5,overflow:"hidden",position:"relative"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sec.color},${sec.color}88)`,borderRadius:5}}/>
          <div style={{position:"absolute",top:0,bottom:0,left:`${expectedPct}%`,width:1,background:"#ffffff22"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginTop:3}}>
          <span style={{color:ahead?"#4ade8077":"#ef444477"}}>{ahead?`En avance de ${pct-expectedPct}%`:`En retard de ${expectedPct-pct}%`}</span>
          <span style={{color:"#333"}}>Attendu: {expectedPct}%</span>
        </div>
        {lastSession&&<div style={{background:"#ffffff08",borderRadius:7,padding:"6px 10px",fontSize:11,marginTop:8}}><span style={{color:"#444"}}>Derniere position: </span><span style={{color:sec.color,fontWeight:600}}>{SURAHS.find(s=>s.n===lastSession.toSurah)?.name} v.{lastSession.toVerse}</span></div>}
      </div>
      <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}33`,borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <div style={{fontSize:10,color:sec.color,textTransform:"uppercase",letterSpacing:1}}>Khatma</div>
          {khatma&&<span style={{fontSize:11,color:sec.color,fontWeight:700,fontFamily:"monospace"}}>{kPct}%</span>}
        </div>
        {khatma?(
          <>
            <div style={{height:4,background:"#0a2010",borderRadius:4,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:`${kPct}%`,background:sec.color,borderRadius:4}}/></div>
            {kPct===100&&<div style={{fontSize:16,color:sec.color,textAlign:"center",fontFamily:"'Scheherazade New',serif",marginTop:6}}>تمت الختمة بحمد الله</div>}
          </>
        ):(
          <button onClick={async()=>await persist({...state,khatma:{startDate:today(),sessions:[]}})} style={{width:"100%",padding:8,background:sec.color+"11",border:`1px dashed ${sec.color}33`,borderRadius:7,color:sec.color+"88",fontSize:11,cursor:"pointer"}}>+ Demarrer une Khatma</button>
        )}
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>Seances de lecture</div>
        {sessions.length===0?<div style={{textAlign:"center",color:"#333",fontSize:12,padding:"8px 0"}}>Aucune lecture ce mois</div>:
        [...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5).map((s,i)=>{
          const cnt=Math.max(0,(s.toGlobal||globalVerse(s.toSurah||1,s.toVerse||1))-(s.fromGlobal||globalVerse(s.fromSurah||1,s.fromVerse||1))+1);
          const label=s.juzMode?`Juz ${s.juzN}`:s.hizbMode?`Hizb ${s.hizbN}`:s.mode==="point"?`Jusqu'a ${SURAHS.find(x=>x.n===s.toSurah)?.name} v.${s.toVerse}`:`${SURAHS.find(x=>x.n===s.fromSurah)?.name} → ${SURAHS.find(x=>x.n===s.toSurah)?.name}`;
          return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<4?"1px solid #1a1a1a":"none"}}>
              <div><div style={{fontSize:11,color:"#ccc"}}>{label}</div><div style={{fontSize:9,color:"#444"}}>{formatDateHijri(s.date)}</div></div>
              <span style={{fontSize:9,color:sec.color,background:sec.color+"11",borderRadius:20,padding:"2px 7px"}}>{cnt} v.</span>
            </div>
          );
        })}
      </div>
      <button onClick={onNewSession} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${sec.colorDim},${sec.color}30)`,border:`1px solid ${sec.colorBorder}`,borderRadius:10,color:sec.color,fontSize:14,cursor:"pointer",fontWeight:600}}>
        + Enregistrer une lecture
      </button>
    </div>
  );
}

function WirdList({state}){
  const sec=SECTIONS.wird;
  const pm=state.surahProgress||{};
  const [search,setSearch]=useState("");
  const [filterMode,setFilterMode]=useState("surah");
  const [filterVal,setFilterVal]=useState("all");
  let displaySurahs=SURAHS;
  if(filterMode==="juz"&&filterVal!=="all"){const j=getJuzInfo(Number(filterVal));displaySurahs=SURAHS.filter(s=>s.n>=j.startSurah&&s.n<=j.endSurah);}
  else if(filterMode==="hizb"&&filterVal!=="all"){const h=getHizbInfo(Number(filterVal));displaySurahs=SURAHS.filter(s=>s.n>=h.startSurah&&s.n<=h.endSurah);}
  if(search) displaySurahs=displaySurahs.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||String(s.n).includes(search));
  return(
    <div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #222",borderRadius:8,color:"#ddd",padding:"7px 12px",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
      <FilterBar filterMode={filterMode} setFilterMode={setFilterMode} filterVal={filterVal} setFilterVal={setFilterVal} color={sec.color}/>
      {(filterMode==="juz"||filterMode==="hizb")&&filterVal!=="all"&&<JuzHizbCard mode={filterMode} n={Number(filterVal)} surahProgress={pm} color={sec.color}/>}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {displaySurahs.map(s=>{
          const pct=surahLearnedPct(pm[s.n]?.learnedRanges,s.v);
          return(
            <div key={s.n} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"9px 12px",display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"#111",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#444",flexShrink:0}}>{s.n}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:"#ccc"}}>{s.name} <span style={{fontFamily:"'Scheherazade New',serif",fontSize:12,color:"#c9a84c33"}}>{s.ar}</span></div>
                <div style={{fontSize:9,color:"#444"}}>Juz {s.juz} · p.{getSurahPage(s.n)} · {s.v} v.</div>
              </div>
              {pct>0&&<span style={{fontSize:10,color:sec.color,fontFamily:"monospace"}}>{pct}% hifz</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WirdSession({state,onSave,onDone}){
  const sec=SECTIONS.wird;
  const useHijri=state.wirdUseHijri||false;
  const mk=getMonthKey(useHijri);
  const sessions=(state.wird||{})[mk]?.sessions||[];
  const last=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const [inputMode,setInputMode]=useState("point");
  const [toSurah,setToSurah]=useState(last?.toSurah||1);
  const [toVerse,setToVerse]=useState(last?.toVerse||1);
  const [fromSurah,setFromSurah]=useState(last?.toSurah||1);
  const [fromVerse,setFromVerse]=useState(last?.toVerse||1);
  const [selJuz,setSelJuz]=useState(1);
  const [selHizb,setSelHizb]=useState(1);
  const [notes,setNotes]=useState("");
  const [saved,setSaved]=useState(false);
  const toSD=SURAHS.find(s=>s.n===toSurah),fromSD=SURAHS.find(s=>s.n===fromSurah);
  const save=async()=>{
    let session={date:today(),mode:inputMode,notes};
    if(inputMode==="juz"){const j=getJuzInfo(selJuz);session={...session,juzMode:true,juzN:selJuz,fromSurah:j.startSurah,fromVerse:j.startVerse,toSurah:j.endSurah,toVerse:j.endVerse,fromGlobal:globalVerse(j.startSurah,j.startVerse),toGlobal:globalVerse(j.endSurah,j.endVerse)};}
    else if(inputMode==="hizb"){const h=getHizbInfo(selHizb);session={...session,hizbMode:true,hizbN:selHizb,fromSurah:h.startSurah,fromVerse:h.startVerse,toSurah:h.endSurah,toVerse:h.endVerse,fromGlobal:globalVerse(h.startSurah,h.startVerse),toGlobal:globalVerse(h.endSurah,h.endVerse)};}
    else if(inputMode==="point"){session={...session,fromSurah:last?.toSurah||1,fromVerse:last?.toVerse||1,toSurah,toVerse,fromGlobal:globalVerse(last?.toSurah||1,last?.toVerse||1),toGlobal:globalVerse(toSurah,toVerse)};}
    else{session={...session,fromSurah,fromVerse,toSurah,toVerse,fromGlobal:globalVerse(fromSurah,fromVerse),toGlobal:globalVerse(toSurah,toVerse)};}
    await onSave(session,!!state.khatma);
    setSaved(true);setTimeout(onDone,1400);
  };
  if(saved) return <div style={{textAlign:"center",padding:60}}><div style={{fontSize:44}}>&#10003;</div><div style={{color:sec.color,fontSize:16,marginTop:12}}>Lecture enregistree !</div></div>;
  const modes=[{k:"point",l:"Jusqu'a..."},{k:"range",l:"Plage"},{k:"juz",l:"Juz"},{k:"hizb",l:"Hizb"}];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:sec.color}}>تسجيل ورد</div>
        <div style={{fontSize:11,color:"#555"}}>Enregistrer une lecture</div>
      </div>
      {last&&<div style={{background:sec.colorDim,border:`1px solid ${sec.colorBorder}`,borderRadius:7,padding:"8px 12px",fontSize:11}}><span style={{color:"#555"}}>Derniere: </span><span style={{color:sec.color,fontWeight:600}}>{SURAHS.find(s=>s.n===last.toSurah)?.name} v.{last.toVerse}</span></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
        {modes.map(m=><button key={m.k} onClick={()=>setInputMode(m.k)} style={{padding:"8px 4px",borderRadius:7,fontSize:10,cursor:"pointer",textAlign:"center",border:inputMode===m.k?`1px solid ${sec.color}`:"1px solid #222",background:inputMode===m.k?sec.colorDim:"#0d0d0d",color:inputMode===m.k?sec.color:"#555",fontWeight:inputMode===m.k?700:400}}>{m.l}</button>)}
      </div>
      {inputMode==="juz"&&(
        <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:9,padding:12}}>
          <select value={selJuz} onChange={e=>setSelJuz(Number(e.target.value))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"9px 12px",fontSize:13,outline:"none",marginBottom:7}}>
            {Array.from({length:30},(_,i)=>i+1).map(n=><option key={n} value={n}>Juz {n} ({JUZ_VERSES[n-1]} versets)</option>)}
          </select>
          <div style={{background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:6,padding:"6px 10px",fontSize:11,color:sec.color+"cc",textAlign:"center"}}>{JUZ_VERSES[selJuz-1]} versets · {Math.round((JUZ_VERSES[selJuz-1]/TOTAL_VERSES)*100)}% du Coran</div>
        </div>
      )}
      {inputMode==="hizb"&&(
        <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:9,padding:12}}>
          <select value={selHizb} onChange={e=>setSelHizb(Number(e.target.value))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"9px 12px",fontSize:13,outline:"none",marginBottom:7}}>
            {Array.from({length:60},(_,i)=>i+1).map(n=><option key={n} value={n}>Hizb {n} ({HIZB_VERSES[n-1]} versets)</option>)}
          </select>
          <div style={{background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:6,padding:"6px 10px",fontSize:11,color:sec.color+"cc",textAlign:"center"}}>{HIZB_VERSES[selHizb-1]} versets</div>
        </div>
      )}
      {inputMode==="range"&&(
        <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:9,padding:12}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>Debut</div>
          <div style={{display:"flex",gap:7}}>
            <select value={fromSurah} onChange={e=>{setFromSurah(Number(e.target.value));setFromVerse(1);}} style={{flex:2,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 8px",fontSize:11,outline:"none"}}>{SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}</select>
            <select value={fromVerse} onChange={e=>setFromVerse(Number(e.target.value))} style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 8px",fontSize:13,outline:"none"}}>{Array.from({length:fromSD?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}</select>
          </div>
        </div>
      )}
      {(inputMode==="point"||inputMode==="range")&&(
        <div style={{background:"#0d0d0d",border:`1px solid ${sec.color}22`,borderRadius:9,padding:12}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:7}}>{inputMode==="point"?"Jusqu'a...":"Fin"}</div>
          <div style={{display:"flex",gap:7}}>
            <select value={toSurah} onChange={e=>{setToSurah(Number(e.target.value));setToVerse(1);}} style={{flex:2,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 8px",fontSize:11,outline:"none"}}>{SURAHS.map(s=><option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}</select>
            <select value={toVerse} onChange={e=>setToVerse(Number(e.target.value))} style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:7,color:"#ddd",padding:"7px 8px",fontSize:13,outline:"none"}}>{Array.from({length:toSD?.v||1},(_,i)=>i+1).map(v=><option key={v} value={v}>{v}</option>)}</select>
          </div>
          <div style={{marginTop:7,background:sec.color+"11",border:`1px solid ${sec.color}22`,borderRadius:6,padding:"6px 10px",fontSize:11,color:sec.color+"cc",textAlign:"center"}}>{SURAHS.find(s=>s.n===toSurah)?.name} v.{toVerse} / {toSD?.v}</div>
        </div>
      )}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
      <button onClick={save} style={{padding:12,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",background:`linear-gradient(135deg,${sec.colorDim},${sec.color}40)`,border:`1px solid ${sec.colorBorder}`,color:sec.color}}>Enregistrer la lecture</button>
    </div>
  );
}

// ── STATS ──────────────────────────────────────────────────────────────────────
function StatsView({state}){
  const pm=state.surahProgress||{};
  const ms=state.murajaSessions||[];
  const hifzPct=globalHifzPct(pm);
  let totalMin=0;
  Object.values(pm).forEach(p=>{(p.hifzSessions||[]).forEach(s=>{totalMin+=(s.duration||0);});});
  ms.forEach(s=>{totalMin+=(s.duration||0);});
  const weeks=Array.from({length:8},(_,w)=>{
    const d=new Date();d.setDate(d.getDate()-(7-w)*7);
    const ws=d.toISOString().slice(0,7);
    let cnt=0;Object.values(pm).forEach(p=>{(p.hifzSessions||[]).forEach(s=>{if(s.date?.slice(0,7)===ws) cnt++;});});
    return {label:ws.slice(5),count:cnt};
  });
  const maxC=Math.max(...weeks.map(w=>w.count),1);
  const errorRates=SURAHS.filter(s=>pm[s.n]?.hifzSessions?.length>0).map(s=>({name:s.name,n:s.n,rate:surahErrorRate(pm[s.n].hifzSessions)})).filter(x=>x.rate>0).sort((a,b)=>b.rate-a.rate);
  const wd=new Date();wd.setDate(wd.getDate()-7);
  const wds=wd.toISOString().slice(0,10);
  let wkVerses=0;
  Object.values(pm).forEach(p=>{(p.hifzSessions||[]).forEach(s=>{if(s.date>=wds&&s.range) wkVerses+=(s.range.to-s.range.from+1);});});
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>الإحصائيات</div>
        <div style={{fontSize:11,color:"#555"}}>Statistiques et progression</div>
      </div>
      {/* Global hifz heart */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
        <div style={{textAlign:"center"}}>
          <HeartProgress pct={hifzPct} color="#60a5fa"/>
          <div style={{fontSize:10,color:"#60a5fa55",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>du Coran memorise</div>
        </div>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #c9a84c33",borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Cette semaine</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
          {[{l:"Versets",v:wkVerses,c:"#4ade80"},{l:"Temps total",v:`${Math.round(totalMin/60)}h`,c:"#f59e0b"},{l:"% global",v:`${hifzPct}%`,c:"#60a5fa"}].map(c=>(
            <div key={c.l} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:7,padding:"9px 6px",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:c.c,fontFamily:"monospace"}}>{c.v}</div>
              <div style={{fontSize:9,color:"#444",textTransform:"uppercase"}}>{c.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>Seances par mois</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:3,height:55}}>
          {weeks.map((w,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:"100%",background:"#60a5fa",borderRadius:"2px 2px 0 0",height:`${Math.max(3,(w.count/maxC)*48)}px`,opacity:0.75}}/>
              <div style={{fontSize:7,color:"#444",transform:"rotate(-30deg)",transformOrigin:"center",whiteSpace:"nowrap"}}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>
      {errorRates.length>0&&(
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:12}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:9}}>Taux d'erreurs</div>
          {errorRates.slice(0,6).map(e=>(
            <div key={e.n} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#ccc"}}>{e.name}</span><span style={{color:e.rate>3?"#ef4444":e.rate>1?"#f59e0b":"#4ade80",fontFamily:"monospace",fontWeight:700}}>{e.rate}</span></div>
              <div style={{height:2,background:"#1a1a1a",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,e.rate/5*100)}%`,background:e.rate>3?"#ef4444":e.rate>1?"#f59e0b":"#4ade80",borderRadius:2}}/></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LEADERBOARD ────────────────────────────────────────────────────────────────
function Leaderboard({state,persist}){
  const [friends,setFriends]=useState([]);
  const [myGroups,setMyGroups]=useState([]);
  const [loading,setLoading]=useState(true);
  const [newGN,setNewGN]=useState("");
  const [joinC,setJoinC]=useState("");
  useEffect(()=>{
    const u=dbListen("leaderboard",d=>{if(d){setFriends(Object.entries(d).map(([uid,v])=>({uid,...v})).sort((a,b)=>(b.memorized||0)-(a.memorized||0)));}setLoading(false);});
    const u2=dbListen(`userGroups/${UID}`,d=>{setMyGroups(d?Object.values(d):[]);});
    return()=>{u();u2();};
  },[]);
  useEffect(()=>{
    if(!state.profile?.name) return;
    const pm=state.surahProgress||{};
    const memorized=SURAHS.filter(s=>surahLearnedPct(pm[s.n]?.learnedRanges,s.v)===100).length;
    dbSet(`leaderboard/${UID}`,{name:state.profile.name,memorized,streak:state.streak?.count||0,updatedAt:today()});
  },[state.profile,state.surahProgress]);
  const createGroup=async()=>{if(!newGN.trim()) return;const gid=genId();await dbSet(`groups/${gid}`,{name:newGN,creator:UID,members:{[UID]:state.profile?.name||"Moi"},code:gid});await dbSet(`userGroups/${UID}/${gid}`,{gid,name:newGN});setNewGN("");};
  const joinGroup=async()=>{if(!joinC.trim()) return;const r2=ref(db,`groups/${joinC}`);onValue(r2,async s=>{if(s.exists()){const g=s.val();await dbSet(`groups/${joinC}/members/${UID}`,state.profile?.name||"Moi");await dbSet(`userGroups/${UID}/${joinC}`,{gid:joinC,name:g.name});}setJoinC("");},{onlyOnce:true});};
  const shareLink=`${window.location.origin}${window.location.pathname}`;
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:12}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>المتسابقون</div>
        <div style={{fontSize:11,color:"#555"}}>Classement et groupes</div>
      </div>
      <div style={{background:"#0a1a2a",border:"1px solid #60a5fa33",borderRadius:9,padding:11,marginBottom:10}}>
        <div style={{fontSize:10,color:"#60a5fa",marginBottom:5,fontWeight:700}}>Partage Thabaat</div>
        <div style={{display:"flex",gap:7}}>
          <div style={{flex:1,background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:5,padding:"6px 9px",fontSize:10,color:"#60a5fa",wordBreak:"break-all",fontFamily:"monospace"}}>{shareLink}</div>
          <button onClick={()=>navigator.clipboard.writeText(shareLink).catch(()=>{})} style={{padding:"6px 10px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:5,color:"#60a5fa",fontSize:10,cursor:"pointer"}}>Copier</button>
        </div>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:8}}>Mes groupes</div>
        {myGroups.length===0?<div style={{color:"#333",fontSize:11,marginBottom:8}}>Aucun groupe</div>:myGroups.map(g=>(
          <div key={g.gid} style={{background:"#111",border:"1px solid #222",borderRadius:7,padding:"7px 10px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"#ccc"}}>{g.name}</span>
            <button onClick={()=>navigator.clipboard.writeText(g.gid).catch(()=>{})} style={{padding:"2px 7px",background:"#c9a84c22",border:"1px solid #c9a84c44",borderRadius:20,color:"#c9a84c",fontSize:9,cursor:"pointer"}}>Code</button>
          </div>
        ))}
        <div style={{display:"flex",gap:5,marginBottom:5}}>
          <input value={newGN} onChange={e=>setNewGN(e.target.value)} placeholder="Nom du groupe..." style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"6px 9px",fontSize:11,outline:"none"}}/>
          <button onClick={createGroup} style={{padding:"6px 10px",background:"#c9a84c22",border:"1px solid #c9a84c44",borderRadius:6,color:"#c9a84c",fontSize:11,cursor:"pointer"}}>Creer</button>
        </div>
        <div style={{display:"flex",gap:5}}>
          <input value={joinC} onChange={e=>setJoinC(e.target.value)} placeholder="Code du groupe..." style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:6,color:"#ddd",padding:"6px 9px",fontSize:11,outline:"none"}}/>
          <button onClick={joinGroup} style={{padding:"6px 10px",background:"#60a5fa22",border:"1px solid #60a5fa44",borderRadius:6,color:"#60a5fa",fontSize:11,cursor:"pointer"}}>Rejoindre</button>
        </div>
      </div>
      {!state.profile?.name&&<div style={{background:"#1a1a0a",border:"1px solid #f59e0b33",borderRadius:8,padding:9,marginBottom:8,fontSize:11,color:"#f59e0b"}}>Configure ton prenom dans Profil.</div>}
      {loading?<div style={{textAlign:"center",color:"#444",padding:16}}>Chargement...</div>:
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {friends.map((f,i)=>(
          <div key={f.uid} style={{background:f.uid===UID?"#111822":"#0d0d0d",border:`1px solid ${f.uid===UID?"#60a5fa33":"#1a1a1a"}`,borderRadius:9,padding:"9px 12px",display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:i===0?"#c9a84c22":"#111",border:`1px solid ${i===0?"#c9a84c":i===1?"#888":"#222"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i===0?"#c9a84c":i===1?"#aaa":"#444",flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:f.uid===UID?"#60a5fa":"#ccc",fontWeight:500}}>{f.name}{f.uid===UID?" (moi)":""}</div>
              <div style={{fontSize:9,color:"#444"}}>&#10024; {f.streak||0} jours consecutifs</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#60a5fa",fontFamily:"monospace"}}>{f.memorized||0}</div>
              <div style={{fontSize:8,color:"#444",textTransform:"uppercase"}}>memorisees</div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ── PROFILE ────────────────────────────────────────────────────────────────────
function ProfileView({state,persist,darkMode,setDarkMode}){
  const [name,setName]=useState(state.profile?.name||"");
  const [saved,setSaved]=useState(false);
  const save=async()=>{await persist({...state,profile:{...(state.profile||{}),name}});setSaved(true);setTimeout(()=>setSaved(false),1500);};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>الملف الشخصي</div>
        <div style={{fontSize:11,color:"#555"}}>Profil et Parametres</div>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:11,padding:13}}>
        <label style={{fontSize:10,color:"#555",textTransform:"uppercase",display:"block",marginBottom:6}}>Ton prenom</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ahmed, Ibrahim..." style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",borderRadius:8,color:"#ddd",padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:11,padding:13,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:"#ddd"}}>Mode {darkMode?"sombre":"clair"}</div>
        <div onClick={()=>setDarkMode(!darkMode)} style={{width:38,height:20,borderRadius:10,background:darkMode?"#333":"#c9a84c",position:"relative",cursor:"pointer",transition:"background .3s"}}>
          <div style={{position:"absolute",top:2,left:darkMode?2:18,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
        </div>
      </div>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:11,padding:13}}>
        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:10}}>Rappels</div>
        {[{key:"hifz",title:"Hifz",color:"#60a5fa"},{key:"muraja",title:"Muraja'a",color:"#f59e0b"},{key:"wird",title:"Wird",color:"#4ade80"}].map(rem=>{
          const r=state.reminders?.[rem.key]||{enabled:false,time:"06:00"};
          const upd=async(f,v)=>await persist({...state,reminders:{...state.reminders,[rem.key]:{...r,[f]:v}}});
          return(
            <div key={rem.key} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:r.enabled?7:0}}>
                <div style={{fontSize:12,color:"#ddd"}}>Rappel {rem.title}</div>
                <div onClick={()=>upd("enabled",!r.enabled)} style={{width:36,height:20,borderRadius:10,background:r.enabled?rem.color:"#222",position:"relative",cursor:"pointer",transition:"background .3s"}}>
                  <div style={{position:"absolute",top:2,left:r.enabled?16:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
                </div>
              </div>
              {r.enabled&&<input type="time" value={r.time||"06:00"} onChange={e=>upd("time",e.target.value)} style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:7,color:"#ddd",padding:"6px 10px",fontSize:16,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"monospace"}}/>}
            </div>
          );
        })}
      </div>
      <button onClick={save} style={{padding:12,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",background:saved?"#4ade8022":"linear-gradient(135deg,#c9a84c22,#c9a84c40)",border:saved?"1px solid #4ade8055":"1px solid #c9a84c55",color:saved?"#4ade80":"#c9a84c",transition:"all .3s"}}>{saved?"Sauvegarde !":"Sauvegarder"}</button>
    </div>
  );
}

// ── CORRECTOR ──────────────────────────────────────────────────────────────────
function CorrectorView({sessionId}){
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const u=dbListen(`sessions/${sessionId}`,d=>{setSession(d);setLoading(false);});return u;},[sessionId]);
  const updateErrors=async ve=>await dbSet(`sessions/${sessionId}/verseErrors`,ve);
  if(loading) return <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#c9a84c",fontSize:18}}>ثبات...</div></div>;
  if(!session) return <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#666"}}>Session introuvable</div></div>;
  const item=SURAHS.find(i=>i.n===Number(session.itemKey));
  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#ddd",fontFamily:"'DM Sans',sans-serif",padding:"18px 14px 40px",maxWidth:500,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontFamily:"'Scheherazade New',serif",fontSize:22,color:"#c9a84c"}}>وضع المصحح</div>
          <div style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Mode Correcteur</div>
        </div>
        <div style={{background:"#111",border:"1px solid #c9a84c33",borderRadius:11,padding:13,marginBottom:12}}>
          <div style={{fontSize:15,color:"#ddd",fontWeight:600}}>{session.itemName}</div>
          <div style={{fontSize:10,color:"#555"}}>{session.date}</div>
        </div>
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:11,padding:13,marginBottom:12}}>
          <VerseErrorPicker totalVerses={item?.v||10} verseErrors={session.verseErrors||{}} onChange={updateErrors}/>
        </div>
        <div style={{background:"#0d3320",border:"1px solid #4ade8033",borderRadius:9,padding:11,fontSize:11,color:"#4ade80",textAlign:"center"}}>Synchronisation en temps reel</div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App(){
  const [state,setState]=useState(null);
  const [section,setSection]=useState("hifz");
  const [subTab,setSubTab]=useState("dashboard");
  const [globalTab,setGlobalTab]=useState("main");
  const [loading,setLoading]=useState(true);
  const [darkMode,setDarkMode]=useState(true);
  const [showPdf,setShowPdf]=useState(false);
  const [pdfPage,setPdfPage]=useState(1);
  // PDF URL — replace with your actual hosted URL
  const PDF_URL="/Quran_Ver__001.pdf";

  const correctorId=new URLSearchParams(window.location.search).get("corrector");
  if(correctorId) return <CorrectorView sessionId={correctorId}/>;

  useEffect(()=>{
    const u=dbListen(`users/${UID}`,d=>{
      setState(d||{surahProgress:{},murajaSessions:[],wird:{},streak:{count:0,lastDate:""},reminders:{},profile:{},wirdUseHijri:false,khatma:null,memGoal:null});
      setLoading(false);
    });
    return u;
  },[]);

  const persist=async ns=>{setState(ns);await dbSet(`users/${UID}`,ns);};

  const onSaveHifz=async(surahKey,session,surahData,goal)=>{
    const pm=state.surahProgress||{};
    const newStreak=updateStreak(state.streak||{});
    const ns={...state,streak:newStreak,surahProgress:{...pm,[surahKey]:{...(pm[surahKey]||{}),...surahData}}};
    if(goal) ns.memGoal=goal;
    await persist(ns);
  };
  const onSaveMuraja=async session=>{
    await persist({...state,streak:updateStreak(state.streak||{}),murajaSessions:[session,...(state.murajaSessions||[])]});
  };
  const onSaveWird=async(session,hasKhatma)=>{
    const mk=getMonthKey(state.wirdUseHijri||false);
    const wird=state.wird||{};
    const md=wird[mk]||{goal:1,sessions:[]};
    const ns={...state,streak:updateStreak(state.streak||{}),wird:{...wird,[mk]:{...md,sessions:[session,...(md.sessions||[])]}}};
    if(hasKhatma&&state.khatma) ns.khatma={...state.khatma,sessions:[session,...(state.khatma.sessions||[])]};
    await persist(ns);
  };
  const openPdfAt=page=>{setPdfPage(page);setShowPdf(true);};

  if(loading) return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={{fontFamily:"'Scheherazade New',serif",fontSize:40,color:"#c9a84c"}}>ثبات</div>
      <div style={{fontSize:11,color:"#333",letterSpacing:3,textTransform:"uppercase"}}>Chargement...</div>
    </div>
  );

  const sec=SECTIONS[section];
  const streak=state.streak||{count:0};
  const streakWarning=streak.count>0&&streak.lastDate!==today();
  const bg=darkMode?"#0a0a0a":"#f5f0e8";

  const subTabsHifz=[{id:"dashboard",label:"Dashboard"},{id:"list",label:"Sourates"},{id:"session",label:"+ Seance"}];
  const subTabsMuraja=[{id:"dashboard",label:"Dashboard"},{id:"list",label:"Sourates"},{id:"session",label:"+ Revision"}];
  const subTabsWird=[{id:"dashboard",label:"Dashboard"},{id:"list",label:"Sourates"},{id:"session",label:"+ Lecture"}];
  const currentSubTabs=section==="hifz"?subTabsHifz:section==="muraja"?subTabsMuraja:subTabsWird;

  return(
    <div style={{minHeight:"100vh",background:bg,color:darkMode?"#ddd":"#222",fontFamily:"'DM Sans',sans-serif",position:"relative",transition:"background .3s"}}>
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <GeoBg color={sec.color}/>

      {/* PDF Reader */}
      {showPdf&&<WarshReader pdfUrl={PDF_URL} initialPage={pdfPage} onClose={()=>setShowPdf(false)}/>}

      {/* STICKY HEADER — section tabs + subtabs + filters always visible */}
      <div style={{position:"sticky",top:0,zIndex:50,background:darkMode?"#0a0a0aee":"#f5f0e8ee",backdropFilter:"blur(12px)",borderBottom:`1px solid ${darkMode?"#181818":"#e0d8cc"}`}}>
        {/* Top bar */}
        <div style={{padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:19,color:"#c9a84c",lineHeight:1}}>ثبات</div>
            <div style={{fontSize:8,color:"#666",letterSpacing:3,textTransform:"uppercase"}}>Thabaat</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:streakWarning?"#1a0a0a":"#111",border:`1px solid ${streakWarning?"#ef444433":"#c9a84c22"}`,borderRadius:20,padding:"4px 9px"}}>
            <span style={{fontSize:12}}>&#10024;</span>
            <span style={{fontFamily:"monospace",fontWeight:700,color:streakWarning?"#ef4444":"#f59e0b",fontSize:12}}>{streak.count}j</span>
          </div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>openPdfAt(1)} title="Mushaf Warsh" style={{width:28,height:28,borderRadius:7,background:"#c9a84c22",border:"1px solid #c9a84c44",color:"#c9a84c",fontSize:12,cursor:"pointer"}}>&#9632;</button>
            <button onClick={()=>setGlobalTab(globalTab==="stats"?"main":"stats")} style={{width:28,height:28,borderRadius:7,background:globalTab==="stats"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="stats"?"#c9a84c44":"#222"}`,color:globalTab==="stats"?"#c9a84c":"#444",fontSize:11,cursor:"pointer"}}>S</button>
            <button onClick={()=>setGlobalTab(globalTab==="leaderboard"?"main":"leaderboard")} style={{width:28,height:28,borderRadius:7,background:globalTab==="leaderboard"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="leaderboard"?"#c9a84c44":"#222"}`,color:globalTab==="leaderboard"?"#c9a84c":"#444",fontSize:11,cursor:"pointer"}}>C</button>
            <button onClick={()=>setGlobalTab(globalTab==="profile"?"main":"profile")} style={{width:28,height:28,borderRadius:7,background:globalTab==="profile"?"#c9a84c22":"#111",border:`1px solid ${globalTab==="profile"?"#c9a84c44":"#222"}`,color:globalTab==="profile"?"#c9a84c":"#444",fontSize:11,cursor:"pointer"}}>P</button>
          </div>
        </div>

        {/* Section tabs (always visible) */}
        {globalTab==="main"&&(
          <div style={{padding:"0 14px"}}>
            <SectionTabs active={section} onChange={s=>{setSection(s);setSubTab("dashboard");}}/>
            <SubTabs tabs={currentSubTabs} active={subTab} onChange={setSubTab} color={sec.color}/>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{padding:"12px 14px 130px",maxWidth:600,margin:"0 auto",position:"relative",zIndex:1}}>
        {globalTab!=="main"?(
          <>
            <button onClick={()=>setGlobalTab("main")} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:12,padding:0}}>&#8592; Retour</button>
            {globalTab==="stats"&&<StatsView state={state}/>}
            {globalTab==="leaderboard"&&<Leaderboard state={state} persist={persist}/>}
            {globalTab==="profile"&&<ProfileView state={state} persist={persist} darkMode={darkMode} setDarkMode={setDarkMode}/>}
          </>
        ):(
          <>
            {subTab==="session"&&<button onClick={()=>setSubTab("dashboard")} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginBottom:12,padding:0}}>&#8592; Retour</button>}

            {section==="hifz"&&subTab==="dashboard"&&<HifzDashboard state={state} onNewSession={()=>setSubTab("session")}/>}
            {section==="hifz"&&subTab==="list"&&<HifzList state={state} persist={persist} pdfUrl={PDF_URL} onOpenPdf={openPdfAt}/>}
            {section==="hifz"&&subTab==="session"&&<HifzSession state={state} onSave={onSaveHifz} onDone={()=>setSubTab("dashboard")}/>}

            {section==="muraja"&&subTab==="dashboard"&&<MurajaDashboard state={state} onNewSession={()=>setSubTab("session")}/>}
            {section==="muraja"&&subTab==="list"&&<MurajaList state={state} persist={persist}/>}
            {section==="muraja"&&subTab==="session"&&<MurajaSession state={state} onSave={onSaveMuraja} onDone={()=>setSubTab("dashboard")}/>}

            {section==="wird"&&subTab==="dashboard"&&<WirdDashboard state={state} onNewSession={()=>setSubTab("session")} persist={persist}/>}
            {section==="wird"&&subTab==="list"&&<WirdList state={state}/>}
            {section==="wird"&&subTab==="session"&&<WirdSession state={state} onSave={onSaveWird} onDone={()=>setSubTab("dashboard")}/>}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,background:darkMode?"#0d0d0df0":"#f5f0e8f0",backdropFilter:"blur(12px)",borderTop:`1px solid ${darkMode?"#181818":"#e0d8cc"}`,padding:"8px 14px 20px"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",justifyContent:"space-around"}}>
          {Object.values(SECTIONS).map(s=>(
            <button key={s.id} onClick={()=>{setSection(s.id);setSubTab("dashboard");setGlobalTab("main");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",padding:"3px 16px",color:section===s.id&&globalTab==="main"?s.color:darkMode?"#2a2a2a":"#bbb",transition:"color .2s"}}>
              <span style={{fontSize:19}}>{s.icon}</span>
              <span style={{fontSize:8,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{s.label}</span>
              {section===s.id&&globalTab==="main"&&<div style={{width:16,height:2,borderRadius:1,background:s.color,marginTop:1}}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
