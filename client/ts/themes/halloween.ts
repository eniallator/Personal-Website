import { getEl, getId } from "../helpers";

const spawnDelay = 5000;
const spawnInterval = 1000;
const halfFadeTime = 3000;

let lastScrolled = Date.now();
let eyesId = 0;
let activeEyes: { id: number; spawnTime: number }[] = [];

const container = getEl("#theme-container");
const overlay = getId("theme-overlay");

const eyesLoop = () => {
  const now = Date.now();
  if (lastScrolled + spawnDelay > now) return;

  if (!overlay.classList.contains("fadein")) {
    getId("theme-overlay").classList.add("fadein");
  }

  activeEyes = activeEyes.filter(({ id, spawnTime }) => {
    const el = getId(`theme-eyes-${id}`);
    if (spawnTime + 2 * halfFadeTime < now) {
      el.remove();
      return false;
    } else {
      el.style.opacity = `${Math.round((1 - Math.abs(now - spawnTime - halfFadeTime) / halfFadeTime) * 100)}%`;
      return true;
    }
  });

  if (activeEyes[0] == null || activeEyes[0].spawnTime < now - spawnInterval) {
    const bounds = container.getBoundingClientRect();
    const scale = 0.4 + Math.random() * 0.6;
    const width = Math.round(scale * 109);
    const height = Math.round(scale * 30);

    const eyes = { id: eyesId++, spawnTime: now };

    activeEyes.unshift(eyes);

    container.innerHTML += `
      <img
        id="theme-eyes-${eyes.id}"
        src='static/images/themes/spooky-eyes.png'
        width="${width}"
        height="${height}"
        style="
          top: ${Math.round(Math.random() * (bounds.height - height))}px;
          left: ${Math.round(Math.random() * (bounds.width - width))}px;
          opacity: 0%;
        "
      />`;
  }
  requestAnimationFrame(eyesLoop);
};

let eyesTimeout: NodeJS.Timeout | null = setTimeout(eyesLoop, spawnDelay);

window.onscroll = function () {
  container.innerHTML = "";
  overlay.classList.remove("fadein");
  lastScrolled = Date.now();
  eyesId = 0;
  activeEyes = [];

  if (eyesTimeout != null) {
    clearTimeout(eyesTimeout);
    eyesTimeout = null;
  }
  eyesTimeout = setTimeout(eyesLoop, spawnDelay);
};
