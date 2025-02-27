import { getAll, getEl, getId } from "./helpers";

getAll<HTMLDivElement>('[tabindex="0"]').forEach((el) => {
  el.onkeyup = (evt) => {
    if (evt.key === "Enter" && evt.target === el) el.click();
  };
});

const navMenuToggle = getId("nav-menu-toggle") as HTMLInputElement;

getAll<HTMLElement>("nav ul > li a").forEach((el) => {
  el.onclick = () => {
    navMenuToggle.checked = false;
  };
});

const darkThemeEl = getId("dark-theme") as HTMLInputElement;
darkThemeEl.onchange = () => {
  document.cookie = `theme=${darkThemeEl.checked ? "dark" : "light"}`;
};

const allProjects = getAll<HTMLAnchorElement>("#project-container .project");

const projectsToggle = getId("projects-toggle") as HTMLInputElement;
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
  getId("project-container").style.height = `${3 + projHeight}px`;
  (projectsToggle.oninput as () => void)();
})();

const previewDialog = getId("project-preview") as HTMLDialogElement;
const previewIframe = getEl("#project-preview iframe") as HTMLIFrameElement;
const previewHeading = getEl("#project-preview h3") as HTMLHeadingElement;
const previewUrl = getEl("#project-preview a.js-preview") as HTMLAnchorElement;
const repoUrl = getEl("#project-preview a.js-repository") as HTMLAnchorElement;

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
    const bg = getEl("img.project-thumbnail", el) as HTMLImageElement;
    const github = el.getAttribute("data-github");
    const heading = getEl("h2", el);

    repoUrl.href = `https://github.com/eniallator/${github}`;
    previewUrl.href = `https://eniallator.github.io/${github}`;
    previewIframe.style.background = `url(${bg.src}) no-repeat center/100%`;

    previewIframe.src = previewUrl.href;
    previewHeading.innerText = heading.innerText;
    previewDialog.showModal();
  };
});
