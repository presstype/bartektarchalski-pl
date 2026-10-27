/* Zgoda na cookies + widżet ZnanyLekarz (Docplanner) ładowany dopiero po zgodzie */
(function($){
	"use strict";

	var KEY = 'cookie-consent';
	var PROFILE = 'https://www.znanylekarz.pl/profil/bartlomiej-tarchalski';

	function getConsent(){
		try { var c = JSON.parse(localStorage.getItem(KEY)); return c && c.status; } catch(e){ return null; }
	}
	function setConsent(status){
		try { localStorage.setItem(KEY, JSON.stringify({status: status, ts: new Date().toISOString()})); } catch(e){}
	}
	function clearConsent(){
		try { localStorage.removeItem(KEY); } catch(e){}
	}

	// Widżet ustawia wysokość iframe na samą kartę, więc jej cień jest ucinany.
	// Dokładamy zapas na dole, za każdym razem gdy widżet zmieni wysokość.
	var PAD = 80;
	function padWidgetHeight(box){
		if(!window.MutationObserver) return;
		var applying = false;
		new MutationObserver(function(){
			if(applying) return;
			var f = box.querySelector('iframe');
			if(!f) return;
			var h = parseFloat(f.style.height) || f.offsetHeight;
			if(!h || String(f.getAttribute('data-pad')) === String(h)) return;
			applying = true;
			var padded = Math.round(h + PAD);
			f.style.setProperty('height', padded + 'px', 'important');
			f.setAttribute('data-pad', padded);
			setTimeout(function(){ applying = false; }, 0);
		}).observe(box, {childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'height']});
	}

	function loadWidget(){
		var box = document.getElementById('booking-widget');
		if(!box || box.getAttribute('data-loaded')) return;
		box.setAttribute('data-loaded', '1');
		box.innerHTML = '<a id="zl-url" class="zl-url" href="'+PROFILE+'" rel="nofollow" data-zlw-doctor="bartlomiej-tarchalski" data-zlw-type="big_with_calendar" data-zlw-opinion="false" data-zlw-hide-branding="true" data-zlw-saas-only="true" data-zlw-a11y-title="Widget umówienia wizyty lekarskiej">Umów wizytę</a>';
		padWidgetHeight(box);
		!function($_x,_s,id){var js,fjs=$_x.getElementsByTagName(_s)[0];if(!$_x.getElementById(id)){js = $_x.createElement(_s);js.id = id;js.src = "https://platform.docplanner.com/js/widget.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","zl-widget-s");
	}

	function showBanner(show){
		var b = document.getElementById('cookie-banner');
		if(b) b.hidden = !show;
	}

	function apply(){
		var c = getConsent();
		showBanner(!c);
		if(c === 'granted') loadWidget();
	}

	function scrollToBooking(){
		setTimeout(function(){
			var el = document.getElementById('umow-wizyte');
			if(el && el.scrollIntoView) el.scrollIntoView({behavior: 'smooth', block: 'start'});
		}, 200);
	}

	$(function(){
		$(document).on('click', '[data-cookie-accept]', function(){
			setConsent('granted');
			apply();
		});
		$(document).on('click', '[data-cookie-reject]', function(){
			var wasLoaded = !!$('#booking-widget').attr('data-loaded');
			setConsent('denied');
			if(wasLoaded){
				// wycofanie zgody: przeładowanie usuwa skrypt Docplanner z pamięci przeglądarki
				window.location.hash = '#kontakt';
				window.location.reload();
				return;
			}
			apply();
		});
		// Zmiana zgody: pokaż ponownie banner z aktualnym wyborem
		$(document).on('click', '[data-cookie-settings]', function(e){
			e.preventDefault();
			showBanner(true);
		});

		// Przycisk "Umów wizytę" w menu (obsługę przejścia sekcji robi init.js)
		$('.transition_link a[data-book]').on('click', scrollToBooking);
		// Przycisk poza menu: odpal pozycję w menu desktopowym lub mobilnym
		$('a[data-book]').not('.transition_link a').on('click', function(e){
			e.preventDefault();
			$('.leftpart .transition_link a[data-book]').trigger('click');
		});

		apply();
		var hash = window.location.hash;
		if(hash === '#kontakt' || hash === '#cookie-settings'){
			$('.leftpart .transition_link a[href="#kontakt"]:not([data-book])').trigger('click');
			if(hash === '#cookie-settings') showBanner(true);
		}
	});
})(jQuery);
