let slideIndex = 1;

document.addEventListener("DOMContentLoaded", function (event) {
  
  get_images();
  
  showSlides(slideIndex);

});




async function get_images() {

  for (let i = 0; i < images.length; i++) {

    slide = "<div class='mySlides fade'><img src='" + images[i] + "'></div>";
    document.getElementById('slideshow-container').insertAdjacentHTML("afterbegin", slide);

    dot = "<span class='dot' onclick='currentSlide(" + (i + 1) + ")'></span>";
    document.getElementById('slideshow-dots').insertAdjacentHTML("beforeend", dot);

  }

}


function get_package_price(clicked_id) {

  if (clicked_id == "booking-forenoon") {
    document.getElementById("booking-cost").textContent = "新台幣 2000 元";
  } else if (clicked_id == "booking-afternoon") {
    document.getElementById("booking-cost").textContent = "新台幣 2500 元";
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