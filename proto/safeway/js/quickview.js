

$(document).ready(function(){

	
	$('.quickview').css('opacity', '0');


    $('#first-apple').hover(function(){

$('.quickview').css('opacity', '.3');  
},

  function(){
	$('.quickview').css('opacity', '0');
  }

  );


  
});