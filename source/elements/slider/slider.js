'use strict';
$(document).ready(function(){
	var $slider = $('#slider');
	$slider.owlCarousel({
		loop: true
		, center: true
		, items: 1
		, onInitialized: initParallax
	});



	function initParallax () {
		var slides = document.getElementsByClassName('slide')
			, slidesInner = document.getElementsByClassName('slide_inner');

		for(var i = 0; i < slides.length; i++){

			new mouseMoveParralax({
				container: slides[i]
				, element: slidesInner[i]
				// , braking: 11
				, isRotate: true
				, isOposite: true
			});

		}
	}


});