let nextPage;
let keyword;

$(document).ready(function () {
  get_first_page();
});

async function get_first_page() {
  nextPage = 0;
  const url = 'api/attractions?page=' + nextPage;
  let fetchedData = await fetch(url, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  nextPage = fetchedData["nextPage"];

  data = fetchedData["data"];


  for (let i = 0; i < data.length; i++) {

    image = data[i]["images"][0];
    attractionName = data[i]["name"];


    const div = document.createElement('div');

    div.innerHTML = `   <div class="post-default">
        <div class="post-default-image">
          <img src=` + image + `  alt=` + attractionName + ` >
        </div>
        <div class="post-default-title">
          <p>` + attractionName + `</p>
        </div>
      </div>`;

    document.getElementById("main-content-default").appendChild(div);

  }

}



// detect scroll bottom

function getDocHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  );
}

async function loadPage() {
  const url = 'api/attractions?page=' + nextPage
  let fetchedData = await fetch(url, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  data = fetchedData["data"];
  nextPage = fetchedData["nextPage"];


  for (let i = 0; i < data.length; i++) {

    image = data[i]["images"][0];
    attractionName = data[i]["name"];


    const div = document.createElement('div');

    div.innerHTML = `   <div class="post-default">
          <div class="post-default-image">
            <img src=` + image + `  alt=` + attractionName + ` >
          </div>
          <div class="post-default-title">
            <p>` + attractionName + `</p>
          </div>
        </div>`;

    document.getElementById("main-content-default").appendChild(div);

  }

}

$(window).scroll(function () {
  if ($(window).scrollTop() + $(window).height() == getDocHeight()) {

    if (nextPage != null) {
      loadPage();
    }

  }
});



async function search_keyword() {
  let keyword = document.getElementById('banner-searchbar-input').value;
  console.log("keyword: " + keyword);
  nextPage = 0;

  const url = 'api/attractions?page=' + nextPage + '&keyword=' + keyword;
  let fetchedData = await fetch(url, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  data = fetchedData["data"];
  nextPage = fetchedData["nextPage"];

  $('#main-content-default').empty()


  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {

      image = data[i]["images"][0];
      attractionName = data[i]["name"];


      const div = document.createElement('div');

      div.innerHTML = `   <div class="post-default">
          <div class="post-default-image">
            <img src=` + image + `  alt=` + attractionName + ` >
          </div>
          <div class="post-default-title">
            <p>` + attractionName + `</p>
          </div>
        </div>`;

      document.getElementById("main-content-default").appendChild(div);

    }
  } else {
    $('#main-content-default').empty()
    const div = document.createElement('div');
    div.innerHTML = `<h2>
          搜尋`+ keyword + `沒有找到任何內容，請輸入其他關鍵字
        </h2>`;

    document.getElementById("main-content-default").appendChild(div);

  }




}

$("#banner-searchbar-button").click(function () {
  nextPage = 0;
  search_keyword();


});



$(document).keyup(function (event) {
  if ($("#banner-searchbar-input").is(":focus") && event.key == "Enter") {
    nextPage = 0;
    search_keyword();
  }
});

$("#banner-searchbar-input").focus(function () {
  unfold_searchbar_category_list();
});

async function unfold_searchbar_category_list() {

  let categorylist = document.getElementById("banner-searchbar-category-list");
  if (categorylist) {
    categorylist.remove();
  }

  const url = 'api/categories';
  let fetchedData = await fetch(url, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  data = fetchedData["data"];

  const div = document.createElement('div');
  div.id = "banner-searchbar-category-list";
  document.getElementById("banner-searchbar").appendChild(div);


  for (let i = 0; i < data.length; i++) {

    const div = document.createElement('a');
    div.text = data[i];

    document.getElementById("banner-searchbar-category-list").appendChild(div);
  }
};




$(document).ready(function () {
  $(document).on("click", "#banner-searchbar-category-list a", function () {
    keyword = $(this).text();
    $("#banner-searchbar-input").val(keyword);
    let categorylist = document.getElementById("banner-searchbar-category-list");
    categorylist.remove();


  });
});

$(document).click(function (e) {

  if ($(e.target).closest("#banner-searchbar").length == 0) {
    let categorylist = document.getElementById("banner-searchbar-category-list");
    if (categorylist) {
      categorylist.remove();
    }
  }


});