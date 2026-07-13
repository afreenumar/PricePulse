let products = {};
let allProducts = [];
let currentProducts = [];
let originalProducts = [];
let lastSearchResults = [];
let isSearchPage = false;
/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    try {

        const res = await fetch("products.json");

        products = await res.json();

        allProducts = [
            ...(products.mobiles || []),
            ...(products.laptops || []),
            ...(products.tablets || [])
        ];

        currentProducts = allProducts;

        renderHome();

    } catch (err) {

        console.log(err);

    }
}


/* =========================
   HOME PAGE
========================= */

function renderHome() {

    isSearchPage = false;

    const homePage =
        document.getElementById("homePage");

    homePage.innerHTML = `

    <div class="main-layout">

        <!-- LEFT SIDEBAR -->
        <div class="sidebar">

            <h3>Sort By</h3>

            <select
                id="sortSelect"
                onchange="applyFilters()"
            >

                <option value="best">
                    Best Deal
                </option>

                <option value="low">
                    Price Low to High
                </option>

                <option value="high">
                    Price High to Low
                </option>

            </select>

            <!-- BRANDS -->
            <div class="brands-group">

                <h3 style="margin-top:30px;">
                    Brands
                </h3>

                <label>
                    <input
                        type="checkbox"
                        value="Apple"
                        onchange="applyFilters()"
                    >
                    Apple
                </label>

                <label>
                    <input
                        type="checkbox"
                        value="Samsung"
                        onchange="applyFilters()"
                    >
                    Samsung
                </label>

                <label>
                    <input
                        type="checkbox"
                        value="OnePlus"
                        onchange="applyFilters()"
                    >
                    OnePlus
                </label>

                <label>
                    <input
                        type="checkbox"
                        value="ASUS"
                        onchange="applyFilters()"
                    >
                    ASUS
                </label>

                <label>
                    <input
                        type="checkbox"
                        value="Lenovo"
                        onchange="applyFilters()"
                    >
                    Lenovo
                </label>

                <label>
                    <input
                        type="checkbox"
                        value="Xiaomi"
                        onchange="applyFilters()"
                    >
                    Xiaomi
                </label>

            </div>

        </div>

        <!-- RIGHT SIDE -->
        <div class="products-side">

            <!-- BROWSE TITLE -->
            <h2 class="browse-title">
                Browse Categories
            </h2>

            <!-- CATEGORY ROW -->
            <div class="categories-grid">

                <!-- ALL -->
<div
    class="category-card"
    onclick="
        isSearchPage = false;
        lastSearchResults = [];
        originalProducts = [];
        currentProducts = allProducts;
        renderProducts(allProducts);
    "
>

                    <div class="category-icon all-icon">
                        🛍️
                    </div>

                    <div class="category-name">
                        All
                    </div>

                </div>

                <!-- MOBILES -->
                <div
                    class="category-card"
                    onclick="filterCategory('mobiles')"
                >

                    <div class="category-icon mobile-icon">
                        📱
                    </div>

                    <div class="category-name">
                        Mobiles
                    </div>

                </div>

                <!-- LAPTOPS -->
                <div
                    class="category-card"
                    onclick="filterCategory('laptops')"
                >

                    <div class="category-icon laptop-icon">
                        💻
                    </div>

                    <div class="category-name">
                        Laptops
                    </div>

                </div>

                <!-- TABLETS -->
                <div
                    class="category-card"
                    onclick="filterCategory('tablets')"
                >

                    <div class="category-icon tablet-icon">
                        📲
                    </div>

                    <div class="category-name">
                        Tablets
                    </div>

                </div>

            </div>

            <!-- PRODUCTS -->
            <div
                id="productsContainer"
                class="products-grid"
            ></div>

        </div>

    </div>

    `;

    // LOAD PRODUCTS
    renderProducts(allProducts);
}

/* =========================
   FILTERS
========================= */

function applyFilters() {

    let filtered = [...currentProducts];

    // =========================
    // SORT
    // =========================

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );

    const sort =
        sortSelect
        ? sortSelect.value
        : "best";

    // =========================
    // BRAND FILTER
    // =========================

    const checkedBrands =
        Array.from(

            document.querySelectorAll(
                '.brands-group input[type="checkbox"]:checked'
            )

        ).map(cb =>

            cb.value.toLowerCase()

        );

    // APPLY BRAND FILTER
    if (checkedBrands.length > 0) {

        filtered = filtered.filter(product => {

            const title =
                (product.title || "")
                .toLowerCase();

            return checkedBrands.some(brand => {

    // APPLE SPECIAL FIX
    if (brand === "apple") {

        return (

            title.includes("apple") ||

            title.includes("iphone") ||

            title.includes("ipad") ||

            title.includes("macbook")

        );

    }

    return title.includes(brand);

});

        });

    }

    // =========================
    // SORTING
    // =========================

    if (sort === "low") {

        filtered.sort(

            (a, b) =>

            Number(a.best_price || 0) -
            Number(b.best_price || 0)

        );

    }

    if (sort === "high") {

        filtered.sort(

            (a, b) =>

            Number(b.best_price || 0) -
            Number(a.best_price || 0)

        );

    }

    // =========================
    // RENDER PRODUCTS
    // =========================

    renderProducts(filtered);
}


