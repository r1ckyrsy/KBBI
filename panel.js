'use strict';

if (window.top !== window) { // only in frames
  let id;

	const resize = () => {
    window.top.postMessage({
      type: 'resize',
      height: document.body.getBoundingClientRect().height
    }, "*");
  };

	document.addEventListener('DOMContentLoaded', () => {

		const observer = new MutationObserver(() => {
      window.clearTimeout(id);
      id = window.setTimeout(resize, 500);
    });
    observer.observe(document.body, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
    });

    // preventing panel from prompting alert or confirm; this needs to be injected to the unwrapped window object to let overwrite alert and confirm functions
    const script = document.createElement('script');
    script.textContent = 'window.alert = window.confirm = function() {return true;}';
    document.body.appendChild(script);

	}, false);
	
}

function onError(error) {
	console.error(`Error: ${error}`);
}