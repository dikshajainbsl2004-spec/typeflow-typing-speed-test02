const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const passages = {
  easy: [
    "Small steps create strong habits. Type with calm hands and keep your eyes on the words ahead.",
    "Practice makes typing easier. Keep your fingers relaxed and let accuracy guide your speed.",
    "A clear mind helps you type better. Breathe, keep a steady rhythm, and enjoy the process."
  ],
  medium: [
    "Technology changes quickly, but thoughtful practice remains a reliable way to build useful skills.",
    "Good communication is more than speed. Clear words, careful attention, and consistent practice matter.",
    "Every keyboard has a rhythm. When your fingers learn common patterns, typing becomes faster and more natural."
  ],
  hard: [
    "Reliable software is built through deliberate decisions, careful testing, readable code, and continuous improvement.",
    "Curiosity turns difficult problems into learning opportunities when you experiment, measure results, and refine your approach.",
    "Modern applications connect people, data, and services; strong digital habits help us work with technology responsibly."
  ],
  code: [
    "const score = Math.round((correct / 5) / minutes); if (score > best) saveResult(score);",
    "function greet(user) { return `Hello, ${user}!`; } console.log(greet('TypeFlow'));",
    "for (let i = 0; i < 5; i++) { total += i; } const average = total / 5;"
  ]
};

let currentUser = null, test = null, timerId = null, challengeMode = false;

function users(){ return JSON.parse(localStorage.getItem("typeflow_users") || "{}"); }
function saveUsers(u){ localStorage.setItem("typeflow_users", JSON.stringify(u)); }
function userKey(){ return "typeflow_data_" + currentUser.id; }
function data(){ return JSON.parse(localStorage.getItem(userKey()) || '{"history":[],"streak":0,"lastDate":null,"theme":"light","challenge":null}'); }
function saveData(d){ localStorage.setItem(userKey(), JSON.stringify(d)); }

function toast(msg){
  const el=$("#toast"); el.textContent=msg; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2200);
}

function login(user){
  currentUser=user; sessionStorage.setItem("typeflow_current", user.id);
  $("#authScreen").classList.add("hidden"); $("#appScreen").classList.remove("hidden");
  $("#navUser").textContent=user.name; applyTheme(); refreshDashboard(); showPage("dashboard");
}
function logout(){ sessionStorage.removeItem("typeflow_current"); currentUser=null; location.reload(); }

function initAuth(){
  $$(".tab").forEach(t=>t.onclick=()=>{
    $$(".tab").forEach(x=>x.classList.remove("active")); t.classList.add("active");
    const login=t.dataset.auth==="login"; $("#loginForm").classList.toggle("hidden",!login); $("#registerForm").classList.toggle("hidden",login);
  });
  $("#registerForm").onsubmit=e=>{
    e.preventDefault(); const u=users(), id=$("#registerId").value.trim().toLowerCase();
    if(u[id]) return toast("That User ID already exists.");
    u[id]={id,name:$("#registerName").value.trim(),password:$("#registerPassword").value};
    saveUsers(u); toast("User ID created. You can log in now.");
    document.querySelector('[data-auth="login"]').click(); $("#loginId").value=id;
  };
  $("#loginForm").onsubmit=e=>{
    e.preventDefault(); const u=users(), id=$("#loginId").value.trim().toLowerCase();
    if(!u[id] || u[id].password!==$("#loginPassword").value) return toast("Incorrect User ID or password.");
    login(u[id]);
  };
}

function showPage(page){
  $$(".page").forEach(p=>p.classList.add("hidden")); $(`#${page}Page`).classList.remove("hidden");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  if(page==="history") renderHistory(); if(page==="achievements") renderAchievements(); if(page==="dashboard") refreshDashboard();
}
function navInit(){ $$(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page)); $("#startFromDash").onclick=()=>showPage("test"); $("#challengeBtn").onclick=()=>{challengeMode=true; $("#durationSelect").value=60; $("#difficultySelect").value="medium"; showPage("test"); startTest();}; }

