import traceback
from UserDatabase import UserDatabase
from oeda.log import *
import sqlite3

class SQLiteDbUsers(UserDatabase):

    def __init__(self, host, port, db_config):

        self.db = 'OEDA.sqlite'
        self.table = 'users'
        try:
            self.conn = sqlite3.connect(self.db)
            self.cursor = conn.cursor()
            print("Database connection successfully")

            sql = 'create table if not exists ' + self.table + ' (id int primary key AUTOINCREMENT, name text, password text, createdAt datetime default current_timestamp)'
            self.cursor.execute(sql)
            conn.commit()
            conn.close()
        except:
            error("Database initialization failed")
            conn.close()


    def get_users(self):
        users = []
        try:
            conn = sqlite3.connect(self.db)
            with conn:
                cursor = conn.cursor()

                sql = 'select * from ' + self.table
                cursor.execute(sql)
                rows = cursor.fetchall()
            
                for row in rows:
                    users.append(row)
            
        except:
            error("Fetching all users failed")
            
        
        return users



    def get_user(self, username):
        users = []
        try:
            conn = sqlite3.connect(self.db)
            with conn: 
                cursor = conn.cursor()
                sql = 'select * from ' + self.table + ' where name = ?'
                cursor.execute(sql, username)
                rows = cursor.fetchall()
                users.append([rows[0])
        except:
            error("Fetching single user failed")
        
        return users

    def save_user(self, user):

        try:
            conn = sqlite3.connect(self.db)
            with conn:
                cursor = conn.cursor()

                sql = 'insert into ' + self.table + ' (name, password) VALUES(?,?)'
                cursor.execute(sql, user['name'], user['password'])
            
        except:
            error("Inserting user failed")
            return False
        
        return True

    def update_user(self, user):
        try:
            conn = sqlite3.connect(self.db)
            with conn:
                cursor = conn.cursor()
                users = self.get_user(user['name'])
                if len(users) == 1:
                    sql = 'update ' + self.table + ' set name = ? where name = ?'
                    cursor.execute(sql, users[0]['name'])
                else:
                    return False
            
        except:
            error("Updating user failed")
            return False
        
        return True
