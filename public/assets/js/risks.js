
// سكربت إدارة المخاطر: ربط الإدخال بالسجل العام والخاص + ديناميكية + نوافذ منبثقة

// مصفوفة المخاطر (من / إلى LocalStorage)
let risks = [];

// خريطة الفئات الرئيسية / الفرعية / المسببات
const riskCategories = {
  "سلامة عامة": {
    "معدات": ["تعطل معدة", "تسريب", "اهتزاز", "عدم صيانة"],
    "كهرباء": ["تماس كهربائي", "تحميل زائد", "كابل مكشوف"],
    "سلوكيات غير آمنة": ["عدم استخدام معدات الوقاية", "تشغيل خاطئ"]
  },
  "بيئة": {
    "تسربات": ["تسرب مواد كيميائية", "تسرب زيوت", "تسرب غازات"],
    "نفايات": ["سوء تخزين النفايات", "خلط مواد خطرة وغير خطرة"]
  },
  "تشغيل": {
    "إجراءات": ["عدم اتباع إجراءات العمل", "غياب تصاريح العمل"],
    "تخطيط": ["نقص أفراد", "عدم توفر معدات كافية"]
  }
};


// هيكل الفروع والإدارات والأقسام والمباني
let ORG_STRUCTURE = {
  "المركز الرئيسي": {
    departments: {
      "الإدارة العامة": ["قسم الأمن", "قسم الجودة"],
      "إدارة تقنية المعلومات": ["قسم الشبكات", "قسم التطوير", "قسم الدعم الفني"],
      "إدارة الصحة والسلامة المهنية": ["قسم السلامة", "قسم البيئة"],
      "إدارة التدريب": ["قسم البرامج التدريبية", "قسم شؤون المتدربين"],
      "إدارة الموارد البشرية": ["قسم شؤون الموظفين", "قسم التدريب والتطوير"]
    },
    buildings: ["مبنى الإدارة", "مبنى التدريب الرئيسي", "مبنى الدعم الفني"]
  },
  "فرع الرياض": {
    departments: {
      "إدارة التدريب": ["قسم البرامج", "قسم شؤون المتدربين"],
      "إدارة التشغيل": ["قسم العمليات", "قسم الخدمات"],
      "إدارة العلاقات العامة": ["قسم التواصل", "قسم الشراكات"]
    },
    buildings: ["مبنى A", "مبنى B"]
  },
  "فرع الشرقية": {
    departments: {
      "إدارة التشغيل": ["قسم العمليات"],
      "إدارة التدريب": ["قسم البرامج"]
    },
    buildings: ["مبنى 1", "مبنى 2"]
  },
  "فرع الجنوب": {
    departments: {
      "إدارة التشغيل": ["قسم العمليات", "قسم الصيانة"],
      "إدارة الخدمات": ["قسم البرامج"]
    },
    buildings: ["مبنى الجنوب الرئيسي"]
  },
  "فرع الغربية": {
    departments: {
      "إدارة التدريب": ["قسم البرامج"],
      "إدارة التشغيل": ["قسم العلاقات"]
    },
    buildings: ["مبنى جدة الإداري"]
  }
};

// محاولة تحميل هيكل مخصص من LocalStorage
try {
  const storedOrg = localStorage.getItem("ohsms_structure");
  if (storedOrg) {
    const parsedOrg = JSON.parse(storedOrg);
    if (parsedOrg && typeof parsedOrg === "object") {
      ORG_STRUCTURE = parsedOrg;
    }
  }
} catch (e) {
  console.warn("تعذر تحميل هيكل الفروع المخصص، سيتم استخدام الهيكل الافتراضي.", e);
}


// دوال مساعدة لتهيئة القوائم المرتبطة بالفرع
function getOrgSelectors() {
  return {
    branch: document.getElementById("branch"),
    department: document.getElementById("department"),
    section: document.getElementById("sectionField"),
    building: document.getElementById("building")
  };
}

