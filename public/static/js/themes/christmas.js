var lastScrolledAt = Date.now() - 1;
var lastUpdatedAt;
var overlayDelay = 5000;
var santaData;

window.onscroll = function () {
  $("#theme-container > img").remove();
  $("#theme-overlay").removeClass("fadein");
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
  $("#theme-container").append(
    "<img id='santa' width='224px' height='125' src='static/images/themes/santa-sleigh.png' style='top: " +
      santaData.x +
      "%; left: " +
      santaData.y +
      "%'/>"
  );
}

function update() {
  if (lastScrolledAt + overlayDelay < Date.now()) {
    var dt = 0;
    var now = Date.now();
    if (lastUpdatedAt !== undefined) {
      dt = (now - lastUpdatedAt) / 1000;
    }
    lastUpdatedAt = now;
    if (!$("#theme-overlay").hasClass("fadein")) {
      $("#theme-overlay").addClass("fadein");
    }

    if ($("#santa").length === 0) {
      spawnSanta();
    }

    santaData.yProgress += dt;

    santaData.x = (santaData.x + dt * 10) % 100;
    santaData.y = curve(santaData.yProgress) * 100;
    $("#santa")
      .css("left", santaData.x + "%")
      .css("top", santaData.y + "%");
  }

  requestAnimationFrame(update);
}

setTimeout(update, overlayDelay);
