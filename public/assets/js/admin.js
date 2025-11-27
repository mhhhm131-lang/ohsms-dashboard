
function loadHomeContent() {
  document.getElementById("homePolicy").value = localStorage.getItem("home_policy") || "";
  document.getElementById("homeGoals").value = localStorage.getItem("home_goals") || "";
  document.getElementById("homeScope").value = localStorage.getItem("home_scope") || "";
}
function saveHomeContent() {
  localStorage.setItem("home_policy",document.getElementById("homePolicy").value);
  localStorage.setItem("home_goals",document.getElementById("homeGoals").value);
  localStorage.setItem("home_scope",document.getElementById("homeScope").value);
  alert("تم حفظ المحتوى بنجاح.");
}
function resetHomeContent() {
  if (!confirm("هل تريد استرجاع الإعدادات الافتراضية؟")) return;
  localStorage.removeItem("home_policy");
  localStorage.removeItem("home_goals");
  localStorage.removeItem("home_scope");
  loadHomeContent();
}
document.addEventListener("DOMContentLoaded", function(){
  loadHomeContent();
  initOrgAdmin();
});


// ===== إدارة الهيكل التنظيمي (فروع / إدارات / أقسام / مباني) =====

// الهيكل الافتراضي (نفسه المستخدم في صفحة المخاطر)
const DEFAULT_ORG_STRUCTURE = {
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
      "إدارة التشغيل": ["قسم العمليات"],
      "إدارة الخدمات": ["قسم الصيانة"]
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

function loadOrgStructure() {
  try {
    const raw = localStorage.getItem("ohsms_structure");
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_ORG_STRUCTURE));
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return JSON.parse(JSON.stringify(DEFAULT_ORG_STRUCTURE));
  } catch (e) {
    console.warn("تعذر قراءة هيكل الفروع، سيتم استخدام الافتراضي.", e);
    return JSON.parse(JSON.stringify(DEFAULT_ORG_STRUCTURE));
  }
}

function saveOrgStructure(struct) {
  localStorage.setItem("ohsms_structure", JSON.stringify(struct));
}

// عناصر واجهة إدارة الهيكل
let ORG_STRUCT_STATE = null;

function initOrgAdmin() {
  ORG_STRUCT_STATE = loadOrgStructure();

  const branchSel = document.getElementById("orgBranchSelect");
  if (!branchSel) return; // لم يتم تفعيل الواجهة بعد

  branchSel.innerHTML = "";
  Object.keys(ORG_STRUCT_STATE).forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    branchSel.appendChild(opt);
  });

  if (branchSel.options.length > 0) {
    branchSel.selectedIndex = 0;
    onAdminBranchChange();
  }
}

function onAdminBranchChange() {
  const branchSel = document.getElementById("orgBranchSelect");
  if (!branchSel || !ORG_STRUCT_STATE) return;
  const branch = branchSel.value;
  const depSel = document.getElementById("orgDepartmentSelect");
  const depList = document.getElementById("orgDepartmentsList");
  const secList = document.getElementById("orgSectionsList");
  const bldList = document.getElementById("orgBuildingsList");

  if (!ORG_STRUCT_STATE[branch]) return;

  // إدارة الإدارات
  const deps = ORG_STRUCT_STATE[branch].departments || {};
  if (depSel) {
    depSel.innerHTML = "";
    Object.keys(deps).forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      depSel.appendChild(opt);
    });
  }

  if (depList) {
    depList.innerHTML = "";
    Object.keys(deps).forEach((d) => {
      const li = document.createElement("li");
      li.textContent = d;
      const btn = document.createElement("button");
      btn.textContent = "حذف";
      btn.onclick = function () {
        if (confirm("هل تريد حذف هذه الإدارة والأقسام التابعة لها؟")) {
          delete ORG_STRUCT_STATE[branch].departments[d];
          saveOrgStructure(ORG_STRUCT_STATE);
          onAdminBranchChange();
        }
      };
      li.appendChild(document.createTextNode(" "));
      li.appendChild(btn);
      depList.appendChild(li);
    });
  }

  // الأقسام للإدارة المحددة
  onAdminDepartmentChange();

  // المباني
  if (bldList) {
    bldList.innerHTML = "";
    (ORG_STRUCT_STATE[branch].buildings || []).forEach((b, idx) => {
      const li = document.createElement("li");
      li.textContent = b;
      const btn = document.createElement("button");
      btn.textContent = "حذف";
      btn.onclick = function () {
        if (confirm("هل تريد حذف هذا المبنى؟")) {
          ORG_STRUCT_STATE[branch].buildings.splice(idx, 1);
          saveOrgStructure(ORG_STRUCT_STATE);
          onAdminBranchChange();
        }
      };
      li.appendChild(document.createTextNode(" "));
      li.appendChild(btn);
      bldList.appendChild(li);
    });
  }
}

