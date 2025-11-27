
// common.js: theme + active nav
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
    }
  });

  // theme buttons (only exist on admin page)
  const themeButtons = document.querySelectorAll(".theme-btn");
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      if (theme === "dark") {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else if (theme === "light") {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      } else {
        alert("يمكن لاحقاً إضافة إعداد ألوان مخصصة.");
      }
    });
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});


// update new reports count
document.addEventListener("DOMContentLoaded",()=>{
  const badge=document.getElementById("newReportsCount");
  if(badge){
    const reps=JSON.parse(localStorage.getItem("reports")||"[]");
    const count=reps.filter(r=>r.status==="جديد").length;
    badge.textContent = count>0 ? count : "";
  }
});
