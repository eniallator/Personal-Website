let lastScrolledAt = Date.now() - 1;
let lastUpdatedAt;
const overlayDelay = 5000;
let santaData;

window.onscroll = function () {
  document
    .querySelectorAll("#theme-container > img")
    .forEach((img) => img.remove());
  document.getElementById("theme-overlay").classList.remove("fadein");
  lastScrolledAt = Date.now();
  lastUpdatedAt = undefined;
};

function curve(progress) {
  return Math.sin(progress / 3) / 2 + 0.5;
}

function spawnSanta() {
  santaData = {
    x: Math.round(Math.random() * 100),
    y: curve(0),
    yProgress: 0,
  };
  document.getElementById("theme-container").innerHTML +=
    "<img id='santa' width='224px' height='125' src='static/images/themes/santa-sleigh.png' style='top: " +
    santaData.x +
    "%; left: " +
    santaData.y +
    "%'/>";
}

function update() {
  if (lastScrolledAt + overlayDelay < Date.now()) {
    const now = Date.now();
    const dt = lastUpdatedAt != null ? (now - lastUpdatedAt) / 1000 : 0;
    lastUpdatedAt = now;
    document.getElementById("theme-overlay").classList.add("fadein");
    if (document.getElementById("santa") == null) {
      spawnSanta();
    }

    santaData.yProgress += dt;

    santaData.x = (santaData.x + dt * 10) % 100;
    santaData.y = curve(santaData.yProgress) * 100;
    const santa = document.getElementById("santa");
    santa.style.left = santaData.x + "%";
    santa.style.top = santaData.y + "%";
  }

  requestAnimationFrame(update);
}

setTimeout(update, overlayDelay);
