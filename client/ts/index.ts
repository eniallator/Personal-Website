import { getAll, getEl, getId } from "./helpers";

getAll<HTMLDivElement>('[tabindex="0"]').forEach((el) => {
  el.onkeyup = (evt) => {
    if (evt.key === "Enter" && evt.target === el) el.click();
  };
});

getAll<HTMLElement>("nav ul > li a").forEach((el) => {
  el.onclick = () => {
    getId<HTMLInputElement>("nav-menu-toggle").checked = false;
  };
});

const darkThemeEl = getId<HTMLInputElement>("dark-theme");
darkThemeEl.onchange = () => {
  document.cookie = `theme=${darkThemeEl.checked ? "dark" : "light"}`;
};

const projectContainer = getId("project-container");
const allProjects = getAll<HTMLAnchorElement>(".project", projectContainer);

const projectsToggle = getId<HTMLInputElement>("projects-toggle");
projectsToggle.oninput = () => {
  const firstY = allProjects[0]?.getBoundingClientRect().y;

  allProjects.forEach((el) => {
    if (projectsToggle.checked || firstY === el.getBoundingClientRect().y) {
      el.removeAttribute("tabindex");
    } else {
      el.setAttribute("tabindex", "-1");
    }
  });
};

(window.onresize = () => {
  const projHeight = allProjects[0]?.getBoundingClientRect().height ?? 300;
  projectContainer.style.height = `${3 + projHeight}px`;
  (projectsToggle.oninput as () => void)();
})();

const previewDialog = getId<HTMLDialogElement>("project-preview");
const previewIframe = getEl<HTMLIFrameElement>("iframe", previewDialog);
const previewHeading = getEl<HTMLHeadingElement>("h3", previewDialog);
const previewUrl = getEl<HTMLAnchorElement>("a.js-preview", previewDialog);
const repoUrl = getEl<HTMLAnchorElement>("a.js-repository", previewDialog);

previewDialog.onclick = (evt) => {
  if (evt.target === previewDialog) previewDialog.close();
};

previewDialog.onclose = () => {
  previewIframe.removeAttribute("src");
};

previewIframe.onload = () => {
  previewIframe.style.backgroundImage = "none";
};

allProjects.forEach((el) => {
  el.onclick = () => {
    const github = el.getAttribute("data-github");

    repoUrl.href = `https://github.com/eniallator/${github}`;
    previewUrl.href = `https://eniallator.github.io/${github}`;
    previewIframe.style.background = `url(${
      getEl<HTMLImageElement>("img.project-thumbnail", el).src
    }) no-repeat center/100%`;

    previewIframe.src = previewUrl.href;
    previewHeading.innerText = getEl("h2", el).innerText;
    previewDialog.showModal();
  };
});
