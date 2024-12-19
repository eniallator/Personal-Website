let lastScrolledAt = Date.now();
const eyesDelay = 5000;

window.onscroll = function () {
  document
    .querySelectorAll("#theme-container > img")
    .forEach((img) => img.remove());
  document.getElementById("theme-overlay").classList.remove("fadein");
  lastScrolledAt = Date.now();
};

const activeEyes = [];
let eyesId = 0;
const eyesFadeOutTime = 3000;

function spawnEyes() {
  if (lastScrolledAt + eyesDelay < Date.now()) {
    activeEyes.push({
      id: eyesId,
      createdAt: Date.now(),
      lifeTime: 10000 + Math.random() * 2000,
    });

    const scale = 0.4 + Math.random() * 0.6;

    document.getElementById("theme-container").innerHTML +=
      "<img width='" +
      Math.round(scale * 109) +
      "px' height='" +
      Math.round(scale * 30) +
      "px' id='eyes-" +
      eyesId +
      "' src='static/images/themes/spooky-eyes.png' style='top: " +
      Math.round(Math.random() * 100) +
      "%; left: " +
      Math.round(Math.random() * 100) +
      "%'/>";

    eyesId = (eyesId + 1) % 10;
  }

  setTimeout(spawnEyes, 2000 + Math.random() * 500);
}

function eyesCleanUp() {
  if (lastScrolledAt + eyesDelay < Date.now()) {
    document.getElementById("theme-overlay").classList.add("fadein");
    const currTime = Date.now();
    for (let i = activeEyes.length - 1; i >= 0; i--) {
      const eyes = activeEyes[i];
      const eyesEl = document.querySelector(
        "#theme-container > #eyes-" + eyes.id
      );
      if (eyes.createdAt + eyes.lifeTime < currTime) {
        eyesEl.remove();
        activeEyes.splice(i, 1);
      }
      if (
        !eyesEl.classList.contains("fadeout") &&
        eyes.createdAt + eyes.lifeTime - eyesFadeOutTime <= currTime
      ) {
        eyesEl.classList.add("fadeout");
      }
    }
  }

  setTimeout(eyesCleanUp, 500);
}

function initEyes() {
  spawnEyes();
  eyesCleanUp();
}

setTimeout(initEyes, 5000);
