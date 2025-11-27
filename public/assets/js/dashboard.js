
document.addEventListener("DOMContentLoaded", function () {
  function getRisks() {
    try {
      return JSON.parse(localStorage.getItem("ohsms_risks") || "[]");
    } catch (e) {
      return [];
    }
  }

  function getReports() {
    try {
      return JSON.parse(localStorage.getItem("reports") || "[]");
    } catch (e) {
      return [];
    }
  }

  // هيكل افتراضي للفروع والإدارات والأقسام والمباني (نفسه في الصفحات الأخرى)
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
      if (!raw) return DEFAULT_ORG_STRUCTURE;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
      return DEFAULT_ORG_STRUCTURE;
    } catch (e) {
      console.warn("تعذر قراءة هيكل الفروع للوحة التحكم، سيتم استخدام الافتراضي.", e);
      return DEFAULT_ORG_STRUCTURE;
    }
  }

  const ORG_STRUCT = loadOrgStructure();

  function initDashboardFilters() {
    const bSel = document.getElementById("dashBranchFilter");
    const dSel = document.getElementById("dashDeptFilter");
    const sSel = document.getElementById("dashSectionFilter");
    const mSel = document.getElementById("dashBuildingFilter");
    if (!bSel || !dSel || !sSel || !mSel) return;

    // الفروع
    bSel.innerHTML = '<option value="">كل الفروع</option>';
    Object.keys(ORG_STRUCT).forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      bSel.appendChild(opt);
    });

    // باقي الحقول الفارغة
    dSel.innerHTML = '<option value="">كل الإدارات</option>';
    sSel.innerHTML = '<option value="">كل الأقسام</option>';
    mSel.innerHTML = '<option value="">كل المباني</option>';

    bSel.addEventListener("change", function () {
      const branch = bSel.value;
      dSel.innerHTML = '<option value="">كل الإدارات</option>';
      sSel.innerHTML = '<option value="">كل الأقسام</option>';
      mSel.innerHTML = '<option value="">كل المباني</option>';
      if (branch && ORG_STRUCT[branch]) {
        const deps = ORG_STRUCT[branch].departments || {};
        Object.keys(deps).forEach((d) => {
          const opt = document.createElement("option");
          opt.value = d;
          opt.textContent = d;
          dSel.appendChild(opt);
        });
        (ORG_STRUCT[branch].buildings || []).forEach((bd) => {
          const opt = document.createElement("option");
          opt.value = bd;
          opt.textContent = bd;
          mSel.appendChild(opt);
        });
      }
      refreshDashboard();
    });

    dSel.addEventListener("change", function () {
      const branch = bSel.value;
      const dep = dSel.value;
      sSel.innerHTML = '<option value="">كل الأقسام</option>';
      if (branch && dep && ORG_STRUCT[branch]) {
        const deps = ORG_STRUCT[branch].departments || {};
        const secs = deps[dep] || [];
        secs.forEach((sc) => {
          const opt = document.createElement("option");
          opt.value = sc;
          opt.textContent = sc;
          sSel.appendChild(opt);
        });
      }
      refreshDashboard();
    });

    sSel.addEventListener("change", refreshDashboard);
    mSel.addEventListener("change", refreshDashboard);
  }

  window.resetDashboardFilters = function () {
    const bSel = document.getElementById("dashBranchFilter");
    const dSel = document.getElementById("dashDeptFilter");
    const sSel = document.getElementById("dashSectionFilter");
    const mSel = document.getElementById("dashBuildingFilter");
    if (!bSel || !dSel || !sSel || !mSel) return;
    bSel.value = "";
    dSel.innerHTML = '<option value="">كل الإدارات</option>';
    sSel.innerHTML = '<option value="">كل الأقسام</option>';
    mSel.innerHTML = '<option value="">كل المباني</option>';
    refreshDashboard();
  };

  function getCurrentFilter() {
    const bSel = document.getElementById("dashBranchFilter");
    const dSel = document.getElementById("dashDeptFilter");
    const sSel = document.getElementById("dashSectionFilter");
    const mSel = document.getElementById("dashBuildingFilter");
    return {
      branch: bSel ? bSel.value : "",
      dept: dSel ? dSel.value : "",
      section: sSel ? sSel.value : "",
      building: mSel ? mSel.value : ""
    };
  }

  function filterRisks(allRisks, f) {
    return allRisks.filter((r) => {
      if (f.branch && r.branch !== f.branch) return false;
      if (f.dept && r.department !== f.dept) return false;
      if (f.section && r.sectionField !== f.section) return false;
      if (f.building && r.building !== f.building) return false;
      return true;
    });
  }

  function filterReports(allReports, f) {
    return allReports.filter((r) => {
      if (f.branch && r.branch !== f.branch) return false;
      if (f.dept && r.orgDepartment !== f.dept) return false;
      if (f.section && r.section !== f.section) return false;
      if (f.building && r.building !== f.building) return false;
      return true;
    });
  }

  let reportsByMonthChart = null;
  let reportTypesChart = null;
  let riskLevelsChart = null;
  let reportStatusChart = null;

  function updateKPIs() {
    const allRisks = getRisks();
    const allReports = getReports();
    const f = getCurrentFilter();

    const risks = filterRisks(allRisks, f);
    const reports = filterReports(allReports, f);

    const totalRisksEl = document.getElementById("totalRisks");
    const highRisksEl = document.getElementById("highRisks");
    const totalReportsEl = document.getElementById("totalReports");
    const totalDocsEl = document.getElementById("totalDocs");

    if (totalRisksEl) totalRisksEl.textContent = risks.length;

    const high = risks.filter((r) => {
      const ev = Number(r.evaluation || 0);
      if (ev) return ev >= 15;
      const p = Number(r.probability || 0);
      const s = Number(r.severity || 0);
      return p && s && p * s >= 15;
    }).length;
    if (highRisksEl) highRisksEl.textContent = high;

    if (totalReportsEl) totalReportsEl.textContent = reports.length;

    if (totalDocsEl) totalDocsEl.textContent = 0;
  }

  function buildCharts() {
    if (typeof Chart === "undefined") {
      return;
    }

    const allRisks = getRisks();
    const allReports = getReports();
    const f = getCurrentFilter();
    const risks = filterRisks(allRisks, f);
    const reports = filterReports(allReports, f);

    // تدمير الرسوم القديمة إن وجدت
    if (reportsByMonthChart) reportsByMonthChart.destroy();
    if (reportTypesChart) reportTypesChart.destroy();
    if (riskLevelsChart) riskLevelsChart.destroy();
    if (reportStatusChart) reportStatusChart.destroy();

    // 1) البلاغات خلال الأشهر (Line)
    (function () {
      const ctx = document.getElementById("reportsByMonthChart");
      if (!ctx) return;

      const monthLabels = [
        "يناير","فبراير","مارس","أبريل","مايو","يونيو",
        "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
      ];
      const counts = new Array(12).fill(0);

      reports.forEach((r) => {
        let d = null;
        if (r.createdAtISO) {
          d = new Date(r.createdAtISO);
        } else if (r.createdAt) {
          d = new Date(r.createdAt);
        }
        if (d && !isNaN(d.getTime())) {
          const m = d.getMonth();
          counts[m] += 1;
        }
      });

      reportsByMonthChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: "عدد البلاغات",
              data: counts,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    })();

    // 2) أنواع البلاغات (Pie)
    (function () {
      const ctx = document.getElementById("reportTypesChart");
      if (!ctx) return;

      let urgent = 0, secret = 0, normal = 0, other = 0;
      reports.forEach((r) => {
        if (r.type === "عاجل") urgent++;
        else if (r.type === "سري") secret++;
        else if (r.type === "عادي") normal++;
        else other++;
      });

      reportTypesChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["عاجل", "سري", "عادي", "أخرى"],
          datasets: [
            {
              data: [urgent, secret, normal, other]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    })();

    // 3) مستويات المخاطر (Bar)
    (function () {
      const ctx = document.getElementById("riskLevelsChart");
      if (!ctx) return;

      let low = 0, medium = 0, high = 0, critical = 0;

      risks.forEach((r) => {
        const ev = (function(){
          const v = Number(r.evaluation || 0);
          if (v) return v;
          const p = Number(r.probability || 0);
          const s = Number(r.severity || 0);
          return p && s ? p * s : 0;
        })();

        if (!ev) return;
        if (ev <= 4) low++;
        else if (ev <= 9) medium++;
        else if (ev <= 14) high++;
        else critical++;
      });

      riskLevelsChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["منخفض", "متوسط", "عالٍ", "حرج"],
          datasets: [
            {
              label: "عدد المخاطر",
              data: [low, medium, high, critical]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    })();

    // 4) حالة معالجة البلاغات (Doughnut)
    (function () {
      const ctx = document.getElementById("reportStatusChart");
      if (!ctx) return;

      let newCount = 0, inProgress = 0, closed = 0, other = 0;

      reports.forEach((r) => {
        const st = (r.status || "").trim();
        if (st === "جديد") newCount++;
        else if (st === "جاري" || st === "قيد المعالجة") inProgress++;
        else if (st === "مغلق") closed++;
        else other++;
      });

      reportStatusChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["جديد", "قيد المعالجة", "مغلق", "أخرى"],
          datasets: [
            {
              data: [newCount, inProgress, closed, other]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    })();
  }

  function refreshDashboard() {
    updateKPIs();
    buildCharts();
  }

  // تهيئة الفلاتر ثم رسم أولي
  initDashboardFilters();
  refreshDashboard();
});
