var lastScrolledAt = Date.now();
var eyesDelay = 5000;

window.onscroll = function () {
  $("#theme-container > img").remove();
  $("#theme-overlay").removeClass("fadein");
  lastScrolledAt = Date.now();
};

var activeEyes = [];
var eyesId = 0;
var eyesFadeOutTime = 3000;

function spawnEyes() {
  if (lastScrolledAt + eyesDelay < Date.now()) {
    activeEyes.push({
      id: eyesId,
      createdAt: Date.now(),
      lifeTime: 10000 + Math.random() * 2000,
    });

    var scale = 0.2 + Math.random() * 0.3;

    $("#theme-container").append(
      "<img width='" +
        Math.round(scale * 318) +
        "px' height='" +
        Math.round(scale * 61) +
        "px' id='eyes-" +
        eyesId +
        "' src='static/images/themes/spooky-eyes.png' style='top: " +
        Math.round(Math.random() * 100) +
        "%; left: " +
        Math.round(Math.random() * 100) +
        "%'/>"
    );
    eyesId = (eyesId + 1) % 10;
  }

  setTimeout(spawnEyes, 2000 + Math.random() * 500);
}

function eyesCleanUp() {
  if (lastScrolledAt + eyesDelay < Date.now()) {
    if (!$("#theme-overlay").hasClass("fadein")) {
      $("#theme-overlay").addClass("fadein");
    }
    var currTime = Date.now();
    for (var i = activeEyes.length - 1; i >= 0; i--) {
      var eyes = activeEyes[i];
      var eyesEl = $("#theme-container > #eyes-" + eyes.id);
      if (eyes.createdAt + eyes.lifeTime < currTime) {
        eyesEl.remove();
        activeEyes.splice(i, 1);
      }
      if (
        !eyesEl.hasClass("fadeout") &&
        eyes.createdAt + eyes.lifeTime - eyesFadeOutTime <= currTime
      ) {
        eyesEl.addClass("fadeout");
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
