from playwright.sync_api import sync_playwright
import re


# =========================================
# AMAZON SCRAPER
# =========================================

def scrape_amazon(query):

    results = []

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=False
        )

        context = browser.new_context(

            user_agent=
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",

            viewport={
                "width": 1280,
                "height": 800
            }

        )

        page = context.new_page()

        page.goto(

            f"https://www.amazon.in/s?k={query}",

            timeout=60000

        )

        page.wait_for_timeout(4000)

        page.mouse.wheel(0, 2000)

        page.wait_for_timeout(2000)

        items = page.query_selector_all(
            "div[data-component-type='s-search-result']"
        )

        print(
            "Amazon items:",
            len(items)
        )

        for item in items:

            try:

                text = item.inner_text()

                price_match = re.search(
                    r"\d{1,3}(?:,\d{2,3})+",
                    text
                )

                if not price_match:
                    continue

                price = int(

                    price_match
                    .group()
                    .replace(",", "")

                )

                lines = text.split("\n")

                title = None

                for line in lines:

                    if (

                        len(line) > 20 and

                        "₹" not in line and

                        "deal" not in line.lower() and

                        "offer" not in line.lower() and

                        "sponsored" not in line.lower() and

                        "case" not in line.lower() and

                        "cover" not in line.lower()

                    ):

                        title = line
                        break

                if not title or price < 1000:
                    continue

                title_lower = title.lower()

                bad_words = [

                    "cover",
                    "case",
                    "bumper",
                    "tempered",
                    "glass",
                    "protector",
                    "charger",
                    "adapter",
                    "cable",
                    "skin",
                    "back cover",
                    "battery",
                    "headphone",
                    "earbuds",
                    "speaker",
                    "tripod",
                    "stand",
                    "watch strap",
                    "camera lens",
                    "smartwatch"

                ]

                junk = False

                for bad in bad_words:

                       if bad in title_lower:

                            junk = True
                            break

                if junk:
                       continue

                img_el = item.query_selector(
                    "img.s-image"
                )

                link = None

                link_el = (

                    item.query_selector("h2 a")

                    or

                    item.query_selector(
                        "a.a-link-normal"
                    )

                )

                if link_el:

                    href = link_el.get_attribute(
                        "href"
                    )

                    if href:

                        if href.startswith("/"):

                            link = (
                                "https://www.amazon.in"
                                + href
                            )

                        else:

                            link = href

                if not link:

                    link = (
                        f"https://www.amazon.in/s?k={query}"
                    )

                image = (

                    img_el.get_attribute("src")

                    if img_el else None

                )

                results.append({

                    "title": title,

                    "price": price,

                    "image": image,

                    "link": link,

                    "source": "Amazon"

                })

            except:
                continue

        browser.close()

    print(
        "Amazon Results:",
        len(results)
    )

    return results


# =========================================
# FLIPKART SCRAPER
# =========================================

