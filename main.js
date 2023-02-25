
let cards = [];
let param = "";

window.onload = function () {
    var width = screen.width;
    var height = screen.height;


    const search = document.getElementById("btn");
    search.onclick = function showImages(event) {
        const pokemon = document.getElementById("input");
        const param = pokemon.value;
        if (!param) {
            return;
        }
        const exportbtn = document.getElementById("exportExcell");

        exportbtn.onclick = async function () {
            const response = await createExcell();
            const blob = new Blob([response.body], { type: response.headers['Content-Type'] });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = document.getElementById("input").value + '.xlsx';;
            link.click();
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
                cards = data.data;
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
                    img.addEventListener('mousemove', rotateCard);
                    img.addEventListener('mouseout', resetCard);

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

    function rotateCard(event) {
        const card = this;
        const cardRect = card.getBoundingClientRect();
        const mouseX = event.pageX - cardRect.left;
        const mouseY = event.pageY - cardRect.top;
        const halfWidth = cardRect.width / 2;
        const halfHeight = cardRect.height / 2;
        const rotateX = -(mouseY - halfHeight) / 10;
        const rotateY = -(halfWidth - mouseX) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    // function to reset the card rotation
    function resetCard() {
        const card = this
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }

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



async function createExcell() {
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
        let flavorText = item.flavorText;
        if (flavorText === null || flavorText === undefined) {
            if (Array.isArray(item.rules)) {
                flavorText = item.rules.join(" ");
                console.log(flavorText)
            } else {
                flavorText = "";
            }
        }
        return {
            ID: item.id,
            Name: item.name,
            "Number (First number in the bottom of the card)": item.number,
            "Total Printed (second number in the bottom of the card)": item.set.printedTotal,
            Artist: item.artist,
            Rarity: item.rarity,
            "Flavor Text": flavorText,
            Set: item.set.name,
            Count: item.count
        };
    });


    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(document.getElementById("input").value);
    worksheet.columns = [
        { header: 'ID', key: 'ID', width: 15 },
        { header: 'Name', key: 'Name', width: 25 },
        { header: 'Nº Right', key: 'Number (First number in the bottom of the card)', width: 10 },
        { header: 'Nº Left', key: 'Total Printed (second number in the bottom of the card)', width: 10 },
        { header: 'Artist', key: 'Artist', width: 25 },
        { header: 'Rarity', key: 'Rarity', width: 25 },
        { header: 'Flavor Text', key: 'Flavor Text', width: 25 },
        { header: 'Set', key: 'Set', width: 25 },
        { header: 'Count', key: 'Count', width: 10 }
    ];
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });
    console.log(filteredData);

    worksheet.addRows(filteredData);
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = document.getElementById("input").value + 'xlsx';

    const response = {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=${fileName}`
        },
        statusCode: 200,
        body: buffer
    };

    showSnackbar("Exported!");
    return response;
}


function showSnackbar(mesage) {
    var snackbar = document.getElementById("snackbar");
    snackbar.textContent = mesage;
    snackbar.className = "show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}
