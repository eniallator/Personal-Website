const unsafeById = (id: string) => document.getElementById(id) as HTMLElement;
const unsafeSelector = (
  selector: string,
  el: HTMLElement | Document = document
) => el.querySelector(selector) as HTMLElement;

unsafeById("dark-theme").onchange = function () {
  document.cookie = `theme=${(this as HTMLInputElement).checked ? "dark" : "light"}`;
};

document.querySelectorAll<HTMLDivElement>('[tabindex="0"]').forEach((el) => {
  el.onkeyup = (evt) => {
    if (evt.key === "Enter" && evt.target === el) el.click();
  };
});

const projectsToggle = unsafeById("projects-toggle") as HTMLInputElement;
projectsToggle.oninput = () => {
  const allProjects = document.querySelectorAll("#project-container .project");
  const firstY = allProjects[0]?.getBoundingClientRect().y;

  allProjects.forEach((el) => {
    if (projectsToggle.checked && firstY !== el.getBoundingClientRect().y) {
      el.setAttribute("tabindex", "-1");
    } else {
      el.removeAttribute("tabindex");
    }
  });
};

const updateProjContainerHeight = () => {
  const projHeight =
    document
      .querySelector("#project-container .project")
      ?.getBoundingClientRect().height ?? 300;
  unsafeById("project-container").style.height = `${3 + projHeight}px`;
  (projectsToggle.oninput as () => void)();
};

window.onresize = updateProjContainerHeight;
updateProjContainerHeight();

document.querySelectorAll<HTMLElement>("nav ul > li a").forEach((el) => {
  el.onclick = (_) => {
    (unsafeById("nav-menu-toggle") as HTMLInputElement).checked = false;
  };
});

const projectRunBase = "https://eniallator.github.io/";
const projectSrcBase = "https://github.com/eniallator/";

const previewDialog = unsafeById("project-preview") as HTMLDialogElement;
const previewIframe = unsafeSelector(
  "#project-preview iframe"
) as HTMLIFrameElement;

previewDialog.onclick = (evt) => {
  if (evt.target === previewDialog) {
    previewDialog.close();
  }
};

previewDialog.onclose = () => {
  previewIframe.removeAttribute("src");
};

document.querySelectorAll<HTMLAnchorElement>(".project").forEach((project) => {
  project.onclick = () => {
    unsafeSelector("#project-preview h3").innerText =
      project.getElementsByTagName("h2")[0]?.innerText ?? "";

    previewIframe.src = `${projectRunBase}${project.getAttribute("data-github")}`;
    previewIframe.style.background = `url(${
      (unsafeSelector("img.project-thumbnail", project) as HTMLIFrameElement)
        .src
    }) no-repeat center/100%`;
    previewIframe.onload = () => (previewIframe.style.backgroundImage = "none");

    (
      unsafeSelector("#project-preview a.js-preview") as HTMLAnchorElement
    ).href = previewIframe.src;
    (
      unsafeSelector("#project-preview a.js-repository") as HTMLAnchorElement
    ).href = `${projectSrcBase}${project.getAttribute("data-github")}`;

    previewDialog.showModal();
  };
});
