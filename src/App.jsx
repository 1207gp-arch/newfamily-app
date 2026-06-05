import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const PASTORS = ["유정", "지혜", "혜빈", "명철", "예훈"];
const WEEKS = ["1주차", "2주차", "3주차", "4주차", "5주차", "등반"];
const ATTEND_STATUS = ["참석", "불참", "미정", "연락X", "등반"];
const INACTIVE_STATUS = "미출석"; // 교회 안나오는 사람

const firebaseConfig = {
  apiKey: "AIzaSyBazdgN0rYlWhIOVyuQaFYaf2Np8Cfe3T0",
  authDomain: "newfamily-app.firebaseapp.com",
  databaseURL: "https://newfamily-app-default-rtdb.firebaseio.com",
  projectId: "newfamily-app",
  storageBucket: "newfamily-app.firebasestorage.app",
  messagingSenderId: "1012257223978",
  appId: "1:1012257223978:web:ed4067e98c0972ce6f1a53",
  measurementId: "G-ZR02J2JXGL"
};
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

function fbSet(path, val) {
  try { set(ref(db, path), val); } catch(e) { console.error(e); }
}

function safeName(n) { return n.replace(/[.#$[\]/\s]/g, "_"); }

function getNextSunday() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + diff);
  const y = sunday.getFullYear();
  const mo = String(sunday.getMonth() + 1).padStart(2, "0");
  const d = String(sunday.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

// Firebase 키에는 . # $ [ ] / 와 공백을 쓸 수 없어서 안전한 형태로 변환
function dateKey(d) {
  return String(d).replace(/[.#$/\[\]\s]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function nextWeekOf(m) {
  const idx = WEEKS.indexOf(m.week);
  return idx < WEEKS.length - 1 ? WEEKS[idx + 1] : "등반";
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState("home");
  const [members, setMembersState] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEventsState] = useState([]);

  const INITIAL_DATA = [{"id": 1780581805099, "name": "안진우", "graduateDate": "2026. 3. 1", "birth": "2000. 5. 17", "phone": "010-5701-9977", "pastor": "유정", "visitDate": "2025. 3. 30", "assignedMokjang": "12목장 (준)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805100, "name": "김대윤", "birth": "2005. 2. 14", "phone": "010-7147-0922", "pastor": "지혜", "visitDate": "2025. 8. 3", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805101, "name": "박원경", "graduateDate": "2026. 4. 19", "birth": "2001. 9. 7", "phone": "010-5637-7471", "pastor": "명철", "visitDate": "2025. 8. 17", "assignedMokjang": "14목장 (혜영)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805102, "name": "장유진", "birth": "1998. 1. 21", "phone": "010-6297-2686", "pastor": "유정", "visitDate": "2025. 11. 16", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805103, "name": "김우혁", "graduateDate": "", "birth": "2003. 11. 16", "phone": "010-5700-0851", "pastor": "지혜", "visitDate": "2025. 11. 16", "assignedMokjang": "", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805104, "name": "송유섭", "graduateDate": "2026. 1. 23", "birth": "1994. 4. 19", "phone": "010-7325-9428", "pastor": "유정", "visitDate": "2025. 11. 30", "assignedMokjang": "12목장 (준)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805105, "name": "허영석", "birth": "1998. 1. 19", "phone": "010-3886-2983", "pastor": "유정", "visitDate": "2025. 11. 30", "assignedMokjang": "", "week": "2주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805106, "name": "황현진", "graduateDate": "2026. 3. 22", "birth": "2001. 6. 30", "phone": "010-4228-3025", "pastor": "지혜", "visitDate": "2025. 12. 14", "assignedMokjang": "8목장 (재원)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805107, "name": "김경원", "birth": "2002. 1. 25", "phone": "010-9369-8627", "pastor": "혜빈", "visitDate": "2025. 12. 28", "assignedMokjang": "", "week": "2주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805108, "name": "이희성", "birth": "1995. 5. 12", "phone": "010-9349-3668", "pastor": "명철", "visitDate": "2025. 12. 28", "assignedMokjang": "", "week": "2주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805109, "name": "전민근", "birth": "2004. 8. 4", "phone": "010-9490-1356", "pastor": "예훈", "visitDate": "2025. 12. 28", "assignedMokjang": "", "week": "1주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805110, "name": "홍설연", "birth": "1998. 11. 28", "phone": "010-2983-8770", "pastor": "지혜", "visitDate": "2025. 12. 28", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805111, "name": "백경하", "graduateDate": "2026. 3. 29", "birth": "1992. 2. 7", "phone": "010-9236-2175", "pastor": "유정", "visitDate": "2026. 1. 4", "assignedMokjang": "1목장 (영곤)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805112, "name": "김재욱", "birth": "2005. 12. 8", "phone": "010-2160-0170", "pastor": "유정", "visitDate": "2026. 1. 4", "assignedMokjang": "", "week": "1주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805113, "name": "이서정", "birth": "2006. 10. 17", "phone": "010-7317-4477", "pastor": "혜빈", "visitDate": "2026. 1. 11", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805114, "name": "김선아", "graduateDate": "2026. 3. 15", "birth": "1994. 9. 17", "phone": "010-4541-3784", "pastor": "명철", "visitDate": "2026. 1. 18", "assignedMokjang": "3목장 (조은)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805115, "name": "이지", "birth": "", "phone": "010-5177-4499", "pastor": "예훈", "visitDate": "2026. 1. 18", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805116, "name": "장주희", "birth": "1995. 3. 6", "phone": "010-9181-1991", "pastor": "지혜", "visitDate": "2026. 1. 18", "assignedMokjang": "", "week": "2주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805117, "name": "이지현", "graduateDate": "2026. 3. 29", "birth": "2000. 1. 26", "phone": "010-3431-9937", "pastor": "혜빈", "visitDate": "2026. 2. 8", "assignedMokjang": "1목장 (영곤)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805118, "name": "김현지", "graduateDate": "2026. 3. 22", "birth": "1997. 3. 12", "phone": "010-9793-2246", "pastor": "지혜", "visitDate": "2026. 2. 15", "assignedMokjang": "4목장 (승미)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805119, "name": "채솔비", "graduateDate": "2026. 4. 26", "birth": "2007. 8. 13", "phone": "010-3355-0691", "pastor": "예훈", "visitDate": "2026. 3. 1", "assignedMokjang": "16목장 (아영)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805120, "name": "권순목", "birth": "1996. 10. 31", "phone": "010-7335-0569", "pastor": "유정", "visitDate": "2026. 3. 15", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": [], "graduateDate": "2026. 4. 19"}, {"id": 1780581805121, "name": "이가영", "birth": "1991. 10. 12", "phone": "010-2918-1226", "pastor": "혜빈", "visitDate": "2026. 3. 22", "assignedMokjang": "", "week": "4주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805122, "name": "성현모", "graduateDate": "2026. 4. 26", "birth": "1988. 4. 2", "phone": "010-9146-5799", "pastor": "예훈", "visitDate": "2026. 3. 22", "assignedMokjang": "2목장 (수열)", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805123, "name": "반승현", "graduateDate": "2026. 5. 17", "birth": "1999. 2. 14", "phone": "010-3387-0062", "pastor": "지혜", "visitDate": "2026. 3. 29", "assignedMokjang": "", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805124, "name": "김성일", "graduateDate": "2026. 5. 17", "birth": "2006. 6. 4", "phone": "010-7563-2278", "pastor": "명철", "visitDate": "2026. 4. 5", "assignedMokjang": "", "week": "등반", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805125, "name": "김주성", "birth": "2004. 12. 13", "phone": "010-3375-7341", "pastor": "혜빈", "visitDate": "2026. 4. 12", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805126, "name": "류지민", "birth": "2004. 6. 15", "phone": "010-9238-8361", "pastor": "예훈", "visitDate": "2026. 4. 19", "assignedMokjang": "", "week": "3주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}, {"id": 1780581805127, "name": "곽상혁", "birth": "1999. 4. 27", "phone": "010-8107-8365", "pastor": "명철", "visitDate": "2026. 5. 10", "assignedMokjang": "", "week": "1주차", "gender": "", "mbti": "", "address": "", "baptism": "", "faithStatus": "", "currentLife": "", "ministry": [], "hobby": "", "todayFeel": "", "need": "", "prayer": "", "community": [], "hope": "", "visitReason": "", "referral": "", "findRoute": "", "photo": "", "inactive": false, "attendHistory": {}, "comments": []}];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMembersState(prev => prev.length > 0 ? prev : INITIAL_DATA);
      setReady(true);
    }, 2000);

    onValue(ref(db, "nf_members"), snap => {
      try {
        const val = snap.val();
        if (val) {
          const list = Object.values(val);
          const existingNames = new Set(list.map(x => x.name));
          const toAdd = INITIAL_DATA.filter(x => !existingNames.has(x.name));
          if (toAdd.length > 0) {
            toAdd.forEach(m => fbSet("nf_members/" + safeName(m.name), m));
          }
          setMembersState(list);
        } else {
          INITIAL_DATA.forEach(m => fbSet("nf_members/" + safeName(m.name), m));
          setMembersState(INITIAL_DATA);
        }
      } catch(e) { console.error(e); }
      clearTimeout(timer);
      setReady(true);
    });

    onValue(ref(db, "nf_events"), snap => {
      try {
        const val = snap.val();
        if (val) setEventsState(Object.values(val));
        else setEventsState([]);
      } catch(e) {}
    });

    return () => clearTimeout(timer);
  }, []);

  const saveMembers = (next) => {
    setMembersState(next);
    next.forEach(m => fbSet("nf_members/" + safeName(m.name), m));
  };
  const saveEvents = (next) => {
    setEventsState(next);
    const obj = {};
    next.forEach(e => { obj[e.id] = e; });
    fbSet("nf_events", Object.keys(obj).length ? obj : null);
  };
  const addMember = (data) => {
    saveMembers([...members, { id: Date.now(), ...data, week: "1주차", attendHistory: {}, comments: [] }]);
    setPage("home");
  };
  const updateMember = (id, fn) => saveMembers(members.map(m => m.id === id ? fn(m) : m));
  const deleteMember = (id) => { saveMembers(members.filter(m => m.id !== id)); setPage("home"); };
  const getMember = () => members.find(m => m.id === selected);

  if (!ready) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#fff", fontFamily:"'Apple SD Gothic Neo',sans-serif" }}>
      <div style={{ fontSize:32, marginBottom:8, color:"#333" }}>✝</div>
      <p style={{ color:"#aaa", fontSize:13, letterSpacing:1 }}>불러오는 중...</p>
    </div>
  );

  return (
    <div style={S.app}>
      <div style={S.container}>
        {page === "home"     && <HomePage members={members} setPage={setPage} setSelected={setSelected} events={events} />}
        {page === "register" && <RegisterPage onSubmit={addMember} onBack={() => setPage("home")} />}
        {page === "detail"   && getMember() && <DetailPage member={getMember()} updateMember={updateMember} deleteMember={deleteMember} onBack={() => setPage("home")} />}
        {page === "attend"   && <AttendPage members={members} saveMembers={saveMembers} onBack={() => setPage("home")} />}
        {page === "calendar"  && <CalendarPage events={events} saveEvents={saveEvents} onBack={() => setPage("home")} setPage={setPage} />}
        {page === "meeting"   && <MeetingPage events={events} saveEvents={saveEvents} onBack={() => setPage("calendar")} />}
        {page === "donkey"    && <DonkeyPage onBack={() => setPage("home")} />}
      </div>
    </div>
  );
}

