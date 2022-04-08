function updateScroll(href) {
  var offset = $("#navbar").height();
  var el = $(href);
  if (!el) return;
  window.scrollTo(0, el.position().top - offset);
  history.pushState({}, document.title, location.pathname + href);
}

$('a[href^="#"').click(function (evt) {
  evt.preventDefault();
  evt.stopPropagation();
  updateScroll($(evt.currentTarget).attr("href"));
});

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
    .slice(0, Math.max(1, Math.floor(container.width() / projects.width())))
    .addClass("show-child");
  updateModalDimensions();
};

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
$(".project").click(launchProjectPreview);

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
  $('[data-toggle="tooltip"]').tooltip();

  $("section#contact form").submit(function (evt) {
    evt.preventDefault();
    var form = this;
    grecaptcha.ready(function () {
      grecaptcha
        .execute("6LeINQMdAAAAAHgXsB7RrMoKehfacEyBVa1trZo3", {
          action: "submit",
        })
        .then(function (token) {
          $(form).find("input[name=recaptcha]").val(token);
          form.submit();
        });
    });
  });

  updateScroll(location.hash);
};

window.onresize();
