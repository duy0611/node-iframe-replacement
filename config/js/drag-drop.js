function tagonAllowDrop(ev) {
	ev.preventDefault();
	ev.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
	return false;
}

function tagonDragStart(ev, targetServer) {
	var dataObj = {
		srcImg: '',
		productLink: ''
	};
	
	var pattern = window.location.href.split('url=')[1].split('//')[1].split('/')[0];
	
	if (typeof(MagicZoom) === 'object') 
		{
			MagicZoom.stop(); 
		}
		if (typeof(MagicZoomPlus) == 'object') 
		{ 
			MagicZoomPlus.stop(); 
		}
	
	if(ev.target.nodeName === 'IMG') {
		dataObj.srcImg = ev.target.src;
		if(ev.target.parentNode != null && ev.target.parentNode.nodeName === 'A' && ev.target.parentNode.href.includes(pattern) && !ev.target.parentNode.href.includes(ev.target.src)) {
			dataObj.productLink = ev.target.parentNode.href;
		}
		else {
			var el = ev.target;
			while(el.nodeName !== 'BODY'){
				if(el.parentNode.nodeName === 'A' && el.parentNode.href.includes(pattern) && !el.parentNode.href.includes(ev.target.src)){
				
					dataObj.productLink = el.parentNode.href;
					break;
				}
				else{
					el = el.parentNode;
				}
			}
			if(!dataObj.productLink){
				dataObj.productLink = window.location.href;
			}
		}
		ev.dataTransfer.setData("text", JSON.stringify(dataObj));
		ev.dataTransfer.setData("targetServer", targetServer);
		
		document.getElementById("tagon-user-collection-bar").style.display = "initial";
	}
	else if (ev.target.nodeName === 'A') {
		if(ev.target.href.includes(pattern)){
			dataObj.productLink = ev.target.href;
		}
		else{
			dataObj.productLink = window.location.href;
		}
		if(ev.target.getElementsByTagName('img')[0] !== undefined) {
			dataObj.srcImg = $(ev.target).find('img').first()[0].src;
			ev.dataTransfer.setData("text", JSON.stringify(dataObj));
			ev.dataTransfer.setData("targetServer", targetServer);
			document.getElementById("tagon-user-collection-bar").style.display = "initial";
		}
		else if(ev.target.getAttribute('data-src')){
			dataObj.srcImg = 'http://' + pattern +  (ev.target.getAttribute('data-src').charAt(0) === '/' ? "" : "/") + ev.target.getAttribute('data-src');
			ev.dataTransfer.setData("text", JSON.stringify(dataObj));
			ev.dataTransfer.setData("targetServer", targetServer);
			document.getElementById("tagon-user-collection-bar").style.display = "initial";
		}
		else if(ev.target.getAttribute('src')){
			dataObj.srcImg = ev.target.getAttribute('src');
			ev.dataTransfer.setData("text", JSON.stringify(dataObj));
			ev.dataTransfer.setData("targetServer", targetServer);
			document.getElementById("tagon-user-collection-bar").style.display = "initial";
		}
		else if(ev.target.getElementsByTagName('div')[0] !== undefined) {
			dataObj.srcImg = $(ev.target).find('div').first()[0].src ? $(ev.target).find('div').first()[0].src : ('http://' + pattern + ($(ev.target).find('div').first()[0].getAttribute('data-src').charAt(0)==='/'? "" : "/") + $(ev.target).find('div').first()[0].getAttribute('data-src'));
			ev.dataTransfer.setData("text", JSON.stringify(dataObj));
			ev.dataTransfer.setData("targetServer", targetServer);
			document.getElementById("tagon-user-collection-bar").style.display = "initial";
		}
		else {
			alert("CAN ONLY DRAG PRODUCT IMAGE from A!!!");
		}
	}
	/*else {
		if(ev.target.getElementsByTagName('img')[0] != undefined) {
			dataObj.srcImg = $(ev.target).find('img').first()[0].src;
			ev.dataTransfer.setData("text", JSON.stringify(dataObj));
			ev.dataTransfer.setData("targetServer", targetServer);
			document.getElementById("tagon-user-collection-bar").style.display = "initial";
		}
		else {
			alert("CAN ONLY DRAG PRODUCT IMAGE!!!");
		}
	}*/
}

function tagonDragEnd(ev) {
	document.getElementById("tagon-user-collection-bar").style.display = "none";
}

function tagonDrop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData('text');
	var targetServer = ev.dataTransfer.getData('targetServer');
	
	if(data) {
		var receiverWin = window.parent;
		function sendMessage(e) {
			// Prevent any default browser behaviour.
			// e.preventDefault();
			// Send a message with the text of the source to the new window.
			// console.log(data);
			receiverWin.postMessage(data, targetServer);
		}
		sendMessage();
	}
	//alert(data);
	
	document.getElementById("tagon-user-collection-bar").style.display = "none";
}

function tagonFadeInPreload(targetServer) {
	var receiverWin = window.parent;
	receiverWin.postMessage("fadeIn", targetServer);
}

function tagonFadeOutPreload(targetServer) {
	var receiverWin = window.parent;
	receiverWin.postMessage("fadeOut", targetServer);
}
