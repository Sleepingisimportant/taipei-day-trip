from flask import Flask
import json

import mysql.connector
from mysql.connector import errorcode
import mysql.connector.pooling




app = Flask(__name__,
            static_folder="public",
            static_url_path="/")

app.config['JSON_AS_ASCII'] = False

app.secret_key = "any string but secret"


#### create connection pool ####
db_config = {
    'host': 'ec2-54-227-42-22.compute-1.amazonaws.com',
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

file_path = "data/taipei-attractions.json"
f = open(file_path, 'r')

json_load_data = json.load(f)
data = json_load_data["result"]["results"]
f.close()


for d in data:
    rate = d["rate"]
    direction = d["direction"]
    name = d["name"]
    date = d["date"]
    longitude = d["longitude"]
    ref_wp = d["REF_WP"]
    avBegin = d["avBegin"]
    langinfo = d["langinfo"]
    mrt = d["MRT"]
    serialNo = d["SERIAL_NO"]
    RowNumber = d["RowNumber"]
    cat = d["CAT"]
    memoTime = d["MEMO_TIME"]
    poi = d["POI"]
    idpt = d["idpt"]
    latitude = d["latitude"]
    description = d["description"]
    idNum = d["_id"]
    avEnd = d["avEnd"]
    address = d["address"]

    file = d["file"]
    fileSplit = file.split("https")
    jpg = ".jpg"
    png = ".png"
    http = "http"
    file_cleaned = ''.join(
        map(str, [http+x for x in fileSplit if jpg in x.lower() or png in x.lower()]))

    insert_attraction = ("INSERT INTO attraction "
                         "(rate, direction, name, date, longitude, REF_WP, avBegin, langinfo, MRT, SERIAL_NO, RowNumber, CAT, MEMO_TIME, POI, file, idpt, latitude, description, ID, avEnd, address)"
                         "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")

    cur.execute(insert_attraction, (rate, direction, name, date, longitude, ref_wp, avBegin, langinfo, mrt,
                                    serialNo, RowNumber, cat, memoTime, poi, file_cleaned, idpt, latitude, description, idNum, avEnd, address))

cnx.commit()
