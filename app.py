from flask import *
import requests
import mysql.connector
import mysql.connector.pooling
from functools import wraps
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__,
            static_folder="static",
            static_url_path="/")

app.config['JSON_AS_ASCII'] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.secret_key = os.getenv('appSecretKey')


#### create connection pool ####
db_config = {
    'host': 'ec2-52-70-76-242.compute-1.amazonaws.com',
    'user': 'admin',
    'password': os.getenv('password'),
    'database': os.getenv('database'),
    'port': 3306,
}




cnxpool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name='website_dbp', pool_size=20, pool_reset_session=True, **db_config)


# Pages
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


# success message
def success_message():
    return {
        "ok": True,
    }

# handle error


def error_messsage(message):
    return {
        "error": True,
        "message": message,
    }


@app.errorhandler(Exception)
def handle_exception(e):
    print("error:")
    print(e)
    # now you're handling non-HTTP exceptions only
    return error_messsage("Internal Server Error."), 500


## APIs ##


@app.route("/api/attractions", methods=["GET"])
def api_attractions():

    cnx = cnxpool.get_connection()
    cur = cnx.cursor(buffered=True)

    keyword = request.args.get("keyword")
    page = request.args.get("page")

    if page is None or page == "":
        err = "Please specify the page number."
        return error_messsage(err)
    else:
        try:
            pageInt = int(page)
        except ValueError:
            err = "Page value is valid."
            return error_messsage(err)

    if pageInt < 0:
        err = "Page number is not valid."
        return error_messsage(err)

    else:
        rowFrom = pageInt*12
        rowTo = 12

        if keyword is None:
            cur.execute(
                "SELECT * FROM attraction limit %s, %s ", (rowFrom, rowTo))
        else:
            keyword = "%"+keyword+"%"
            cur.execute("""SELECT * FROM attraction WHERE name LIKE %s OR CAT LIKE %s OR description LIKE %s OR address LIKE %s OR direction LIKE %s OR MRT LIKE %s limit %s, %s """,
                        (keyword, keyword, keyword, keyword, keyword, keyword, rowFrom, rowTo,))

        data = cur.fetchall()

        cnx.close()
        nextPage = None if len(data) < 12 else (pageInt+1)

        json = {
            "nextPage": nextPage,
            "data": [
            ]}

        for d in data:

            # clear non-image file
            imageFile = d[15]
            fileSplit = imageFile.split("https")
            https = "https"
            imagesList = [https+x for x in fileSplit[1:]]

            attraction = {
                "id": d[0],
                "name": d[3],
                "category": d[12],
                "description": d[18],
                "address": d[20],
                "transport": d[2],
                "mrt": d[9],
                "lat": d[17],
                "lng": d[5],
                "images": imagesList
            }
            json["data"].append(attraction)

        return json


@app.route("/api/attraction/<id>", methods=["GET"])
def api_attraction_id(id):

    cnx = cnxpool.get_connection()
    cur = cnx.cursor(buffered=True)

    cur.execute("SELECT * FROM attraction WHERE ID= %s", (id,))
    data = cur.fetchone()
    cnx.close()

    json = {
        "data": "",
    }

    # clear non-image file
    imageFile = data[15]
    fileSplit = imageFile.split("https")
    https = "https"
    imagesList = [https+x for x in fileSplit[1:]]

    attraction = {
        "id": data[0],
        "name": data[3],
        "category": data[12],
        "description": data[18],
        "address": data[20],
        "transport": data[2],
        "mrt": data[9],
        "lat": data[17],
        "lng": data[5],
        "images": imagesList
    }
    json["data"] = attraction

    return json


@app.route("/api/categories")
def api_categories():
    cnx = cnxpool.get_connection()
    cur = cnx.cursor(buffered=True)
    cur.execute("SELECT DISTINCT CAT FROM attraction")
    data = cur.fetchall()
    cnx.close()

    json = {
        "data":  [d[0] for d in data]
    }

    return json


@app.route("/api/user", methods=["POST"])
def api_register_user():

    try:
        cnx = cnxpool.get_connection()
        cur = cnx.cursor(buffered=True)

        request_params = request.get_json()
        name = request_params["name"]
        email = request_params["email"]
        password = request_params["password"]

        cur.execute("INSERT INTO member (name, email, password) VALUES (%s, %s, %s)",
                    (name, email, password))
        cnx.commit()

        return success_message()

    except mysql.connector.Error:
        return error_messsage("註冊失敗，重複的 Email 或其他原因"), 400

    finally:
        cnx.close()


@app.route("/api/user/auth", methods=["PUT"])
def api_login_user():
    try:

        cnx = cnxpool.get_connection()
        cur = cnx.cursor(buffered=True)

        request_params = request.get_json()
        email = request_params["email"]
        password = request_params["password"]

        cur.execute(
            "SELECT * FROM website.member WHERE email = %s AND password = %s", (email, password,))

        row_count = cur.rowcount

        if row_count == 0:
            return error_messsage("帳號或密碼有誤")

        else:
            user = cur.fetchone()

            token = jwt.encode({
                "id": user[0],
                "name": user[1],
                'email': user[2],
                'expiration': str(datetime.utcnow() + timedelta(seconds=604800))
            },
                app.secret_key, algorithm="HS256")

            json = make_response(success_message())
            json.set_cookie('token', token, max_age=604800, samesite=None, secure=False
                            )

            return json

    except mysql.connector.Error:
        return error_messsage("註冊失敗，重複的 Email 或其他原因"), 400

    finally:
        cnx.close()


