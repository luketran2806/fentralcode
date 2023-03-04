import scrapy
import random
import csv
from scrapy.http import HtmlResponse


class ClothingSpider(scrapy.Spider):
    name = "clothing"
    start_urls = [
        "https://us.sandro-paris.com/en/womens/sale/all-clothing/",
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

    def parse(self, response):
        for product in response.css(".product-viewed"):
            yield {
                "title": product.css(".name-link::text").get(),
                "price": product.css(".price-reduction::text").get(),
                "image_url": product.css("img::attr(src)").get(),
                "link_url": product.css(".name-link::attr(href)").get(),
                for size in response_size.css(".swatch-list"):
                    yield{
                        "size": product.css(".name-link::attr(href)").get(),
                    }

            }

        # Check if the "Load More" button is present and clickable
        load_more_button = response.css("#load-more-button")
        if load_more_button:
            # Extract the URL to call for the next set of products
            load_more_url = load_more_button.css("::attr(data-url)").get()
            # Make a request to the URL to load the next set of products
            yield response.follow(load_more_url, self.parse)

    def closed(self, reason):
        csv_file = open('clothing.csv', 'w', newline='')
        writer = csv.writer(csv_file)
        writer.writerow(["Title", "Price", "Image URL", "Product Link URL", "Size"])
        for product in self.products:
            writer.writerow([product['title'], product['price'],
                            product['image_url'], product['link_url']])
        csv_file.close()
    
            