def scrape_flipkart(query):

    results = []

    query_lower = query.lower()

    bad_words = [

        "cover",
        "case",
        "tempered",
        "glass",
        "protector",
        "charger",
        "adapter",
        "cable",
        "skin",
        "back cover",
        "battery",
        "headphone",
        "earbuds",
        "speaker",
        "tripod",
        "stand",
        "watch strap",
        "camera lens",
        "smartwatch"

    ]

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=False
        )

        context = browser.new_context(

            user_agent=
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",

            viewport={
                "width": 1280,
                "height": 800
            }

        )

        page = context.new_page()

        page.goto(

            f"https://www.flipkart.com/search?q={query}",

            timeout=60000

        )

        try:

            page.click(

                "button._2KpZ6l._2doB4z",

                timeout=3000

            )

        except:
            pass

        page.wait_for_timeout(5000)

        items = page.query_selector_all(
            "div[data-id]"
        )

        print(
            "Flipkart items:",
            len(items)
        )

        for item in items:

            try:

                text = item.inner_text()

                price_match = re.search(
                    r"₹\s?[\d,]+",
                    text
                )

                if not price_match:
                    continue

                price = float(

                    price_match
                    .group()
                    .replace("₹", "")
                    .replace(",", "")

                )

                lines = text.split("\n")

                title = None

                for line in lines:

                    clean = line.strip()

                    if (

                        len(clean) > 20 and

                        "₹" not in clean and

                        "off" not in clean.lower() and

                        "rating" not in clean.lower() and

                        "bank offer" not in clean.lower()

                    ):

                        title = clean
                        break

                if not title:
                    continue

                title_lower = title.lower()

                query_first = query_lower.split()[0]

                if query_first not in title_lower:
                    continue

                junk = False

                for bad in bad_words:

                    if bad in title_lower:

                        junk = True
                        break

                if junk:
                    continue

                query_words = []

                for word in query_lower.split():

                    if len(word) > 2:

                        query_words.append(word)

                score = 0

                for word in query_words:

                    if word in title_lower:

                        score += 1

                if "samsung" in query_lower:

                    if "samsung" not in title_lower:
                        continue

                if "iphone" in query_lower:

                    if "iphone" not in title_lower:
                        continue

                if "oneplus" in query_lower:

                    if "oneplus" not in title_lower:
                        continue

                if score < max(2, len(query_words) // 2):

                    continue

                if "currently unavailable" in title_lower:

                    continue

                link_el = item.query_selector("a")

                link = None

                if link_el:

                    href = link_el.get_attribute(
                        "href"
                    )

                    if href:

                        link = (
                            "https://www.flipkart.com"
                            + href
                        )

                results.append({

                    "title": title,

                    "price": price,

                    "link": link,

                    "source": "Flipkart"

                })

            except:
                continue

        browser.close()

    print(
        "Flipkart Results:",
        len(results)
    )

    return results


# =========================================
# CLEAN TEXT
# =========================================

def clean_text(text):

    text = text.lower()

    text = re.sub(
        r'[^a-z0-9\s]',
        ' ',
        text
    )

    remove_words = [

        "smartphone",
        "mobile",
        "phone",
        "5g",
        "ai",
        "new",
        "latest",
        "with",
        "for",
        "dual",
        "sim",
        "android",
        "inch",
        "display",
        "camera",
        "processor",
        "storage"

    ]

    words = text.split()

    cleaned = []

    for word in words:

        if word not in remove_words:

            cleaned.append(word)

    text = " ".join(cleaned)

    text = " ".join(text.split())

    return text


# =========================================
# EXTRACT SPECS
# =========================================

def extract_specs(title):

    t = clean_text(title)

    specs = {}

    brands = [

        "apple",
        "samsung",
        "oneplus",
        "iqoo",
        "xiaomi",
        "redmi",
        "realme",
        "nothing",
        "asus",
        "lenovo",
        "hp",
        "acer",
        "msi",
        "dell"

    ]

    specs["brand"] = ""

    for b in brands:

        if b in t:

            specs["brand"] = b
            break

    ram_match = re.search(
        r'(\d+)\s?gb\s?ram',
        t
    )

    specs["ram"] = (
        ram_match.group(1)
        if ram_match else ""
    )

    storage_match = re.search(
        r'(64|128|256|512|1024)\s?gb|1\s?tb',
        t
    )

    specs["storage"] = (
        storage_match.group(0)
        if storage_match else ""
    )

    gpu_match = re.search(
        r'rtx\s?(2050|3050|4050|4060|4070)',
        t
    )

    specs["gpu"] = (
        gpu_match.group(0)
        if gpu_match else ""
    )

    cpu_match = re.search(
        r'(i5|i7|i9|ryzen 5|ryzen 7|ryzen 9)',
        t
    )

    specs["cpu"] = (
        cpu_match.group(0)
        if cpu_match else ""
    )

    year_match = re.search(
        r'20(22|23|24|25)',
        t
    )

    specs["year"] = (
        year_match.group(0)
        if year_match else ""
    )

    colors = [

        "black",
        "white",
        "silver",
        "blue",
        "green",
        "purple",
        "gold",
        "gray",
        "grey"

    ]

    specs["color"] = ""

    for c in colors:

        if c in t:

            specs["color"] = c
            break

    model_match = re.search(

        r'(s23|s24|s25|a15|a25|a35|a55|iphone 13|iphone 14|iphone 15|iphone 16|nord ce 4|edge 50|note 13)',

        t

    )

    specs["model"] = (

        model_match.group(1)

        if model_match else ""

    )

    return specs


# =========================================
# MATCH SCORE
# =========================================

def exact_match_score(a_specs, f_specs):

    score = 0

    if (
        a_specs["brand"] and
        f_specs["brand"]
    ):

        if (
            a_specs["brand"] ==
            f_specs["brand"]
        ):

            score += 50

        else:

            score -= 40

    if (
        a_specs["ram"] and
        f_specs["ram"]
    ):

        if (
            a_specs["ram"] ==
            f_specs["ram"]
        ):

            score += 40

        else:

            score -= 40

    if (
        a_specs["storage"] and
        f_specs["storage"]
    ):

        if (
            a_specs["storage"] ==
            f_specs["storage"]
        ):

            score += 40

        else:

            score -= 40

    if (
        a_specs["gpu"] and
        f_specs["gpu"]
    ):

        if (
            a_specs["gpu"] ==
            f_specs["gpu"]
        ):

            score += 50

        else:

            score -= 40

    if (
        a_specs["cpu"] and
        f_specs["cpu"]
    ):

        if (
            a_specs["cpu"] ==
            f_specs["cpu"]
        ):

            score += 30

        else:

            score -= 40

    if (
        a_specs["year"] and
        f_specs["year"]
    ):

        if (
            a_specs["year"] ==
            f_specs["year"]
        ):

            score += 20

        else:

            score -= 15

    if (
        a_specs["color"] and
        f_specs["color"]
    ):

        if (
            a_specs["color"] ==
            f_specs["color"]
        ):

            score += 15

        else:

            score -= 10

    if (
        a_specs.get("model") and
        f_specs.get("model")
    ):

        if (
            a_specs["model"] ==
            f_specs["model"]
        ):

            score += 50

        else:

            score -= 80

    return score


# =========================================
# FINAL SEARCH
# =========================================



def search_products(query):

    amazon_results = scrape_amazon(query)

    flipkart_results = scrape_flipkart(query)

    results = []

    used_flipkart = set()

    for amazon in amazon_results[:10]:

        amazon_title = amazon.get(
            "title",
            ""
        )

        amazon_specs = extract_specs(
            amazon_title
        )

        best_match = None

        best_score = -999

        for i, flipkart in enumerate(
            flipkart_results
        ):

            if i in used_flipkart:
                continue

            flipkart_title = flipkart.get(
                "title",
                ""
            )

            flipkart_specs = extract_specs(
                flipkart_title
            )

            # =====================================
            # SIMPLE SMART MATCHING
            # =====================================

            amazon_clean = clean_text(
                amazon_title
            )

            flipkart_clean = clean_text(
                flipkart_title
            )

            amazon_words = set(
                amazon_clean.split()
            )

            flipkart_words = set(
                flipkart_clean.split()
            )

            common = (
                amazon_words &
                flipkart_words
            )

            # =====================================
            # BASE SCORE
            # =====================================

            score = len(common) * 10

            # =====================================
            # BRAND MATCH
            # =====================================

            a_brand = amazon_specs.get(
                "brand",
                ""
            )

            f_brand = flipkart_specs.get(
                "brand",
                ""
            )

            if (
                a_brand and
                f_brand
            ):

                if a_brand == f_brand:

                    score += 50

                else:

                    score -= 100

            # =====================================
            # STORAGE MATCH
            # =====================================

            a_storage = amazon_specs.get(
                "storage",
                ""
            )

            f_storage = flipkart_specs.get(
                "storage",
                ""
            )

            if (
                a_storage and
                f_storage
            ):

                if a_storage == f_storage:

                    score += 20

            # =====================================
            # IMPORTANT QUERY WORDS
            # =====================================

            query_words = query.lower().split()

            for word in query_words:

                if (
                    word in amazon_clean and
                    word in flipkart_clean
                ):

                    score += 15

            # =====================================
            # REMOVE ACCESSORIES
            # =====================================

            bad_words = [

                "cover",
                "case",
                "charger",
                "cable",
                "adapter",
                "tempered",
                "glass",
                "protector",
                "bumper"

            ]

            junk = False

            for bad in bad_words:

                if (
                    bad in amazon_clean
                    or
                    bad in flipkart_clean
                ):

                    junk = True
                    break

            if junk:
                continue

            # =====================================
            # BEST MATCH
            # =====================================

            if score > best_score:

                best_score = score

                best_match = (
                    i,
                    flipkart
                )

        # =====================================
        # FINAL FILTER
        # =====================================

        if (

            best_match and

            best_score >= 40

        ):

            i, flipkart = best_match

            used_flipkart.add(i)

            amazon_price = float(
                amazon.get("price", 0)
            )

            flipkart_price = float(
                flipkart.get("price", 0)
            )

            # =====================================
            # REMOVE BAD PRICE DIFFERENCE
            # =====================================

            if abs(
                amazon_price -
                flipkart_price
            ) > 250000:

                continue

            if (
                amazon_price <= 0
                or
                flipkart_price <= 0
            ):

                continue

            best_price = min(
                amazon_price,
                flipkart_price
            )

            best_source = (

                "Amazon"

                if amazon_price <
                flipkart_price

                else "Flipkart"

            )

            results.append({

                "title":
                amazon.get("title", ""),

                "image":
                amazon.get("image", ""),

                "best_price":
                best_price,

                "best_source":
                best_source,

                "amazon_price":
                amazon_price,

                "flipkart_price":
                flipkart_price,

                "amazon_link":
                amazon.get("link", ""),

                "flipkart_link":
                flipkart.get("link", "")

            })

    print(
        "FINAL RESULTS:",
        len(results)
    )

    return results