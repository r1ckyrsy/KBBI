'use strict';

let btnPU, ifrPU;

Element.prototype.remove = function() {
	this.parentElement.removeChild(this);
};
Element.prototype.insertInto = function(el) {
	el.appendChild(this);
};

class IframePopup {

	constructor(range) {
		let endIdx = range.getClientRects().length - 1;
		let endClientRect = range.getClientRects()[ endIdx ];
		let maxW = window.innerWidth;
		this.isVisible = false;

		this.words = range.toString();

		var top, left;
		if (endClientRect.right + (400 - 10) < maxW) {
			top = endClientRect.top + pageYOffset;
			left = endClientRect.right + (10 + pageXOffset);
		} else if (endClientRect.right - (400 + 10) > 0) {
			top =  endClientRect.top + pageYOffset;
			left = endClientRect.left - (400 + 10) + pageXOffset;
		}	else {
			top = endClientRect.bottom + (10 + pageYOffset);
			left = ((endClientRect.right + endClientRect.left) / 2) + pageXOffset;
		}

		this.el = Object.assign( document.createElement('iframe'), {
			style: `top: ${top}px; left: ${left}px; display: none`,
			scrolling: 'no'
		});
		this.el.classList.add('ifr-floating-kbbi');
		this.preload();
	}

	preload() {
		this.el.src = browser.runtime.getURL('/preloader.html');
		this.el.insertInto(document.body);
	}

	resize(height) {
		Object.assign( this.el.style, {
			height: `${height}px`
		});
	}

	show() {
		if (!this.isVisible) {
			Object.assign( this.el.style, { display: 'block' });
			this.el.contentWindow.postMessage({
				type: 'preloader-resize',
				height: this.el.clientHeight
			}, '*');
			this.el.src = `https://kbbi.kemdikbud.go.id/entri/${this.words}`;
			this.isVisible = true;
		}
	}
}

class ButtonPopup {

	constructor(range) {
		let endIdx = range.getClientRects().length - 1;
		let endClientRect = range.getClientRects()[ endIdx ];
		this.isVisible = false;
		let maxW = window.innerWidth;

		let top  = endClientRect.top + (pageYOffset - 15);
		let left = endClientRect.right + 50 > maxW
			? maxW - 50 : endClientRect.right + (pageXOffset + 5);

		if (ifrPU !== undefined && ifrPU.el !== undefined)
			ifrPU.el.remove();
		ifrPU = new IframePopup( range );
		this.el = Object.assign( document.createElement('button'), {
			title: 'Cari definisi di KBBI',
			style: `top: ${top}px; left: ${left}px`,
			onanimationend: () => el.classList.remove('pulse-kbbi'),
			onclick: () => ifrPU.show()
		});
		this.el.classList.add('btn-floating-kbbi');

		let icon = document.createElement('i');
		icon.classList.add('icon-kbbi');
		this.el.append(icon);
	}

	showWithAnimationAndRemoveLater() {
		if (!this.isVisible) {
			this.el.classList.add('pulse-kbbi');
			this.el.insertInto(document.body);
			this.isVisible = true;

			this.remove();
		}
	}

	removeNow() {
		clearTimeout(this.timeout);
		this.el.remove();
		this.isVisible = false;
	}

	remove(delay) {
		if (this.isVisible) {
			this.timeout = setTimeout( () => {
				this.el.remove();
				this.isVisible = false;
			}, delay ? delay : 3000);
		}
	}
}

const gesture = (function() {

	function getSelection() {
		const _s = window.getSelection();
		let data = { isRange: _s.type === 'Range' };

	 	if (data.isRange){
	 		data.text = _s.toString();
	 		data.range = _s.getRangeAt(0);
	 	}
	 	return data;
	 }

	const _init = (function () {

		return function (e) {
			const _s = getSelection();

			if(_s.isRange) {
				if (e.type === 'keyup' && (e.shiftKey // still selecting
					|| e.altKey || e.ctrlKey)) // ignore with this command
					return;

				if (btnPU !== undefined) {
					// clicked button Popup
					if (e.target === btnPU.el)
						return;
					// button link-popup still visible
					if (btnPU.isVisible) 
						btnPU.removeNow();
				}

				// show direct button link-popup
				btnPU = new ButtonPopup( _s.range );
				btnPU.showWithAnimationAndRemoveLater();
			} else {
				if (e.type === 'mouseup'
					&& btnPU !== undefined && btnPU.isVisible)
					btnPU.removeNow();
			}
			if (ifrPU !== undefined && ifrPU !== undefined
				&& e.target !== ifrPU.el && e.type === 'mouseup'
				&& ifrPU.isVisible) {
				ifrPU.el.remove();
			}
		}
	})();

	return {
		load: function() {
			document.addEventListener("mouseup", _init, false);
			document.addEventListener("keyup"	 , _init, false);
		},
		unload: function() {
			document.removeEventListener("mouseup", _init);
			document.removeEventListener("keyup"	, _init);
		}
	}
})();

window.addEventListener('message', (e) => {
	let data = e.data;
	if (data.type === 'resize') {
		ifrPU.resize(data.height);
	}
}, false);