
document.addEventListener("DOMContentLoaded", async function (event) {
    const url = "/api/user/auth";
    let auth_data = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json ; charset=UTF-8'
        }
    })
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData);
            return responseData;
        })
        .catch(error => console.warn(error));

    if (auth_data["data"] == null) {
        window.location.replace("/");
        popup_user_login_box("/booking");

    } else {


        const url = "/api/booking";
        let fetchedData = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json ; charset=UTF-8'
            },
        })
            .then((response) => response.json())
            .then((responseData) => {
                console.log(responseData);
                return responseData;
            })
            .catch(error => console.warn(error));

        data = fetchedData["data"];
        totalPrice = 0;

        if (data.length == 0) {
            insertBookingInfo = `    
            <div id="booking-welcome-message" class="button bold">您好，<span id="welcome-username"></span>，您目前沒有待預定的行程。</div>`

            document.getElementById("main-content").insertAdjacentHTML("afterbegin", insertBookingInfo);

        } else {

            insertBookingInfo = `    
            <div id="booking-welcome-message" class="button bold">您好，<span id="welcome-username"></span>，待預定的行程如下：</div>
            <div id="booking-section">

            </div>
            <div id="contact-section">
                <div class="section-title">
                    <div class="button bold">您的聯絡資訊</div>
                </div>
                <p class="body ">聯絡姓名：</p>
                <input class="body " type="text"> <br>
                <p class="body ">聯絡信箱：</p>
                <input class="body " type="email"> <br>
                <p class="body ">手機號碼：</p>
                <input class="body " type="text"> <br>
                <p class="body bold">請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。</p>
        
            </div>
            <hr>
            <div id="payment-section">
                <div class="section-title">
                    <div class="button bold">信用卡付款資訊</div>
                </div>
                <p class="body ">卡片號碼：</p>
                <input class="body " type="text"> <br>
                <p class="body ">過期時間：</p>
                <input class="body " type="email"> <br>
                <p class="body ">驗證密碼：</p>
                <input class="body " type="text"> <br>
            </div>
            <hr>
            <div id="confirmation-section">
                <br><button id="bookng-button" class="btn"><span>確認訂購並付款</span></button>
            </div>`
            document.getElementById("main-content").insertAdjacentHTML("afterbegin", insertBookingInfo);


            for (i = 0; i < data.length; i++) {
                d = data[i];
                attrId = d['attraction']['id'];
                attrName = d['attraction']['name'];
                attrAddress = d['attraction']['address'];
                attrImage = d['attraction']['image'];
                bookingDate = d['date'];
                bookingTime = d['time'];
                bookingPrice = d['price'];
                bookingId = d['bookingId']

                if (bookingTime == 0) {
                    bookingTime = "早上 9 點到中午 12 點"
                } else {
                    bookingTime = "中午 12 點到下午 4 點"
                }

                insertHTML = `<div id="booking-section-` + bookingId + `">
            <div id="booking-section-image">
            <a href="/attraction/`+ attrId + `"><img src="` + attrImage + `"></a>
        </div>
        <div id="booking-section-info">
            <div id="booking-section-info-title">
                <p class="body bold">台北一日遊: <span id="booking-section-info-title-text class="body bold">`+ attrName + `</span></p>
            </div>
            
            <div id="booking-section-info-description">
                <p class="body bold">日期</p>
                <p class="body ">`+ bookingDate + `</p> <br>
                <p class="body bold">時間</p>
                <p class="body ">`+ bookingTime + `</p> <br>
                <p class="body bold">費用</p>
                <p class="body ">新台幣 `+ bookingPrice + ` 元</p><br>
                <p class="body bold">地點</p>
                <p class="body ">`+ attrAddress + `</p> <br>
            </div>

        </div>
        <div id="booking-section-delete">
            <i  id="`+ bookingId + `-` + bookingPrice + `" class="fa fa-trash" onclick="delete_booking(this.id)"></i>
        </div>
    
    <hr>`


                document.getElementById("booking-section").insertAdjacentHTML("afterbegin", insertHTML);

                totalPrice += bookingPrice;
            }

            insertTotalPrice = `<p id="total-price" class="body bold">總價：新台幣 ` + totalPrice + ` 元</p>`;

            document.getElementById("confirmation-section").insertAdjacentHTML("afterbegin", insertTotalPrice);
        }
        document.getElementById('welcome-username').innerText = auth_data['data']['name'];



    }
})



async function delete_booking(bookingIdPrice) {
    arr = bookingIdPrice.split("-");
    bookingId = arr[0];
    bookingPrice = arr[1];


    const url = "/api/booking";
    let data = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json ; charset=UTF-8'
        },
        body: JSON.stringify({
            bookingId: bookingId
        })
    })
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData);
            return responseData;
        })
        .catch(error => console.warn(error));
    if (data.hasOwnProperty("ok")) {

        toBeDelete = "booking-section-" + bookingId;

        removeFadeOut(document.getElementById(toBeDelete), 1000);
        window.location.replace("/booking");

        // totalPrice-=bookingPrice;
        // document.getElementById("total-price").innerText=`總價：新台幣 `+totalPrice+` 元`

    }
}


function removeFadeOut(el, speed) {
    var seconds = speed / 1000;
    el.style.transition = "opacity " + seconds + "s ease";

    el.style.opacity = 0;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, speed);


}
