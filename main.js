let cards = "";
let param = "";

window.onload = function () {
    const exportbtn = document.getElementById("exportExcell");
    var width = screen.width;
    var height = screen.height;

    const search = document.getElementById("btn");
    search.onclick = function showImages(event) {
        const pokemon = document.getElementById("input");
        const param = pokemon.value;
        if (!param) {
            return;
        }

        const loadingGif = document.getElementById("loading-gif");
        const lupe = document.getElementsByClassName("fas fa-search")[0];
        event.preventDefault();
        loadingGif.style.display = "inline-block";
        lupe.style.display = "none";
        const url = "https://api.pokemontcg.io/v2/cards?q=name:" + param;
        const headers = {
            "x-api-key": "46b0dc2d-5668-4467-93f7-acfd30d2c085",
        };
        const response = fetch(url, {
            headers,
        })
            .then((response) => response.json())
            .then((data) => {
                // Add a "count" attribute to each card object and initialize it to 0
                data.data.forEach((card) => {
                    card.count = 0;
                });

                // Create a container for the cards and count input boxes
                const cardContainer = document.createElement("div");
                cardContainer.id = "card-container";
                document.getElementById("image-container").appendChild(cardContainer);

                // Create a card and count input box for each card in the response
                data.data.forEach((card) => {
                    const cardDiv = document.createElement("div");
                    cardDiv.classList.add("cardBox");

                    const nameAndCountContainer = document.createElement("div");
                    nameAndCountContainer.classList.add("nameAndCountContainer");

                    const name = document.createElement("h2");
                    name.textContent = card.name
                    name.classList.add("card-name");
                    const code = document.createElement("h3");
                    code.textContent = "(" + card.number + '/' + card.set.printedTotal + ")";
                    code.classList.add("code-name");

                    const countInput = document.createElement("input");
                    countInput.type = "number";
                    countInput.id = card.id;
                    countInput.min = 0;
                    countInput.value = 0;
                    countInput.step = 1;
                    countInput.classList.add("count-input");

                    const incrementBtn = document.createElement("button");
                    incrementBtn.textContent = "+";
                    incrementBtn.classList.add("count-btn", "count-increment");
                    incrementBtn.addEventListener("click", () => {
                        countInput.stepUp();
                        card.count = parseInt(countInput.value);
                    });

                    const decrementBtn = document.createElement("button");
                    decrementBtn.textContent = "-";
                    decrementBtn.classList.add("count-btn", "count-decrement");
                    decrementBtn.addEventListener("click", () => {
                        countInput.stepDown();
                        card.count = parseInt(countInput.value);
                    });

                    const countWrapper = document.createElement("div");
                    countWrapper.classList.add("count-wrapper");

                    const btnWrapper = document.createElement("div");
                    btnWrapper.classList.add("btn-wrapper");
                    btnWrapper.appendChild(decrementBtn);
                    btnWrapper.appendChild(incrementBtn);

                    countWrapper.appendChild(countInput);
                    countWrapper.appendChild(btnWrapper);

                    nameAndCountContainer.appendChild(name);
                    nameAndCountContainer.appendChild(code);
                    nameAndCountContainer.appendChild(countWrapper);

                    const img = document.createElement("img");
                    img.classList.add("cards");
                    img.src = card.images.small;

                    cardDiv.appendChild(nameAndCountContainer);
                    cardDiv.appendChild(img);

                    cardContainer.appendChild(cardDiv);
                });


                lupe.style.display = "inline-block";
                loadingGif.style.display = "none";

                if (data.data.length == 0) {
                    showSnackbar("No result for this query.");
                } else {
                    showSnackbar("All cards loaded!");
                    exportbtn.style.display = "inline-block";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                lupe.style.display = "inline-block";
                loadingGif.style.display = "none";
                showSnackbar("Error loading cards");
            });
    };

    const bg = document.getElementById("bg");

    const bgImage = {
        small: [
            "images/image1small.jpg",
            "images/image2small.jpg",
            "images/image3small.jpg",
        ],
        medium: [
            "images/image1medium.jpg",
            "images/image2medium.jpg",
            "images/image3medium.jpg",
        ],
        big: [
            "images/image1big.jpg",
            "images/image2big.jpg",
            "images/image3big.jpg",
        ],
    };

    function setRandomImage() {
        const screenWidth = window.innerWidth;
        let imagesArray;

        if (screenWidth <= 640) {
            imagesArray = bgImage.small;
        } else if (screenWidth > 640 && screenWidth <= 1024) {
            imagesArray = bgImage.medium;
        } else {
            imagesArray = bgImage.big;
        }

        const randomIndex = Math.floor(Math.random() * imagesArray.length);
        bg.style.backgroundImage = `url(${imagesArray[randomIndex]})`;
    }
    setRandomImage();
};

const exportbtn = document.getElementById("exportExcell");

function createExcell() {
    if (!cards) {
        console.error("cards is not available yet");
        showSnackbar("Error loading cards");
        return;
    }
    if (typeof cards !== "object" || !Array.isArray(cards)) {
        console.error("cards is not an array");
        showSnackbar("Error loading cards");
        return;
    }
    showSnackbar("Exporting!");
    const filteredData = cards.map((item) => {
        return {
            ID: item.id,
            Name: item.name,
            "Number (First number in the bottom of the card)": item.number,
            "Total Printed (second number in the bottom of the card)":
                item.set.printedTotal,
            Artist: item.artist,
            Rarity: item.rarity,
            "Flavor Text": item.flavorText,
            Set: item.set.name,
        };
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    ws["!cols"] = [
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
        { width: 25 },
        { width: 10 },
        { width: 110 },
        { width: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
    XLSX.writeFile(workbook, document.getElementById("input").value + ".xlsx");
}

function showSnackbar(mesage) {
    var snackbar = document.getElementById("snackbar");
    snackbar.textContent = mesage;
    snackbar.className = "show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}
