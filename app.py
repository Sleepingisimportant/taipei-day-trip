from flask import *

import mysql.connector
import mysql.connector.pooling
from functools import wraps
import jwt
from datetime import datetime, timedelta
import time


app = Flask(__name__,
            static_folder="static",
            static_url_path="/")

app.config['JSON_AS_ASCII'] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.secret_key = "9e57f96152234a7d86453201e927cc1f"


#### create connection pool ####
db_config = {
    'host': 'ec2-52-70-76-242.compute-1.amazonaws.com',
    'user': 'admin',
    'password': 'Mysqlpw1!',
    'database': 'website',
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
    # print(e)
    # now you're handling non-HTTP exceptions only
    return error_messsage("Internal Server Error."), 500




## APIs ##


@app.route("/api/attractions")
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


@app.route("/api/attraction/<id>")
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

        json = {
            "ok": True
        }
        return json

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
            print("setcookie")
            json.set_cookie('token', token, max_age=604800, samesite=None, secure=False
                            )
            print("setcookiedone")

            return json

    except mysql.connector.Error:
        return error_messsage("註冊失敗，重複的 Email 或其他原因"), 400

    finally:
        cnx.close()


@app.route("/api/user/auth", methods=["DELETE"])
def api_logout_user():

    json = make_response(success_message())
    json.delete_cookie('token')
    print(request.cookies.get('token'))
    return json


# https://blog.51cto.com/hanzhichao/5325252
@app.route("/api/user/auth", methods=["GET"])
def api_verify_authentication():
    token = request.cookies.get('token')

    if token is None:
        return {"data": None}

    try:

        _payload = jwt.decode(token, app.secret_key, algorithms="HS256")

        print(_payload)
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




if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000)
