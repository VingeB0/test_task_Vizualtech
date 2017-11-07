$(document).ready(function () {

	$('.wedding-item__slider').slick({
		dots: true,
		infinite: true,
		slidesToShow: 1,
		slidesToScroll: 1
	});

	$('.header__gamburger').click(function() {
		$(this).toggleClass('active');
		$('.header__nav-list').toggleClass('active');
	})

});
