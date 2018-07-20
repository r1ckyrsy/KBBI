window.addEventListener("message", (e) => {
	if (e.data.type === 'preloader-resize')
		Object.assign( document.documentElement.style, {
			height: `${e.data.height}px`
		});
});