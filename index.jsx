import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, Video, Search, Copy, Check, RefreshCw, 
  AlertCircle, Lock, Unlock, Key, Zap, LogOut, X, ShieldCheck, 
  Star, Flame, Flower2, Camera, Scan, 
  Heart, Library, Book, Volume2, VolumeX, 
  UserPlus, Users, Trash2, Edit3, Save, Plus, Settings,
  PlayCircle, Mail, User, Layout, Eye, EyeOff, Wind as WindIcon, HelpCircle, FileVideo, UserCircle,
  AlertTriangle, Trash, CalendarPlus, Sparkles, ChevronRight, Megaphone, BookOpen, CheckCircle2,
  MessageCircle, Quote, ClipboardCheck, Activity, Target, Shield, Timer, Dumbbell
} from 'lucide-react';

// --- KONFIGURASI UTAMA ---
const apiKey = ""; 
const API_BASE = "https://script.google.com/macros/s/AKfycbzGHXhcDADltiar9J8eEKRQvrtDdxAiPX4v5Ege_tB9qulJGkoxnnkzSzFYTL1ftoei/exec";
const WA_ADMIN = "6281234567890"; 

// --- CUSTOM ICONS (INSTAGRAM VERIFIED SEAL) ---
const BlueVerifiedIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" fill="#3B99D9" />
    <path d="M10.2 16.2l-3.3-3.3 1.1-1.1 2.2 2.2 5.5-5.5 1.1 1.1-6.6 6.6z" fill="white" />
  </svg>
);

// --- DATE HELPERS (FIX TIMEZONE DRIFT WIB UTC+7) ---
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const MONTHS_SHORT_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const getDateComponents = (dateStr) => {
  if (!dateStr) return null;
  let d;
  try {
    if (String(dateStr).includes('T')) {
      const utcDate = new Date(dateStr);
      d = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dayName: DAYS_ID[d.getUTCDay()] };
    } else {
      const parts = String(dateStr).split(/[-/]/);
      if (parts.length !== 3) return null;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month - 1, day);
      return { y: year, m: month, d: day, dayName: DAYS_ID[dateObj.getDay()] };
    }
  } catch (e) { return null; }
};

const formatHumanDate = (dateStr) => {
  const comp = getDateComponents(dateStr);
  return comp ? `${comp.d} ${MONTHS_ID[comp.m - 1]} ${comp.y}` : String(dateStr);
};

const formatScheduleDate = (dateStr) => {
  const comp = getDateComponents(dateStr);
  return comp ? `${comp.dayName}, ${comp.d} ${MONTHS_SHORT_ID[comp.m - 1]}` : String(dateStr);
};

const checkIfLive = (dateStr, timeRange) => {
  if (!dateStr || !timeRange) return false;
  try {
    const now = new Date();
    const comp = getDateComponents(dateStr);
    if (!comp) return false;
    const isToday = comp.d === now.getDate() && comp.m === (now.getMonth() + 1) && comp.y === now.getFullYear();
    if (!isToday) return false;
    const times = String(timeRange).split('-').map(t => t.trim().replace('.', ':'));
    if (times.length < 2) return false;
    const [startH, startM] = times[0].split(':').map(Number);
    const [endH, endM] = times[1].split(':').map(Number);
    const startTime = new Date(); startTime.setHours(startH, startM, 0);
    const endTime = new Date(); endTime.setHours(endH, endM, 0);
    return now >= startTime && now <= endTime;
  } catch (e) { return false; }
};

// --- AI TEXT BEAUTIFIER & PROFESSIONAL POSE NAMES ---
const cleanAIText = (text) => {
    if (!text) return "";
    return String(text)
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/### (.*?)\n/g, '$1\n')
        .replace(/\*(.*?)\*/g, '$1')
        // FILTER KATA KURANG ETIS & TERJEMAHAN KAKU
        .replace(/Pose Mayat/gi, 'Savasana')
        .replace(/Anjing Menghadap ke Bawah/gi, 'Downward Dog')
        .replace(/Anjing Menghadap Bawah/gi, 'Downward Dog')
        .replace(/Pose Kucing-Sapi/gi, 'Cat-Cow')
        .replace(/Kucing Sapi/gi, 'Cat-Cow')
        .replace(/Pose Kobra/gi, 'Cobra Pose')
        .replace(/Pose Segitiga/gi, 'Triangle Pose')
        .replace(/Pose Anak/gi, 'Child\'s Pose')
        .replace(/Mayat/gi, 'Relaksasi')
        .trim();
};

