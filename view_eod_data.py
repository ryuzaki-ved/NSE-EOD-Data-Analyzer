import sqlite3

conn = sqlite3.connect('eod_data.db')
cur = conn.cursor()

# View fii_derivatives table
print("\nFII Derivatives Table:")
print("date       | instrument           | buy_contracts | buy_amt   | sell_contracts | sell_amt  | oi_contracts | oi_amt   | buy_contracts_adj | sell_contracts_adj | oi_contracts_adj | buy_amt_adj   | sell_amt_adj  | oi_amt_adj    | buy_str_act | sell_str_act")
print("-"*200)
for row in cur.execute('SELECT * FROM fii_derivatives ORDER BY date, instrument'):
    print(f"{row[0]:10} | {row[1]:20} | {row[2]:13} | {row[3]:9.2f} | {row[4]:14} | {row[5]:9.2f} | {row[6]:12} | {row[7]:8.2f} | {row[8]:17} | {row[9]:18} | {row[10]:16} | {row[11]:13.2f} | {row[12]:13.2f} | {row[13]:13.2f} | {row[14]:11.4f} | {row[15]:12.4f}")

# View participant_oi table
print("\nParticipant OI Table:")
print("date       | client_type | future_index_long | future_index_short | future_stock_long | future_stock_short | option_index_call_long | option_index_put_long | option_index_call_short | option_index_put_short | option_stock_call_long | option_stock_put_long | option_stock_call_short | option_stock_put_short | total_long_contracts | total_short_contracts")
print("-"*220)
for row in cur.execute('SELECT * FROM participant_oi ORDER BY date, client_type'):
    print(f"{row[0]:10} | {row[1]:12} | {row[2]:17} | {row[3]:18} | {row[4]:17} | {row[5]:19} | {row[6]:22} | {row[7]:20} | {row[8]:24} | {row[9]:23} | {row[10]:22} | {row[11]:21} | {row[12]:25} | {row[13]:22} | {row[14]:20} | {row[15]:21}")

# View participant_vol table
print("\nParticipant VOL Table:")
print("date       | client_type | future_index_long | future_index_short | future_stock_long | future_stock_short | option_index_call_long | option_index_put_long | option_index_call_short | option_index_put_short | option_stock_call_long | option_stock_put_long | option_stock_call_short | option_stock_put_short | total_long_contracts | total_short_contracts")
print("-"*220)
for row in cur.execute('SELECT * FROM participant_vol ORDER BY date, client_type'):
    print(f"{row[0]:10} | {row[1]:12} | {row[2]:17} | {row[3]:18} | {row[4]:17} | {row[5]:19} | {row[6]:22} | {row[7]:20} | {row[8]:24} | {row[9]:23} | {row[10]:22} | {row[11]:21} | {row[12]:25} | {row[13]:22} | {row[14]:20} | {row[15]:21}")

conn.close() 