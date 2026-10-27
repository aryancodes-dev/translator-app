// Translator App v20 ADVANCED — Project #04.
// Online: free MyMemory API, no key. Offline backup: built-in phrase book for common
// English <-> Hindi and English <-> Bengali phrases. History/favourites only on this phone.
// Honest limit: MyMemory is free with a daily limit; very long or rare texts may fail,
// in which case the app says so instead of inventing a translation.
const $ = id => document.getElementById(id);
// Offline phrase book: lowercased English -> {hi, bn}
const PHRASES = {
  "hello": {hi:"नमस्ते", bn:"নমস্কার"},
  "hello, how are you?": {hi:"नमस्ते, आप कैसे हैं?", bn:"নমস্কার, আপনি কেমন আছেন?"},
  "how are you?": {hi:"आप कैसे हैं?", bn:"আপনি কেমন আছেন?"},
  "thank you": {hi:"धन्यवाद", bn:"ধন্যবাদ"},
  "thank you very much": {hi:"बहुत-बहुत धन्यवाद", bn:"অনেক ধন্যবাদ"},
  "good morning": {hi:"सुप्रभात", bn:"সুপ্রভাত"},
  "good night": {hi:"शुभ रात्रि", bn:"শুভ রাত্রি"},
  "goodbye": {hi:"अलविदा", bn:"বিদায়"},
  "where are you going?": {hi:"आप कहाँ जा रहे हैं?", bn:"আপনি কোথায় যাচ্ছেন?"},
  "what is your name?": {hi:"आपका नाम क्या है?", bn:"আপনার নাম কি?"},
  "my name is aryan": {hi:"मेरा नाम आर्यन है", bn:"আমার নাম আরিয়ান"},
  "i love you": {hi:"मैं तुमसे प्यार करता हूँ", bn:"আমি তোমাকে ভালোবাসি"},
  "please": {hi:"कृपया", bn:"দয়া করে"},
  "sorry": {hi:"माफ़ कीजिए", bn:"দুঃখিত"},
  "yes": {hi:"हाँ", bn:"হ্যাঁ"},
  "no": {hi:"नहीं", bn:"না"},
  "welcome": {hi:"स्वागत है", bn:"স্বাগতম"},
  "how much does this cost?": {hi:"इसकी कीमत कितनी है?", bn:"এটার দাম কত?"},
  "i am a student": {hi:"मैं एक छात्र हूँ", bn:"আমি একজন ছাত্র"},
  "i am learning": {hi:"मैं सीख रहा हूँ", bn:"আমি শিখছি"},
};
const LANG_VOICE = {en:"en-US", hi:"hi-IN", bn:"bn-IN", es:"es-ES", fr:"fr-FR", de:"de-DE", ja:"ja-JP", ta:"ta-IN", te:"te-IN"};
// Word-by-word offline backup for English -> Hindi/Bengali, used only if MyMemory quota fails.
// Grammar will not be perfect — the app says so — but common words will still translate.
const WORD_DICT = {
  hello:{hi:"नमस्ते",bn:"নমস্কার"}, world:{hi:"दुनिया",bn:"বিশ্ব"}, thank:{hi:"धन्यवाद",bn:"ধন্যবাদ"},
  you:{hi:"आप",bn:"আপনি"}, very:{hi:"बहुत",bn:"খুব"}, much:{hi:"बहुत",bn:"অনেক"},
  good:{hi:"अच्छा",bn:"ভালো"}, morning:{hi:"सुबह",bn:"সকাল"}, night:{hi:"रात",bn:"রাত"},
  please:{hi:"कृपया",bn:"দয়া করে"}, sorry:{hi:"माफ़ कीजिए",bn:"দুঃখিত"}, yes:{hi:"हाँ",bn:"হ্যাঁ"},
  no:{hi:"नहीं",bn:"না"}, my:{hi:"मेरा",bn:"আমার"}, name:{hi:"नाम",bn:"নাম"}, is:{hi:"है",bn:"হয়"},
  are:{hi:"हैं",bn:"আছেন"}, i:{hi:"मैं",bn:"আমি"}, am:{hi:"हूँ",bn:"আছি"}, a:{hi:"एक",bn:"একটি"},
  student:{hi:"छात्र",bn:"ছাত্র"}, teacher:{hi:"शिक्षक",bn:"শিক্ষক"}, school:{hi:"स्कूल",bn:"স্কুল"},
  book:{hi:"किताब",bn:"বই"}, water:{hi:"पानी",bn:"জল"}, food:{hi:"खाना",bn:"খাবার"},
  friend:{hi:"दोस्त",bn:"বন্ধু"}, family:{hi:"परिवार",bn:"পরিবার"}, home:{hi:"घर",bn:"বাড়ি"},
  today:{hi:"आज",bn:"আজ"}, tomorrow:{hi:"कल",bn:"আগামীকাল"}, how:{hi:"कैसे",bn:"কেমন"},
  what:{hi:"क्या",bn:"কি"}, where:{hi:"कहाँ",bn:"কোথায়"}, when:{hi:"कब",bn:"কখন"},
  love:{hi:"प्यार",bn:"ভালোবাসা"}, happy:{hi:"खुश",bn:"খুশি"}, beautiful:{hi:"सुंदर",bn:"সুন্দর"},
};
function wordByWord(text, to){
  return text.replace(/[A-Za-z']+/g, (w)=>{
    const d = WORD_DICT[w.toLowerCase()];
    return d && d[to] ? d[to] : w;
  });
}
let history = load("tr-history", []);
let favourites = load("tr-fav", []);
let theme = load("tr-theme", "dark");
function load(k, f){ try { const v = JSON.parse(localStorage.getItem(k)); return v==null?f:v; } catch(e){ return f; } }
function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function offlineTranslate(text, from, to){
  const key = text.trim().toLowerCase();
  if (from==="en" && (to==="hi" || to==="bn") && PHRASES[key] && PHRASES[key][to]) return PHRASES[key][to];
  // Reverse: Hindi/Bengali -> English for the same phrases (exact match only)
  if (to==="en" && (from==="hi" || from==="bn")) {
    for (const [en, vals] of Object.entries(PHRASES)) if (vals[from]===text.trim()) return en;
  }
  return null;
}
async function onlineTranslate(text, from, to){
  const ctrl = new AbortController(); const timer = setTimeout(()=>ctrl.abort(), 12000);
  try {
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=" + from + "|" + to;
    const r = await fetch(url, {signal: ctrl.signal});
    clearTimeout(timer);
    if (!r.ok) return null;
    const d = await r.json();
    const out = d.responseData && d.responseData.translatedText;
    if (!out || /MYMEMORY WARNING|QUERY LENGTH LIMIT|NO QUERY SPECIFIED/i.test(out)) return null;
    return out;
  } catch(e){ clearTimeout(timer); return null; }
}
function renderLists(){
  $("favList").textContent = favourites.length ? favourites.join("  •  ") : "No favourites yet.";
  $("historyList").textContent = history.length ? history.slice(-10).reverse().join("  •  ") : "No translations yet.";
}
function speak(text, lang){
  if (!("speechSynthesis" in window)) { alert("Speech is not supported in this browser. Try Chrome on Android."); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_VOICE[lang] || "en-US";
  speechSynthesis.speak(u);
}
async function doTranslate(){
  const text = $("inputText").value.trim();
  if (!text) { $("output").textContent = "Type something first."; return; }
  const from = $("fromLang").value, to = $("toLang").value;
  if (from===to) { $("output").textContent = text; $("sourceNote").textContent = "Same language — no translation needed."; return; }
  $("output").textContent = "Translating…";
  const offline = offlineTranslate(text, from, to);
  let out = null, source = "";
  if (offline) { out = offline; source = "Offline phrase book (exact common phrase) — works without internet."; }
  else {
    out = await onlineTranslate(text, from, to);
    source = out ? "Online — free MyMemory API, no key." : "";
    if (!out && from==="en" && (to==="hi" || to==="bn")) {
      const wb = wordByWord(text, to);
      if (wb !== text) { out = wb; source = "Offline word-by-word backup (MyMemory quota/internet failed) — grammar may not be perfect, but common words are translated."; }
    }
  }
  if (!out) {
    $("output").textContent = "Could not translate this right now — MyMemory free quota may be finished for today, or internet failed. Try a common phrase like 'Good morning' (works offline), or a shorter text.";
    $("sourceNote").textContent = "";
    return;
  }
  $("output").textContent = out;
  $("sourceNote").textContent = source;
  const entry = `${text} → ${out}`;
  history.push(entry); save("tr-history", history); renderLists();
}
$("translateBtn").addEventListener("click", doTranslate);
$("inputText").addEventListener("input", ()=>{ $("charCount").textContent = $("inputText").value.length + " characters"; });
$("swapBtn").addEventListener("click", ()=>{
  const f = $("fromLang").value; $("fromLang").value = $("toLang").value; $("toLang").value = f;
  const t = $("inputText").value, o = $("output").textContent;
  if (o && !o.startsWith("Translation") && !o.startsWith("Translating") && !o.startsWith("Could")) { $("inputText").value = o; $("output").textContent = t; }
});
$("clearBtn").addEventListener("click", ()=>{ $("inputText").value=""; $("output").textContent="Translation will appear here."; $("sourceNote").textContent=""; $("charCount").textContent="0 characters"; });
$("copyBtn").addEventListener("click", async ()=>{ const t=$("output").textContent; if (t && !t.startsWith("Translation")) { try { await navigator.clipboard.writeText(t); } catch(e){} } });
$("shareBtn").addEventListener("click", async ()=>{ const t=$("output").textContent; if (t && !t.startsWith("Translation")) { try { if (navigator.share) await navigator.share({text:t}); else await navigator.clipboard.writeText(t); } catch(e){} } });
$("speakInputBtn").addEventListener("click", ()=>speak($("inputText").value, $("fromLang").value));
$("speakOutputBtn").addEventListener("click", ()=>speak($("output").textContent, $("toLang").value));
$("favBtn").addEventListener("click", ()=>{
  const t = $("output").textContent;
  if (!t || t.startsWith("Translation") || t.startsWith("Could")) return;
  const entry = `${$("inputText").value} → ${t}`;
  if (!favourites.includes(entry)) { favourites.push(entry); save("tr-fav", favourites); renderLists(); }
});
document.querySelectorAll("[data-example]").forEach(b=>b.addEventListener("click", ()=>{ $("inputText").value=b.dataset.example; $("charCount").textContent = b.dataset.example.length + " characters"; doTranslate(); }));
function applyTheme(){ document.body.classList.toggle("light", theme==="light"); $("themeBtn").textContent = theme==="light" ? "☀️" : "🌙"; }
$("themeBtn").addEventListener("click", ()=>{ theme = theme==="light" ? "dark" : "light"; save("tr-theme", theme); applyTheme(); });
applyTheme(); renderLists();