function populateBranches() {
  const sels = getOrgSelectors();
  if (!sels.branch) return;
  // لا نلمس الخيارات إن كانت مهيأة في HTML ما عدا التأكد من وجودها
}

function populateDepartments(branchVal) {
  const sels = getOrgSelectors();
  if (!sels.department) return;
  sels.department.innerHTML = "<option value=''>اختر الإدارة</option>";
  sels.section.innerHTML = "<option value=''>اختر القسم</option>";
  if (!branchVal || !ORG_STRUCTURE[branchVal]) return;
  const deps = ORG_STRUCTURE[branchVal].departments || {};
  Object.keys(deps).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    sels.department.appendChild(opt);
  });
}

function populateSections(branchVal, depVal) {
  const sels = getOrgSelectors();
  if (!sels.section) return;
  sels.section.innerHTML = "<option value=''>اختر القسم</option>";
  if (!branchVal || !ORG_STRUCTURE[branchVal]) return;
  const deps = ORG_STRUCTURE[branchVal].departments || {};
  const secs = deps[depVal] || [];
  secs.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sels.section.appendChild(opt);
  });
}

function populateBuildings(branchVal) {
  const sels = getOrgSelectors();
  if (!sels.building) return;
  sels.building.innerHTML = "<option value=''>اختر المبنى</option>";
  if (!branchVal || !ORG_STRUCTURE[branchVal]) return;
  const blds = ORG_STRUCTURE[branchVal].buildings || [];
  blds.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    sels.building.appendChild(opt);
  });
}

function onBranchChange() {
  const sels = getOrgSelectors();
  const branchVal = sels.branch ? sels.branch.value : "";
  populateDepartments(branchVal);
  populateSections(branchVal, "");
  populateBuildings(branchVal);
}

function onDepartmentChange() {
  const sels = getOrgSelectors();
  const branchVal = sels.branch ? sels.branch.value : "";
  const depVal = sels.department ? sels.department.value : "";
  populateSections(branchVal, depVal);
}

// جعل الدوال متاحة عالمياً للاستخدام في HTML عند الحاجة
window.onBranchChange = onBranchChange;
window.onDepartmentChange = onDepartmentChange;

// تحميل البيانات من LocalStorage
function loadRisks() {
  try {
    const saved = localStorage.getItem("ohsms_risks");
    risks = saved ? JSON.parse(saved) : [];
  } catch (e) {
    risks = [];
  }
}

// حفظ البيانات في LocalStorage
function saveRisks() {
  localStorage.setItem("ohsms_risks", JSON.stringify(risks));
}

// حساب التقييم = الشدة × الاحتمالية
function calculateEvaluation(prob, sev) {
  const p = Number(prob) || 0;
  const s = Number(sev) || 0;
  if (!p || !s) return "";
  return p * s;
}

// تحديث الفئات الفرعية حسب الفئة الرئيسية
function updateSubCategories() {
  const mainSelect = document.getElementById("mainRisk");
  const subSelect = document.getElementById("subRisk");
  const causeSelect = document.getElementById("riskCause");

  if (!mainSelect || !subSelect || !causeSelect) return;

  const main = mainSelect.value;
  subSelect.innerHTML = "<option value=''>اختر الفئة الفرعية</option>";
  causeSelect.innerHTML = "<option value=''>اختر مسببات الخطر</option>";

  if (main && riskCategories[main]) {
    Object.keys(riskCategories[main]).forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subSelect.appendChild(opt);
    });
  }
}

// تحديث مسببات الخطر حسب الفئة الفرعية
function updateCauses() {
  const mainSelect = document.getElementById("mainRisk");
  const subSelect = document.getElementById("subRisk");
  const causeSelect = document.getElementById("riskCause");

  if (!mainSelect || !subSelect || !causeSelect) return;

  const main = mainSelect.value;
  const sub = subSelect.value;
  causeSelect.innerHTML = "<option value=''>اختر مسببات الخطر</option>";

  if (main && sub && riskCategories[main] && riskCategories[main][sub]) {
    riskCategories[main][sub].forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      causeSelect.appendChild(opt);
    });
  }
}

