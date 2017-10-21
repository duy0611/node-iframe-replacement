function removeMagicZoom() {
  if (typeof(MagicZoom) === 'object') {
    MagicZoom.stop();
  }
  if (typeof(MagicZoomPlus) === 'object') {
    MagicZoomPlus.stop();
  }
}

removeMagicZoom();
