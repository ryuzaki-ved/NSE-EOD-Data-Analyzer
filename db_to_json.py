import sqlite3
import json
import os

db_path = 'eod_data.db'
output_dir = 'my-eod-app/public/data'

def export_table_to_json(table_name, conn, output_path):
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    column_names = [description[0] for description in cursor.description]

    data = []
    for row in rows:
        data.append(dict(zip(column_names, row)))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Exported {len(data)} records from {table_name} to {output_path}")

def main():
    if not os.path.exists(db_path):
        print(f"Error: Database file '{db_path}' not found. Please run 'python import_fii_der.py' first.")
        return

    with sqlite3.connect(db_path) as conn:
        export_table_to_json('fii_derivatives', conn, os.path.join(output_dir, 'fii_derivatives.json'))
        export_table_to_json('participant_oi', conn, os.path.join(output_dir, 'participant_oi.json'))
        export_table_to_json('participant_vol', conn, os.path.join(output_dir, 'participant_vol.json'))

if __name__ == '__main__':
    main()