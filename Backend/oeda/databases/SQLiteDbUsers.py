import traceback
from UserDatabase import UserDatabase
from oeda.log import *
import sqlite3

class SQLiteDbUsers(UserDatabase):
    
    def __init__(self, dbfile='OEDA.sqlite'):

        self.db = dbfile
        self.table = 'users'
        self.table_user_groups = 'user_groups'
        try:
            conn = sqlite3.connect(self.db)
            cursor = conn.cursor()
            print("Database connection successfull")
            try:
                sql_u_group = "CREATE TABLE IF NOT EXISTS " + self.table_user_groups + \
                    " (group_id integer PRIMARY KEY, group_name text NOT NULL, created_at DATETIME default current_timestamp)"
                cursor.execute(sql_u_group)
                sql = 'CREATE TABLE IF NOT EXISTS ' + self.table + \
                    '(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT, db_configuration TEXT, group_id integer NOT NULL, created_at DATETIME default current_timestamp, FOREIGN KEY(group_id) REFERENCES user_groups(group_id))'
                cursor.execute(sql)
                conn.commit()
                conn.close()
            except Exception as e:
                print(e)
                error('Table Creation Failed')
                conn.close()
        except:
            error("Database initialization failed")

    def get_connection(self):
        conn = False
        try:
            conn = sqlite3.connect(self.db)
            conn.row_factory = sqlite3.Row
        except:
            error("Database connection failed")

        return conn


    def get_users(self):
        users = []
        try:
            conn = self.get_connection()
            with conn:
                cursor = conn.cursor()

                sql = 'SELECT * FROM ' + self.table + ' as u INNER JOIN ' + self.table_user_groups + \
                    ' as ug ON u.group_id == ug.group_id'
                cursor.execute(sql)
                for row in cursor:
                    print('with prefix')
                    print(row['u.name'])
                    print(row['ug.group_name'])
                    print('without prefix')
                    print(row['name'])
                    print(row['group_name'])
                    user = {}
                    user['name'] = row['u.name']
                    user['id'] = row['u.id']
                    user['password'] = row['u.password']
                    user['db_configuration'] = row['u.db_configuration']
                    user['created_at'] = row['u.created_at']
                    user['group_id'] = row['u.group_id']
                    user['group_name'] = row['ug.group_name']

                # row = cursor.fetchone()
                    users.append(user)
            
                # for row in rows:
                #     users.append(row)
        except:
            error("Fetching all users failed")
            
        
        return users


    def get_user(self, username):
        users = []
        try:
            conn = self.get_connection()
            with conn:
                
                cursor = conn.cursor()
                #sql = "SELECT * FROM " + self.table + " WHERE name = (?)"
                sql = 'SELECT * FROM ' + self.table + ' as u INNER JOIN ' + self.table_user_groups + \
                    ' as ug ON u.group_id == ug.group_id WHERE u.name = (?)'
                try:
                    cursor.execute(sql, (username,))
                    for row in cursor:
                        user = {}
                        user['name'] = row['name']
                        user['id'] = row['id']
                        user['password'] = row['password']
                        user['db_configuration'] = row['db_configuration']
                        #user['created_at'] = row['created_at']
                        user['group_id'] = row['group_id']
                        user['group_name'] = row['group_name']


                    # row = cursor.fetchone()
                        users.append(user)
                    #print(users)
                except Exception as e:
                    print(e)
                
        except Exception as e:
            print(e)
            error("Fetching single user failed")
        
        return users

    def save_user(self, user):
        
        if 'group_id' not in user:
            user['group_id'] = 1

        if 'db_configuration' not in user:
            user['db_configuration'] = ''
        else:
            user['db_configuration'] = str(user['db_configuration'])

        try:
            conn = self.get_connection()
            with conn:
                cursor = conn.cursor()

                sql = 'insert into ' + self.table + ' (name, password, group_id, db_configuration) VALUES(?,?,?,?)'
                cursor.execute(sql, [user['name'], user['password'], user['group_id'], user['db_configuration']])
            
        except Exception as e:
            print(e)
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
                    sql = 'update ' + self.table + ' set name = (?) where name = (?)'
                    cursor.execute(sql, (users[0]['name'], users[0]['name'], ))
                else:
                    return False
            
        except:
            error("Updating user failed")
            return False
        
        return True
