import { getAll, getId } from "../helpers";

function curve(progress: number): number {
  return Math.sin(progress / 3) / 2 + 0.5;
}

let lastScrolledAt: number = Date.now() - 1;
let lastUpdatedAt: number | null = null;
const overlayDelay = 5000;
let santaData = { xPercent: 0, yPercent: 0, yProgress: 0 };

window.onscroll = function () {
  getAll("#theme-container > img").forEach((img) => {
    img.remove();
  });
  getId("theme-overlay").classList.remove("fadein");
  lastScrolledAt = Date.now();
  lastUpdatedAt = null;
};

function spawnSanta() {
  santaData = {
    xPercent: Math.round(Math.random() * 100),
    yPercent: curve(0),
    yProgress: 0,
  };
  getId("theme-container").innerHTML += `
    <img
      id='santa'
      width='224px'
      height='125'
      src='static/images/themes/santa-sleigh.png'
      style='top: ${santaData.xPercent}%; left: ${santaData.yPercent}%'
    />`;
}

function update() {
  if (lastScrolledAt + overlayDelay < Date.now()) {
    const now = Date.now() / 1000;
    const dt = lastUpdatedAt != null ? now - lastUpdatedAt : 0;
    lastUpdatedAt = now;
    getId("theme-overlay").classList.add("fadein");
    if (document.getElementById("santa") == null) {
      spawnSanta();
    }

    santaData.yProgress += dt;

    santaData.xPercent = (santaData.xPercent + dt * 10) % 100;
    santaData.yPercent = curve(santaData.yProgress) * 100;
    const santa = getId("santa");
    santa.style.left = `${santaData.xPercent}%`;
    santa.style.top = `${santaData.yPercent}%`;
  }

  requestAnimationFrame(update);
}

setTimeout(update, overlayDelay);
