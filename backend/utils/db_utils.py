def get_connection():
    import mysql.connector
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="tanay282004",
        database="stock_trading_app"
    ) 