function filterCategory(category) {

    isSearchPage = false;

    lastSearchResults = [];

    originalProducts = [];


    let filtered = [];

    if (category === "mobiles") {

        filtered =
            products.mobiles || [];

    }

    if (category === "laptops") {

        filtered =
            products.laptops || [];

    }

    if (category === "tablets") {

        filtered =
            products.tablets || [];

    }

    currentProducts = filtered;

    renderProducts(filtered);
}

function updatePriceFilter() {

    const value =
        document.getElementById(
            "priceRange"
        ).value;

    document.getElementById(
        "priceValue"
    ).innerText = value;

    applyFilters();
}


/* =========================
   LOCAL PRODUCTS
========================= */

function renderProducts(items) {

    const container =
        document.getElementById(
            "productsContainer"
        );

    container.innerHTML = "";

    const grid =
        document.createElement("div");

    grid.className = "products-grid";

    items.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <div class="image-box">

                <img
                    class="product-image"
                    src="${product.image}"
                    onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'"
                >

            </div>

            <div class="card-body">

                <div class="platform">
                    Popular Product
                </div>

                <div class="title">
                    ${product.title}
                </div>

                <button class="compare-btn">
                    Compare Prices
                </button>

            </div>

        `;

        card.querySelector(".compare-btn")
            .addEventListener("click", () => {

                searchSpecificProduct(
                    product.search || product.title
                );

            });

        grid.appendChild(card);

    });

    container.appendChild(grid);
}


/* =========================
   SEARCH
========================= */

async function searchProducts() {

    const q =
        document
        .getElementById("searchInput")
        .value
        .trim();

    if (!q) return;

    try {

        document
            .getElementById("loading")
            .classList.add("show");

        const response =
            await fetch(
                `http://127.0.0.1:8000/search?q=${encodeURIComponent(q)}`
            );

        const data =
            await response.json();

        document
            .getElementById("loading")
            .classList.remove("show");

        document.getElementById(
            "homePage"
            ).style.display = "block";

        originalProducts =
            [...(data.results || [])];

        currentProducts =
            [...(data.results || [])];
        
        lastSearchResults =
           [...(data.results || [])];
 
        isSearchPage = true;

        renderMatchedProducts(
            data.results || []
);

    } catch (err) {

        console.log(err);

        document
            .getElementById("loading")
            .classList.remove("show");

        alert("Backend Error");

    }
}


/* =========================
   PRODUCT CARD SEARCH
========================= */

async function searchSpecificProduct(query) {

    try {

        document
            .getElementById("loading")
            .classList.add("show");

        const response =
            await fetch(
                `http://127.0.0.1:8000/search?q=${encodeURIComponent(query)}`
            );

        const data =
            await response.json();

        document
            .getElementById("loading")
            .classList.remove("show");
        
        document.getElementById(
            "homePage"
            ).style.display = "block";

        originalProducts =
    [...(data.results || [])];

currentProducts =
    [...(data.results || [])];

lastSearchResults =
    [...(data.results || [])];

isSearchPage = true;

renderMatchedProducts(
    data.results || []
);

    } catch (err) {

        console.log(err);

        document
            .getElementById("loading")
            .classList.remove("show");

    }
}


/* =========================
   EXTRACT PRODUCT INFO
========================= */

