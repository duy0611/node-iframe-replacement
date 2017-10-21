function fixAinosofia() {
  var el = tagonJquery("div.hover");
  el.css("width", "0");
  el.css("height", "0");
  var getParam = tagonJquery("img")[0].getAttribute("ondragstart");
  var params = getParam.split("tagonDragStart(")[1].split(")")[0].split(", ");
  var newFunc = "overrideDragStart(" + params[0] + ", " + params[1] + ")";
  tagonJquery('img').attr('ondragstart', newFunc);
  tagonJquery('a').attr('ondragstart', newFunc);
  tagonJquery('img').attr('onclick', 'tagonClick(event)');
}

function tagonClick(event) {
  var findHoverDiv = tagonJquery(event.target.parentNode).nextAll("div.hover").first();
  if (findHoverDiv) {
    window.location.href = tagonJquery(findHoverDiv).find("a:first")[0].href;
  }
}

function overrideDragStart(ev, targetServer) {
  var dataObj = {
    srcImg: '',
    productLink: ''
  };

  var pattern = window.location.href.split('url=')[1].split('//')[1].split('/')[0];

  if (ev.target.nodeName === 'IMG') {
    dataObj.srcImg = ev.target.src;
    if (ev.target.parentNode != null && ev.target.parentNode.nodeName === 'A' && ev.target.parentNode.href.includes(pattern) && !ev.target.parentNode.href.includes(ev.target.src)) {
      dataObj.productLink = ev.target.parentNode.href;
    } else {
      var el = ev.target;
      while (el.nodeName !== 'BODY') {
        if (el.parentNode.nodeName === 'A' && el.parentNode.href.includes(pattern) && !el.parentNode.href.includes(ev.target.src)) {

          dataObj.productLink = el.parentNode.href;
          break;
        } else {
          el = el.parentNode;
        }
      }
      if (!dataObj.productLink) {
        var findHoverDiv = tagonJquery(ev.target.parentNode).nextAll("div.hover").first();
        if (findHoverDiv) {
          dataObj.productLink = tagonJquery(findHoverDiv).find("a:first")[0].href;
        } else {
          dataObj.productLink = window.location.href;
        }
        console.log(dataObj.productLink);
      }
    }
    ev.dataTransfer.setData("text", JSON.stringify(dataObj));
    ev.dataTransfer.setData("targetServer", targetServer);

    document.getElementById("tagon-user-collection-bar").style.display = "initial";

  } else if (ev.target.nodeName === 'A') {
    if (ev.target.href.includes(pattern)) {
      dataObj.productLink = ev.target.href;
    } else {
      dataObj.productLink = window.location.href;
    }
    if (ev.target.getElementsByTagName('img')[0] !== undefined) {
      dataObj.srcImg = tagonJquery(ev.target).find('img').first()[0].src;
      ev.dataTransfer.setData("text", JSON.stringify(dataObj));
      ev.dataTransfer.setData("targetServer", targetServer);
      document.getElementById("tagon-user-collection-bar").style.display = "initial";
    } else if (ev.target.getAttribute('data-src')) {
      dataObj.srcImg = 'http://' + pattern + (ev.target.getAttribute('data-src').charAt(0) === '/' ? "" : "/") + ev.target.getAttribute('data-src');
      ev.dataTransfer.setData("text", JSON.stringify(dataObj));
      ev.dataTransfer.setData("targetServer", targetServer);
      document.getElementById("tagon-user-collection-bar").style.display = "initial";
    } else if (ev.target.getAttribute('src')) {
      dataObj.srcImg = ev.target.getAttribute('src');
      ev.dataTransfer.setData("text", JSON.stringify(dataObj));
      ev.dataTransfer.setData("targetServer", targetServer);
      document.getElementById("tagon-user-collection-bar").style.display = "initial";
    } else if (ev.target.getElementsByTagName('div')[0] !== undefined) {
      dataObj.srcImg = tagonJquery(ev.target).find('div').first()[0].src ? tagonJquery(ev.target).find('div').first()[0].src : ('http://' + pattern + (tagonJquery(ev.target).find('div').first()[0].getAttribute('data-src').charAt(0) === '/' ? "" : "/") + tagonJquery(ev.target).find('div').first()[0].getAttribute('data-src'));
      ev.dataTransfer.setData("text", JSON.stringify(dataObj));
      ev.dataTransfer.setData("targetServer", targetServer);
      document.getElementById("tagon-user-collection-bar").style.display = "initial";
    } else {
      alert("CAN ONLY DRAG PRODUCT IMAGE from A!!!");
    }
  }
}

window.onload = function() {
  fixAinosofia();
}
