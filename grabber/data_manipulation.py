import os
import pandas as pd

# List to hold DataFrames from all CSVs
dfs = []

# Loop through all files in the current directory
for filename in os.listdir():
    if filename.endswith('.csv'):
        # Read the CSV file directly
        df = pd.read_csv(filename)
        
        # Check if the required columns exist, then extract them
        if {'Product Name', 'Color', 'Product URL', 'Scraped Image URL'}.issubset(df.columns):
            df_filtered = df[['Product Name', 'Color', 'Product URL', 'Scraped Image URL']]
            
            # Remove rows where any of the required columns are empty (NaN)
            df_filtered.dropna(subset=['Product Name', 'Color', 'Product URL', 'Scraped Image URL'], inplace=True)
            
            dfs.append(df_filtered)
        else:
            print(f"Columns not found in {filename}")

# Concatenate all DataFrames into one
if dfs:
    combined_df = pd.concat(dfs, ignore_index=True)

    # Remove duplicate rows
    combined_df.drop_duplicates(inplace=True)

    # Save the result to a new CSV
    combined_df.to_csv('combined_output.csv', index=False)
    print('Combined CSV saved as combined_output.csv')
else:
    print('No valid CSV files found with required columns.')
