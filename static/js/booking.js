

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
                <form id="contact-form">
                <p class="body ">聯絡姓名：</p>
                <input class="body " type="text" name="name" required> <br>
                <p class="body " type="email">聯絡信箱：</p>
                <input class="body " type="email" name="email" required> <br>
                <p class="body " >手機號碼：</p>
                <input class="body " type="text" name="phone_number" required> <br>  
                </form>
                <p class="body bold">請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。</p>
                
            </div>
            <hr>
            <div id="payment-section">
                <div class="section-title">
                    <div class="button bold">信用卡付款資訊</div>
                </div>
                <p class="body" >卡片號碼：</p>
                <div class="tpfield" id="card-number"></div><br>
                <p class="body ">過期時間：</p>
                <div class="tpfield body" id="card-expiration-date"></div><br>
                <p class="body ">驗證密碼：</p>
                <div class="tpfield body" id="card-ccv"></div><br>
                </div>
            <hr>
            <div id="confirmation-section">
                <br><button id="booking-button" class="btn"><span>確認訂購並付款</span></button>
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

            insertTotalPrice = `<p class="body bold">總價：新台幣 <scan class="body bold" id="total-price" >` + totalPrice + `</scan> 元</p>`;

            document.getElementById("confirmation-section").insertAdjacentHTML("afterbegin", insertTotalPrice);
        }
        document.getElementById('welcome-username').innerText = auth_data['data']['name'];


        if (document.getElementById("booking-button") != null) {
            addTapPayScript(() => {
                setupSdk();
                setupCard();
                cardOnUpdate();
                confirmButtonHandler();
            });
        }



    }
});

function addTapPayScript(callback) {
    const script = document.createElement('script');

    script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.14.0";
    script.async = true;
    script.addEventListener('load', callback);
    document.body.appendChild(script);
};


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



    }
}


function removeFadeOut(el, speed) {
    var seconds = speed / 1000;
    el.style.transition = "opacity " + seconds + "s ease";

    el.style.opacity = 0;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, speed);
};

function disableScrolling() {
    var x = window.scrollX;
    var y = window.scrollY;
    window.onscroll = function () { window.scrollTo(x, y); };
}


function getContactFormData() {

    const contactForm = document.getElementById("contact-form");
    const contactFormData = new FormData(contactForm);
    return {
        name: contactFormData.get("name"),
        email: contactFormData.get("email"),
        phone_number: contactFormData.get("phone_number"),
    };
}


async function createOrder({ prime, cardholder, totalPrice }) {

    disableScrolling();
    insertHTML = `  <div id="dimmed-background"><div id="loading"><h1>Loading...</h1></div></div>`;
    document.body.insertAdjacentHTML("beforeend", insertHTML);
    

    const url = "/api/orders";
    let data = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json ; charset=UTF-8'
        },
        body: JSON.stringify({
            prime: prime,
            cardholder: cardholder,
            totalPrice: totalPrice
        })
    })
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData);
            return responseData;
        })
        .catch(error => console.warn(error));





    if (data.ok) {

        window.location.href = `/thankyou?ordernumber=${data.orderNumber}`;

        return
    }

};

function addTapPayScript(callback) {
    const script = document.createElement('script');

    script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.14.0";
    script.async = true;
    script.addEventListener('load', callback);
    document.body.appendChild(script);
}


//tapPay

function setupSdk() {

    if (window.TPDirect) {
        console.log(window.TPDirect)
        TPDirect.setupSDK(127032, "app_ZycZpLOlUsAmqOc38EQkggoaba7jcRx8aURxcWa2lGCPbbncjYnEkCZ0CuQ5", 'sandbox')
    } else {
        console.error("TPDirect_unload")
    }
}

function setupCard() {
    const fields = {
        number: {
            // css selector
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv'
        }
    }

    TPDirect.card.setup({
        fields: fields,
        styles: {
            // Style all elements
            'input': {
                'color': 'gray',
                "border-radius": "5px"
            },
            // Styling ccv field
            'input.ccv': {
                // 'font-size': '16px'
            },
            // Styling expiration-date field
            'input.expiration-date': {
                // 'font-size': '16px'
            },
            // Styling card-number field
            'input.card-number': {
                // 'font-size': '16px'
            },
            // style focus state
            ':focus': {
                // 'color': 'black'
            },
            // style valid state
            '.valid': {
                'color': 'green'
            },
            // style invalid state
            '.invalid': {
                'color': 'red'
            },
            // Media queries
            // Note that these apply to the iframe, not the root window.
            '@media screen and (max-width: 400px)': {
                'input': {
                    'color': 'orange'
                }
            }
        },
        // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
        isMaskCreditCardNumber: true,
        maskCreditCardNumberRange: {
            beginIndex: 6,
            endIndex: 11
        }
    })
}

//得知目前卡片資訊的輸入狀態
function cardOnUpdate() {

    const submitButton = document.getElementById("booking-button")
    TPDirect.card.onUpdate(function (update) {
        // update.canGetPrime === true
        // --> you can call TPDirect.card.getPrime()
        if (update.canGetPrime) {
            // Enable submit Button to get prime.
            submitButton.removeAttribute('disabled')
        } else {
            // Disable submit Button to get prime.
            submitButton.setAttribute('disabled', true)
        }

        // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
        if (update.cardType === 'visa') {
            // Handle card type visa.
        }

        // number 欄位是錯誤的
        if (update.status.number === 2) {
            // setNumberFormGroupToError()
        } else if (update.status.number === 0) {
            // setNumberFormGroupToSuccess()
        } else {
            // setNumberFormGroupToNormal()
        }

        if (update.status.expiry === 2) {
            // setNumberFormGroupToError()
        } else if (update.status.expiry === 0) {
            // setNumberFormGroupToSuccess()
        } else {
            // setNumberFormGroupToNormal()
        }

        if (update.status.ccv === 2) {
            // setNumberFormGroupToError()
        } else if (update.status.ccv === 0) {
            // setNumberFormGroupToSuccess()
        } else {
            // setNumberFormGroupToNormal()
        }
    })
}

function confirmButtonHandler() {
    const submitButton = document.getElementById("booking-button")
    const onSubmit = (event) => {

        event.preventDefault()

        // 取得 TapPay Fields 的 status
        const tappayStatus = TPDirect.card.getTappayFieldsStatus()

        // 確認是否可以 getPrime
        if (tappayStatus.canGetPrime === false) {
            console.log(tappayStatus)

            alert('can not get prime')
            return
        }

        // Get prime
        TPDirect.card.getPrime((result) => {
            if (result.status !== 0) {
                alert('get prime error ' + result.msg)
                return
            }

            const contactFormData = getContactFormData();
            const totalPrice = document.getElementById("total-price").innerText;

            console.log(result)
            const payHolderData = {
                prime: result.card.prime,
                cardholder: contactFormData,
                totalPrice: totalPrice
            }

            createOrder(payHolderData);

            // send prime to your server, to pay with Pay by Prime API .
            // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
        })
    }
    submitButton.addEventListener("click", onSubmit)
}