function extractProductInfo(title) {

    if (!title) {

        return {
            clean: "No Title",
            key: "unknown"
        };

    }

    // CLEAN TITLE
    let text = title
        .replace(/\(/g, " ")
        .replace(/\)/g, " ")
        .replace(/\|/g, " ")
        .replace(/,/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const lower = text.toLowerCase();

    // =========================
    // MODEL DETECTION
    // =========================

    let model = "";

    // SPECIAL SAMSUNG FIX
    const samsungMatch = lower.match(
        /(s\d{1,2}\s?(ultra|plus|fe)?)/i
    );

    // IPHONE
    const iphoneMatch = lower.match(
        /(iphone\s?\d{1,2}(\s?(pro|max|plus))?)/i
    );

    // ONEPLUS
    const oneplusMatch = lower.match(
        /(oneplus\s?[a-z0-9\s]+)/i
    );

    // IQOO
    const iqooMatch = lower.match(
        /(iqoo\s?[a-z0-9\s]+)/i
    );

    // REDMI / XIAOMI
    const redmiMatch = lower.match(
        /(redmi\s?[a-z0-9\s]+|xiaomi\s?[a-z0-9\s]+)/i
    );

    // VIVO
    const vivoMatch = lower.match(
        /(vivo\s?[a-z0-9\s]+)/i
    );

    // OPPO
    const oppoMatch = lower.match(
        /(oppo\s?[a-z0-9\s]+)/i
    );

    // REALME
    const realmeMatch = lower.match(
        /(realme\s?[a-z0-9\s]+)/i
    );

    // PIXEL
    const pixelMatch = lower.match(
        /(pixel\s?\d[a-z]?)/i
    );

    // MOTOROLA
    const motoMatch = lower.match(
        /(moto\s?[a-z0-9\s]+|motorola\s?[a-z0-9\s]+)/i
    );

    // =========================
    // PRIORITY MODEL MATCHING
    // =========================

    if (iphoneMatch) {

        model = iphoneMatch[0];

    } else if (samsungMatch) {

        model = "Samsung " + samsungMatch[0];

    } else if (oneplusMatch) {

        model = oneplusMatch[0];

    } else if (iqooMatch) {

        model = iqooMatch[0];

    } else if (redmiMatch) {

        model = redmiMatch[0];

    } else if (vivoMatch) {

        model = vivoMatch[0];

    } else if (oppoMatch) {

        model = oppoMatch[0];

    } else if (realmeMatch) {

        model = realmeMatch[0];

    } else if (pixelMatch) {

        model = pixelMatch[0];

    } else if (motoMatch) {

        model = motoMatch[0];

    } else {

        model =
            text.split(" ")
            .slice(0, 5)
            .join(" ");

    }

    // =========================
    // RAM
    // =========================

    let ram = "";

    const ramMatch = lower.match(
        /(4|6|8|12|16|24)\s?gb\s?ram/i
    );

    if (ramMatch) {

        ram =
            ramMatch[1] + "GB";

    }

    // =========================
    // STORAGE
    // =========================

    let storage = "";

    const storageMatch = lower.match(
        /(64|128|256|512|1024)\s?gb|1\s?tb/i
    );

    if (storageMatch) {

        storage =
            storageMatch[0]
            .replace(/\s+/g, "")
            .toUpperCase();

    }

    // =========================
    // COLORS
    // =========================

    let color = "";

    const colors = [

        "titanium black",
        "titanium gray",
        "titanium silverblue",
        "titanium whitesilver",
        "titanium white",

        "black",
        "white",
        "silver",
        "blue",
        "green",
        "purple",
        "gold",
        "gray",
        "grey",
        "red",
        "pink"

    ];

    for (const c of colors) {

        if (lower.includes(c)) {

            color = c;
            break;

        }
    }

    // =========================
    // CLEAN TITLE
    // =========================

    let finalTitle = model;

    if (color) {

        finalTitle += ` | ${color}`;

    }

    if (ram) {

        finalTitle += ` | ${ram} RAM`;

    }

    if (storage) {

        finalTitle += ` | ${storage}`;

    }

    // =========================
    // UNIQUE MATCH KEY
    // =========================

    const key = (

        model +
        "|" +
        ram +
        "|" +
        storage +
        "|" +
        color

    )
    .toLowerCase()
    .replace(/\s+/g, "");

    return {

        clean: finalTitle,
        key: key

    };
}
/* =========================
   SEARCH RESULT CARDS
========================= */

function renderMatchedProducts(results) {

    const homePage =
        document.getElementById(
            "homePage"
        );

    // SEARCH PAGE LAYOUT
    homePage.innerHTML = `


    <button
    class="search-back-btn"
    onclick="backToHome()"
>
    ← Back To Home
</button>
    <div class="main-layout">

        <!-- NEW FILTER SIDEBAR -->
        <div class="filters-sidebar">

            <h3>Filters</h3>

            <!-- SORT -->
            <div class="filter-group">

                <label>Sort By</label>

                <select
                    id="searchSortSelect"
                    onchange="applySearchFilters()"
                >

                    <option value="default">
                        Best Match
                    </option>

                    <option value="low">
                        Price: Low → High
                    </option>

                    <option value="high">
                        Price: High → Low
                    </option>

                </select>

            </div>

           

        </div>

        <!-- PRODUCTS -->
        <div
            id="productsContainer"
            class="products-side"
        >
        </div>

    </div>

    `;

    const container =
        document.getElementById(
            "productsContainer"
        );

    const grid =
        document.createElement("div");

    grid.className = "products-grid";

    const used = new Set();

    const filtered = [];

    results.forEach(product => {

        const info =
            extractProductInfo(
                product.title
            );

        if (!used.has(info.key)) {

            used.add(info.key);

            product.cleanTitle =
                info.clean;

            filtered.push(product);

        }

    });

    // STORE GLOBALLY

    filtered.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "card";

        card.setAttribute(
            "data-price",
            product.best_price || 0
        );

        const image =
            product.image ||
            "https://via.placeholder.com/400x400?text=No+Image";

        card.innerHTML = `

            <div class="image-box">

                <img
                    class="product-image"
                    src="${image}"
                    onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'"
                >

            </div>

            <div class="card-body">

                <div class="platform">
                    ${product.best_source}
                </div>

                <div class="title">
                    ${product.cleanTitle}
                </div>

                <div class="price">
                    ₹${product.best_price}
                </div>

                <button class="compare-btn">
                    Compare
                </button>

            </div>

        `;

        card.querySelector(".compare-btn")
            .addEventListener("click", () => {

                openComparison(product);

            });

        grid.appendChild(card);

    });

    container.appendChild(grid);
}