function HomePage({ members, setPage, setSelected, events }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const todayEvents = (events||[]).filter(e => e.startDate <= todayStr && (e.endDate||e.startDate) >= todayStr);
  const tomorrowEvents = (events||[]).filter(e => e.startDate <= tomorrowStr && (e.endDate||e.startDate) >= tomorrowStr && !todayEvents.find(x=>x.id===e.id));
  const [mainTab, setMainTab] = useState("active");
  const [filterPastor, setFilterPastor] = useState("전체");
  const [filterWeek, setFilterWeek] = useState("전체");
  const [search, setSearch] = useState("");

  const active = members.filter(m => m.week !== "등반" && !m.inactive);
  const graduated = members.filter(m => m.week === "등반");

  const applyFilter = (list) => list.filter(m => {
    const p = filterPastor === "전체" || m.pastor === filterPastor;
    const w = filterWeek === "전체" || m.week === filterWeek;
    return p && w && m.name.includes(search);
  });

  const inactive = members.filter(m => m.inactive);
  const activeFiltered = active.filter(m => !m.inactive);
  const list = applyFilter(mainTab === "active" ? activeFiltered : mainTab === "graduated" ? graduated : inactive);

  return (
    <div style={S.page}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 0 16px" }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:-1, margin:0, color:"#111" }}>새가족목장</h1>
          <p style={{ fontSize:12, color:"#aaa", margin:"2px 0 0" }}>주안감리교회 참청년부 · 2026</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.iconBtn} onClick={() => setPage("donkey")}>🫏</button>
          <button style={S.iconBtn} onClick={() => setPage("calendar")}>📅</button>
          <button style={S.iconBtn} onClick={() => setPage("attend")}>📋</button>
          <button style={S.btnAdd} onClick={() => setPage("register")}>+ 등록</button>
        </div>
      </div>

      {/* 전체 통계 */}
      <div style={{ display:"flex", gap:8, marginBottom:14, padding:"12px 16px", background:"#f8f8f8", borderRadius:12 }}>
        <div style={{ flex:1, textAlign:"center" }}>
          <b style={{ fontSize:22, color:"#111", display:"block" }}>{members.length}</b>
          <span style={{ fontSize:11, color:"#888" }}>전체</span>
        </div>
        <div style={{ width:1, background:"#e8e8e8" }} />
        <div style={{ flex:1, textAlign:"center" }}>
          <b style={{ fontSize:22, color:"#4a7c59", display:"block" }}>{graduated.length}</b>
          <span style={{ fontSize:11, color:"#888" }}>등반 완료</span>
        </div>
        <div style={{ width:1, background:"#e8e8e8" }} />
        <div style={{ flex:1, textAlign:"center" }}>
          <b style={{ fontSize:22, color:"#111", display:"block" }}>{active.filter(m=>!m.inactive).length}</b>
          <span style={{ fontSize:11, color:"#888" }}>미등반</span>
        </div>
        <div style={{ width:1, background:"#e8e8e8" }} />
        <div style={{ flex:1, textAlign:"center" }}>
          <b style={{ fontSize:22, color:"#9ca3af", display:"block" }}>{members.filter(m=>m.inactive).length}</b>
          <span style={{ fontSize:11, color:"#888" }}>미출석</span>
        </div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        <button style={{ flex:1, padding:"10px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:-0.3, background:mainTab==="active"?"#111":"#f0f0f0", color:mainTab==="active"?"#fff":"#888" }}
          onClick={() => { setMainTab("active"); setFilterWeek("전체"); }}>
          미등반 {active.filter(m=>!m.inactive).length}명
        </button>
        <button style={{ flex:1, padding:"10px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:-0.3, background:mainTab==="graduated"?"#4a7c59":"#f0f0f0", color:mainTab==="graduated"?"#fff":"#888" }}
          onClick={() => { setMainTab("graduated"); setFilterWeek("전체"); }}>
          등반 완료 {graduated.length}명
        </button>
        <button style={{ flex:1, padding:"10px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:-0.3, background:mainTab==="inactive"?"#9ca3af":"#f0f0f0", color:mainTab==="inactive"?"#fff":"#888" }}
          onClick={() => { setMainTab("inactive"); setFilterWeek("전체"); }}>
          미출석 {members.filter(m=>m.inactive).length}명
        </button>
      </div>

      {mainTab === "active" && (
        <div style={{ display:"flex", gap:5, marginBottom:14 }}>
          {[["전체", active.length], ...WEEKS.filter(w => w !== "등반").map(w => [w, active.filter(m => m.week === w).length])].map(([label, count]) => (
            <div key={label} style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center", background: filterWeek===label?"#f0faf4":"#f8f8f8", borderRadius:10, padding:"8px 2px", cursor:"pointer", border: filterWeek===label?"1.5px solid #4a7c59":"1.5px solid transparent" }}
              onClick={() => setFilterWeek(filterWeek === label ? "전체" : label)}>
              <b style={{ fontSize:17 }}>{count}</b>
              <span style={{ fontSize:10.5, color:"#888", marginTop:2, whiteSpace:"nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom:12 }}>
        <input style={S.searchInput} placeholder="이름 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
          {["전체", ...PASTORS].map(p => (
            <button key={p} style={{ padding:"5px 12px", borderRadius:20, border: filterPastor===p?"1.5px solid #4a7c59":"1.5px solid #e8e8e8", background: filterPastor===p?"#f0faf4":"#f8f8f8", fontSize:12, cursor:"pointer", color: filterPastor===p?"#4a7c59":"#666", fontWeight: filterPastor===p?600:400, letterSpacing:-0.3 }}
              onClick={() => setFilterPastor(p)}>{p}</button>
          ))}
        </div>
      </div>

      {list.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <p style={{ color:"#bbb", fontSize:14 }}>{mainTab === "active" ? "등록된 새가족이 없어요" : mainTab === "graduated" ? "등반 완료한 새가족이 없어요" : "미출석 새가족이 없어요"}</p>
          {mainTab === "active" && <button style={{ ...S.btnAdd, marginTop:12 }} onClick={() => setPage("register")}>첫 번째 새가족 등록하기</button>}
        </div>
      )}

      {list.map(m => (
        <div key={m.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 4px", borderBottom:"1px solid #f5f5f5", cursor:"pointer" }}
          onClick={() => { setSelected(m.id); setPage("detail"); }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {m.photo
              ? <img src={m.photo} alt={m.name} style={{ width:40, height:40, borderRadius:20, objectFit:"cover", border:"1.5px solid #e8e8e8", flexShrink:0 }} />
              : <div style={{ width:40, height:40, borderRadius:20, background: PASTOR_COLOR[m.pastor]||"#e0e0e0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#444", flexShrink:0 }}>{m.name[0]}</div>
            }
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <b style={{ fontSize:15, letterSpacing:-0.3 }}>{m.name}</b>
                {m.inactive && <span style={{ fontSize:11, background:"#f3f4f6", color:"#9ca3af", padding:"2px 7px", borderRadius:10 }}>미출석</span>}
                {m.gender && <span style={S.badge}>{m.gender}</span>}
                {m.mbti && <span style={S.badge}>{m.mbti}</span>}
              </div>
              <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600, color: m.week==="등반"?"#fff":"#444", background: WEEK_COLOR[m.week]||"#f0f0f0" }}>{m.week}</span>
                {(m.week === "등반" || m.week === "5주차") && m.assignedMokjang
                  ? <span style={{ fontSize:12, color:"#2e7d32", fontWeight:600 }}>🏠 {m.assignedMokjang} 목장</span>
                  : m.pastor && <span style={{ fontSize:12, color:"#888" }}>담당 {m.pastor}</span>
                }
                {m.week === "등반"
                  ? m.graduateDate && <span style={{ fontSize:12, color:"#aaa" }}>등반 {m.graduateDate}</span>
                  : m.phone && <span style={{ fontSize:12, color:"#bbb" }}>{m.phone}</span>
                }
              </div>
            </div>
          </div>
          <span style={{ fontSize:18, color:"#ccc" }}>›</span>
        </div>
      ))}
    </div>
  );
}

function RegisterPage({ onSubmit, onBack }) {
  const [step, setStep] = useState("scan");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    name:"", mbti:"", phone:"", birth:"", gender:"남", address:"",
    baptism:"안받음", pastor:"", photo:"",
    currentLife:"", faithStatus:"처음이에요",
    ministry:[], hobby:"", todayFeel:"", need:"", prayer:"",
    community:[], hope:"", visitDate:new Date().toLocaleDateString("ko-KR"),
    visitReason:"", referral:"", findRoute:"",
  });

  const fileRef = React.useRef();
  const photoRef = React.useRef();
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleArr = (k, v) => setForm(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v] }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set("photo", ev.target.result); r.readAsDataURL(file);
  };

  const handleScan = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setPreview(ev.target.result);
      setScanning(true);
      setScanError("");
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
              { type: "text", text: "이 새가족 만남카드에서 정보를 추출해 JSON만 응답해. {\"name\":\"이름\",\"mbti\":\"MBTI\",\"phone\":\"전화번호\",\"birth\":\"생년월일\",\"gender\":\"남또는여\",\"address\":\"주소\",\"baptism\":\"받음또는안받음\",\"faithStatus\":\"처음이에요또는예전에다녔어요\",\"currentLife\":\"학생또는취업준비중또는직장인또는잠시쉬는중\",\"hobby\":\"취미\",\"todayFeel\":\"느낀점\",\"prayer\":\"기도제목\",\"visitReason\":\"방문이유\",\"referral\":\"추천인\",\"need\":\"위로또는친구또는신앙성장또는방향또는쉼\"} 없는항목은빈문자열." }
            ]}]
          })
        });
        const data = await res.json();
        const text = data.content?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setForm(prev => ({ ...prev, ...parsed }));
        setStep("form");
      } catch (err) {
        console.error(err);
        setScanError("인식에 실패했어요. 다시 시도하거나 직접 입력해주세요.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (step === "scan") return (
    <div style={S.page}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleScan} />
      <div style={S.topBar}>
        <button style={S.back} onClick={onBack}>← 목록</button>
        <span style={S.topName}>새가족 등록</span>
        <span />
      </div>
      <div style={{ padding:"20px 0", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
        <h2 style={{ fontSize:18, fontWeight:700, letterSpacing:-0.5, margin:"0 0 6px" }}>만남카드 스캔</h2>
        <p style={{ fontSize:13, color:"#888", margin:"0 0 32px", lineHeight:1.6 }}>만남카드 사진을 올리면<br/>AI가 자동으로 내용을 입력해드려요</p>
        {!scanning && !scanError && (
          <div>
            <button style={{ width:"100%", padding:"20px", border:"2px dashed #e0e0e0", borderRadius:16, background:"#fafafa", color:"#555", fontSize:15, cursor:"pointer", marginBottom:12 }}
              onClick={() => fileRef.current.click()}>📁 앨범에서 사진 선택</button>
            <button style={{ width:"100%", padding:"14px", background:"#111", color:"#fff", border:"none", borderRadius:12, fontSize:14, cursor:"pointer" }}
              onClick={() => setStep("form")}>직접 입력하기</button>
          </div>
        )}
        {scanning && (
          <div>
            {preview && <img src={preview} alt="카드" style={{ width:"100%", borderRadius:12, marginBottom:16, maxHeight:300, objectFit:"cover", opacity:0.6 }} />}
            <div style={{ background:"#f8f8f8", borderRadius:12, padding:"24px" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
              <p style={{ fontSize:14, color:"#555", fontWeight:600, margin:"0 0 4px" }}>카드 내용 인식 중...</p>
              <p style={{ fontSize:12, color:"#aaa", margin:0 }}>잠시만 기다려주세요</p>
            </div>
          </div>
        )}
        {scanError && !scanning && (
          <div>
            {preview && <img src={preview} alt="카드" style={{ width:"100%", borderRadius:12, marginBottom:12, maxHeight:200, objectFit:"cover" }} />}
            <div style={{ background:"#fdecea", border:"1px solid #fca5a5", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
              <p style={{ margin:"0 0 4px", fontSize:14, color:"#c62828", fontWeight:600 }}>😢 인식 실패</p>
              <p style={{ margin:0, fontSize:12, color:"#e57373" }}>{scanError}</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ flex:1, padding:"12px", border:"1.5px solid #e0e0e0", borderRadius:12, background:"#f8f8f8", color:"#555", fontSize:13, cursor:"pointer" }}
                onClick={() => { setScanError(""); fileRef.current.click(); }}>다시 시도</button>
              <button style={{ flex:1, padding:"12px", background:"#111", color:"#fff", border:"none", borderRadius:12, fontSize:13, cursor:"pointer" }}
                onClick={() => { setScanError(""); setStep("form"); }}>직접 입력</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleScan} />
      <div style={S.topBar}>
        <button style={S.back} onClick={() => setStep("scan")}>← 스캔</button>
        <span style={S.topName}>정보 확인 · 수정</span>
        <button style={{ background:"none", border:"none", color:"#888", fontSize:12, cursor:"pointer" }} onClick={() => fileRef.current.click()}>재스캔</button>
      </div>
      {preview && <img src={preview} alt="카드" style={{ width:"100%", borderRadius:10, maxHeight:120, objectFit:"cover", opacity:0.7, marginBottom:12 }} />}

      <Section title="기본 정보">
        <Label>새가족 사진</Label>
        <input ref={photoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhotoUpload} />
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          {form.photo
            ? <div style={{ position:"relative" }}>
                <img src={form.photo} alt="프로필" style={{ width:72, height:72, borderRadius:36, objectFit:"cover" }} />
                <button style={{ position:"absolute", top:-4, right:-4, width:20, height:20, borderRadius:10, background:"#111", color:"#fff", border:"none", fontSize:11, cursor:"pointer" }} onClick={() => set("photo", "")}>×</button>
              </div>
            : <div style={{ width:72, height:72, borderRadius:36, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"#ccc", cursor:"pointer" }} onClick={() => photoRef.current.click()}>👤</div>
          }
          <button style={{ padding:"8px 16px", border:"1.5px solid #e8e8e8", borderRadius:10, background:"#f8f8f8", color:"#666", fontSize:13, cursor:"pointer" }} onClick={() => photoRef.current.click()}>
            {form.photo ? "사진 변경" : "사진 추가"}
          </button>
        </div>
        <Label>이름 *</Label>
        <input style={S.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="홍길동" />
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ flex:1 }}>
            <Label>MBTI</Label>
            <input style={S.input} value={form.mbti} onChange={e => set("mbti", e.target.value.toUpperCase())} placeholder="ISFJ" />
          </div>
          <div style={{ flex:1 }}>
            <Label>성별</Label>
            <div style={{ display:"flex", gap:6 }}>
              {["남","여"].map(g => <button key={g} style={{ ...S.toggleBtn, ...(form.gender===g ? S.toggleBtnOn : {}) }} onClick={() => set("gender", g)}>{g}</button>)}
            </div>
          </div>
        </div>
        <Label>연락처</Label>
        <input style={S.input} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" />
        <Label>생년월일</Label>
        <input style={S.input} value={form.birth} onChange={e => set("birth", e.target.value)} placeholder="1996.09.08" />
        <Label>주소</Label>
        <input style={S.input} value={form.address} onChange={e => set("address", e.target.value)} placeholder="인천시..." />
        <Label>세례</Label>
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {["받음","안받음"].map(b => <button key={b} style={{ ...S.toggleBtn, ...(form.baptism===b ? S.toggleBtnOn : {}) }} onClick={() => set("baptism", b)}>{b}</button>)}
        </div>
        <Label>담당 목자</Label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {PASTORS.map(p => <button key={p} style={{ ...S.toggleBtn, ...(form.pastor===p ? S.toggleBtnOn : {}) }} onClick={() => set("pastor", p)}>{p}</button>)}
        </div>
      </Section>

      <Section title="방문 정보">
        <Label>방문일</Label>
        <input style={S.input} value={form.visitDate} onChange={e => set("visitDate", e.target.value)} />
        <Label>방문 이유</Label>
        <input style={S.input} value={form.visitReason} onChange={e => set("visitReason", e.target.value)} placeholder="지인 소개, 검색 등" />
        <Label>추천인</Label>
        <input style={S.input} value={form.referral} onChange={e => set("referral", e.target.value)} placeholder="추천해준 분 이름" />
        <Label>찾은 경로</Label>
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {["검색","지인소개","기타"].map(r => <button key={r} style={{ ...S.toggleBtn, ...(form.findRoute===r ? S.toggleBtnOn : {}) }} onClick={() => set("findRoute", r)}>{r}</button>)}
        </div>
      </Section>

      <Section title="신앙 현황">
        <Label>현재 신앙 상태</Label>
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {["처음이에요","예전에 다녔어요"].map(f => <button key={f} style={{ ...S.toggleBtn, ...(form.faithStatus===f ? S.toggleBtnOn : {}) }} onClick={() => set("faithStatus", f)}>{f}</button>)}
        </div>
        <Label>현재 생활</Label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {["학생","취업준비 중","직장인","잠시 쉬는 중"].map(l => <button key={l} style={{ ...S.toggleBtn, ...(form.currentLife===l ? S.toggleBtnOn : {}) }} onClick={() => set("currentLife", l)}>{l}</button>)}
        </div>
        <Label>섬겨본 경험 (복수 선택)</Label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {["찬양팀","셀그룹","소그룹 리더","선교 사역","교회학교 교사","기타"].map(v => <button key={v} style={{ ...S.toggleBtn, ...(form.ministry.includes(v) ? S.toggleBtnOn : {}) }} onClick={() => toggleArr("ministry", v)}>{v}</button>)}
        </div>
      </Section>

      <Section title="나눔">
        <Label>관심사 / 취미</Label>
        <input style={S.input} value={form.hobby} onChange={e => set("hobby", e.target.value)} placeholder="독서, 운동..." />
        <Label>오늘 예배와 공동체를 경험하며 느낀 점</Label>
        <textarea style={S.textarea} value={form.todayFeel} onChange={e => set("todayFeel", e.target.value)} rows={2} placeholder="자유롭게 적어주세요" />
        <Label>지금 가장 필요한 것</Label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {["위로","친구","신앙성장","방향","쉼"].map(n => <button key={n} style={{ ...S.toggleBtn, ...(form.need===n ? S.toggleBtnOn : {}) }} onClick={() => set("need", n)}>{n}</button>)}
        </div>
        <Label>기도제목</Label>
        <textarea style={S.textarea} value={form.prayer} onChange={e => set("prayer", e.target.value)} rows={2} placeholder="함께 나누고 싶은 기도제목" />
        <Label>함께하고 싶은 공동체 분위기 (복수 선택)</Label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {["진지한 나눔","신앙중심","성숙한 신앙","유쾌하고 즐거운 모임","비슷한 또래"].map(c => <button key={c} style={{ ...S.toggleBtn, ...(form.community.includes(c) ? S.toggleBtnOn : {}) }} onClick={() => toggleArr("community", c)}>{c}</button>)}
        </div>
        <Label>이 공동체에서 기대하는 것</Label>
        <textarea style={S.textarea} value={form.hope} onChange={e => set("hope", e.target.value)} rows={2} placeholder="기대하는 것을 적어주세요" />
      </Section>

      <button style={{ ...S.btnPrimary, marginTop:8 }} onClick={() => { if (!form.name.trim()) { alert("이름을 입력해주세요"); return; } onSubmit(form); }}>
        등록하기
      </button>
    </div>
  );
}

function DetailPage({ member, updateMember, deleteMember, onBack }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...member });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newComment, setNewComment] = useState({ author:"", week:"", text:"" });
  const [mokjangInput, setMokjangInput] = useState("");

  useEffect(() => { setForm({ ...member }); }, [member.id]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const save = () => { updateMember(member.id, () => form); setEditing(false); };

  const addComment = () => {
    if (!newComment.text.trim()) return;
    const comment = { id: Date.now(), ...newComment, date: new Date().toLocaleDateString("ko-KR") };
    updateMember(member.id, m => ({ ...m, comments: [...(m.comments||[]), comment] }));
    setNewComment(prev => ({ ...prev, text:"" }));
  };

  const deleteComment = (cid) => {
    updateMember(member.id, m => ({ ...m, comments: (m.comments||[]).filter(c => c.id !== cid) }));
  };

  const rows = [
    ["연락처", member.phone], ["생년월일", member.birth], ["주소", member.address],
    ["MBTI", member.mbti], ["세례", member.baptism], ["신앙상태", member.faithStatus],
    ["현재 생활", member.currentLife], ["섬김 경험", (member.ministry||[]).join(", ")],
    ["관심사/취미", member.hobby], ["가장 필요한 것", member.need],
    ["기도제목", member.prayer], ["방문일", member.visitDate],
    ["방문 이유", member.visitReason], ["추천인", member.referral],
    ["찾은 경로", member.findRoute], ["오늘 느낀 점", member.todayFeel],
    ["원하는 공동체", (member.community||[]).join(", ")], ["기대하는 것", member.hope],
  ].filter(([, v]) => v);

  return (
    <div style={S.page}>
      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"24px 20px", width:"85%", maxWidth:320 }}>
            <p style={{ fontWeight:700, fontSize:16, marginBottom:8, textAlign:"center" }}>정말 삭제할까요?</p>
            <p style={{ fontSize:14, color:"#666", marginBottom:20, textAlign:"center" }}><b>{member.name}</b> 님의 모든 정보가 사라져요</p>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ flex:1, padding:"12px", background:"#c62828", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer" }} onClick={() => deleteMember(member.id)}>삭제</button>
              <button style={{ flex:1, padding:"12px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:12, fontSize:15, cursor:"pointer" }} onClick={() => setConfirmDelete(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      <div style={S.topBar}>
        <button style={S.back} onClick={onBack}>← 목록</button>
        <span style={S.topName}>{member.name}</span>
        <button style={{ background:"none", border:"none", color:"#4a7c59", fontSize:13, cursor:"pointer" }} onClick={() => setEditing(!editing)}>
          {editing ? "취소" : "수정"}
        </button>
      </div>

      <div style={{ textAlign:"center", padding:"20px 0 16px" }}>
        {member.photo
          ? <img src={member.photo} alt={member.name} style={{ width:88, height:88, borderRadius:44, objectFit:"cover", border:"2px solid #e8e8e8", margin:"0 auto 10px", display:"block" }} />
          : <div style={{ width:64, height:64, borderRadius:32, background: PASTOR_COLOR[member.pastor]||"#e0e0e0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:700, color:"#444", margin:"0 auto 10px" }}>{member.name[0]}</div>
        }
        <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:-0.5, margin:"0 0 2px" }}>{member.name}</h2>
        {member.birth && <p style={{ fontSize:13, color:"#888", margin:"0 0 8px" }}>{member.birth}</p>}
        <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          {member.mbti && <span style={S.badge}>{member.mbti}</span>}
          {member.gender && <span style={S.badge}>{member.gender}</span>}
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600, color: member.week==="등반"?"#fff":"#444", background: WEEK_COLOR[member.week]||"#f0f0f0" }}>{member.week}</span>
          {member.pastor && <span style={S.badge}>담당 {member.pastor}</span>}
          {(member.week === "등반" || member.week === "5주차") && member.assignedMokjang && (
            <span style={{ fontSize:12, background:"#e8f5e9", color:"#2e7d32", padding:"3px 10px", borderRadius:10, fontWeight:700 }}>🏠 {member.assignedMokjang} 목장</span>
          )}
        </div>
      </div>

      {!editing && (
        <div style={S.card}>
          <p style={S.cardLabel}>📅 교육 진행 현황</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:4 }}>
            {WEEKS.map(w => (
              <button key={w} style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:600, border:"none", cursor:"pointer", outline: member.week===w?"2px solid #4a7c59":"none", outlineOffset:2, background: WEEKS.indexOf(w) <= WEEKS.indexOf(member.week) ? "#4a7c59" : "#e8e8e8", color: WEEKS.indexOf(w) <= WEEKS.indexOf(member.week) ? "#fff" : "#aaa" }}
                onClick={() => updateMember(member.id, m => ({ ...m, week: w }))}>
                {w}
              </button>
            ))}
          </div>
          <p style={{ fontSize:11, color:"#bbb", margin:"6px 0 0" }}>주차를 눌러서 변경할 수 있어요</p>
        </div>
      )}

      {!editing && (
        <div style={{ marginBottom:14 }}>
          <button style={{ padding:"8px 16px", border: member.inactive?"1.5px solid #9ca3af":"1.5px solid #e8e8e8", borderRadius:10, background: member.inactive?"#f3f4f6":"#f8f8f8", color: member.inactive?"#6b7280":"#666", fontSize:13, cursor:"pointer", letterSpacing:-0.3 }}
            onClick={() => updateMember(member.id, m => ({ ...m, inactive: !m.inactive }))}>
            {member.inactive ? "✓ 미출석 처리됨 (취소하기)" : "미출석으로 이동"}
          </button>
          {member.inactive && <p style={{ fontSize:12, color:"#aaa", margin:"6px 0 0" }}>미출석 탭에서 관리되고 있어요</p>}
        </div>
      )}

      {!editing && (member.week === "등반" || member.week === "5주차") && (
        <div style={S.card}>
          <p style={S.cardLabel}>🏠 목장 배정</p>
          {member.assignedMokjang ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <span style={{ fontSize:16, fontWeight:700, color:"#2e7d32", letterSpacing:-0.3 }}>{member.assignedMokjang} 목장</span>
                <p style={{ fontSize:12, color:"#aaa", margin:"2px 0 0" }}>배정 완료</p>
              </div>
              <button style={{ padding:"6px 14px", border:"1.5px solid #e8e8e8", borderRadius:8, background:"#f8f8f8", color:"#666", fontSize:12, cursor:"pointer" }}
                onClick={() => updateMember(member.id, m => ({ ...m, assignedMokjang:"" }))}>변경</button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize:13, color:"#bbb", marginBottom:10 }}>아직 목장이 배정되지 않았어요</p>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{ ...S.input, marginBottom:0, flex:1 }} placeholder="목장 이름 (예: 은혜)" value={mokjangInput} onChange={e => setMokjangInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && mokjangInput.trim()) { updateMember(member.id, m => ({ ...m, assignedMokjang: mokjangInput.trim() })); setMokjangInput(""); }}} />
                <button style={{ padding:"0 16px", background:"#111", color:"#fff", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                  onClick={() => { if (mokjangInput.trim()) { updateMember(member.id, m => ({ ...m, assignedMokjang: mokjangInput.trim() })); setMokjangInput(""); }}}>저장</button>
              </div>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div style={S.card}>
          <p style={S.cardLabel}>정보 수정</p>
          <Label>사진</Label>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            {form.photo ? <img src={form.photo} alt="" style={{ width:56, height:56, borderRadius:28, objectFit:"cover" }} /> : <div style={{ width:56, height:56, borderRadius:28, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>}
            <label style={{ padding:"6px 14px", border:"1.5px solid #e8e8e8", borderRadius:8, fontSize:12, cursor:"pointer", color:"#666" }}>
              사진 변경
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => setForm(f => ({ ...f, photo: ev.target.result })); r.readAsDataURL(file); }} />
            </label>
          </div>
          <Label>담당 목자</Label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {PASTORS.map(p => <button key={p} style={{ ...S.toggleBtn, ...(form.pastor===p ? S.toggleBtnOn : {}) }} onClick={() => set("pastor", p)}>{p}</button>)}
          </div>
          <Label>주차</Label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {WEEKS.map(w => <button key={w} style={{ ...S.toggleBtn, ...(form.week===w ? S.toggleBtnOn : {}) }} onClick={() => set("week", w)}>{w}</button>)}
          </div>
          <Label>연락처</Label><input style={S.input} value={form.phone||""} onChange={e => set("phone", e.target.value)} />
          <Label>등반일</Label><input style={S.input} value={form.graduateDate||""} onChange={e => set("graduateDate", e.target.value)} placeholder="예: 2026. 3. 1" />
          {(form.week === "등반" || form.week === "5주차") && (<>
            <Label>배정 목장</Label>
            <input style={S.input} value={form.assignedMokjang||""} onChange={e => set("assignedMokjang", e.target.value)} placeholder="목장 이름 (예: 은혜)" />
          </>)}
          <Label>생년월일</Label><input style={S.input} value={form.birth||""} onChange={e => set("birth", e.target.value)} />
          <Label>주소</Label><input style={S.input} value={form.address||""} onChange={e => set("address", e.target.value)} />
          <Label>MBTI</Label><input style={S.input} value={form.mbti||""} onChange={e => set("mbti", e.target.value.toUpperCase())} />
          <Label>세례</Label>
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            {["받음","안받음"].map(b => <button key={b} style={{ ...S.toggleBtn, ...(form.baptism===b ? S.toggleBtnOn : {}) }} onClick={() => set("baptism", b)}>{b}</button>)}
          </div>
          <Label>기도제목</Label><textarea style={S.textarea} value={form.prayer||""} onChange={e => set("prayer", e.target.value)} rows={2} />
          <Label>관심사/취미</Label><input style={S.input} value={form.hobby||""} onChange={e => set("hobby", e.target.value)} />
          <button style={S.btnPrimary} onClick={save}>저장</button>
        </div>
      )}

      {!editing && (
        <div style={S.card}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ borderBottom:"1px solid #f5f5f5", padding:"8px 0", display:"flex", gap:12 }}>
              <span style={{ fontSize:12, color:"#aaa", minWidth:90 }}>{label}</span>
              <span style={{ fontSize:13, color:"#333", flex:1, lineHeight:1.6 }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {!editing && (
        <div style={S.card}>
          <p style={S.cardLabel}>💬 주차별 코멘트</p>
          {(member.comments||[]).length === 0 && <p style={{ fontSize:13, color:"#bbb", textAlign:"center", padding:"12px 0" }}>아직 코멘트가 없어요</p>}
          {(member.comments||[]).map(c => (
            <CommentItem key={c.id} c={c}
              onDelete={() => deleteComment(c.id)}
              onEdit={(newText) => updateMember(member.id, m => ({ ...m, comments: (m.comments||[]).map(x => x.id===c.id ? {...x, text:newText} : x) }))}
            />
          ))}
          <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:12, marginTop:4 }}>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              <select style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid #e8e8e8", fontSize:13, color:"#444", background:"#fff", outline:"none" }}
                value={newComment.author} onChange={e => setNewComment(p => ({ ...p, author: e.target.value }))}>
                <option value="">목자 선택</option>
                {PASTORS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid #e8e8e8", fontSize:13, color:"#444", background:"#fff", outline:"none" }}
                value={newComment.week} onChange={e => setNewComment(p => ({ ...p, week: e.target.value }))}>
                <option value="">주차 선택</option>
                {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <textarea style={{ ...S.textarea, marginBottom:0, flex:1, fontSize:13 }} placeholder="코멘트를 입력하세요..." value={newComment.text} onChange={e => setNewComment(p => ({ ...p, text: e.target.value }))} rows={2} />
              <button style={{ padding:"0 16px", background:"#111", color:"#fff", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", alignSelf:"stretch" }} onClick={addComment}>등록</button>
            </div>
          </div>
        </div>
      )}

      {!editing && (
        <button style={{ padding:"8px 16px", background:"#fdecea", color:"#c62828", border:"1px solid #f5c6cb", borderRadius:10, fontSize:13, cursor:"pointer", marginTop:8 }}
          onClick={() => setConfirmDelete(true)}>삭제</button>
      )}
    </div>
  );
}

function AttendPage({ members, saveMembers, onBack }) {
  const [date, setDate] = useState(getNextSunday);
  const active = members.filter(m => m.week !== "등반" && !m.inactive);

  const setStatus = (id, status) => {
    const k = dateKey(date);
    saveMembers(members.map(m => m.id === id ? { ...m, attendHistory: { ...(m.attendHistory||{}), [k]: status } } : m));
  };
  const getStatus = (m) => m.attendHistory?.[dateKey(date)] || "";

  const grouped = ATTEND_STATUS.reduce((acc, s) => { acc[s] = active.filter(m => getStatus(m) === s); return acc; }, {});
  const unset = active.filter(m => !getStatus(m));

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.back} onClick={onBack}>← 목록</button>
        <span style={S.topName}>참석 체크</span>
        <span />
      </div>
      <input style={{ ...S.input, marginBottom:12 }} value={date} onChange={e => setDate(e.target.value)} />

      {/* 참석 현황 요약 */}
      {active.length > 0 && (
        <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
          {[
            ["전체", active.length, "#555"],
            ["참석", grouped["참석"]?.length||0, "#16a34a"],
            ["불참", grouped["불참"]?.length||0, "#dc2626"],
            ["미정", grouped["미정"]?.length||0, "#d97706"],
            ["연락X", grouped["연락X"]?.length||0, "#9ca3af"],
            ["등반", grouped["등반"]?.length||0, "#4a7c59"],
            ["미응답", unset.length, "#bbb"],
          ].map(([label, count, color]) => (
            <div key={label} style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"#f8f8f8", borderRadius:10, padding:"8px 14px", minWidth:52 }}>
              <b style={{ fontSize:18, color, lineHeight:1.2 }}>{count}</b>
              <span style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && <div style={{ textAlign:"center", padding:"60px 0" }}><p style={{ color:"#bbb", fontSize:14 }}>등반 전 새가족이 없어요</p></div>}

      {unset.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:12, color:"#aaa", marginBottom:8, fontWeight:600 }}>미응답 ({unset.length}명)</p>
          {unset.map(m => <AttendRow key={m.id} m={m} status={getStatus(m)} onSet={(s) => setStatus(m.id, s)} />)}
        </div>
      )}
      {ATTEND_STATUS.map(status => grouped[status].length > 0 && (
        <div key={status} style={{ marginBottom:16 }}>
          <p style={{ fontSize:12, fontWeight:600, marginBottom:8, color: STATUS_TEXT[status] }}>{status} ({grouped[status].length}명)</p>
          {grouped[status].map(m => <AttendRow key={m.id} m={m} status={getStatus(m)} onSet={(s) => setStatus(m.id, s)} />)}
        </div>
      ))}
    </div>
  );
}

