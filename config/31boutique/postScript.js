function fix31Boutique(){
	var els = tagonJquery("section");
	for(var i=0;i<els.length;i++){
		var url = els[i].getAttribute('onclick');
		var path = url.split("href=")[1].split("'").join("");
		var newUrl = "document.location.href='http://localhost:12345/proxy?url="+ path + "'";
		els[i].setAttribute('onclick', newUrl);
	}
}
window.onload=function(){
 fix31Boutique();
}
