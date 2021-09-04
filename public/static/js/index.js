// Taken from https://stackoverflow.com/a/13067009/11824244
(function (document, history, location) {
  var HISTORY_SUPPORT = !!(history && history.pushState);

  var anchorScrolls = {
    ANCHOR_REGEX: /^#[^ ]+$/,
    OFFSET_HEIGHT_PX: 52,

    /**
     * Establish events, and fix initial scroll position if a hash is provided.
     */
    init: function () {
      this.scrollToCurrent();
      window.addEventListener("hashchange", this.scrollToCurrent.bind(this));
      document.body.addEventListener("click", this.delegateAnchors.bind(this));
    },

    /**
     * Return the offset amount to deduct from the normal scroll position.
     * Modify as appropriate to allow for dynamic calculations
     */
    getFixedOffset: function () {
      return this.OFFSET_HEIGHT_PX;
    },

    /**
     * If the provided href is an anchor which resolves to an element on the
     * page, scroll to it.
     * @param  {String} href
     * @return {Boolean} - Was the href an anchor.
     */
    scrollIfAnchor: function (href, pushToHistory) {
      var match, rect, anchorOffset;

      if (!this.ANCHOR_REGEX.test(href)) {
        return false;
      }

      match = document.getElementById(href.slice(1));

      if (match) {
        rect = match.getBoundingClientRect();
        anchorOffset = window.pageYOffset + rect.top - this.getFixedOffset();
        window.scrollTo(window.pageXOffset, anchorOffset);

        // Add the state to history as-per normal anchor links
        if (HISTORY_SUPPORT && pushToHistory) {
          history.pushState({}, document.title, location.pathname + href);
        }
      }

      return !!match;
    },

    /**
     * Attempt to scroll to the current location's hash.
     */
    scrollToCurrent: function () {
      this.scrollIfAnchor(window.location.hash);
    },

    /**
     * If the click event's target was an anchor, fix the scroll position.
     */
    delegateAnchors: function (e) {
      var elem = e.target;

      if (
        elem.nodeName === "A" &&
        this.scrollIfAnchor(elem.getAttribute("href"), true)
      ) {
        e.preventDefault();
      }
    },
  };

  window.addEventListener(
    "DOMContentLoaded",
    anchorScrolls.init.bind(anchorScrolls)
  );
})(window.document, window.history, window.location);

var PROJECT_SRC_BASE = "https://github.com/eniallator/";
var PROJECT_RUN_BASE = "https://eniallator.github.io/";

function toggleChildren() {
  $(".js-toggle-hide-projects").toggleClass("hide-children");
}

function updateModalDimensions() {
  var modalWidth = $("[data-modal-width]").width();
  $("#project-preview-modal iframe")
    .width(modalWidth)
    .height((modalWidth * 9) / 16);
}

window.onresize = function () {
  var container = $("#project-container");
  var projects = container.children();
  projects.removeClass("show-child");
  projects
    .slice(0, Math.floor(container.width() / projects.width()))
    .addClass("show-child");
  updateModalDimensions();
};

function makeProjectHtml(project) {
  return $(
    '<a class="project card m-2" data-github="' +
      project.github +
      '"><img class="card-img-top" width="288" height="162" src="static/images/thumbnails/' +
      project.thumbnail +
      '" alt="' +
      project.title +
      ' Thumbnail"/><div class="card-body"><h2 class="h5 card-title">' +
      project.title +
      '</h2><p class="card-text">' +
      project.description +
      "</p></div></a>"
  );
}

function launchProjectPreview(evt) {
  var modal = $("#project-preview-modal");
  var project = $(evt.currentTarget);
  var previewUrl = PROJECT_RUN_BASE + project.data("github");
  modal.find("iframe").attr("src", previewUrl);
  modal.find("[data-project-preview]").attr("href", previewUrl);
  modal.find("[data-project-title]").text(project.find(".card-title").text());
  modal
    .find("[data-project-repo]")
    .attr("href", PROJECT_SRC_BASE + project.data("github"));
  modal.modal("show");
}

$("#project-preview-modal a").click(function (evt) {
  evt.preventDefault();
  evt.stopPropagation();
  open($(evt.currentTarget).attr("href"));
});

$("#project-preview-modal")
  .on("shown.bs.modal", updateModalDimensions)
  .on("hide.bs.modal", function (evt) {
    $(evt.currentTarget).find("iframe").removeAttr("src");
  });

window.onload = function () {
  fetch("projects/")
    .then(function (resp) {
      return resp.json();
    })
    .then(function (data) {
      for (var i = 0; i < data.length; i++) {
        var project = data[i];
        var projectHtml = makeProjectHtml(project);
        $("#project-container").append(projectHtml);
        projectHtml.click(launchProjectPreview);
      }

      toggleChildren();
      $(".js-toggle-hide-projects").removeClass("hidden");
      window.onresize();
    });
};
