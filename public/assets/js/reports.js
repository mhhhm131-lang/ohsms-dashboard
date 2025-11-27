
document.addEventListener("DOMContentLoaded", function () {
  function generateReportId(kind) {
    var now = new Date();
    var year = now.getFullYear();
    var prefix = kind === 'secret' ? 'SE' : (kind === 'urgent' ? 'AC' : 'NO');
    var key = 'counter_' + year + '_' + prefix;
    var current = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, String(current));
    var counterStr = String(current).padStart(5, '0');
    return year + '-' + prefix + '-' + counterStr;
  }

  const secretBtn = document.getElementById("openSecret");
  const urgentBtn = document.getElementById("openUrgent");
  const normalBtn = document.getElementById("openNormal");
  const secretForm = document.getElementById("secretForm");
  const urgentLinks = document.getElementById("urgentLinks");
  const normalForm = document.getElementById("normalForm");

  function showBlock(type) {
    if (!secretForm || !urgentLinks || !normalForm) return;
    secretForm.classList.add("hidden");
    urgentLinks.classList.add("hidden");
    normalForm.classList.add("hidden");
    if (type === "secret") secretForm.classList.remove("hidden");
    if (type === "urgent") urgentLinks.classList.remove("hidden");
    if (type === "normal") normalForm.classList.remove("hidden");
  }

  if (secretBtn) secretBtn.onclick = () => showBlock("secret");
  if (urgentBtn) urgentBtn.onclick = () => showBlock("urgent");
  if (normalBtn) normalBtn.onclick = () => showBlock("normal");

  // hash navigation from home page (إذا تم فتح هذه الصفحة مباشرة)
  if (location.hash === "#secret") showBlock("secret");
  if (location.hash === "#urgent") showBlock("urgent");

  const btnSecret = document.getElementById("btnSecret");
  if (btnSecret) btnSecret.onclick = saveSecret;

  const btnNormal = document.getElementById("btnNormal");
  if (btnNormal) btnNormal.onclick = saveNormal;

  function saveSecret() {
    const report = {
      id: generateReportId('secret'),
      type: "سري",
      danger: document.getElementById("s_type").value,
      cause: document.getElementById("s_cause").value,
      damage: document.getElementById("s_damage").value,
      location: document.getElementById("s_branch").value,
      createdAt: new Date().toLocaleString(),
      status: "جديد",
      receivedBySafety: "-"
    };
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    reports.push(report);
    localStorage.setItem("reports", JSON.stringify(reports));
    alert("✔ تم تسجيل البلاغ السري");
    loadReports();
  }

  function saveNormal() {
    const user = localStorage.getItem("loggedUser") || "موظف";
    const report = {
      id: generateReportId('normal'),
      type: "عادي",
      danger: document.getElementById("n_type").value,
      cause: "-",
      damage: "-",
      location: document.getElementById("n_location").value,
      createdAt: new Date().toLocaleString(),
      status: "جديد",
      receivedBySafety: user
    };
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    reports.push(report);
    localStorage.setItem("reports", JSON.stringify(reports));
    alert("✔ تم تسجيل البلاغ العادي");
    loadReports();
  }

  function renderStatus(status) {
    var cls = "status-new";
    if (status === "تحت المعالجة") cls = "status-inprogress";
    if (status === "محال") cls = "status-assigned";
    if (status === "مصعّد") cls = "status-escalated";
    if (status === "مغلق") cls = "status-closed";
    return '<span class="status-pill ' + cls + '">' + status + '</span>';
  }

  
function loadReports(){
 const body=document.querySelector("#reportTable tbody");
 if(!body) return;
 body.innerHTML="";
 const reports=JSON.parse(localStorage.getItem("reports")||"[]");
 reports.forEach((r,index)=>{
   if(!r.status) r.status="جديد";
   const summary = `<div class='summary'>${((r.danger||"")+" "+(r.cause||"")+" "+(r.damage||"")+" "+(r.location||""))}</div>`;
   const tr=document.createElement("tr");
   tr.innerHTML=`
    <td>${r.id||""}</td>
    <td>${r.type||""}</td>
    <td>${summary}</td>
    <td>${r.createdAt||""}</td>
    <td>${r.status||""}</td>
    <td>${r.receivedBySafety||"-"}
      ${r.status==="جديد"?`<button class='btn-receive' data-index='${index}'>استلام</button>`:""}
    </td>`;
   body.appendChild(tr);
 });
}
loadReports();
});


function closeReport(index){
  const reports=JSON.parse(localStorage.getItem("reports")||"[]");
  const r=reports[index];
  r.status="مغلق";
  r.closedAt=new Date().toLocaleString();
  localStorage.setItem("reports",JSON.stringify(reports));
  loadReports();
}


// Search filter
document.addEventListener("DOMContentLoaded",()=>{
  const s=document.getElementById("searchInput");
  if(s){
    s.addEventListener("input",()=>{
      const val=s.value.trim();
      const reps=JSON.parse(localStorage.getItem("reports")||"[]");
      const filtered=reps.filter(r=>{
        return (r.id||"").includes(val) ||
               (r.danger||"").includes(val) ||
               (r.location||"").includes(val);
      });
      renderFiltered(filtered);
    });
  }
});

function renderFiltered(list){
  const body=document.querySelector("#reportTable tbody");
  if(!body) return;
  body.innerHTML="";
  list.forEach((r,index)=>{
    const summary = `<div class='summary'>${(r.danger||"")+" "+(r.location||"")}</div>`;
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${r.id||""}</td>
      <td>${r.type||""}</td>
      <td>${summary}</td>
      <td>${r.createdAt||""}</td>
      <td>${r.status||""}</td>
      <td>${r.receivedBySafety||"-"}</td>
    `;
    body.appendChild(tr);
  });
}
