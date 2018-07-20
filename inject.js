'use strict';

var init = () => {
	gesture.unload();
	document.removeEventListener("DOMContentLoaded", init);
	gesture.load();
}
document.addEventListener("DOMContentLoaded", init, false);