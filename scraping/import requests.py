import requests
import csv
import random

# List of proxy IP addresses to use for switching
proxies = [
    "http://192.168.1.1:8080",
    "http://192.168.1.2:8080",
    "http://192.168.1.3:8080",
    # Add more proxy IP addresses here
]

# URL for the web scraping API
url = "api_endpoint_url"

# Initialize an empty list to store the scraped data
data = []

# Function to switch IP addresses


def switch_ip():
    # Choose a random proxy IP from the list
    proxy = random.choice(proxies)
    # Return the proxy IP as a dictionary for use with the requests library
    return {"http": proxy, "https": proxy}


# Loop through multiple pages by changing the page number in the API URL
for page in range(1, 5):
    # Switch the IP address
    proxy = switch_ip()

    # Send a GET request to the API with the switched IP
    response = requests.get(f"{url}?page={page}", proxies=proxy)

    # Check if the request was successful
    if response.status_code == 200:
        # Extract the data from the API response
        page_data = response.json()

        # Loop through the data for each product
        for product in page_data:
            title = product.get("title", "")
            price = product.get("price", "")
            image_url = product.get("image_url", "")
            link_url = product.get("link_url", "")

            # Append the product data to the list
            data.append([title, price, image_url, link_url])
    else:
        # Print an error message if the request failed
        print(
            f"Failed to get data from page {page}. Response code: {response.status_code}")

# Write the scraped data to a CSV file
with open("output.csv", "w", newline="") as file:
    writer = csv.writer(file)
    # Write the header row
    writer.writerow(["Title", "Price", "Image URL", "Link URL"])
    # Write the data rows
    for row in data:
        writer.writerow(row)
