function fix20Again() {
  var els = tagonJquery("ul.actions > li > h3");
  for (var i = 0; i < els.length; i++) {
    var url = els[i].getAttribute('onclick');
    var path = url.split("href=")[1].split("'").join("");
    var newUrl = "location.href='" + PROXY_SERVER + "/proxy?url=http://20again.vn" + path + "'";
    els[i].setAttribute('onclick', newUrl);
  }
}

window.onload = function() {
  fix20Again();
}
