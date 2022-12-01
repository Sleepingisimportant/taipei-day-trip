


let slideIndex = 1;


$(document).ready(function () {
  get_images();
  showSlides(slideIndex);



  $("input:radio[name=bookingTime]").on("change", function () {

    if (this.id == "booking-forenoon") {
      $('#booking-cost').text("新台幣 2000 元");
    } else if (this.id == "booking-afternoon") {
      $('#booking-cost').text("新台幣 2500 元");
    }
  })

  $(".menu-title").on("click", function () {
    window.location.replace("/");

    
  })
  
});






async function get_images() {

  for (let i = 0; i < images.length; i++) {

    slide = `<div class="mySlides fade"><img src="` + images[i] + `"></div>`;
    $(".slideshow-container").prepend(slide);

    dot = `<span class="dot" onclick="currentSlide(` + (i + 1) + `)"></span>`
    $(".dots").append(dot);


  }

}




// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}