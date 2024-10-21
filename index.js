// Ensure that the DOM content is loaded before proceeding
window.addEventListener("DOMContentLoaded", () => {
    // If on the home page
    if (document.URL.includes("index.html")) {
        // ---------------------------------------- 
        // Update the welcome text
        // ----------------------------------------
        let userName = sessionStorage.getItem('userName');
        if (!userName || userName === 'undefined') {
            document.getElementById("sub_header").style.display = "none";
            document.getElementById("main_home").style.top = '86px';
        } else {
            document.getElementById("sub_header").style.display = "block";
            document.getElementById("welcome_text").innerText = `Welcome, ${userName}`;
            document.getElementById("main_home").style.top = '150px';
        }

        // ----------------------------------------
        // Generate the home logo cards
        // ----------------------------------------
        fetch("data.json")
        .then((response) => response.json())
        .then((brandInfo) => loadHomeCards(brandInfo))
        .catch((err) => console.log("Error: " + err));
    }

    if (document.URL.includes("log_in.html")) {
        document
        .getElementById("loginButton")
        .addEventListener("click", (event) => {
            event.preventDefault();
            const userInput = document.getElementById("userInput").value;
            const passwordInput = document.getElementById("passwordInput").value;
            useAdmin(userInput, passwordInput);
        });
    }

    // If on a product page
    if (document.URL.includes("productPage.html")) {
        // ----------------------------------------
        // Get the brand name
        // ----------------------------------------
        const params = new URLSearchParams(window.location.search);
        const brandName = params.get("brandName");

        // ----------------------------------------
        // Change the products header
        // ----------------------------------------
        document.getElementById(
        "product_header"
        ).innerText = `${brandName} Products`;

        // ----------------------------------------
        // Fetch the data for that brand & call loadProductCards
        // ----------------------------------------
        fetch("data.json")
        .then((response) => response.json())
        .then((brandInfo) =>
            loadProductCards(brandInfo.Brands.find((brand) => brand.Name === brandName), [])
        )
        .catch((err) => console.log("Error: " + err));

        // ----------------------------------------
        // Set listeners for all filter checkboxes
        // ----------------------------------------
        var filterBoxes = document.querySelectorAll("input[type=checkbox][name=filter]");
        for (let i = 0; i < filterBoxes.length; i++) {
            filterBoxes[i].addEventListener("change", function() {
                // Clear the cards shown
                document.getElementById("product_card_loc").innerHTML = "";

                // Call a helper to refresh the products being shown
                fetch("data.json")
                .then((response) => response.json())
                .then((brandInfo) => loadProductCards(brandInfo.Brands.find((brand) => brand.Name === brandName), Array.from(filterBoxes).filter(i => i.checked).map(i => i.value)))
                .catch((err) => console.log("Error: " + err));
            });
        }
    }

    // If on any page aside from the login page
    if (!document.URL.includes("log_in.html")) {
        // ---------------------------------------- 
        // Sign out button listener
        // ----------------------------------------
        document.getElementById("sign_out").addEventListener("click", () => {
            // Remove the userName information from sessionStorage
            sessionStorage.removeItem('userName');
            // Change the sign out button to log in
            document.getElementById("log_in").style.display = "inline";
            document.getElementById("sign_out").style.display = "none";
            // If on the home page, update the sub header as well
            if (document.URL.includes('index.html')) {
                document.getElementById("sub_header").style.display = "none";
                document.getElementById("main_home").style.top = '86px';
            }
        });

        // ---------------------------------------- 
        // Ensure the correct button is showing (log in/sign out)
        // ----------------------------------------
        let userName = sessionStorage.getItem('userName');
        if (!userName || userName === 'undefined') {
            // Change the sign out button to log in
            document.getElementById("log_in").style.display = "inline";
            document.getElementById("sign_out").style.display = "none";
        } else {
            // Change the log in button to sign out
            document.getElementById("log_in").style.display = "none";
            document.getElementById("sign_out").style.display = "inline";
        }
    }
});

function loadHomeCards(brandInfo) {
    // Get the element & ensure inner html is empty
    let homeCard = document.getElementById("home_card_loc");

    let brands = brandInfo.Brands;

    // Loop through the brands
    for (let i = 0; i < brands.length; i++) {
        let brandName = brands[i].Name;
        let logoURL = brands[i].Logo;
        // Construct the HTML element
        let newCard = document.createElement("div");
        newCard.classList.add("home_card");
        newCard.innerHTML = `<img src="${logoURL}" alt="${brandName} Logo">`;
        // Add a listener to go to new page
        newCard.addEventListener("click", () => {
        window.location.href = `./productPage.html?brandName=${brandName}`;
        });
        // Add the new card to the end of the div placeholder
        homeCard.appendChild(newCard);
    }
}

function loadProductCards(brandInfo, filters) {
    let productCard = document.getElementById("product_card_loc");

    // Check if a products field exists, grab it if so
    if (brandInfo.hasOwnProperty("Products")) {
        let products = brandInfo.Products;
        console.log("Before " + products[1].Type);
        products = products.sort((a, b) => Number(a.Cost) - Number(b.Cost));
        console.log("After " + products[1].Type);
        for (let i = 0; i < products.length; i++) {
            // Ensure the product type is one of the requested ones
            let productType = products[i].Type;
            // Ignore if filters is empty
            if (filters.length !== 0 && !filters.includes(productType)) {
                continue;
            }

            let productName = products[i].Name;
            let productCost = products[i].Cost;
            let productURL = products[i].Image;

            let newCard = document.createElement("div");
            newCard.classList.add("col");
            newCard.innerHTML = `<div class="card">
                            <img src="${productURL}" alt="${productName} image">
                            <div class="card-body">
                                <h5 class="card-title">${productName}</h5>
                                <p class="card-text">$${productCost}</p>
                            </div>
                        </div>`;

            productCard.appendChild(newCard);
        }
    }
}

function returnToHome() {
    window.location.href = "index.html";
}

function fetchUser() {
    return new Promise((resolve, reject) => {
        fetch("users.json")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            resolve(data);
        })
        .catch((error) => {
            console.log(error);
        });
    });
}

function login(users, userInput, passwordInput) {
    let userIdx = findUser(users, userInput);
    if (userIdx !== -1 && users[userIdx].user === userInput && users[userIdx].password === passwordInput) {
        sessionStorage.setItem('userName', users[userIdx].user);
        window.location.href = "index.html";
    } else {
        document.getElementById("loginuser").innerHTML = "Username or password is incorrect.";
    }
}

async function useAdmin(userInput, passwordInput) {
    users = await fetchUser();
    login(users.Users, userInput, passwordInput);
}

// Find the given user, if it exists, and return the index
// Return -1 if the user does not exist
function findUser(users, userInput) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].user === userInput) {
            return i;
        }
    }

    return -1;
}