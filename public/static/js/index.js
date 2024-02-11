document.querySelectorAll("[tabindex]").forEach((el) => {
  el.onkeyup = (evt) => {
    if (evt.key === "Enter" && evt.target === el) el.click();
  };
});

const projectsToggle = document.getElementById("projects-toggle");
projectsToggle.oninput = () => {
  const allProjects = document.querySelectorAll("#project-container .project");
  const firstY = allProjects[0].getBoundingClientRect().y;

  allProjects.forEach((el) =>
    !projectsToggle.checked && firstY !== el.getBoundingClientRect().y
      ? el.removeAttribute("tabindex")
      : el.setAttribute("tabindex", "0")
  );
};

(window.onresize = function () {
  document.querySelector("#project-container").style.height =
    3 +
    (document
      .querySelector("#project-container .project")
      ?.getBoundingClientRect().height ?? 300) +
    "px";
  projectsToggle.oninput();
})();

document.querySelectorAll("nav ul > li a").forEach((el) => {
  el.onclick = (evt) => {
    document.getElementById("nav-menu-toggle").checked = false;
  };
});

const projectRunBase = "https://eniallator.github.io/";
const projectSrcBase = "https://github.com/eniallator/";

const previewDialog = document.getElementById("project-preview");

previewDialog.onclick = (evt) =>
  evt.target === previewDialog ? previewDialog.close() : null;
previewDialog.onclose = () =>
  document.querySelector("#project-preview iframe").removeAttribute("src");

document.querySelectorAll(".project").forEach((project) => {
  project.onclick = function () {
    document.querySelector("#project-preview h3").innerText =
      this.getElementsByTagName("h2")[0]?.innerText;

    const iframe = document.querySelector("#project-preview iframe");
    iframe.src = `${projectRunBase}${this.getAttribute("data-github")}`;
    iframe.style.background = `url(${
      this.querySelector("img.project-thumbnail").src
    }) no-repeat center/100%`;
    iframe.onload = () => (iframe.style.backgroundImage = "none");

    document.querySelector(
      "#project-preview a.js-preview"
    ).href = `${projectRunBase}${this.getAttribute("data-github")}`;

    document.querySelector(
      "#project-preview a.js-repository"
    ).href = `${projectSrcBase}${this.getAttribute("data-github")}`;
    previewDialog.showModal();
  };
});
