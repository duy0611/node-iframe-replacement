function removeMagicZoom(){
		if (typeof(MagicZoom) === 'object') 
		{
			alert(typeof(MagicZoom));
			MagicZoom.stop(); 
		}
		if (typeof(MagicZoomPlus) == 'object') 
		{ 
			MagicZoomPlus.stop(); 
		}
	}

	removeMagicZoom();
