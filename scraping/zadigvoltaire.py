import scrapy
import random
import csv
from scrapy.http import HtmlResponse


class ClothingSpider(scrapy.Spider):
    name = "clothing"
    start_urls = [
        "https://us.zadig-et-voltaire.com/sale/women.html?p=1",
    ]
    user_agents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
    ]
    custom_settings = {
        'USER_AGENT': random.choice(user_agents),
        'DOWNLOAD_DELAY': 0.25,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
    }
    products = []

    def parse(self, response):
        for product in response.css(".product-item"):
            product_data = {
                "title": product.css(".product-item-link::text").get(),
                "price": product.css(".price::text").get(),
                "image_url": product.css("img::attr(src)").get(),
                "link_url": product.css(".product-item-link::attr(href)").get(),
            }
            self.products.append(product_data)
            yield product_data

        next_page = response.css(".pages-item-next .next::attr(href)").get()

        if next_page is not None:
            yield response.follow(next_page, self.parse)


def closed(self, reason):
    print("Closed method called.")
    csv_file = open('zadig_clothing.csv', 'w', newline='')
    writer = csv.writer(csv_file)
    writer.writerow(["Title", "Price", "Image URL", "Product Link URL"])
    for product in self.products:
        writer.writerow([product['title'], product['price'],
                        product['image_url'], product['link_url']])
    csv_file.close()
# scrapy runspider zadigvoltaire.py -o zadig_clothing.csv   