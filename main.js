


window.onload = function () {


    let fullData = ''
    let param = ''

    function createExcell() {
        if (!fullData) {
            console.error("fullData is not available yet");
            return;
        }
        if (typeof fullData !== 'object' || !Array.isArray(fullData)) {
            console.error('fullData is not an array');
            return;
        }

        const filteredData = fullData.map(item => {
            return {
                "ID": item.id,
                "Name": item.name,
                "Number (First number in the bottom of the card)": item.number,
                "Total Printed (second number in the bottom of the card)": item.set.printedTotal,
                "Artist": item.artist,
                "Rarity": item.rarity,
                "Flavor Text": item.flavorText,
                "Set": item.set.name
            }
        });

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
        columns.forEach(column => {
            ws[`${column}1`].s = { font: { bold: true } };
        });
        for (let col = 0; col < filteredData[0].length; col++) {
            let longestValueLength = 0;
            for (let row = 0; row < filteredData.length; row++) {
                const value = filteredData[row][col];
                if (value.toString().length > longestValueLength) {
                    longestValueLength = value.toString().length;
                }
            }
            const column = XLSX.utils.encode_col(col);
            for (let i = 1; i <= filteredData.length; i++) {
                ws[`${column}${i}`].w = longestValueLength * 1.5;
            }
        }
        XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
        XLSX.writeFile(workbook, document.getElementById("input").value + ".xlsx");

    }

    const exportbtn = document.getElementById("exportExcell");
    exportbtn.addEventListener("click", createExcell);
    var width = screen.width;
    var height = screen.height;


    const search = document.getElementById("btn");
    search.onclick = function showImages(event) {
        const pokemon = document.getElementById("input")
        const param = pokemon.value;
        if (!param) {
            return;
        }

        const loadingGif = document.getElementById("loading-gif");
        const lupe = document.getElementsByClassName("fas fa-search")[0];
        event.preventDefault();
        loadingGif.style.display = "inline-block";
        lupe.style.display = "none";
        const url = 'http://' + window.location.host + '/api/cards?query=' + pokemon.value;
        fetch(url, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                fullData = data;
                console.log(fullData);
                const imagesUrl = data.map(obj => obj.images.small)
                const imageContainer = document.getElementById("image-container");
                imageContainer.innerHTML = "";
                imagesUrl.forEach(url => {
                    const img = document.createElement("img");
                    img.src = url;
                    imageContainer.appendChild(img);
                });
                lupe.style.display = "inline-block";
                loadingGif.style.display = "none";
                exportbtn.style.display = "inline-block"


            })
            .catch(error => {
                console.error('Error:', error);
                lupe.style.display = "inline-block";
                loadingGif.style.display = "none";
            });
    }




    const bg = document.getElementById("bg");

    const bgImage = {
        "small": [
            "images/image1small.jpg",
            "images/image2small.jpg",
            "images/image3small.jpg"
        ],
        "medium": [
            "images/image1medium.jpg",
            "images/image2medium.jpg",
            "images/image3medium.jpg"
        ],
        "big": [
            "images/image1big.jpg",
            "images/image2big.jpg",
            "images/image3big.jpg"
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
    setRandomImage()
}
