import os
import pymysql
from dotenv import load_dotenv  # Load dotenv to read .env file

load_dotenv()

# Connect to MySQL using values from .env
db = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = db.cursor()