// عرض نص طويل في النافذة المنبثقة
function showText(text) {
  const modal = document.getElementById("textModal");
  const p = document.getElementById("modalText");
  if (!modal || !p) return;
  p.textContent = text || "لا يوجد نص";
  modal.style.display = "block";
}

// جعل الدوال متاحة عالمياً
window.showText = showText;
window.updateSubCategories = updateSubCategories;
window.updateCauses = updateCauses;

// بناء خلية تعرض نص طويل كزر "عرض"
function createTextCell(row, text) {
  const td = document.createElement("td");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "link-btn";
  btn.textContent = text ? "عرض" : "-";
  btn.onclick = () => showText(text);
  td.appendChild(btn);
  row.appendChild(td);
}

// إعادة رسم السجل العام
function renderGeneralTable() {
  const tbody = document.querySelector("#generalTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  risks.forEach(risk => {
    const tr = document.createElement("tr");

    // الفئة الرئيسية
    let td = document.createElement("td");
    td.textContent = risk.mainRisk || "-";
    tr.appendChild(td);

    // الفئة الفرعية
    td = document.createElement("td");
    td.textContent = risk.subRisk || "-";
    tr.appendChild(td);

    // مسببات الخطر (modal)
    createTextCell(tr, risk.riskCause);

    // الشدة
    td = document.createElement("td");
    td.textContent = risk.severity || "-";
    tr.appendChild(td);

    // الاحتمالية
    td = document.createElement("td");
    td.textContent = risk.probability || "-";
    tr.appendChild(td);

    // التقييم
    td = document.createElement("td");
    td.textContent = risk.evaluation || "-";
    tr.appendChild(td);

    // المتأثرين (modal)
    createTextCell(tr, risk.affected);

    // الإجراء التصحيحي (modal)
    createTextCell(tr, risk.corrective);

    // الإجراء الوقائي (modal)
    createTextCell(tr, risk.preventive);

    // الإدارة المسؤولة
    td = document.createElement("td");
    td.textContent = risk.responsibleDept || "-";
    tr.appendChild(td);

    // الشخص المسؤول
    td = document.createElement("td");
    td.textContent = risk.authorizedPerson || "-";
    tr.appendChild(td);

    // قناة التواصل
    td = document.createElement("td");
    td.textContent = risk.contact || "-";
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

// إعادة رسم السجل الخاص
function renderPrivateTable() {
  const tbody = document.querySelector("#privateTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  risks.forEach(risk => {
    const tr = document.createElement("tr");

    // وضع بيانات الفرع / الإدارة / القسم / المبنى لاستخدامها في التصفية
    tr.dataset.branch = risk.branch || "";
    tr.dataset.department = risk.department || "";
    tr.dataset.section = risk.sectionField || "";
    tr.dataset.building = risk.building || "";

    // الحقول الحساسة + الكل
    const plainFields = [
      "branch",
      "department",
      "sectionField",
      "building",
      "floor",
      "mainRisk",
      "subRisk"
    ];

    plainFields.forEach(f => {
      const td = document.createElement("td");
      td.textContent = risk[f] || "-";
      tr.appendChild(td);
    });

    // مسببات الخطر (modal)
    createTextCell(tr, risk.riskCause);

    // الشدة
    let td = document.createElement("td");
    td.textContent = risk.severity || "-";
    tr.appendChild(td);

    // الاحتمالية
    td = document.createElement("td");
    td.textContent = risk.probability || "-";
    tr.appendChild(td);

    // التقييم
    td = document.createElement("td");
    td.textContent = risk.evaluation || "-";
    tr.appendChild(td);

    // المتأثرين (modal)
    createTextCell(tr, risk.affected);

    // الإجراء التصحيحي (modal)
    createTextCell(tr, risk.corrective);

    // الإجراء الوقائي (modal)
    createTextCell(tr, risk.preventive);

    // الإدارة المسؤولة
    td = document.createElement("td");
    td.textContent = risk.responsibleDept || "-";
    tr.appendChild(td);

    // الشخص المسؤول
    td = document.createElement("td");
    td.textContent = risk.authorizedPerson || "-";
    tr.appendChild(td);

    // قناة التواصل
    td = document.createElement("td");
    td.textContent = risk.contact || "-";
    tr.appendChild(td);

    // حالة الخطر (Editable فقط من هنا)
    td = document.createElement("td");
    const statusSelect = document.createElement("select");
    const statuses = ["", "جديد", "قيد المعالجة", "مغلق", "خطر متكرر"];
    statuses.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s || "—";
      if (risk.status === s) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.onchange = () => {
      risk.status = statusSelect.value;
      saveRisks();
    };
    td.appendChild(statusSelect);
    tr.appendChild(td);

    // ملاحظات (Editable من هنا فقط)
    td = document.createElement("td");
    const notesBtn = document.createElement("button");
    notesBtn.type = "button";
    notesBtn.className = "link-btn";
    notesBtn.textContent = risk.notes ? "عرض / تعديل" : "إضافة";
    notesBtn.onclick = () => {
      const newNotes = prompt("أدخل الملاحظات على الخطر:", risk.notes || "");
      if (newNotes !== null) {
        risk.notes = newNotes.trim();
        saveRisks();
        renderPrivateTable();
      }
    };
    td.appendChild(notesBtn);
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

// إعادة رسم السجلين
function renderTables() {
  renderGeneralTable();
  renderPrivateTable();
}

// تهيئة التبويبات + الأحداث
document.addEventListener("DOMContentLoaded", function () {
  loadRisks();
  renderTables();

  // التبويبات
  const tabBtns = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      tabBtns.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.add("hidden"));
      btn.classList.add("active");
      document.getElementById(target).classList.remove("hidden");
    });
  });

  const probSelect = document.getElementById("probability");
  const sevSelect = document.getElementById("severity");
  const evalInput = document.getElementById("evaluation");

  function updateEval() {
    const evalVal = calculateEvaluation(probSelect.value, sevSelect.value);
    evalInput.value = evalVal ? evalVal : "";
  }

  if (probSelect && sevSelect && evalInput) {
    probSelect.addEventListener("change", updateEval);
    sevSelect.addEventListener("change", updateEval);
  }

  const saveBtn = document.getElementById("saveRiskBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const branch = document.getElementById("branch").value.trim();
      const department = document.getElementById("department").value.trim();
      const sectionField = document.getElementById("sectionField").value.trim();
      const building = document.getElementById("building").value.trim();
      const floor = document.getElementById("floor").value.trim();
      const mainRisk = document.getElementById("mainRisk").value.trim();
      const subRisk = document.getElementById("subRisk").value.trim();
      const riskCause = document.getElementById("riskCause").value.trim();
      const affected = document.getElementById("affected").value.trim();
      const probability = document.getElementById("probability").value;
      const severity = document.getElementById("severity").value;
      const evaluation = calculateEvaluation(probability, severity);
      const corrective = document.getElementById("corrective").value.trim();
      const preventive = document.getElementById("preventive").value.trim();
      const responsibleDept = document.getElementById("responsibleDept").value.trim();
      const authorizedPerson = document.getElementById("authorizedPerson").value.trim();
      const contact = document.getElementById("contact").value.trim();

      if (!mainRisk || !subRisk || !riskCause) {
        alert("الرجاء إدخال الفئة الرئيسية، الفئة الفرعية، ومسببات الخطر على الأقل.");
        return;
      }

      const newRisk = {
        id: Date.now(),
        branch,
        department,
        sectionField,
        building,
        floor,
        mainRisk,
        subRisk,
        riskCause,
        affected,
        probability,
        severity,
        evaluation,
        corrective,
        preventive,
        responsibleDept,
        authorizedPerson,
        contact,
        status: "جديد",  // يتم تعديلها لاحقًا من السجل الخاص فقط
        notes: ""         // يتم إدخالها من السجل الخاص فقط
      };

      risks.push(newRisk);
      saveRisks();
      renderTables();

      // تفريغ النموذج
      document.getElementById("riskForm").reset();
      evalInput.value = "";
      alert("تم حفظ الخطر في السجل العام والخاص.");
    });
  }
});

