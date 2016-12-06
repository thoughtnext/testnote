
function main() {

(function () {
   'use strict';

   

    /*====================================
    Preloader
    ======================================*/
	
  	$(window).load(function() {

   	// will first fade out the loading animation 
    	$("#status").fadeOut("slow"); 

    	// will fade out the whole DIV that covers the website. 
    	$("#preloader").delay(500).fadeOut("slow").remove();      

  	}) 
   

	
}());


}
main();