function makeText(){
  const pool=passages[$("#difficultySelect").value]; return Array.from({length:5},()=>pool[Math.floor(Math.random()*pool.length)]).join(" ");
}
function renderText(text){
  const display = $("#textDisplay");
  display.innerHTML = "";

  [...text].forEach((c, i) => {
    const span = document.createElement("span");

    span.dataset.i = i;

    // Keep normal spaces so browser can wrap text
    span.textContent = c;

    display.appendChild(span);
  });
}
function updateDisplay(){
  if(!test) return;
  const typed=$("#typingInput").value, spans=$$("#textDisplay span");
  spans.forEach((s,i)=>{
    s.className=i<typed.length?(typed[i]===test.text[i]?"correct":"incorrect"):"";
    if(i===typed.length) s.classList.add("current");
  });
}
function startTest(){
  clearInterval(timerId); challengeMode=false;
  test={text:makeText(),duration:+$("#durationSelect").value,start:Date.now(),finished:false};
  $("#resultPanel").classList.add("hidden"); renderText(test.text);
  $("#typingInput").value=""; $("#typingInput").disabled=false; $("#typingInput").focus();
  $("#timer").textContent=test.duration; $("#testStatus").textContent="Type the highlighted text. Your timer starts now.";
  $("#startBtn").disabled=true;
  timerId=setInterval(tick,250);
}
function tick(){
  if(!test) return; const elapsed=(Date.now()-test.start)/1000, left=Math.max(0,test.duration-elapsed);
  const typed=$("#typingInput").value, correct=[...typed].filter((c,i)=>c===test.text[i]).length;
  const acc=typed.length?Math.round(correct/typed.length*100):100;
  const wpm=Math.max(0,Math.round((correct/5)/(Math.max(elapsed,.1)/60)));
  $("#timer").textContent=Math.ceil(left); $("#liveWpm").textContent=wpm; $("#liveAcc").textContent=acc+"%";
  $("#liveErrors").textContent=Math.max(0,typed.length-correct); updateDisplay();
  if(left<=0) finishTest();
}
function finishTest(){
  if(!test || test.finished)return; test.finished=true; clearInterval(timerId);
  const typed=$("#typingInput").value, correct=[...typed].filter((c,i)=>c===test.text[i]).length;
  const errors=Math.max(0,typed.length-correct), minutes=test.duration/60;
  const wpm=Math.max(0,Math.round((correct/5)/minutes)), acc=typed.length?Math.round(correct/typed.length*100):0;
  const d=data(), item={date:new Date().toISOString(),wpm,acc,errors,chars:typed.length,duration:test.duration,mode:$("#difficultySelect").value};
  d.history.push(item); d.history=d.history.slice(-100);
  updateStreak(d); saveData(d);
  $("#typingInput").disabled=true; $("#startBtn").disabled=false;
  $("#resultWpm").textContent=wpm; $("#resultAcc").textContent=acc+"%"; $("#resultErrors").textContent=errors; $("#resultCorrect").textContent=correct; $("#resultChars").textContent=typed.length;
  $("#resultTitle").textContent=wpm>=60?"Excellent run!":wpm>=40?"Strong run!":"Good practice run!";
  $("#resultMessage").textContent=acc>=95?"Great control — now work on speed.":errors>5?"Try slowing down slightly and focus on clean keystrokes.":"Keep the rhythm steady and repeat.";
  $("#resultPanel").classList.remove("hidden");
  challengeMode=false; refreshDashboard();
}
function updateStreak(d){
  const today=new Date().toISOString().slice(0,10), last=d.lastDate;
  if(last!==today){ const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10); d.streak=last===yesterday?d.streak+1:1; d.lastDate=today; }
}
function restart(){ clearInterval(timerId); $("#startBtn").disabled=false; $("#typingInput").disabled=true; $("#resultPanel").classList.add("hidden"); $("#testStatus").textContent="Ready when you are."; $("#textDisplay").textContent="Press Start, then type the highlighted text here."; $("#timer").textContent=$("#durationSelect").value; $("#liveWpm").textContent=0; $("#liveAcc").textContent="100%"; $("#liveErrors").textContent=0; test=null; }
function refreshDashboard(){
  if(!currentUser)return; const d=data(), h=d.history;
  $("#bestWpm").textContent=h.length?Math.max(...h.map(x=>x.wpm)):0;
  $("#bestAcc").textContent=(h.length?Math.max(...h.map(x=>x.acc)):0)+"%"; $("#testCount").textContent=h.length;
  $("#totalTime").textContent=Math.round(h.reduce((a,x)=>a+x.duration,0)/60)+"m"; $("#heroStreak").textContent=(d.streak||0)+" day streak";
  const challengeDone=h.some(x=>x.date.slice(0,10)===new Date().toISOString().slice(0,10)&&x.duration===60&&x.acc>=95);
  $("#challengeProgress").style.width=challengeDone?"100%":"0%"; $("#challengeBadge").textContent=challengeDone?"DONE":"READY";
  drawTrend(h.slice(-7));
  const tips=["Relax your shoulders and wrists.","Look slightly ahead of the character you are typing.","Accuracy is more useful than rushing into a higher WPM.","Use the same finger for the same key until the movement becomes automatic."];
  $("#smartTip").textContent=tips[h.length%tips.length];
}
function drawTrend(h){
  const c=$("#trendChart"),ctx=c.getContext("2d"),w=c.width=c.clientWidth*2,hgt=c.height=c.clientHeight*2; ctx.clearRect(0,0,w,hgt);
  if(!h.length){ctx.font="28px DM Sans";ctx.fillStyle="#8a94a8";ctx.fillText("Complete a test to see your trend.",20,75);return}
  const max=Math.max(...h.map(x=>x.wpm),1), pad=24; ctx.beginPath();
  h.forEach((x,i)=>{const xx=pad+i*((w-pad*2)/Math.max(h.length-1,1)),yy=hgt-pad-(x.wpm/max)*(hgt-pad*2); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.strokeStyle="#5b5cf0";ctx.lineWidth=5;ctx.stroke();
}
function renderHistory(){
  const h=data().history.slice().reverse(), body=$("#historyBody"); body.innerHTML=h.length?h.map(x=>`<tr><td>${new Date(x.date).toLocaleString()}</td><td>${x.mode}</td><td><b>${x.wpm}</b></td><td>${x.acc}%</td><td>${x.errors}</td><td>${x.duration}s</td></tr>`).join(""):`<tr><td colspan="6">No tests yet. Start your first run from Typing Lab.</td></tr>`;
}
const achievements=[
  ["⚡","First Keys","Complete your first typing test.",d=>d.history.length>=1],
  ["🎯","Clean Hands","Reach 98% accuracy in a test.",d=>d.history.some(x=>x.acc>=98)],
  ["🚀","40 Club","Reach 40 WPM.",d=>d.history.some(x=>x.wpm>=40)],
  ["🔥","Speed Runner","Reach 60 WPM.",d=>d.history.some(x=>x.wpm>=60)],
  ["🏆","100 WPM","Reach 100 WPM.",d=>d.history.some(x=>x.wpm>=100)],
  ["📚","Regular","Complete 10 tests.",d=>d.history.length>=10],
  ["⏱️","Time Builder","Practice for 10 minutes total.",d=>d.history.reduce((a,x)=>a+x.duration,0)>=600],
  ["🌟","Streak","Practice on 3 consecutive days.",d=>d.streak>=3],
  ["💻","Code Mode","Complete a Code Mix test.",d=>d.history.some(x=>x.mode==="code")]
];
function renderAchievements(){
  const d=data(); $("#achievementGrid").innerHTML=achievements.map(a=>`<article class="achievement ${a[3](d)?"unlocked":""}"><div class="icon">${a[0]}</div><h3>${a[1]}</h3><p>${a[2]}</p></article>`).join("");
}
function applyTheme(){const d=data();document.body.classList.toggle("dark",d.theme==="dark")}
function toggleTheme(){const d=data();d.theme=d.theme==="dark"?"light":"dark";saveData(d);applyTheme()}
function initTest(){
  $("#startBtn").onclick=startTest; $("#restartBtn").onclick=restart; $("#againBtn").onclick=startTest;
  $("#typingInput").addEventListener("input",()=>{if(test&&!test.finished)updateDisplay()});
  $("#shareBtn").onclick=async()=>{const text=`My TypeFlow result: ${$("#resultWpm").textContent} WPM • ${$("#resultAcc").textContent} accuracy`;try{await navigator.clipboard.writeText(text);toast("Result copied!")}catch{toast(text)}};
  $("#soundToggle").onchange=()=>{}; $("#focusToggle").onchange=e=>document.body.classList.toggle("focus-mode",e.target.checked);
}
function init(){
  initAuth();navInit();initTest();$("#logoutBtn").onclick=logout;$("#themeBtn").onclick=toggleTheme;
  $("#clearHistory").onclick=()=>{if(confirm("Delete all your test history?")){const d=data();d.history=[];saveData(d);renderHistory();refreshDashboard();toast("History cleared.")}};
  const saved=sessionStorage.getItem("typeflow_current"),u=users(); if(saved&&u[saved])login(u[saved]);
}
init();
