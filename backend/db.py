# db.py

import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="tanay282004",
        database="stock_trading_app"
    )