/* =========================
   COMPARISON PAGE
========================= */

function openComparison(product) {


    document.getElementById("homePage")
        .style.display = "none";

    document.getElementById("detailsPage")
        .style.display = "block";

    document.getElementById("detailsImage")
        .src = product.image;

    document.getElementById("detailsTitle")
        .innerText = product.cleanTitle || product.title;

    document.getElementById("bestPrice")
        .innerText =
        `₹${product.best_price}`;

    document.getElementById("bestDeal")
        .innerText =
        `Best Deal: ${product.best_source}`;

    document.getElementById("tableBody")
        .innerHTML = `

        <tr>

            <td>Flipkart</td>

            <td>
                ₹${product.flipkart_price}
            </td>

            <td>

                <a
                    target="_blank"
                    class="buy-btn"
                    href="${product.flipkart_link || '#'}"
                >
                    Buy Now
                </a>

            </td>

        </tr>

        <tr>

            <td>Amazon</td>

            <td>
                ₹${product.amazon_price}
            </td>

            <td>

                <a
                    target="_blank"
                    class="buy-btn"
                    href="${product.amazon_link || '#'}"
                >
                    Buy Now
                </a>

            </td>

        </tr>

    `;
}


/* =========================
   BACK
========================= */

function goBack() {

    document.getElementById(
        "detailsPage"
    ).style.display = "none";

    document.getElementById(
        "homePage"
    ).style.display = "block";

    // IF USER CAME FROM SEARCH
    if (
        isSearchPage &&
        lastSearchResults.length > 0
    ) {

        renderMatchedProducts(
            lastSearchResults
        );

    }

    // OTHERWISE NORMAL HOME
    else {

        renderHome();

    }
}

/* =========================
   START
========================= */

loadProducts();

function applySearchFilters() {

    let filtered =
        [...originalProducts];

    // GET SORT
    const sort =
        document.getElementById(
            "searchSortSelect"
        ).value;

    // LOW → HIGH
    if (sort === "low") {

        filtered.sort((a, b) => {

            return (
                Number(a.best_price || 0)
                -
                Number(b.best_price || 0)
            );

        });

    }

    // HIGH → LOW
    if (sort === "high") {

        filtered.sort((a, b) => {

            return (
                Number(b.best_price || 0)
                -
                Number(a.best_price || 0)
            );

        });

    }

    // SAVE
    currentProducts = filtered;

    // RENDER USING SAME UI
    renderMatchedProducts(filtered);

    // RESTORE DROPDOWN VALUE
    setTimeout(() => {

        const select =
            document.getElementById(
                "searchSortSelect"
            );

        if (select) {

            select.value = sort;

        }

    }, 0);
}

function backToHome() {

    // CLEAR SEARCH INPUT
    document.getElementById(
        "searchInput"
    ).value = "";

    // RESET SEARCH STATE
    isSearchPage = false;

    lastSearchResults = [];

    originalProducts = [];

    // VERY IMPORTANT FIX
    currentProducts = allProducts;

    // LOAD NORMAL HOME
    renderHome();
}


