import json
import pandas as pd

def convert_json_to_excel(json_data, excel_file_name):
    # Flatten the main JSON structure
    df = pd.json_normalize(json_data['values'], sep='_')
    
    # Flatten the varietyTotals and merge with the main DataFrame
    variety_totals_dfs = []
    
    for i, row in df.iterrows():
        variety_totals = row['varietyTotals']
        if variety_totals:
            vt_df = pd.json_normalize(variety_totals, sep='_')
            vt_df['index'] = i
            variety_totals_dfs.append(vt_df)
    
    if variety_totals_dfs:
        variety_totals_df = pd.concat(variety_totals_dfs, ignore_index=True)
        df = df.drop(columns=['varietyTotals']).merge(variety_totals_df, left_index=True, right_on='index', how='left').drop(columns=['index'])

    # Save DataFrame to Excel
    df.to_excel(excel_file_name, index=False)

    print("Excel file has been created successfully.")
    
json_file = open("MEDIDAS DE FIELD OPERATION.json")

json_content = json_file.read()

convert_json_to_excel(json.loads(json_content),'MEDIDAS FIELD OPS.xlsx')