import sqlite3
conn = sqlite3.connect('database/explorapet.db')
cursor = conn.cursor()
cursor.execute("UPDATE tutores SET status='Ativo' WHERE status='Prospecto'")
conn.commit()
conn.close()
print('Atualizado!')