function filterPrivateRisks(){
  const b=document.getElementById('fBranch').value;
  const d=document.getElementById('fDept').value;
  const s=document.getElementById('fSection').value;
  const m=document.getElementById('fBuilding').value;
  const risks = getStoredRisks();
  const rows=document.querySelectorAll('#privateTable tbody tr');
  rows.forEach(r=>{
    const rb=r.dataset.branch;
    const rd=r.dataset.department;
    const rs=r.dataset.section;
    const rm=r.dataset.building;
    let show=true;
    if(b && rb!==b) show=false;
    if(d && rd!==d) show=false;
    if(s && rs!==s) show=false;
    if(m && rm!==m) show=false;
    r.style.display=show?'':'none';
  });
}
function resetRiskFilters(){
 document.getElementById('fBranch').value="";
 document.getElementById('fDept').value="";
 document.getElementById('fSection').value="";
 document.getElementById('fBuilding').value="";
 filterPrivateRisks();
}

// تهيئة شريط التصفية في السجل الخاص
function initPrivateRiskFilters(){
  try {
    const structRaw = localStorage.getItem("ohsms_structure");
    let struct = null;
    if(structRaw){
      struct = JSON.parse(structRaw);
    }
    if(!struct || typeof struct !== "object"){
      if (typeof ORG_STRUCTURE !== "undefined") {
        struct = ORG_STRUCTURE;
      } else {
        return;
      }
    }

    const bSel = document.getElementById('fBranch');
    const dSel = document.getElementById('fDept');
    const sSel = document.getElementById('fSection');
    const mSel = document.getElementById('fBuilding');
    if(!bSel || !dSel || !sSel || !mSel) return;

    // تعبئة الفروع
    bSel.innerHTML = '<option value="">كل الفروع</option>';
    Object.keys(struct).forEach(branch => {
      const opt = document.createElement('option');
      opt.value = branch;
      opt.textContent = branch;
      bSel.appendChild(opt);
    });

    // إعادة تعيين البقية
    dSel.innerHTML = '<option value="">كل الإدارات</option>';
    sSel.innerHTML = '<option value="">كل الأقسام</option>';
    mSel.innerHTML = '<option value="">كل المباني</option>';

    // المباني الافتراضية (عند اختيار فرع)
    bSel.addEventListener('change', function(){
      const b = bSel.value;
      dSel.innerHTML = '<option value="">كل الإدارات</option>';
      sSel.innerHTML = '<option value="">كل الأقسام</option>';
      mSel.innerHTML = '<option value="">كل المباني</option>';
      if(b && struct[b]){
        const deps = struct[b].departments || {};
        Object.keys(deps).forEach(d => {
          const opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d;
          dSel.appendChild(opt);
        });
        (struct[b].buildings || []).forEach(bd => {
          const opt = document.createElement('option');
          opt.value = bd;
          opt.textContent = bd;
          mSel.appendChild(opt);
        });
      }
      filterPrivateRisks();
    });

    dSel.addEventListener('change', function(){
      const b = bSel.value;
      const d = dSel.value;
      sSel.innerHTML = '<option value="">كل الأقسام</option>';
      if(b && d && struct[b]){
        const deps = struct[b].departments || {};
        const secs = deps[d] || [];
        secs.forEach(sc => {
          const opt = document.createElement('option');
          opt.value = sc;
          opt.textContent = sc;
          sSel.appendChild(opt);
        });
      }
      filterPrivateRisks();
    });

    sSel.addEventListener('change', filterPrivateRisks);
    mSel.addEventListener('change', filterPrivateRisks);

  } catch(e){
    console.warn('تعذر تهيئة شريط التصفية في السجل الخاص', e);
  }
}

// استدعاء التهيئة بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function(){
  initPrivateRiskFilters();
});