function onAdminDepartmentChange() {
  const branchSel = document.getElementById("orgBranchSelect");
  const depSel = document.getElementById("orgDepartmentSelect");
  const secList = document.getElementById("orgSectionsList");
  if (!branchSel || !depSel || !secList || !ORG_STRUCT_STATE) return;
  const branch = branchSel.value;
  const dep = depSel.value;
  secList.innerHTML = "";
  if (!branch || !dep || !ORG_STRUCT_STATE[branch]) return;
  const deps = ORG_STRUCT_STATE[branch].departments || {};
  const secs = deps[dep] || [];
  secs.forEach((s, idx) => {
    const li = document.createElement("li");
    li.textContent = s;
    const btn = document.createElement("button");
    btn.textContent = "حذف";
    btn.onclick = function () {
      if (confirm("هل تريد حذف هذا القسم؟")) {
        ORG_STRUCT_STATE[branch].departments[dep].splice(idx, 1);
        saveOrgStructure(ORG_STRUCT_STATE);
        onAdminDepartmentChange();
      }
    };
    li.appendChild(document.createTextNode(" "));
    li.appendChild(btn);
    secList.appendChild(li);
  });
}

function addDepartment() {
  const branchSel = document.getElementById("orgBranchSelect");
  const input = document.getElementById("newDepartmentName");
  if (!branchSel || !input || !ORG_STRUCT_STATE) return;
  const branch = branchSel.value;
  const name = (input.value || "").trim();
  if (!name) {
    alert("رجاءً أدخل اسم الإدارة.");
    return;
  }
  if (!ORG_STRUCT_STATE[branch].departments) ORG_STRUCT_STATE[branch].departments = {};
  if (!ORG_STRUCT_STATE[branch].departments[name]) {
    ORG_STRUCT_STATE[branch].departments[name] = [];
    saveOrgStructure(ORG_STRUCT_STATE);
    input.value = "";
    onAdminBranchChange();
  } else {
    alert("هذه الإدارة موجودة بالفعل.");
  }
}

function addSection() {
  const branchSel = document.getElementById("orgBranchSelect");
  const depSel = document.getElementById("orgDepartmentSelect");
  const input = document.getElementById("newSectionName");
  if (!branchSel || !depSel || !input || !ORG_STRUCT_STATE) return;
  const branch = branchSel.value;
  const dep = depSel.value;
  const name = (input.value || "").trim();
  if (!branch || !dep) {
    alert("رجاءً اختر الفرع والإدارة أولاً.");
    return;
  }
  if (!name) {
    alert("رجاءً أدخل اسم القسم.");
    return;
  }
  if (!ORG_STRUCT_STATE[branch].departments[dep]) ORG_STRUCT_STATE[branch].departments[dep] = [];
  if (!ORG_STRUCT_STATE[branch].departments[dep].includes(name)) {
    ORG_STRUCT_STATE[branch].departments[dep].push(name);
    saveOrgStructure(ORG_STRUCT_STATE);
    input.value = "";
    onAdminDepartmentChange();
  } else {
    alert("هذا القسم موجود بالفعل.");
  }
}

function addBuilding() {
  const branchSel = document.getElementById("orgBranchSelect");
  const input = document.getElementById("newBuildingName");
  if (!branchSel || !input || !ORG_STRUCT_STATE) return;
  const branch = branchSel.value;
  const name = (input.value || "").trim();
  if (!name) {
    alert("رجاءً أدخل اسم المبنى.");
    return;
  }
  if (!ORG_STRUCT_STATE[branch].buildings) ORG_STRUCT_STATE[branch].buildings = [];
  if (!ORG_STRUCT_STATE[branch].buildings.includes(name)) {
    ORG_STRUCT_STATE[branch].buildings.push(name);
    saveOrgStructure(ORG_STRUCT_STATE);
    input.value = "";
    onAdminBranchChange();
  } else {
    alert("هذا المبنى موجود بالفعل.");
  }
}

// مهيّأ بحيث يمكنك لاحقاً تقييد الوصول حسب صلاحيات منسق الفرع