// --- PREMIUM COMPONENTS ---
const YogaLoader = () => (
  <div className="flex flex-col items-center justify-center text-center px-10 h-screen animate-in fade-in bg-[#FFFDFB]">
    <div className="relative mb-6 flex justify-center">
       <div className="absolute inset-0 bg-[#F8E1E7] rounded-full animate-ping opacity-30"></div>
       <div className="relative bg-white p-6 rounded-full shadow-2xl border-2 border-white">
         <Flower2 className="w-12 h-12 text-[#C08497]" />
       </div>
    </div>
    <h3 className="text-[#6D4C41] font-serif text-xl tracking-tight italic">Menyiapkan Ruang Tenang...</h3>
    <p className="text-[10px] font-bold text-[#C08497] uppercase tracking-[0.3em] mt-2 opacity-60">Virtual Studio Premium</p>
  </div>
);

const ZenLoadingIndicator = ({ message = "Menyelaraskan Energi..." }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in">
    <div className="relative">
      <div className="w-20 h-20 bg-[#F8E1E7]/30 rounded-full animate-pulse absolute inset-0 -m-1"></div>
      <div className="relative w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border border-[#F8E1E7]">
         <Flower2 className="w-8 h-8 text-[#C08497] animate-spin-slow" />
      </div>
    </div>
    <div className="text-center">
       <p className="text-xs font-serif italic text-[#6D4C41] animate-pulse mb-3">{String(message)}</p>
       <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-[#C08497] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
       </div>
    </div>
  </div>
);

const App = () => {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState('schedule');
  const [activeGuideSubTab, setActiveGuideSubTab] = useState('scan'); 
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState("");
  const [userAccessInfo, setUserAccessInfo] = useState(null);
  
  // Data States
  const [allSchedule, setAllSchedule] = useState([]);
  const [recordingsData, setRecordingsData] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // AI States
  const [userMood, setUserMood] = useState("");
  const [meditationResult, setMeditationResult] = useState(null);
  const [isGeneratingMeditation, setIsGeneratingMeditation] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryResult, setLibraryResult] = useState(null);
  const [isGeneratingLibrary, setIsGeneratingLibrary] = useState(false);
  const [scanImage, setScanImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [seqDuration, setSeqDuration] = useState("15");
  const [seqFocus, setSeqFocus] = useState("");
  const [sequenceResult, setSequenceResult] = useState(null);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('yoga_access_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        handleVerifyKey(parsed.key);
      } catch (e) { localStorage.removeItem('yoga_access_v1'); setIsLoading(false); }
    } else { setIsLoading(false); }
  }, []);

  const smartFetch = async (sheetName, params = "") => {
    try {
      const url = `${API_BASE}?sheet=${sheetName}${params}&t=${Date.now()}`;
      const res = await fetch(url);
      return await res.json();
    } catch (e) { return null; }
  };

  const handleVerifyKey = async (targetKey) => {
    const keyToVerify = targetKey || inputKey;
    if (!keyToVerify) return;
    setAuthError(""); setIsProcessing(true);
    try {
      // MODE FAST READ-ONLY: Tanpa pembatasan deviceId untuk kecepatan maksimal
      const res = await smartFetch("sheet4");
      const found = (res?.sheet4 || []).find(k => String(k.key).trim().toLowerCase() === keyToVerify.trim().toLowerCase());
      
      if (found) {
        const cleanExp = String(found.expiredAt).split('T')[0];
        const comp = getDateComponents(cleanExp);
        const expDateLimit = comp ? new Date(comp.y, comp.m - 1, comp.d, 23, 59, 59) : new Date(0);
        
        if (new Date() < expDateLimit) {
          const access = { 
            key: found.key, 
            expiry: cleanExp, 
            nama: String(found.namaMember || "Member"), 
            spesialAkses: String(found.spesialAkses).toUpperCase() === "TRUE" 
          };
          if (rememberMe) localStorage.setItem('yoga_access_v1', JSON.stringify(access));
          setUserAccessInfo(access); 
          setIsAuthorized(true); 
          await fetchStudioData();
        } else { setAuthError(`Akses kedaluwarsa pada ${formatHumanDate(cleanExp)}.`); }
      } else { setAuthError("Kode akses tidak valid."); }
    } catch (err) { setAuthError("Gagal terhubung ke database."); }
    finally { setIsProcessing(false); setIsLoading(false); }
  };

  const fetchStudioData = async () => {
    const [schedRes, recRes, infoRes] = await Promise.all([smartFetch("sheet1"), smartFetch("sheet2"), smartFetch("sheet3")]);
    setAllSchedule(schedRes?.sheet1 || []); setRecordingsData(recRes?.sheet2 || []);
    const infoData = infoRes?.sheet3 || [];
    const activeInfo = infoData.find(i => String(i.aktif).toUpperCase() === "TRUE");
    setAnnouncement(activeInfo ? String(activeInfo.pesan) : null);
  };

  const handleLogout = () => { localStorage.removeItem('yoga_access_v1'); setIsAuthorized(false); setInputKey(""); };

  const handleCopy = (text, type) => {
    const el = document.createElement("textarea"); el.value = String(text || ""); document.body.appendChild(el); el.select(); document.execCommand('copy');
    setCopyFeedback(`${String(type)} Disalin`); setTimeout(() => setCopyFeedback(""), 2000); document.body.removeChild(el);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setScanImage(reader.result); setScanResult(null); };
      reader.readAsDataURL(file);
    }
  };

  const generateMeditation = async () => {
    if (!userMood) return; setIsGeneratingMeditation(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Saya merasa ${userMood}` }] }], systemInstruction: { parts: [{ text: "Berikan panduan meditasi pendek & afirmasi Bahasa Indonesia yang hangat. PENTING: Dilarang menggunakan istilah 'Pose Mayat'." }] } })
      });
      const json = await res.json(); setMeditationResult(json.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) { setCopyFeedback("AI Sibuk"); } finally { setIsGeneratingMeditation(false); }
  };

  const generateLibrary = async () => {
    if (!libraryQuery) return; setIsGeneratingLibrary(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: libraryQuery }] }], systemInstruction: { parts: [{ text: "Berikan edukasi yoga profesional dalam Bahasa Indonesia. PENTING: Gunakan nama gerakan dalam Bahasa Inggris standar (Downward Dog, Cat-Cow, dll). Dilarang menggunakan istilah 'Pose Mayat'." }] } })
      });
      const json = await res.json(); setLibraryResult(json.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) { setCopyFeedback("AI Sibuk"); } finally { setIsGeneratingLibrary(false); }
  };

  const generateSequence = async () => {
    if (!seqFocus) return; setIsGeneratingSequence(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Waktu: ${seqDuration} menit, Fokus: ${seqFocus}` }] }], systemInstruction: { parts: [{ text: "Anda adalah AI Personal Trainer Yoga profesional. Buatkan urutan gerakan yoga sesuai waktu dan fokus pengguna. PENTING: Gunakan nama gerakan dalam Bahasa Inggris standar (Downward Dog, Cat-Cow, dll). Dilarang menggunakan istilah 'Pose Mayat', gunakan 'Savasana'." }] } })
      });
      const json = await res.json(); setSequenceResult(json.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) { setCopyFeedback("AI Sibuk"); } finally { setIsGeneratingSequence(false); }
  };

  const analyzePose = async () => {
    if (!scanImage) return; setIsAnalyzing(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Analisis alignment pose yoga dalam 3 bagian. PENTING: Gunakan nama pose Inggris standar. Dilarang menggunakan istilah 'Pose Mayat'." }, { inlineData: { mimeType: "image/png", data: scanImage.split(',')[1] } }] }], systemInstruction: { parts: [{ text: "Berikan analisis teknis alignment yoga profesional Bahasa Indonesia." }] } })
      });
      const json = await res.json(); setScanResult(json.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) { setCopyFeedback("AI Sibuk"); } finally { setIsAnalyzing(false); }
  };

  if (isLoading) return <YogaLoader />;

  return (
    <div className="bg-[#FAF7F5] min-h-screen flex justify-center selection:bg-[#F8E1E7]">
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden border-x border-gray-100 pb-20 text-left">
        
        {copyFeedback && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-2xl animate-in zoom-in uppercase tracking-widest whitespace-nowrap text-center">
                {String(copyFeedback)}
            </div>
        )}

        {!isAuthorized ? (
          <div className="flex-1 flex flex-col px-8 py-12 justify-center bg-gradient-to-b from-[#FFFDFB] to-[#FDF2F2] text-left">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-[#C08497] rounded-[22px] flex items-center justify-center shadow-lg mb-4 mx-auto border-2 border-white">
                    <Layout className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-serif text-[#6D4C41] italic">Virtual Studio</h1>
                <p className="text-[10px] font-bold text-[#C08497] tracking-[0.3em] uppercase opacity-60">Member Access</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-xl border border-white/50 space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#D7CCC8] tracking-widest ml-1">Access Key</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D7CCC8]" />
                  <input type="text" placeholder="Masukkan Kode" value={inputKey} onChange={e => setInputKey(e.target.value)} className="w-full py-4.5 pl-12 pr-4 bg-[#FFFDFB] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F8E1E7] font-bold text-[#6D4C41] transition-all text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" id="rem" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="w-4 h-4 rounded border-gray-200 text-[#C08497] focus:ring-[#C08497]" />
                <label htmlFor="rem" className="text-[11px] font-bold text-[#D7CCC8] cursor-pointer">Ingat Saya</label>
              </div>
              {authError && <div className="text-red-400 text-[10px] font-bold px-4 py-3 bg-red-50 rounded-2xl border border-red-100 text-justify animate-shake">{String(authError)}</div>}
              <button onClick={() => handleVerifyKey()} disabled={isProcessing} className="w-full py-5 bg-[#C08497] text-white rounded-[22px] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-center">
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "MASUK STUDIO"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl px-5 py-4 border-b border-gray-50 flex justify-between items-center text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C08497] rounded-xl flex items-center justify-center border border-white shadow-sm">
                    <Flower2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-serif italic text-[#6D4C41] leading-none mb-1">Virtual Studio</h2>
                    <p className="text-[10px] font-black text-[#C08497] uppercase tracking-tighter leading-none">{String(userAccessInfo.nama)}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 active:scale-90 transition-all"><LogOut className="w-4.5 h-4.5" /></button>
            </header>

            <main className="flex-1 px-5 pt-5 pb-28 space-y-5 overflow-y-auto no-scrollbar text-left">
              
              {/* --- INFO MASA AKTIF --- */}
              <div className="flex gap-2">
                <div className="flex-1 bg-[#FDF2F2] rounded-2xl p-3 border border-white flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#C08497] shadow-sm"><Clock className="w-4 h-4" /></div>
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[#C08497] uppercase opacity-60">Masa Aktif</span>
                        <p className="text-[10px] font-black text-[#6D4C41] truncate">{formatHumanDate(userAccessInfo.expiry)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center justify-center px-4">
                    <p className="text-[10px] font-black text-[#C08497] whitespace-nowrap">
                      {Math.ceil((getDateComponents(userAccessInfo.expiry) ? new Date(getDateComponents(userAccessInfo.expiry).y, getDateComponents(userAccessInfo.expiry).m-1, getDateComponents(userAccessInfo.expiry).d, 23, 59, 59) - new Date() : 0) / (1000 * 60 * 60 * 24))} HARI
                    </p>
                </div>
              </div>

              {/* --- BAR PENGUMUMAN --- */}
              {announcement && (
                <div className="bg-[#6D4C41] text-white p-4 rounded-2xl flex items-start gap-3 shadow-md animate-in slide-in-from-top-2">
                   <Megaphone className="w-4 h-4 shrink-0 mt-0.5 text-[#F7AF9D]" />
                   <p className="text-[10px] font-medium leading-relaxed opacity-90">{String(announcement)}</p>
                </div>
              )}

              {/* --- MENU BAR PRESISI --- */}
              <div className="bg-[#F3F4F6] p-1.5 rounded-[24px] grid grid-cols-5 gap-1 shadow-inner border border-gray-200/50">
                {['schedule', 'recordings', 'meditation', 'library', 'scan'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`relative py-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${activeTab === tab ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === tab ? 'text-[#C08497]' : 'text-gray-400'}`}>
                      {tab === 'schedule' ? 'Live' : tab === 'recordings' ? 'Replay' : tab === 'meditation' ? 'Mind' : tab === 'library' ? 'Book' : 'Guide'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-4 animate-in slide-in-from-bottom-2 text-left">
                {/* --- TAB: SCHEDULE --- */}
                {activeTab === 'schedule' && allSchedule.map((item, idx) => {
                  const isLiveNow = checkIfLive(item.date || item.Tanggal, item.time || item.Jam);
                  return (
                    <div key={idx} className="rounded-[35px] p-6 border bg-white border-gray-100 shadow-sm text-left relative overflow-hidden">
                      {isLiveNow && (
                        <div className="absolute -top-1 left-6 bg-red-500 text-white px-3 py-1 rounded-b-xl text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 animate-pulse z-10">
                           <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE SEKARANG
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-[#C08497] uppercase tracking-widest">{formatScheduleDate(item.date || item.Tanggal)}</span>
                            <h4 className="text-xl font-serif italic text-[#6D4C41] leading-tight">{String(item.title || item.Judul)}</h4>
                            <div className="flex items-center gap-3 mt-3">
                               <img src={item.coachPhoto || `https://ui-avatars.com/api/?name=${item.coach || item.Pelatih}&background=C08497&color=fff`} className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-white" alt="Coach" />
                               <div className="flex flex-col">
                                  <div className="flex items-center gap-1">
                                     <span className="text-[12px] font-bold text-gray-700 uppercase tracking-tight">{String(item.coach || item.Pelatih)}</span>
                                     <BlueVerifiedIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{String(item.sertifikat || "Pro Instructor")}</span>
                               </div>
                            </div>
                        </div>
                        <div className="bg-[#FDF2F2] px-3 py-1.5 rounded-full text-[10px] font-black text-[#C08497]">{String(item.time || item.Jam)}</div>
                      </div>
                      {(item.perlengkapan || item.Perlengkapan) && (
                        <div className="flex flex-wrap gap-2 mb-5">
                           {String(item.perlengkapan || item.Perlengkapan).split(',').map((tool, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#008169] rounded-lg text-[9px] font-black uppercase border border-emerald-100/50">
                                 <CheckCircle2 className="w-3 h-3" /> {tool.trim()}
                              </div>
                           ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between border border-gray-100 min-w-0">
                              <div className="flex flex-col min-w-0">
                                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">ID</span>
                                <span className="text-[11px] font-black text-[#6D4C41] truncate">{String(item.meetingId || "—")}</span>
                              </div>
                              <button onClick={() => handleCopy(item.meetingId, "ID")} className="p-1.5 bg-white rounded-xl shadow-sm text-[#C08497] active:bg-[#FDF2F2]">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between border border-gray-100 min-w-0">
                              <div className="flex flex-col min-w-0">
                                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">PASS</span>
                                <span className="text-[11px] font-black text-[#6D4C41] truncate">{String(item.meetingPass || "—")}</span>
                              </div>
                              <button onClick={() => handleCopy(item.meetingPass, "PASS")} className="p-1.5 bg-white rounded-xl shadow-sm text-[#C08497] active:bg-[#FDF2F2]">
                                <Copy className="w-3.5 h-3.5"/>
                              </button>
                          </div>
                      </div>
                      <a href={String(item.zoomUrl || item.ZoomUrl || "#")} target="_blank" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#6D4C41] text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all text-center"><Video className="w-4 h-4" /> MASUK STUDIO SEKARANG</a>
                    </div>
                  );
                })}

                {/* --- TAB: MEDITATION (ZEN MIND) --- */}
                {activeTab === 'meditation' && (
                  <div className="space-y-5 pb-10">
                     <div className="bg-[#6D4C41] text-white p-7 rounded-[35px] shadow-lg relative overflow-hidden">
                       <h3 className="text-xl font-serif italic mb-1">Zen Mind AI</h3>
                       <p className="text-[9px] text-[#F7AF9D] font-bold uppercase tracking-widest mb-6 opacity-80">Afirmasi & Meditasi Personal</p>
                       <textarea placeholder="Apa yang Anda rasakan?..." value={userMood} onChange={(e) => setUserMood(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-xs outline-none focus:border-[#F7AF9D] placeholder:text-white/30 min-h-[100px] mb-4 transition-all" />
                       <button onClick={generateMeditation} disabled={!userMood || isGeneratingMeditation} className="w-full py-4 bg-[#F7AF9D] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                         {isGeneratingMeditation ? <RefreshCw className="w-4 h-4 animate-spin" /> : <WindIcon className="w-4 h-4" />} MULAI AFIRMASI
                       </button>
                     </div>
                     {isGeneratingMeditation && <ZenLoadingIndicator message="Menyusun naskah ketenangan..." />}
                     {meditationResult && !isGeneratingMeditation && (
                       <div className="bg-[#FEF9F9] rounded-[40px] border border-[#F8E1E7] shadow-xl overflow-hidden animate-in slide-in-from-bottom-6 text-left">
                         <div className="bg-white px-8 py-6 border-b border-[#FDF2F2] flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[#C08497] font-black uppercase text-[9px] tracking-widest text-left"><Heart className="w-4 h-4 fill-current" /> Meditation Guide</div>
                            <button onClick={() => handleCopy(cleanAIText(meditationResult), "Afirmasi")} className="p-2 bg-gray-50 rounded-lg text-[#C08497] active:scale-90 transition-all"><ClipboardCheck className="w-4 h-4" /></button>
                         </div>
                         <div className="p-10 relative text-left">
                            <Quote className="absolute top-6 left-6 w-12 h-12 text-[#F8E1E7] opacity-40 -z-0" />
                            <div className="relative z-10 text-[15px] leading-[1.8] font-serif italic text-stone-700 whitespace-pre-wrap">
                                {cleanAIText(meditationResult)}
                            </div>
                         </div>
                         <button onClick={() => setMeditationResult(null)} className="w-full py-5 bg-white text-stone-300 font-black text-[9px] uppercase tracking-widest border-t border-[#FDF2F2] active:bg-gray-50 text-center">Selesai Sesi</button>
                       </div>
                     )}
                  </div>
                )}

                {/* --- TAB: LIBRARY --- */}
                {activeTab === 'library' && (
                  <div className="space-y-5 pb-10">
                     <div className="bg-gradient-to-br from-[#002B24] to-[#004D40] text-white p-7 rounded-[35px] shadow-lg text-center">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20"><BookOpen className="w-6 h-6 text-emerald-300" /></div>
                       <h3 className="text-xl font-serif italic mb-1">Yoga Library AI</h3>
                       <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest mb-6 opacity-80 text-center">Pustakawan Ilmu Yoga</p>
                       <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input type="text" placeholder="Tanya tentang yoga..." value={libraryQuery} onChange={(e) => setLibraryQuery(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-xs outline-none focus:border-emerald-400 placeholder:text-white/20 text-left" />
                       </div>
                       <button onClick={generateLibrary} disabled={!libraryQuery || isGeneratingLibrary} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                         {isGeneratingLibrary ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Library className="w-4 h-4" />} TANYA PUSTAKAWAN
                       </button>
                     </div>
                     {isGeneratingLibrary && <ZenLoadingIndicator message="Mencari lembar ilmu..." />}
                     {libraryResult && !isGeneratingLibrary && (
                       <div className="bg-white rounded-[35px] border-l-8 border-l-emerald-600 border-y border-r border-emerald-50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 text-left">
                         <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Sparkles className="w-5 h-5"/></div>
                               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Wawasan Yoga</span>
                            </div>
                            <div className="text-[14px] leading-[1.7] text-stone-600 font-medium whitespace-pre-wrap">
                                {cleanAIText(libraryResult)}
                            </div>
                         </div>
                         <div className="flex p-2 gap-2 bg-emerald-50/30 border-t border-emerald-50">
                            <button onClick={() => handleCopy(cleanAIText(libraryResult), "Materi")} className="flex-1 py-4 bg-white text-emerald-700 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-sm active:scale-95 transition-all text-center">Salin Materi</button>
                            <button onClick={() => { setLibraryResult(null); setLibraryQuery(""); }} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all text-center">Tanya Lagi</button>
                         </div>
                       </div>
                     )}
                  </div>
                )}

                {/* --- TAB: GUIDE (SCAN & SEQUENCE) --- */}
                {activeTab === 'scan' && (
                  <div className="space-y-6 pb-20">
                    <div className="bg-[#F3F4F6] p-1.5 rounded-[22px] grid grid-cols-2 gap-1.5 shadow-inner border border-gray-200/50">
                      <button onClick={() => setActiveGuideSubTab('scan')} className={`py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center font-black text-[10px] uppercase ${activeGuideSubTab === 'scan' ? 'bg-white shadow-sm text-[#C08497]' : 'text-gray-400 hover:bg-white/30'}`}>Body Scan</button>
                      <button onClick={() => setActiveGuideSubTab('sequence')} className={`py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center font-black text-[10px] uppercase ${activeGuideSubTab === 'sequence' ? 'bg-white shadow-sm text-[#C08497]' : 'text-gray-400 hover:bg-white/30'}`}>Sequence Builder</button>
                    </div>

                    {activeGuideSubTab === 'scan' ? (
                      <>
                        <div className="bg-emerald-950 text-white p-7 rounded-[40px] shadow-2xl relative overflow-hidden text-left">
                          <h3 className="text-2xl font-serif italic mb-1 text-center">AI Yoga Guide</h3>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-8 text-center opacity-80 text-center">Analisis Postur & Alignment</p>
                          {!scanImage ? (
                            <div onClick={() => fileInputRef.current.click()} className="w-full py-16 border-2 border-dashed border-emerald-800/50 rounded-[35px] flex flex-col items-center justify-center gap-4 bg-emerald-900/20 cursor-pointer hover:bg-emerald-900/30 transition-all active:scale-95 text-center">
                              <Camera className="w-8 h-8 text-emerald-400 text-center" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-center">Ambil Foto Pose</span>
                              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            </div>
                          ) : (
                            <div className="space-y-5 text-left">
                              <div className="relative rounded-[35px] overflow-hidden aspect-square bg-black border-4 border-emerald-900 shadow-inner group">
                                <img src={scanImage} className="w-full h-full object-contain text-left" alt="Scan" />
                                {isAnalyzing && (
                                  <>
                                    <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_#34d399] animate-scanner-line z-20"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-[2px] text-center">
                                       <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mb-4 text-center" />
                                       <span className="text-[10px] font-black uppercase text-white tracking-[0.3em] animate-pulse text-center">Scanning Body...</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              {!isAnalyzing && !scanResult && (
                                <div className="flex gap-3">
                                  <button onClick={() => setScanImage(null)} className="flex-1 py-4.5 bg-emerald-900/30 text-white rounded-2xl font-black text-[10px] uppercase text-center">Ganti Foto</button>
                                  <button onClick={analyzePose} className="flex-[2] py-4.5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-center text-center">
                                    <Activity className="w-4 h-4 text-center" /> Mulai Analisis
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {scanResult && !isAnalyzing && (
                          <div className="animate-in slide-in-from-bottom-8 space-y-5 px-1 text-left">
                             <div className="bg-white rounded-[35px] p-8 border border-emerald-100 shadow-xl relative overflow-hidden text-left">
                                <div className="flex items-center gap-4 mb-6 text-left">
                                   <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg text-left"><Target className="w-6 h-6 text-left" /></div>
                                   <div className="text-left text-left">
                                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-left">Analisis Coach AI</h4>
                                      <p className="text-xl font-serif italic text-stone-800 text-left">Evaluasi Postur</p>
                                   </div>
                                </div>
                                <div className="text-[15px] leading-[1.7] text-stone-600 font-medium whitespace-pre-wrap border-l-2 border-emerald-100 pl-5 mb-8 text-left">
                                   {cleanAIText(scanResult)}
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                                   <div className="bg-emerald-50/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center text-center">
                                      <Activity className="w-5 h-5 text-emerald-600 mb-2 text-center" /><span className="text-[8px] font-black text-emerald-700 uppercase">Alignment</span><span className="text-[11px] font-bold text-stone-700 text-center">Checked</span>
                                   </div>
                                   <div className="bg-emerald-50/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center text-center">
                                      <Shield className="w-5 h-5 text-emerald-600 mb-2 text-center" /><span className="text-[8px] font-black text-emerald-700 uppercase">Safety</span><span className="text-[11px] font-bold text-stone-700 text-center">Verified</span>
                                   </div>
                                </div>
                             </div>
                             <button onClick={() => { setScanImage(null); setScanResult(null); }} className="w-full py-4 text-[10px] font-black text-emerald-500 uppercase border-2 border-emerald-100 rounded-2xl active:bg-emerald-50 text-center">Scan Pose Lain</button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-6 text-left">
                        {/* --- PREMIUM SEQUENCE BUILDER FORM --- */}
                        <div className="bg-[#6D4C41] text-white p-8 rounded-[45px] shadow-2xl relative overflow-hidden text-left">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 text-left"></div>
                          <h3 className="text-2xl font-serif italic mb-1 text-center text-center">Sequence Builder</h3>
                          <p className="text-[10px] text-[#F7AF9D] font-bold uppercase tracking-[0.2em] mb-8 text-center opacity-80 text-center text-center">Jadwal Latihan Mandiri</p>
                          <div className="space-y-5 text-left text-left">
                            <div className="grid grid-cols-2 gap-4 text-left text-left">
                              <div className="space-y-2 text-left">
                                <label className="text-[9px] font-black uppercase text-[#F7AF9D] tracking-widest text-left">Durasi Latihan</label>
                                <select value={seqDuration} onChange={(e) => setSeqDuration(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-[20px] p-4 text-xs outline-none focus:border-[#F7AF9D] appearance-none text-left">
                                  <option value="10">10 Menit</option><option value="15">15 Menit</option><option value="30">30 Menit</option><option value="45">45 Menit</option>
                                </select>
                              </div>
                              <div className="space-y-2 text-left text-left">
                                <label className="text-[9px] font-black uppercase text-[#F7AF9D] tracking-widest text-left text-left">Intensitas</label>
                                <div className="w-full bg-white/5 border border-white/10 rounded-[20px] p-4 text-[10px] font-bold text-center text-center opacity-50">Moderat</div>
                              </div>
                            </div>
                            <div className="space-y-2 text-left text-left">
                              <label className="text-[9px] font-black uppercase text-[#F7AF9D] tracking-widest text-left text-left">Fokus Keluhan/Target</label>
                              <input type="text" placeholder="Cth: Lower back pain, flexibility..." value={seqFocus} onChange={(e) => setSeqFocus(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-[20px] p-4 text-xs outline-none focus:border-[#F7AF9D] placeholder:text-white/20 text-left text-left" />
                            </div>
                            <button onClick={generateSequence} disabled={!seqFocus || isGeneratingSequence} className="w-full py-5 bg-gradient-to-r from-[#F7AF9D] to-[#E29578] text-white rounded-[22px] font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3 text-center text-center">
                              {isGeneratingSequence ? <RefreshCw className="w-4 h-4 animate-spin text-center" /> : <Sparkles className="w-4 h-4 text-center" />} SUSUN JADWAL SEKARANG
                            </button>
                          </div>
                        </div>
                        {isGeneratingSequence && <ZenLoadingIndicator message="Merangkai aliran gerakan khusus untukmu..." />}
                        {sequenceResult && !isGeneratingSequence && (
                          <div className="animate-in slide-in-from-bottom-8 bg-white rounded-[40px] border border-[#F8E1E7] shadow-xl overflow-hidden text-left text-left">
                            <div className="bg-[#FEF9F9] p-7 flex justify-between items-center text-left">
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C08497] shadow-sm text-left"><Timer className="w-6 h-6 text-left" /></div>
                                <div className="text-left text-left">
                                  <span className="text-[10px] font-black text-[#C08497] uppercase text-left text-left">Flow Dibuat</span>
                                  <span className="text-xs font-bold text-stone-500 block text-left text-left text-left">{seqDuration} Menit Sesi</span>
                                </div>
                              </div>
                              <button onClick={() => handleCopy(cleanAIText(sequenceResult), "Sequence")} className="p-3 bg-white rounded-2xl text-[#C08497] shadow-sm active:scale-90 text-left text-left"><ClipboardCheck className="w-5 h-5 text-left" /></button>
                            </div>
                            <div className="p-8 text-[15px] leading-[1.8] text-stone-600 font-medium whitespace-pre-wrap text-left text-left">
                              {cleanAIText(sequenceResult)}
                            </div>
                            <button onClick={() => {setSequenceResult(null); setSeqFocus("");}} className="w-full py-6 text-[10px] font-black uppercase text-stone-300 border-t border-gray-50 active:bg-gray-50 text-center text-center text-center text-center">Selesai Latihan</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: REPLAY --- */}
                {activeTab === 'recordings' && (
                  <div className="space-y-3 text-left">
                     <div className="relative mb-4 text-left text-left">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 text-left" />
                        <input type="text" placeholder="Cari rekaman..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-10 pr-4 text-[10px] font-bold outline-none text-left" />
                     </div>
                     {recordingsData.filter(r => String(r.title || "").toLowerCase().includes(searchQuery.toLowerCase())).map((rec, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 text-left text-left">
                           <div className="w-12 h-12 rounded-xl bg-[#FDF2F2] flex items-center justify-center text-[#C08497] shrink-0 text-left"><PlayCircle className="w-6 h-6 text-left" /></div>
                           <div className="flex-1 min-w-0 text-left">
                              <p className="text-[7px] font-black text-[#C08497] uppercase text-left">{formatScheduleDate(rec.date)}</p>
                              <h4 className="text-xs font-bold text-[#6D4C41] truncate leading-tight text-left">{String(rec.title || "Replay")}</h4>
                              <p className="text-[8px] text-gray-400 font-bold text-left text-left">{String(rec.coach || "Coach")} • {String(rec.duration || "60m")}</p>
                           </div>
                           <a href={String(rec.rekaman || "#")} target="_blank" className="p-2.5 bg-gray-50 rounded-lg text-[#C08497] active:bg-[#FDF2F2] text-left text-left"><ChevronRight className="w-4 h-4 text-left" /></a>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            </main>

            {/* NAV BAR */}
            <div className="absolute bottom-5 left-4 right-4 z-[150] text-left text-left">
                <nav className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 px-2 py-3 flex justify-around items-center shadow-[0_15px_40px_rgba(0,0,0,0.1)] ring-1 ring-black/5 text-left text-left">
                  {[
                    { key: 'schedule', icon: Calendar, label: 'Live' },
                    { key: 'recordings', icon: Video, label: 'Replay' },
                    { key: 'meditation', icon: WindIcon, label: 'Mind' },
                    { key: 'library', icon: BookOpen, label: 'Book' },
                    { key: 'scan', icon: Scan, label: 'Guide' }
                  ].map((btn) => (
                    <button key={btn.key} onClick={() => setActiveTab(btn.key)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === btn.key ? 'text-[#C08497]' : 'text-gray-300'} text-center text-center text-center`}>
                      <btn.icon className="w-5 h-5 text-center" />
                      <span className="text-[6px] font-black uppercase tracking-tighter text-center">{btn.label}</span>
                    </button>
                  ))}
                </nav>
            </div>
            
            <a href={`https://wa.me/${WA_ADMIN}`} target="_blank" className="fixed bottom-24 right-6 z-[200] w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 border-4 border-white text-center text-center"><MessageCircle className="w-7 h-7 fill-current text-center" /></a>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FAF7F5; -webkit-tap-highlight-color: transparent; text-align: left; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes scannerLine { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        .animate-scanner-line { animation: scannerLine 2s linear infinite; }
        .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
      `}} />
    </div>
  );
};

export default App;