@app.route("/api/user/auth", methods=["DELETE"])
def api_logout_user():

    json = make_response(success_message())
    json.delete_cookie('token')
    return json


# https://blog.51cto.com/hanzhichao/5325252
@app.route("/api/user/auth", methods=["GET"])
def api_verify_authentication():
    token = request.cookies.get('token')

    if token is None:
        return {"data": None}

    try:

        _payload = jwt.decode(token, app.secret_key, algorithms="HS256")

        json = {
            "data": {
                "id": _payload["id"],
                "name": _payload["name"],
                "email": _payload["email"]
            }
        }

        return json

    except jwt.InvalidTokenError as e:
        print('jwt.InvalidTokenError')

        print(e)

        return {"data": None}
    except jwt.PyJWTError as e:
        print('jwt.PyJWTError')
        print(e)
        return {"data": None}


@app.route("/api/booking", methods=["POST"])
def api_create_booking():
    try:
        cnx = cnxpool.get_connection()
        cur = cnx.cursor(buffered=True)

        request_params = request.get_json()

        memberId = request_params["memberId"]
        attractionId = request_params["attractionId"]
        booking_date = request_params["date"]
        booking_time = request_params["time"]
        price = request_params["price"]

        cur.execute("INSERT INTO booking (member_id, attraction_id,booking_date,booking_time,price) VALUES (%s, %s, %s, %s, %s)",
                    (memberId, attractionId, booking_date, booking_time, price))
        cnx.commit()

        return success_message()

    finally:
        cnx.close()


@app.route("/api/booking", methods=["GET"])
def api_get_unconfirmed_booking():
    token = request.cookies.get('token')
    if token is None:
        return error_messsage("請先登入")
    try:

        _payload = jwt.decode(token, app.secret_key, algorithms="HS256")

        memberId = int(_payload["id"])

        cnx = cnxpool.get_connection()
        cur = cnx.cursor(buffered=True)

        cur.execute(
            "SELECT  booking.booking_date, booking_time, booking.price, attraction.id, attraction.name, attraction.address, attraction.file, booking.booking_Id FROM booking INNER JOIN attraction ON booking.attraction_id=attraction.ID WHERE member_id= %s AND booking_status=%s;", (memberId, 0))
        data = cur.fetchall()
        cnx.close()

        json = {
            "data": [
            ]}

        for d in data:
            images = d[6].split("https")
            image = "https"+images[1]

            booking = {
                "attraction": {
                    "id": d[3],
                    "name": d[4],
                    "address": d[5],
                    "image": image,
                },
                "date": str(d[0]),
                "time": d[1],
                "price": d[2],
                "bookingId": d[7],
            }
            json["data"].append(booking)

        return json

    except jwt.InvalidTokenError as e:
        print('jwt.InvalidTokenError')

        print(e)

        return {"data": None}
    except jwt.PyJWTError as e:
        print('jwt.PyJWTError')
        print(e)
        return {"data": None}


@app.route("/api/booking", methods=["DELETE"])
def api_delete_booking():
    try:
        cnx = cnxpool.get_connection()
        cur = cnx.cursor(buffered=True)

        request_params = request.get_json()
        bookingId = request_params["bookingId"]

        cur.execute(
            "DELETE FROM booking WHERE booking_id= %s;", (bookingId,))
        cnx.commit()

        return success_message()

    except mysql.connector.Error:
        return error_messsage("刪除失敗，請再試一次。"), 400

    finally:
        cnx.close()


@app.route("/api/orders", methods=["POST"])
def api_confirm_booking():

    token = request.cookies.get('token')
    if token is None:
        return error_messsage("請先登入")
    try:
        _payload = jwt.decode(token, app.secret_key, algorithms="HS256")
        memberId = int(_payload["id"])

        cnx = cnxpool.get_connection()
        cur = cnx.cursor(buffered=True)

        partnerKey = os.getenv('partnerKey')


        json = {
            "prime": request.json["prime"],
            "partner_key": partnerKey,
            "merchant_id": "wehelp2022_CTBC",
            "details": "TapPay Test",
            "amount": int(request.json["totalPrice"]),
            "cardholder": request.json["cardholder"],
            "remember": True,
            "order_number": datetime.now().strftime('%Y%m%d%H%M%S'),
            "bank_transaction_id": datetime.now().strftime('%Y%m%d%H%M%S')
        }

        headers = {
            "Content-Type": "application/json",
            "x-api-key": partnerKey,
        }

        tapPayResponese = requests.post(
            'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', json=json, headers=headers, timeout=10)

        tapPayData = tapPayResponese.json()
        print(tapPayData)
        
        if tapPayData["msg"] == 'Success':
            cur.execute(
                "UPDATE booking SET booking_status=1, contact_name= %s, contact_email= %s, contact_phone= %s, order_number= %s, bank_transaction_id= %s  WHERE member_id= %s AND booking_status=0;", (request.json["cardholder"]["name"],request.json["cardholder"]["email"],request.json["cardholder"]["phone_number"],tapPayData["order_number"],tapPayData["bank_transaction_id"],memberId))
            cnx.commit()
            return jsonify({"ok": True, "orderNumber": tapPayData["order_number"]})
        else:
            err_msg="尚未付款成功，請重新再試一次。"
            return error_messsage(err_msg)

    finally:
        cnx.close()


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000)
