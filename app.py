from flask import *

import mysql.connector
from mysql.connector import errorcode
from werkzeug.exceptions import HTTPException
import mysql.connector.pooling


app = Flask(__name__,
            static_folder="static",
            static_url_path="/")

app.config['JSON_AS_ASCII'] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.secret_key = "any string but secret"


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

try:
    cnx = cnxpool.get_connection()

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)

cur = cnx.cursor(buffered=True)


# handle error
def error_messsage(message):
    return {
        "error": True,
        "message": message
    }


@app.errorhandler(Exception)
def handle_exception(e):
    # pass through HTTP errors
    if isinstance(e, HTTPException):
        return e

    # now you're handling non-HTTP exceptions only
    return error_messsage("Internal Server Error."), 500


## APIs ##
@app.route("/api/attractions")
def apiAttractions():

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
def apiAttractionId(id):

    cur.execute("SELECT * FROM attraction WHERE ID= %s", (id,))
    data = cur.fetchone()

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
def categories():

    cur.execute("SELECT DISTINCT CAT FROM attraction")
    data = cur.fetchall()

    json = {
        "data":  [d[0] for d in data]
    }
    return json


# # Pages
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):

    fetchedData = apiAttractionId(id)
    data = fetchedData['data']

    address = data['address']
    category = data['category']
    description = data['description']
    transport = data['transport']
    name = data['name']
    mrt = data['mrt']
    images = data['images']
    print(type(images))
    print(images)

    return render_template("attraction.html", address=address, category=category, description=description, transport=transport, name=name, mrt=mrt, images=images)
# @app.route("/booking")
# def booking():
# 	return render_template("booking.html")
# @app.route("/thankyou")
# def thankyou():
# 	return render_template("thankyou.html")


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000)