function CommentItem({ c, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.text);
  return (
    <div style={{ background:"#f8f8f8", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {c.week && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600, color:"#444", background: WEEK_COLOR[c.week]||"#f0f0f0" }}>{c.week}</span>}
          {c.author && <span style={{ fontSize:12, fontWeight:600, color:"#555" }}>{c.author}</span>}
          <span style={{ fontSize:11, color:"#bbb" }}>{c.date}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"none", border:"none", color:"#aaa", fontSize:12, cursor:"pointer" }} onClick={() => setEditing(!editing)}>{editing ? "취소" : "수정"}</button>
          <button style={{ background:"none", border:"none", color:"#ccc", fontSize:12, cursor:"pointer" }} onClick={onDelete}>×</button>
        </div>
      </div>
      {editing ? (
        <div style={{ display:"flex", gap:6 }}>
          <textarea style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid #e8e8e8", fontSize:13, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }}
            value={text} onChange={e => setText(e.target.value)} rows={2} />
          <button style={{ padding:"0 12px", background:"#111", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", alignSelf:"stretch" }}
            onClick={() => { onEdit(text); setEditing(false); }}>저장</button>
        </div>
      ) : (
        <p style={{ margin:0, fontSize:13, color:"#444", lineHeight:1.6 }}>{c.text}</p>
      )}
    </div>
  );
}

