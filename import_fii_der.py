import os
import re
import sqlite3
import pandas as pd

# Path to your folder and database
folder = 'fii_der'
db_path = 'eod_data.db'

# Instrument multipliers
INSTRUMENT_MULTIPLIERS = {
    'BANKNIFTY': 35,
    'NIFTY': 75,
    'MIDCPNIFTY': 140,
    'FINNIFTY': 65,
    'NIFTYNXT50': 25
}

# Valid instruments
valid_instruments = [
    "INDEX FUTURES", "BANKNIFTY FUTURES", "FINNIFTY FUTURES", "MIDCPNIFTY FUTURES", "NIFTY FUTURES", "NIFTYNXT50 FUTURES",
    "INDEX OPTIONS", "BANKNIFTY OPTIONS", "FINNIFTY OPTIONS", "MIDCPNIFTY OPTIONS", "NIFTY OPTIONS", "NIFTYNXT50 OPTIONS",
    "STOCK FUTURES", "STOCK OPTIONS"
]

# Connect to SQLite
def get_connection():
    return sqlite3.connect(db_path)

# Create table with new columns
with get_connection() as conn:
    cur = conn.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS fii_derivatives (
        date TEXT,
        instrument TEXT,
        buy_contracts INTEGER,
        buy_amt REAL,
        sell_contracts INTEGER,
        sell_amt REAL,
        oi_contracts INTEGER,
        oi_amt REAL,
        buy_contracts_adj INTEGER,
        sell_contracts_adj INTEGER,
        oi_contracts_adj INTEGER,
        buy_amt_adj REAL,
        sell_amt_adj REAL,
        oi_amt_adj REAL,
        buy_str_act REAL,
        sell_str_act REAL
    )
    ''')
    conn.commit()

def extract_date(filename):
    # Try dd-Mmm-yyyy (e.g., 10-Jul-2025)
    match = re.search(r'(\d{2}-[A-Za-z]{3}-\d{4})', filename)
    if match:
        return match.group(1)
    # Try ddmmyyyy (e.g., 10072025)
    match = re.search(r'(\d{2})(\d{2})(\d{4})', filename)
    if match:
        day, month, year = match.groups()
        import calendar
        month_abbr = calendar.month_abbr[int(month)].title()
        return f"{day}-{month_abbr}-{year}"
    return None

def is_number_like(val):
    if pd.isna(val):
        return False
    if isinstance(val, (int, float)):
        return True
    if isinstance(val, str):
        val = val.replace(',', '').replace(' ', '')
        try:
            float(val)
            return True
        except Exception:
            return False
    return False

def safe_int(val):
    if pd.isna(val) or val == '':
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    if isinstance(val, str):
        val = val.replace(',', '').replace(' ', '')
        try:
            return int(float(val))
        except Exception:
            return 0
    return 0

def safe_float(val):
    if pd.isna(val) or val == '':
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        val = val.replace(',', '').replace(' ', '')
        try:
            return float(val)
        except Exception:
            return 0.0
    return 0.0

def get_multiplier(instrument):
    # Sort keys by length descending to match the most specific first
    for key in sorted(INSTRUMENT_MULTIPLIERS, key=len, reverse=True):
        if instrument.startswith(key):
            return INSTRUMENT_MULTIPLIERS[key]
    return 1

def process_csv_file(fpath, date):
    df = pd.read_csv(fpath, header=None)
    records = []
    # For summary
    summary = {
        'INDEX FUTURES': {
            'buy_contracts_adj': 0, 'sell_contracts_adj': 0, 'oi_contracts_adj': 0,
            'buy_amt_adj': 0, 'sell_amt_adj': 0, 'oi_amt_adj': 0,
            'buy_contracts': 0, 'sell_contracts': 0, 'oi_contracts': 0,
            'buy_amt': 0, 'sell_amt': 0, 'oi_amt': 0
        },
        'INDEX OPTIONS': {
            'buy_contracts_adj': 0, 'sell_contracts_adj': 0, 'oi_contracts_adj': 0,
            'buy_amt_adj': 0, 'sell_amt_adj': 0, 'oi_amt_adj': 0,
            'buy_contracts': 0, 'sell_contracts': 0, 'oi_contracts': 0,
            'buy_amt': 0, 'sell_amt': 0, 'oi_amt': 0
        }
    }
    # Which instruments to sum for each summary
    futures_instruments = [
        "BANKNIFTY FUTURES", "FINNIFTY FUTURES", "MIDCPNIFTY FUTURES", "NIFTY FUTURES", "NIFTYNXT50 FUTURES"
    ]
    options_instruments = [
        "BANKNIFTY OPTIONS", "FINNIFTY OPTIONS", "MIDCPNIFTY OPTIONS", "NIFTY OPTIONS", "NIFTYNXT50 OPTIONS"
    ]
    for i, row in df.iterrows():
        if i < 3:
            continue
        instrument = str(row[0]).strip()
        if not instrument or instrument.lower() == "nan" or instrument == "Notes:":
            continue
        if instrument.startswith("Notes"):
            break
        # Skip original INDEX FUTURES and INDEX OPTIONS rows from CSV
        if instrument in ["INDEX FUTURES", "INDEX OPTIONS"]:
            continue
        if len(row) >= 7 and instrument in valid_instruments:
            try:
                buy_contracts = safe_int(row[1])
                buy_amt = safe_float(row[2])
                sell_contracts = safe_int(row[3])
                sell_amt = safe_float(row[4])
                oi_contracts = safe_int(row[5])
                oi_amt = safe_float(row[6])
                multiplier = get_multiplier(instrument)
                buy_contracts_adj = buy_contracts * multiplier
                sell_contracts_adj = sell_contracts * multiplier
                oi_contracts_adj = oi_contracts * multiplier
                buy_amt_adj = buy_amt * 1e7
                sell_amt_adj = sell_amt * 1e7
                oi_amt_adj = oi_amt * 1e7
                buy_str_act = (buy_amt_adj / buy_contracts_adj) if buy_contracts_adj else 0
                sell_str_act = (sell_amt_adj / sell_contracts_adj) if sell_contracts_adj else 0
                records.append((
                    date, instrument, buy_contracts, buy_amt, sell_contracts, sell_amt, oi_contracts, oi_amt,
                    buy_contracts_adj, sell_contracts_adj, oi_contracts_adj,
                    buy_amt_adj, sell_amt_adj, oi_amt_adj,
                    buy_str_act, sell_str_act
                ))
                # Add to summary
                if instrument in futures_instruments:
                    for k, v in zip(
                        ['buy_contracts', 'sell_contracts', 'oi_contracts', 'buy_amt', 'sell_amt', 'oi_amt',
                         'buy_contracts_adj', 'sell_contracts_adj', 'oi_contracts_adj',
                         'buy_amt_adj', 'sell_amt_adj', 'oi_amt_adj'],
                        [buy_contracts, sell_contracts, oi_contracts, buy_amt, sell_amt, oi_amt,
                         buy_contracts_adj, sell_contracts_adj, oi_contracts_adj,
                         buy_amt_adj, sell_amt_adj, oi_amt_adj]
                    ):
                        summary['INDEX FUTURES'][k] += v
                if instrument in options_instruments:
                    for k, v in zip(
                        ['buy_contracts', 'sell_contracts', 'oi_contracts', 'buy_amt', 'sell_amt', 'oi_amt',
                         'buy_contracts_adj', 'sell_contracts_adj', 'oi_contracts_adj',
                         'buy_amt_adj', 'sell_amt_adj', 'oi_amt_adj'],
                        [buy_contracts, sell_contracts, oi_contracts, buy_amt, sell_amt, oi_amt,
                         buy_contracts_adj, sell_contracts_adj, oi_contracts_adj,
                         buy_amt_adj, sell_amt_adj, oi_amt_adj]
                    ):
                        summary['INDEX OPTIONS'][k] += v
            except Exception as e:
                print(f"Error parsing {instrument} in {fpath}: {e}")
    # Insert summary rows
    for summary_inst in ['INDEX FUTURES', 'INDEX OPTIONS']:
        s = summary[summary_inst]
        buy_str_act = (s['buy_amt_adj'] / s['buy_contracts_adj']) if s['buy_contracts_adj'] else 0
        sell_str_act = (s['sell_amt_adj'] / s['sell_contracts_adj']) if s['sell_contracts_adj'] else 0
        records.append((
            date, summary_inst, s['buy_contracts'], s['buy_amt'], s['sell_contracts'], s['sell_amt'], s['oi_contracts'], s['oi_amt'],
            s['buy_contracts_adj'], s['sell_contracts_adj'], s['oi_contracts_adj'],
            s['buy_amt_adj'], s['sell_amt_adj'], s['oi_amt_adj'],
            buy_str_act, sell_str_act
        ))
    return records

def create_participant_tables():
    with get_connection() as conn:
        cur = conn.cursor()
        # Table for Open Interest
        cur.execute('''
        CREATE TABLE IF NOT EXISTS participant_oi (
            date TEXT,
            client_type TEXT,
            future_index_long INTEGER,
            future_index_short INTEGER,
            future_stock_long INTEGER,
            future_stock_short INTEGER,
            option_index_call_long INTEGER,
            option_index_put_long INTEGER,
            option_index_call_short INTEGER,
            option_index_put_short INTEGER,
            option_stock_call_long INTEGER,
            option_stock_put_long INTEGER,
            option_stock_call_short INTEGER,
            option_stock_put_short INTEGER,
            total_long_contracts INTEGER,
            total_short_contracts INTEGER
        )
        ''')
        # Table for Trading Volume
        cur.execute('''
        CREATE TABLE IF NOT EXISTS participant_vol (
            date TEXT,
            client_type TEXT,
            future_index_long INTEGER,
            future_index_short INTEGER,
            future_stock_long INTEGER,
            future_stock_short INTEGER,
            option_index_call_long INTEGER,
            option_index_put_long INTEGER,
            option_index_call_short INTEGER,
            option_index_put_short INTEGER,
            option_stock_call_long INTEGER,
            option_stock_put_long INTEGER,
            option_stock_call_short INTEGER,
            option_stock_put_short INTEGER,
            total_long_contracts INTEGER,
            total_short_contracts INTEGER
        )
        ''')
        conn.commit()

def process_participant_file(fpath, date):
    df = pd.read_csv(fpath, header=1)
    records = []
    for i, row in df.iterrows():
        client_type = str(row.iloc[0]).strip()
        if not client_type or client_type.lower() == 'nan' or client_type == 'Client Type':
            continue
        try:
            records.append((
                date,
                client_type,
                safe_int(row.iloc[1]), safe_int(row.iloc[2]), safe_int(row.iloc[3]), safe_int(row.iloc[4]),
                safe_int(row.iloc[5]), safe_int(row.iloc[6]), safe_int(row.iloc[7]), safe_int(row.iloc[8]),
                safe_int(row.iloc[9]), safe_int(row.iloc[10]), safe_int(row.iloc[11]), safe_int(row.iloc[12]),
                safe_int(row.iloc[13]), safe_int(row.iloc[14])
            ))
        except Exception as e:
            print(f"Error parsing {client_type} in {fpath}: {e}")
    return records

def import_participant_data():
    # OI
    oi_folder = 'part_w_oi'
    oi_dates_to_update = set()
    oi_records = []
    for fname in os.listdir(oi_folder):
        if fname.endswith('.csv'):
            fpath = os.path.join(oi_folder, fname)
            date = extract_date(fname)
            if not date:
                print(f"Could not extract date from {fname}")
                continue
            records = process_participant_file(fpath, date)
            if records:
                oi_dates_to_update.add(date)
                oi_records.extend(records)
    with get_connection() as conn:
        cur = conn.cursor()
        for date in oi_dates_to_update:
            cur.execute("DELETE FROM participant_oi WHERE date = ?", (date,))
        cur.executemany('''
            INSERT INTO participant_oi
            (date, client_type, future_index_long, future_index_short, future_stock_long, future_stock_short,
             option_index_call_long, option_index_put_long, option_index_call_short, option_index_put_short,
             option_stock_call_long, option_stock_put_long, option_stock_call_short, option_stock_put_short,
             total_long_contracts, total_short_contracts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', oi_records)
        conn.commit()
    print(f"Inserted {len(oi_records)} records into participant_oi table.")

    # VOL
    vol_folder = 'part_w_vol'
    vol_dates_to_update = set()
    vol_records = []
    for fname in os.listdir(vol_folder):
        if fname.endswith('.csv'):
            fpath = os.path.join(vol_folder, fname)
            date = extract_date(fname)
            if not date:
                print(f"Could not extract date from {fname}")
                continue
            records = process_participant_file(fpath, date)
            if records:
                vol_dates_to_update.add(date)
                vol_records.extend(records)
    with get_connection() as conn:
        cur = conn.cursor()
        for date in vol_dates_to_update:
            cur.execute("DELETE FROM participant_vol WHERE date = ?", (date,))
        cur.executemany('''
            INSERT INTO participant_vol
            (date, client_type, future_index_long, future_index_short, future_stock_long, future_stock_short,
             option_index_call_long, option_index_put_long, option_index_call_short, option_index_put_short,
             option_stock_call_long, option_stock_put_long, option_stock_call_short, option_stock_put_short,
             total_long_contracts, total_short_contracts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', vol_records)
        conn.commit()
    print(f"Inserted {len(vol_records)} records into participant_vol table.")

def main():
    create_participant_tables()
    all_records = []
    dates_to_update = set()
    for fname in os.listdir(folder):
        if fname.endswith('.csv'):
            fpath = os.path.join(folder, fname)
            date = extract_date(fname)
            if not date:
                print(f"Could not extract date from {fname}")
                continue
            records = process_csv_file(fpath, date)
            if records:
                dates_to_update.add(date)
                all_records.extend(records)
    with get_connection() as conn:
        cur = conn.cursor()
        # Delete existing data for each date to be updated
        for date in dates_to_update:
            cur.execute("DELETE FROM fii_derivatives WHERE date = ?", (date,))
        cur.executemany('''
            INSERT INTO fii_derivatives
            (date, instrument, buy_contracts, buy_amt, sell_contracts, sell_amt, oi_contracts, oi_amt,
             buy_contracts_adj, sell_contracts_adj, oi_contracts_adj,
             buy_amt_adj, sell_amt_adj, oi_amt_adj,
             buy_str_act, sell_str_act)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', all_records)
        conn.commit()
    print(f"Inserted {len(all_records)} records into eod_data.db")
    import_participant_data()

if __name__ == '__main__':
    main() 