const unsafeById = (id: string) => document.getElementById(id) as HTMLElement;
const unsafeSelector = (
  selector: string,
  el: HTMLElement | Document = document
) => el.querySelector(selector) as HTMLElement;

document.querySelectorAll<HTMLDivElement>('[tabindex="0"]').forEach((el) => {
  el.onkeyup = (evt) => {
    if (evt.key === "Enter" && evt.target === el) el.click();
  };
});

const navMenuToggle = unsafeById("nav-menu-toggle") as HTMLInputElement;

document.querySelectorAll<HTMLElement>("nav ul > li a").forEach((el) => {
  el.onclick = (_) => {
    navMenuToggle.checked = false;
  };
});

const darkThemeEl = unsafeById("dark-theme") as HTMLInputElement;
darkThemeEl.onchange = () => {
  document.cookie = `theme=${darkThemeEl.checked ? "dark" : "light"}`;
};

const allProjects = [
  ...document.querySelectorAll<HTMLAnchorElement>(
    "#project-container .project"
  ),
];

const projectsToggle = unsafeById("projects-toggle") as HTMLInputElement;
projectsToggle.oninput = () => {
  const firstY = allProjects[0]?.getBoundingClientRect().y;

  allProjects.forEach((el) => {
    if (projectsToggle.checked && firstY !== el.getBoundingClientRect().y) {
      el.setAttribute("tabindex", "-1");
    } else {
      el.removeAttribute("tabindex");
    }
  });
};

const projectContainer = unsafeById("project-container");

const updateProjContainerHeight = () => {
  const projHeight = allProjects[0]?.getBoundingClientRect().height ?? 300;
  projectContainer.style.height = `${3 + projHeight}px`;
  (projectsToggle.oninput as () => void)();
};

window.onresize = updateProjContainerHeight;
updateProjContainerHeight();

const projectRunBase = "https://eniallator.github.io/";
const projectSrcBase = "https://github.com/eniallator/";

const previewDialog = unsafeById("project-preview") as HTMLDialogElement;
const previewIframe = unsafeSelector(
  "#project-preview iframe"
) as HTMLIFrameElement;
const previewHeading = unsafeSelector("#project-preview h3");
const previewUrl = unsafeSelector(
  "#project-preview a.js-preview"
) as HTMLAnchorElement;
const repoUrl = unsafeSelector(
  "#project-preview a.js-repository"
) as HTMLAnchorElement;

previewDialog.onclick = (evt) => {
  if (evt.target === previewDialog) previewDialog.close();
};

previewDialog.onclose = () => {
  previewIframe.removeAttribute("src");
};

allProjects.forEach((el) => {
  el.onclick = () => {
    const bg = unsafeSelector("img.project-thumbnail", el) as HTMLImageElement;
    const github = el.getAttribute("data-github");
    const heading = unsafeSelector("h2", el);

    repoUrl.href = `${projectSrcBase}${github}`;
    previewUrl.href = `${projectRunBase}${github}`;
    previewIframe.style.background = `url(${bg.src}) no-repeat center/100%`;
    previewIframe.onload = () => (previewIframe.style.backgroundImage = "none");
    previewIframe.src = previewUrl.href;
    previewHeading.innerText = heading.innerText;

    previewDialog.showModal();
  };
});
