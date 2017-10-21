function fix3cevietnam() {
  var el = tagonJquery("a");
  for (var i = 0; i < el.length; i++) {
    el.css("z-index", "100000");
  }
}

window.onload = function() {
  fix3cevietnam();
}