function AttendRow({ m, status, onSet }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", marginBottom:6, background:"#fafafa", borderRadius:10, borderLeft:`3px solid ${status ? STATUS_TEXT[status] : "#e0e0e0"}`, gap:8, flexWrap:"wrap" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <b style={{ fontSize:14, letterSpacing:-0.3 }}>{m.name}</b>
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600, background:"#e8f5e9", color:"#2e7d32" }}>{nextWeekOf(m)} 예정</span>
          {m.pastor && <span style={{ fontSize:11, color:"#bbb" }}>{m.pastor}</span>}
        </div>
        <span style={{ fontSize:11, color:"#ccc" }}>현재 {m.week} 완료</span>
      </div>
      <div style={{ display:"flex", gap:4, flexShrink:0 }}>
        {ATTEND_STATUS.map(s => (
          <button key={s} style={{ padding:"4px 8px", border:"1.5px solid #e8e8e8", borderRadius:6, background:"#f8f8f8", color:"#aaa", fontSize:11, cursor:"pointer", whiteSpace:"nowrap", ...(status===s ? STATUS_STYLE[s] : {}) }}
            onClick={() => onSet(status === s ? "" : s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function CalendarPage({ events, saveEvents, onBack, setPage }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const emptyForm = { title:"", memo:"", startDate:"", endDate:"", startTime:"", endTime:"", color:"#4a7c59" };
  const [form, setForm] = useState(emptyForm);
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const DAYS = ["일","월","화","수","목","금","토"];
  const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const getDateStr = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  // 날짜에 걸치는 이벤트 반환
  const getEvents = (d) => {
    const dStr = getDateStr(d);
    return events.filter(e => e.startDate <= dStr && (e.endDate||e.startDate) >= dStr);
  };

  const prevMonth = () => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };

  // 알림 권한 요청
  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  };

  // 알림 스케줄 등록
  const scheduleNotif = (ev) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const start = new Date(ev.startDate + (ev.startTime ? "T" + ev.startTime : "T09:00"));
    const notifTime = new Date(start.getTime() - 24*60*60*1000); // 하루 전
    const now = new Date();
    const delay = notifTime.getTime() - now.getTime();
    if (delay > 0) {
      setTimeout(() => {
        new Notification("📅 내일 일정이 있어요!", {
          body: `${ev.title}${ev.startTime ? " " + ev.startTime : ""}`,
          icon: "/favicon.ico"
        });
      }, delay);
    }
  };

  const saveEvent = () => {
    if (!form.title.trim() || !form.startDate) return;
    const ev = {
      id: editId || Date.now(),
      ...form,
      endDate: form.endDate || form.startDate,
    };
    const next = editId ? events.map(e => e.id===editId ? ev : e) : [...events, ev];
    saveEvents(next);
    scheduleNotif(ev);
    setForm(emptyForm);
    setShowForm(false);
    setEditId(null);
  };

  const deleteEvent = (id) => saveEvents(events.filter(e => e.id!==id));

  const startEdit = (e) => {
    setForm({ title:e.title, startDate:e.startDate, endDate:e.endDate||e.startDate, startTime:e.startTime||"", endTime:e.endTime||"", color:e.color||"#4a7c59" });
    setEditId(e.id);
    setShowForm(true);
  };

  const selectedEvents = selectedDate ? getEvents(selectedDate) : [];

  return (
    <div style={S.page}>
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:480 }}>
            <p style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>{editId?"일정 수정":"일정 추가"}</p>
            <Label>일정 제목 *</Label>
            <input style={S.input} value={form.title} onChange={e=>setF("title",e.target.value)} placeholder="예: 주일예배, 새가족 교육, 당나귀" autoFocus />
            <Label>메모</Label>
            <textarea style={{ ...S.textarea, marginBottom:10, fontSize:13 }} value={form.memo} onChange={e=>setF("memo",e.target.value)} placeholder="장소, 준비물 등 메모" rows={2} />
            <Label>시작일 *</Label>
            <input style={S.input} type="date" value={form.startDate} onChange={e=>setF("startDate",e.target.value)} />
            <Label>종료일 (1박2일 이상일 때)</Label>
            <input style={S.input} type="date" value={form.endDate} onChange={e=>setF("endDate",e.target.value)} />
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1 }}>
                <Label>시작 시간</Label>
                <input style={S.input} type="time" value={form.startTime} onChange={e=>setF("startTime",e.target.value)} />
              </div>
              <div style={{ flex:1 }}>
                <Label>종료 시간</Label>
                <input style={S.input} type="time" value={form.endTime} onChange={e=>setF("endTime",e.target.value)} />
              </div>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button style={{ ...S.btnPrimary, flex:1 }} onClick={saveEvent}>{editId?"수정 완료":"추가"}</button>
              <button style={{ flex:1, padding:"13px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:12, fontSize:15, cursor:"pointer" }}
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>취소</button>
            </div>
          </div>
        </div>
      )}

      <div style={S.topBar}>
        <button style={S.back} onClick={onBack}>← 목록</button>
        <span style={S.topName}>교회 일정</span>
        <button style={{ background:"none", border:"none", fontSize:13, cursor:"pointer", color: notifPerm==="granted"?"#4a7c59":"#aaa" }}
          onClick={requestNotif}>
          {notifPerm==="granted" ? "🔔 알림 ON" : "🔕 알림"}
        </button>
      </div>

      {/* 월 네비게이션 */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", padding:"4px 10px" }} onClick={prevMonth}>‹</button>
        <b style={{ fontSize:17, letterSpacing:-0.5 }}>{year}년 {MONTHS[month]}</b>
        <button style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", padding:"4px 10px" }} onClick={nextMonth}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
        {DAYS.map((d,i) => (
          <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:i===0?"#ef4444":i===6?"#3b82f6":"#aaa", padding:"4px 0" }}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:16 }}>
        {Array(firstDay).fill(null).map((_,i) => <div key={"e"+i} />)}
        {Array(daysInMonth).fill(null).map((_,i) => {
          const d = i+1;
          const dStr = getDateStr(d);
          const dayEvents = getEvents(d);
          const isToday = dStr === todayStr;
          const isSelected = selectedDate === d;
          const dow = (firstDay+i)%7;
          return (
            <div key={d} style={{ minHeight:54, borderRadius:10, padding:"4px 3px", cursor:"pointer", background:isSelected?"#f0faf4":isToday?"#f8f8f8":"transparent", border:isSelected?"1.5px solid #4a7c59":isToday?"1.5px solid #e0e0e0":"1.5px solid transparent" }}
              onClick={() => { setSelectedDate(d); setShowForm(false); }}>
              {KR_HOLIDAYS[dStr] && (
                <div style={{ fontSize:8, color:"#ef4444", textAlign:"center", lineHeight:1, marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{KR_HOLIDAYS[dStr]}</div>
              )}
              <div style={{ textAlign:"center", fontSize:13, fontWeight:isToday?700:400, color: KR_HOLIDAYS[dStr]?"#ef4444":isToday?"#4a7c59":dow===0?"#ef4444":dow===6?"#3b82f6":"#333", marginBottom:2 }}>{d}</div>
              {dayEvents.slice(0,2).map(ev => (
                <div key={ev.id} style={{ background:ev.color||"#4a7c59", borderRadius:3, padding:"1px 4px", fontSize:9, color:"#fff", marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                  {ev.title}
                </div>
              ))}
              {dayEvents.length>2 && <div style={{ fontSize:9, color:"#aaa", textAlign:"center" }}>+{dayEvents.length-2}</div>}
            </div>
          );
        })}
      </div>

      {/* 버튼 행 */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button style={{ ...S.btnPrimary, flex:2 }} onClick={() => {
        const dStr = selectedDate ? getDateStr(selectedDate) : todayStr;
        setForm({...emptyForm, startDate:dStr, endDate:dStr});
        setEditId(null);
        setShowForm(true);
      }}>+ 일정 추가</button>
        <button style={{ flex:1, padding:"13px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" }}
          onClick={() => setPage("meeting")}>약속잡기</button>
      </div>

      {/* 선택된 날 일정 */}
      {selectedDate && selectedEvents.length > 0 && (
        <div style={S.card}>
          <p style={{ ...S.cardLabel, marginBottom:10 }}>{month+1}월 {selectedDate}일</p>
          {selectedEvents.map(ev => (
            <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f5f5f5" }}>
              <div style={{ width:4, minHeight:36, borderRadius:2, background:ev.color||"#4a7c59", flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:14, fontWeight:600, letterSpacing:-0.3 }}>{ev.title}</p>
                <p style={{ margin:0, fontSize:12, color:"#aaa" }}>
                  {ev.startDate}{ev.endDate&&ev.endDate!==ev.startDate?` ~ ${ev.endDate}`:""}
                  {ev.startTime ? ` · ${ev.startTime}${ev.endTime?` ~ ${ev.endTime}`:""}` : ""}
                </p>
                {ev.memo && <p style={{ margin:"2px 0 0", fontSize:12, color:"#888", lineHeight:1.5 }}>{ev.memo}</p>}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ background:"none", border:"none", color:"#aaa", fontSize:12, cursor:"pointer" }} onClick={()=>startEdit(ev)}>수정</button>
                <button style={{ background:"none", border:"none", color:"#ccc", fontSize:12, cursor:"pointer" }} onClick={()=>deleteEvent(ev.id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedDate && selectedEvents.length === 0 && (
        <p style={{ fontSize:13, color:"#bbb", textAlign:"center", padding:"8px 0" }}>선택한 날에 일정이 없어요</p>
      )}
    </div>
  );
}


function DonkeyPage({ onBack }) {
  const [tab, setTab] = useState("first"); // first | second

  const firstHalf = {
    title: "2026 상반기 당나귀",
    date: "2026.06.21(일) 오후 3:30",
    verse: "고린도후서 5:17",
    verseText: "그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다",
    booths: [
      { name:"풍선 붕어 낚시", emoji:"🎣" },
      { name:"공 넣기", emoji:"🎯" },
      { name:"목사님과 한 컷", emoji:"📸" },
      { name:"찬양 챌린지", emoji:"🎤" },
      { name:"파친코 게임", emoji:"🎰" },
    ]
  };

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.back} onClick={onBack}>← 목록</button>
        <span style={S.topName}>🫏 당나귀</span>
        <span />
      </div>

      {/* 탭 */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        <button style={{ flex:1, padding:"10px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:-0.3, background:tab==="first"?"#111":"#f0f0f0", color:tab==="first"?"#fff":"#888" }}
          onClick={() => setTab("first")}>상반기</button>
        <button style={{ flex:1, padding:"10px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:-0.3, background:tab==="second"?"#111":"#f0f0f0", color:tab==="second"?"#fff":"#888" }}
          onClick={() => setTab("second")}>하반기</button>
      </div>

      {tab === "first" && (
        <div>
          {/* 헤더 카드 */}
          <div style={{ background:"linear-gradient(135deg,#f0faf4,#e8f5e9)", border:"1.5px solid #4a7c59", borderRadius:16, padding:"20px 16px", marginBottom:16, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🫏</div>
            <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:-0.5, margin:"0 0 6px", color:"#1a3a2a" }}>{firstHalf.title}</h2>
            <p style={{ fontSize:14, color:"#4a7c59", margin:"0 0 4px", fontWeight:600 }}>{firstHalf.date}</p>
          </div>


        </div>
      )}

      {tab === "second" && (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🫏</div>
          <p style={{ fontSize:16, fontWeight:700, color:"#333", marginBottom:8 }}>2026 하반기 당나귀</p>
          <p style={{ fontSize:14, color:"#aaa" }}>일정이 아직 정해지지 않았어요</p>
        </div>
      )}
    </div>
  );
}


function MeetingPage({ events, saveEvents, onBack }) {
  const today = new Date();
  const [step, setStep] = useState("setup"); // setup | vote | result
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [meetings, setMeetingsState] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [myName, setMyName] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    const unsub = onValue(ref(db, "nf_meetings"), snap => {
      const val = snap.val();
      if (val) setMeetingsState(Object.values(val));
      else setMeetingsState([]);
    });
    return () => {};
  }, []);

  const saveMeetings = (next) => {
    setMeetingsState(next);
    const obj = {};
    next.forEach(m => { obj[m.id] = m; });
    fbSet("nf_meetings", Object.keys(obj).length ? obj : null);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const getDateStr = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const DAYS = ["일","월","화","수","목","금","토"];
  const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  const createMeeting = () => {
    if (!title.trim() || !rangeStart) return;
    const m = { id: Date.now(), title, description, duration, rangeStart, rangeEnd: rangeEnd||rangeStart, votes: {}, done: false };
    saveMeetings([...meetings, m]);
    setTitle(""); setDescription(""); setDuration(""); setRangeStart(""); setRangeEnd("");
  };

  const toggleDate = (dStr) => {
    setSelectedDates(prev => prev.includes(dStr) ? prev.filter(d=>d!==dStr) : [...prev, dStr]);
  };

  const submitVote = () => {
    if (!myName.trim() || !activeMeeting) return;
    const updated = meetings.map(m => m.id===activeMeeting.id
      ? { ...m, votes: { ...m.votes, [myName]: selectedDates } }
      : m
    );
    saveMeetings(updated);
    setActiveMeeting(updated.find(m=>m.id===activeMeeting.id));
    setMyName(""); setSelectedDates([]);
    setStep("result");
  };

  const confirmDate = (meeting, dateStr) => {
    const ev = {
      id: Date.now(),
      title: meeting.title,
      startDate: dateStr,
      endDate: dateStr,
      startTime: "",
      endTime: "",
      color: "#3b82f6",
    };
    saveEvents([...events, ev]);
    const updated = meetings.map(m => m.id===meeting.id ? {...m, done:true, confirmedDate:dateStr} : m);
    saveMeetings(updated);
    setActiveMeeting(updated.find(m=>m.id===meeting.id));
    alert(`✅ ${dateStr} 일정이 캘린더에 저장됐어요!`);
  };

  // 날짜별 투표 수 계산
  const getVoteCount = (meeting) => {
    const counts = {};
    Object.values(meeting.votes||{}).forEach(dates => {
      dates.forEach(d => { counts[d] = (counts[d]||0)+1; });
    });
    return counts;
  };

  const prevMonth = () => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };

  const activeMeetingData = activeMeeting ? meetings.find(m=>m.id===activeMeeting.id) : null;
  const voteCounts = activeMeetingData ? getVoteCount(activeMeetingData) : {};
  const maxVotes = Math.max(0, ...Object.values(voteCounts));
  const bestDates = Object.entries(voteCounts).filter(([,c])=>c===maxVotes&&maxVotes>0).map(([d])=>d).sort();

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.back} onClick={() => { setStep("list"); onBack(); }}>← 캘린더</button>
        <span style={S.topName}>약속 잡기</span>
        <span />
      </div>

      {/* 약속 만들기 폼 */}
      <div style={S.card}>
        <p style={S.cardLabel}>➕ 새 약속 만들기</p>
        <Label>모임 이름 *</Label>
        <input style={S.input} value={title} onChange={e=>setTitle(e.target.value)} placeholder="예: 새가족팀 회의, MT" />
        <Label>모임 설명</Label>
        <textarea style={{ ...S.textarea, marginBottom:10 }} value={description} onChange={e=>setDescription(e.target.value)} placeholder="예: 상반기 정리 회의입니다. 2시간 정도 예상해요" rows={2} />
        <Label>모임 시간</Label>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:"#aaa", margin:"0 0 4px" }}>시작</p>
            <input style={{ ...S.input, marginBottom:0 }} type="time" value={duration.split("~")[0]?.trim()||""} onChange={e=>{const end=duration.split("~")[1]?.trim()||""; setDuration(e.target.value+(end?` ~ ${end}`:""));}} />
          </div>
          <div style={{ display:"flex", alignItems:"center", paddingTop:18, color:"#aaa", fontSize:14 }}>~</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:"#aaa", margin:"0 0 4px" }}>종료</p>
            <input style={{ ...S.input, marginBottom:0 }} type="time" value={duration.split("~")[1]?.trim()||""} onChange={e=>{const start=duration.split("~")[0]?.trim()||""; setDuration(start?`${start} ~ ${e.target.value}`:e.target.value);}} />
          </div>
        </div>
        <Label>약속잡기 날짜 범위 * (가능한 날짜를 고를 범위)</Label>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:"#aaa", margin:"0 0 4px" }}>시작일</p>
            <input style={{ ...S.input, marginBottom:0 }} type="date" value={rangeStart} onChange={e=>setRangeStart(e.target.value)} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:"#aaa", margin:"0 0 4px" }}>종료일</p>
            <input style={{ ...S.input, marginBottom:0 }} type="date" value={rangeEnd} onChange={e=>setRangeEnd(e.target.value)} />
          </div>
        </div>
        <button style={{ ...S.btnPrimary, marginTop:4 }} onClick={createMeeting}>약속 만들기</button>
      </div>

      {/* 약속 목록 */}
      {meetings.length > 0 && (
        <div>
          <p style={{ fontSize:12, fontWeight:700, color:"#888", marginBottom:8, letterSpacing:0.3 }}>진행 중인 약속</p>
          {[...meetings].reverse().map(m => (
            <div key={m.id} style={{ ...S.card, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div>
                  <b style={{ fontSize:15, letterSpacing:-0.3 }}>{m.title}</b>
                  {m.done && m.confirmedDate && <span style={{ fontSize:11, background:"#e8f5e9", color:"#2e7d32", padding:"2px 8px", borderRadius:10, marginLeft:6, fontWeight:600 }}>✓ {m.confirmedDate}</span>}
                  {m.description && <p style={{ fontSize:12, color:"#666", margin:"2px 0 2px" }}>{m.description}</p>}
                  <p style={{ fontSize:12, color:"#aaa", margin:"2px 0 0" }}>
                    {m.duration && `🕐 ${m.duration} · `}{m.rangeStart}{m.rangeEnd&&m.rangeEnd!==m.rangeStart?` ~ ${m.rangeEnd}`:""} · {Object.keys(m.votes||{}).length}명 응답
                  </p>
                </div>
                <button style={{ background:"none", border:"none", color:"#ccc", fontSize:12, cursor:"pointer" }}
                  onClick={() => saveMeetings(meetings.filter(x=>x.id!==m.id))}>×</button>
              </div>

              {!m.done && (
                <div style={{ display:"flex", gap:6 }}>
                  <button style={{ flex:1, padding:"8px", background:"#111", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}
                    onClick={() => { setActiveMeeting(m); setSelectedDates(m.votes?.[myName]||[]); setStep("vote"); }}>
                    날짜 선택하기
                  </button>
                  <button style={{ flex:1, padding:"8px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:8, fontSize:13, cursor:"pointer" }}
                    onClick={() => { setActiveMeeting(m); setStep("result"); }}>
                    결과 보기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 날짜 선택 모달 */}
      {step === "vote" && activeMeeting && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:"24px 16px 40px", width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }}>
            <p style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{activeMeeting.title}</p>
            {activeMeeting.description && <p style={{ fontSize:13, color:"#555", marginBottom:4 }}>{activeMeeting.description}</p>}
            {activeMeeting.duration && <p style={{ fontSize:12, color:"#888", marginBottom:4 }}>🕐 {activeMeeting.duration}</p>}
            <p style={{ fontSize:12, color:"#4a7c59", marginBottom:16, fontWeight:600 }}>📅 {activeMeeting.rangeStart}{activeMeeting.rangeEnd&&activeMeeting.rangeEnd!==activeMeeting.rangeStart?` ~ ${activeMeeting.rangeEnd}`:""} 중 가능한 날 선택</p>
            <Label>이름 *</Label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {PASTORS.map(p => (
                <button key={p} style={{ ...S.toggleBtn, ...(myName===p?S.toggleBtnOn:{}) }} onClick={()=>setMyName(p)}>{p}</button>
              ))}
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <button style={{ background:"none", border:"none", fontSize:20, cursor:"pointer" }} onClick={prevMonth}>‹</button>
              <b style={{ fontSize:15 }}>{year}년 {MONTHS[month]}</b>
              <button style={{ background:"none", border:"none", fontSize:20, cursor:"pointer" }} onClick={nextMonth}>›</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
              {DAYS.map((d,i) => <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:i===0?"#ef4444":i===6?"#3b82f6":"#aaa" }}>{d}</div>)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:16 }}>
              {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
              {Array(daysInMonth).fill(null).map((_,i) => {
                const d = i+1;
                const dStr = getDateStr(year, month, d);
                const isSelected = selectedDates.includes(dStr);
                const isPast = dStr < todayStr || dStr < (activeMeeting.rangeStart||todayStr) || dStr > (activeMeeting.rangeEnd||'9999-12-31');
                const dow = (firstDay+i)%7;
                return (
                  <div key={d} style={{ aspectRatio:"1", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:isPast?"default":"pointer", background:isSelected?"#4a7c59":"#f8f8f8", color:isSelected?"#fff":isPast?"#ddd":dow===0?"#ef4444":dow===6?"#3b82f6":"#333", fontSize:13, fontWeight:isSelected?700:400, border:isSelected?"none":"1px solid #f0f0f0" }}
                    onClick={() => !isPast && toggleDate(dStr)}>
                    {d}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize:12, color:"#4a7c59", marginBottom:12 }}>선택한 날짜: {selectedDates.length}개</p>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ ...S.btnPrimary, flex:2 }} onClick={submitVote}>제출하기</button>
              <button style={{ flex:1, padding:"13px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:12, fontSize:14, cursor:"pointer" }}
                onClick={() => { setStep("list"); setSelectedDates([]); }}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 결과 보기 모달 */}
      {step === "result" && activeMeetingData && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:"24px 16px 40px", width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }}>
            <p style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{activeMeetingData.title} · 결과</p>
            {activeMeetingData.description && <p style={{ fontSize:13, color:"#555", marginBottom:4 }}>{activeMeetingData.description}</p>}
            {activeMeetingData.duration && <p style={{ fontSize:12, color:"#888", marginBottom:4 }}>🕐 {activeMeetingData.duration}</p>}
            <p style={{ fontSize:13, color:"#888", marginBottom:16 }}>총 {Object.keys(activeMeetingData.votes||{}).length}명 응답</p>

            {Object.keys(activeMeetingData.votes||{}).length === 0 && (
              <p style={{ fontSize:13, color:"#bbb", textAlign:"center", padding:"20px 0" }}>아직 응답이 없어요</p>
            )}

            {bestDates.length > 0 && (
              <div style={{ background:"#e8f5e9", border:"1.5px solid #4a7c59", borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
                <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:"#2e7d32" }}>🎯 최다 가능 날짜 ({maxVotes}명)</p>
                {bestDates.map(d => (
                  <div key={d} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{d}</span>
                    {!activeMeetingData.done && (
                      <button style={{ padding:"6px 14px", background:"#4a7c59", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}
                        onClick={() => confirmDate(activeMeetingData, d)}>
                        이날로 확정
                      </button>
                    )}
                  </div>
                ))}
                {activeMeetingData.confirmedDate && (
                  <p style={{ margin:"6px 0 0", fontSize:12, color:"#4a7c59", fontWeight:600 }}>✓ {activeMeetingData.confirmedDate}로 확정됐어요</p>
                )}
              </div>
            )}

            {Object.entries(voteCounts).sort(([,a],[,b])=>b-a).map(([d, count]) => (
              <div key={d} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f5f5f5" }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:14, fontWeight:600 }}>{d}</span>
                  <span style={{ fontSize:12, color:"#888", marginLeft:8 }}>{count}명 가능</span>
                </div>
                <div style={{ display:"flex", gap:4 }}>
                  {Object.entries(activeMeetingData.votes||{}).filter(([,dates])=>dates.includes(d)).map(([name])=>(
                    <span key={name} style={{ fontSize:11, background:"#f0f0f0", color:"#555", padding:"2px 7px", borderRadius:10 }}>{name}</span>
                  ))}
                </div>
              </div>
            ))}

            <button style={{ ...S.btnPrimary, marginTop:16 }} onClick={() => setStep("list")}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}


function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:1.5, marginBottom:8 }}>{title}</p>
      <div style={{ background:"#fafafa", borderRadius:12, padding:"16px", border:"1px solid #f0f0f0" }}>{children}</div>
    </div>
  );
}
function Label({ children }) { return <p style={{ fontSize:12, color:"#888", marginBottom:4, marginTop:0, fontWeight:600 }}>{children}</p>; }


const KR_HOLIDAYS = {
  "2026-01-01": "신정",
  "2026-01-28": "설날 연휴",
  "2026-01-29": "설날",
  "2026-01-30": "설날 연휴",
  "2026-03-01": "삼일절",
  "2026-05-05": "어린이날",
  "2026-05-24": "부처님오신날",
  "2026-06-06": "현충일",
  "2026-08-15": "광복절",
  "2026-09-24": "추석 연휴",
  "2026-09-25": "추석",
  "2026-09-26": "추석 연휴",
  "2026-10-03": "개천절",
  "2026-10-09": "한글날",
  "2026-12-25": "크리스마스",
  "2025-01-01": "신정",
  "2025-01-28": "설날 연휴",
  "2025-01-29": "설날",
  "2025-01-30": "설날 연휴",
  "2025-03-01": "삼일절",
  "2025-05-05": "어린이날",
  "2025-05-06": "부처님오신날",
  "2025-06-06": "현충일",
  "2025-08-15": "광복절",
  "2025-10-05": "추석 연휴",
  "2025-10-06": "추석",
  "2025-10-07": "추석 연휴",
  "2025-10-03": "개천절",
  "2025-10-09": "한글날",
  "2025-12-25": "크리스마스",
};

const PASTOR_COLOR = { "유정":"#dbeafe", "지혜":"#fce7f3", "혜빈":"#dcfce7", "명철":"#fef9c3", "예훈":"#ede9fe" };
const WEEK_COLOR = { "1주차":"#e0f2fe", "2주차":"#fce7f3", "3주차":"#dcfce7", "4주차":"#fef9c3", "5주차":"#ede9fe", "등반":"#4a7c59", "미출석":"#9ca3af" };
const STATUS_TEXT = { "참석":"#16a34a", "불참":"#dc2626", "미정":"#d97706", "연락X":"#9ca3af", "등반":"#4a7c59", "미출석":"#9ca3af" };
const STATUS_STYLE = {
  "참석":  { background:"#dcfce7", color:"#16a34a", border:"1px solid #86efac" },
  "불참":  { background:"#fdecea", color:"#dc2626", border:"1px solid #fca5a5" },
  "미정":  { background:"#fef9c3", color:"#d97706", border:"1px solid #fde047" },
  "연락X": { background:"#f3f4f6", color:"#6b7280", border:"1px solid #d1d5db" },
  "등반":  { background:"#dcfce7", color:"#4a7c59", border:"1px solid #4a7c59" },
  "미출석":{ background:"#f3f4f6", color:"#9ca3af", border:"1px solid #d1d5db" },
};

const S = {
  app:        { minHeight:"100vh", background:"#f8f8f8", fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif", display:"flex", justifyContent:"center" },
  container:  { width:"100%", maxWidth:480, minHeight:"100vh", background:"#fff" },
  page:       { padding:"0 16px 48px" },
  topBar:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 12px", borderBottom:"1px solid #f0f0f0", marginBottom:16, position:"sticky", top:0, background:"#fff", zIndex:10 },
  back:       { background:"none", border:"none", color:"#4a7c59", fontSize:14, fontWeight:600, cursor:"pointer", padding:"4px 0" },
  topName:    { fontSize:15, fontWeight:700, color:"#111", letterSpacing:-0.3 },
  searchInput:{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e8e8e8", fontSize:14, outline:"none", boxSizing:"border-box", letterSpacing:-0.3, color:"#111", background:"#fff", WebkitTextFillColor:"#111" },
  badge:      { fontSize:11, background:"#f0f0f0", color:"#666", padding:"2px 7px", borderRadius:10 },
  card:       { background:"#fafafa", borderRadius:12, padding:"16px", marginBottom:14, border:"1px solid #f0f0f0" },
  cardLabel:  { fontSize:12, fontWeight:700, color:"#888", marginBottom:10, letterSpacing:0.3 },
  input:      { width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e8e8e8", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10, letterSpacing:-0.3, color:"#111", background:"#fff", WebkitTextFillColor:"#111" },
  textarea:   { width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e8e8e8", fontSize:14, outline:"none", boxSizing:"border-box", resize:"vertical", lineHeight:1.6, fontFamily:"inherit", marginBottom:10, letterSpacing:-0.3, color:"#111", background:"#fff" },
  btnPrimary: { width:"100%", padding:"13px", background:"#111", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:-0.3 },
  btnAdd:     { padding:"8px 16px", background:"#111", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", letterSpacing:-0.3 },
  iconBtn:    { padding:"8px 10px", background:"#f0f0f0", border:"none", borderRadius:10, fontSize:16, cursor:"pointer" },
  toggleBtn:  { padding:"6px 12px", border:"1.5px solid #e8e8e8", borderRadius:8, background:"#f8f8f8", color:"#666", fontSize:13, cursor:"pointer", letterSpacing:-0.3 },
  toggleBtnOn:{ border:"1.5px solid #111", background:"#111", color:"#fff" },
};


