// bookstore.js
const firebaseConfig = {
    apiKey: "AIzaSyAyNikX8cQUAFOk9CLNG6hNqzQSep04ie4",
    authDomain: "knjizara-37d14.firebaseapp.com",
    databaseURL: "https://knjizara-37d14-default-rtdb.firebaseio.com",
    projectId: "knjizara-37d14",
    storageBucket: "knjizara-37d14.appspot.com",
    messagingSenderId: "161941898064",
    appId: "1:161941898064:web:2cbe591b58e5ca2b82a255"
};
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let knjige = [];
const bookList = document.getElementById("bookList");
// const closeButton = document.getElementById("closeButton");
const editButtons = document.querySelectorAll(".edit-btn");
const editForm = document.getElementById("editForm");
const overlay = document.createElement("div");
overlay.className = "overlay";

// closeButton.addEventListener("click", function () {
//     editForm.style.display = "none"; // Hide the edit form
// });

editButtons.forEach((button) => {
    button.addEventListener("click", function () {
        const isbnToEdit = this.getAttribute("data-isbn");
        const bookToEdit = knjige.find((knjiga) => knjiga.isbn === isbnToEdit);

        if (bookToEdit) {
            // Fill the form fields with existing values
            document.getElementById("editAutor").value = bookToEdit.autor;
            document.getElementById("editIsbn").value = bookToEdit.isbn;
            // Populate other form fields as needed

            // Show the edit form and overlay
            editForm.style.display = "block";
            document.body.appendChild(overlay);
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const bookList = document.getElementById("bookList");

    // Reference to the books collection in Firebase Realtime Database
    const booksRef = firebase.database().ref("knjige");

    // Function to generate the HTML for a single book card
    function createBookCard(knjiga) {
        return `
        <div class="col-md-4 mb-4">
        <div class="card">
            <img src="${knjiga.slika}" class="card-img-top" alt="Book Cover">
            <div class="card-body">
                <h5 class="card-title">${knjiga.naziv}</h5>
                <p class="card-text">${knjiga.autor}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge badge-primary">Ocena: ${knjiga.ocena}</span>
                    <button class="btn btn-info rate-btn">Oceni knjigu</button>
                    <button class="btn btn-info details-btn details-btn-yellow">Detalji o knjizi</button>
                    <button class="btn btn-info">Dodaj u korpu</button>
                    <button class="btn btn-success edit-btn" data-isbn="${knjiga.isbn}">Izmeni</button>
                    <button class="btn btn-danger delete-btn" data-isbn="${knjiga.isbn}">Obriši</button>
                </div>
            </div>
            <div class="card-details d-none">
                <p>Broj stranica: ${knjiga.brojStranica}</p>
                <p>Cena: ${knjiga.cena}</p>
                <p>Godina izdavanja: ${knjiga.godinaIzdavanja}</p>
                <p>ISBN: ${knjiga.isbn}</p>
                <p>Izdavačka kuća: ${knjiga.izdavackaKuca}</p>
                <p>Jezik: ${knjiga.jezik}</p>
                <p>Opis: ${knjiga.opis}</p>
                <p>Pismo: ${knjiga.pismo}</p>
                <p>Tip poveza: ${knjiga.tipPoveza}</p>
                <p>Ocena: ${knjiga.ocena}</p>
            </div>

            <div class="rating-popup d-none">
                <p>Ocena je zabeležena!</p>
                <button class="btn btn-secondary close-btn">Zatvori</button>
            </div>
        </div>
    </div>
        `;
    }

    function deleteBookByISBN(isbn) {
        // Reference to the specific user by username
        const bookRef = booksRef.orderByChild("isbn").equalTo(isbn);
    
        bookRef.once("value", function(snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(function(childSnapshot) {
                    const bookKey = childSnapshot.key;
                    // Now, delete the book with the retrieved key
                    booksRef.child(bookKey).remove()
                        .then(function() {
                            // User deleted successfully
                            alert("Knjiga je uspešno obrisana.");
                        })
                        .catch(function(error) {
                            // Error occurred while deleting the user
                            alert("Došlo je do greške pri brisanju knjige: " + error.message);
                        });
                });
            } else {
                alert("Knjiga sa datim ISBN-om nije pronađen.");
            }
        });
    }

    // Function to display all books from Firebase
    function displayBooks() {
        booksRef.on("value", (snapshot) => {
            bookList.innerHTML = ""; // Clear the existing book list
            knjige = [];

            snapshot.forEach((childSnapshot) => {
                const bookData = childSnapshot.val();
                const isbn = bookData.isbn;
                knjige.push(bookData);
                const bookCard = createBookCard(bookData);
                bookList.insertAdjacentHTML("beforeend", bookCard);
            });

            // Now that the books are displayed, add event listeners to "Details" buttons
            const detailsButtons = document.querySelectorAll(".details-btn");
            detailsButtons.forEach((button) => {
                button.addEventListener("click", function () {
                    const parentCard = this.closest(".card");
                    const detailsDiv = parentCard.querySelector(".card-details");
                    detailsDiv.classList.toggle("d-none");
                });
            });

            const deleteButtons = document.querySelectorAll(".delete-btn");
            deleteButtons.forEach((button) => {
                button.addEventListener("click", function () {
                    const isbnToDelete = this.getAttribute("data-isbn");
                    // Call a function to delete the user from Firebase by username
                    deleteBookByISBN(isbnToDelete);
                });
            });

            const editButtons = document.querySelectorAll(".edit-btn");
            editButtons.forEach((button) => {
                button.addEventListener("click", function () {
                    const isbnToEdit = this.getAttribute("data-isbn");
                    openEditForm(isbnToEdit);
                });
            });

            const rateButtons = document.querySelectorAll(".rate-btn");
            rateButtons.forEach((button) => {
            button.addEventListener("click", function () {
                // Get the parent card and find the corresponding rating popup div
                const parentCard = this.closest(".card");
                const ratingPopup = parentCard.querySelector(".rating-popup");

                // Show the rating popup
                ratingPopup.classList.remove("d-none");
                ratingPopup.innerHTML = ""; // Clear previous content

                // Create 5 stars
                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement("span");
                    star.classList.add("star");
                    star.innerHTML = "&#9733;"; // Unicode star symbol
                    star.addEventListener("click", function () {
                        // Mark the selected star as active
                        const stars = ratingPopup.querySelectorAll(".star");
                        stars.forEach((s, index) => {
                            s.classList.toggle("active", index < i);
                        });
                    });
                    ratingPopup.appendChild(star);
                }

                const closeButton = document.createElement("button");
                closeButton.classList.add("btn", "btn-secondary");
                closeButton.textContent = "Zatvori";
                closeButton.style.display = "none";

                // Handle the rating submission (e.g., when the submit button is clicked)
                const submitButton = document.createElement("button");
                submitButton.classList.add("btn", "btn-primary");
                submitButton.textContent = "Pošalji ocenu";

                submitButton.addEventListener("click", function () {
                    // In this example, we simulate a successful rating by adding a timeout
                    // You should remove this timeout and replace it with your actual rating submission logic
                    setTimeout(function () {
                        closeButton.style.display = "block"; // Show the "Close" button
                        submitButton.style.display = "none"; // Hide the submit button
                        ratingPopup.innerHTML = "<p>Ocena je zabeležena!</p>"; // Show the success message

                        // Add the "Close" button to the pop-up after the rating is successful
                        ratingPopup.appendChild(closeButton);
                    }, 1000); // Replace 1000ms with the actual delay after successful rating
                });

                ratingPopup.appendChild(submitButton);

                // Event listener for the "Close" button
                closeButton.addEventListener("click", function () {
                    ratingPopup.classList.add("d-none"); // Hide the pop-up
                });

                const changeButtons = document.querySelectorAll(".change-btn");
                changeButtons.forEach((button) => {
                button.addEventListener("click", function () {
                // Get the parent card and find the corresponding book data
                const parentCard = this.closest(".card");
                const bookData = {
                // Retrieve the book data from the parentCard and store it in the bookData object
                // Example:
                naziv: parentCard.querySelector(".card-title").textContent,
                autor: parentCard.querySelector(".card-text").textContent,
                ocena: parentCard.querySelector(".badge-primary").textContent,
                // Add other book attributes...
                };

                // Encode the bookData object as a query parameter in the URL
                const queryString = new URLSearchParams(bookData).toString();

                // Navigate to the "Edit Book" page with the book data in the URL
                window.location.href = `../html/izmenaKnjiga.html?${queryString}`;
            });
        });
            });
            });
        });
    }

    // Call the displayBooks function to show books when the page loads
    displayBooks();

    // Pretraga knjiga
    document.getElementById("searchButton").addEventListener("click", function () {
        var searchInput = document.getElementById("searchInput").value.toLowerCase(); // Preuzmite unos korisnika
    
        // Filtrirajte knjige prema unosu korisnika (pretraga po nazivu knjige)
        var filteredBooks = knjige.filter(function (book) {
            return book.naziv.toLowerCase().includes(searchInput); // Pogodi li unos korisnika naziv knjige
        });
    
        // Prikaz rezultata pretrage
        bookList.innerHTML = ""; // Clear the existing book list
    
        if (filteredBooks.length === 0) {
            // Nema pronađenih knjiga, možete prikazati poruku da nema rezultata
            bookList.innerHTML = "<p>Nema rezultata za uneti pojam.</p>";
        } else {
            // Postoje pronađene knjige, prikažite ih
            filteredBooks.forEach(function (bookData) {
                const bookCard = createBookCard(bookData);
                bookList.insertAdjacentHTML("beforeend", bookCard);
            });
        }
    });

    document.getElementById("searchButtonTwo").addEventListener("click", function () {
        var searchInput = document.getElementById("searchInputTwo").value.toLowerCase(); // Preuzmite unos korisnika
    
        // Filtrirajte knjige prema unosu korisnika (pretraga po nazivu knjige)
        var filteredBooks = knjige.filter(function (book) {
            return book.autor.toLowerCase().includes(searchInput); // Pogodi li unos korisnika naziv knjige
        });
    
        // Prikaz rezultata pretrage
        bookList.innerHTML = ""; // Clear the existing book list
    
        if (filteredBooks.length === 0) {
            // Nema pronađenih knjiga, možete prikazati poruku da nema rezultata
            bookList.innerHTML = "<p>Nema rezultata za uneti pojam.</p>";
        } else {
            // Postoje pronađene knjige, prikažite ih
            filteredBooks.forEach(function (bookData) {
                const bookCard = createBookCard(bookData);
                bookList.insertAdjacentHTML("beforeend", bookCard);
            });
        }
    });

    document.getElementById("updateButton").addEventListener("click", function () {
        // Get updated values from the form
        const updatedAutor = document.getElementById("editAutor").value;
        const updatedIsbn = document.getElementById("editIsbn").value;
        // Get other updated fields as needed
    
        // Find the user in korisnici array by username and update the data
        const bookToUpdate = knjige.find((knjiga) => knjiga.isbn === updatedIsbn);
        if (bookToUpdate) {
            // Update the user's data
            bookToUpdate.autor = updatedAutor;
            // Update other fields as needed
    
            // You can also update the user's data in Firebase here
    
            // Hide the edit form and overlay
            editForm.style.display = "none";
            overlay.remove();
    
            // Display a success message or perform other actions as needed
            alert("Podaci o knjizi su uspešno izmenjeni.");
        } else {
            alert("Knjiga nije pronađena.");
        }
    });

    function openEditForm(isbn) {
        const bookToEdit = knjige.find((knjiga) => knjiga.isbn === isbn);
        if (bookToEdit) {
            // Populate the edit form fields with existing data
            document.getElementById("editAutor").value = bookToEdit.autor;
            document.getElementById("editBrojStranica").value = bookToEdit.brojStranica;
            document.getElementById("editCena").value = bookToEdit.cena;
            document.getElementById("editGodinaIzdavanja").value = bookToEdit.godinaIzdavanja;
            document.getElementById("editIsbn").value = bookToEdit.isbn;
            document.getElementById("editIzdavackaKuca").value = bookToEdit.izdavackaKuca;
            document.getElementById("editJezik").value = bookToEdit.jezik;
            document.getElementById("editNaziv").value = bookToEdit.naziv;
            document.getElementById("editOcena").value = bookToEdit.ocena;
            document.getElementById("editOpis").value = bookToEdit.opis;
            document.getElementById("editPismo").value = bookToEdit.pismo;
            document.getElementById("editSlika").value = bookToEdit.slika;
            document.getElementById("editTipPoveza").value = bookToEdit.tipPoveza;
    
            // Show the edit form
            document.getElementById("editForm").style.display = "block";
        }
    }

    function sortAndDisplayBooks(order) {
        knjige.sort(function (a, b) {
            // Compare book names in ascending or descending order
            const nameA = a.naziv.toUpperCase();
            const nameB = b.naziv.toUpperCase();

            if (order === "asc") {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });

        // Display the sorted books
        bookList.innerHTML = ""; // Clear the existing book list
        knjige.forEach(function (bookData) {
            const bookCard = createBookCard(bookData);
            bookList.insertAdjacentHTML("beforeend", bookCard);
        });
    }

    sortAscendingButton.addEventListener("click", function () {
        sortAndDisplayBooks("asc"); // Sort in ascending order
    });

    sortDescendingButton.addEventListener("click", function () {
        sortAndDisplayBooks("desc"); // Sort in descending order
    });

    function updateBookData() {
        const autor = document.getElementById("editAutor").value;
        const brojStranica = document.getElementById("editBrojStranica").value;
        const cena = document.getElementById("editCena").value;
        const godinaIzdavanja = document.getElementById("editGodinaIzdavanja").value;
        const isbn = document.getElementById("editIsbn").value;
        const izdavackaKuca = document.getElementById("editIzdavackaKuca").value;
        const jezik = document.getElementById("editJezik").value;
        const naziv = document.getElementById("editNaziv").value;
        const ocena = document.getElementById("editOcena").value;
        const opis = document.getElementById("editOpis").value;
        const pismo = document.getElementById("editPismo").value;
        const slika = document.getElementById("editSlika").value;
        const tipPoveza = document.getElementById("editTipPoveza").value;
    
        // Update the user data in Firebase using the username as the identifier
        const bookRef = booksRef.orderByChild("isbn").equalTo(isbn);
        bookRef.once("value", function(snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(function(childSnapshot) {
                    const bookKey = childSnapshot.key;
                    // Now, update the user data with the retrieved key
                    booksRef.child(bookKey).update({
                        autor: autor,
                        brojStranica: brojStranica,
                        cena: cena,
                        godinaIzdavanja: godinaIzdavanja,
                        isbn: isbn,
                        izdavackaKuca: izdavackaKuca,
                        jezik: jezik,
                        naziv: naziv,
                        ocena: ocena,
                        opis: opis,
                        pismo: pismo,
                        slika: slika,
                        tipPoveza: tipPoveza
                        // Update additional fields like password as needed
                    })
                    .then(function() {
                        // User data updated successfully
                        alert("Podaci knjige su uspešno izmenjeni.");
                        // Close the edit form
                        document.getElementById("editForm").style.display = "none";
                    })
                    .catch(function(error) {
                        // Error occurred while updating user data
                        alert("Došlo je do greške pri izmeni podataka knjige: " + error.message);
                    });
                });
            } else {
                alert("Knjiga sa datim ISBN=om nije pronađen.");
            }
        });
    }

    document.getElementById("updateButton").addEventListener("click", function () {
        updateBookData();
    });
});

document.getElementById("login-link").addEventListener("click", function() {
    document.getElementById("login-popup").style.display = "block";
});

document.getElementById("close-popup").addEventListener("click", function() {
    document.getElementById("login-popup").style.display = "none";
});

function validateForm() {
    // Get the values entered by the user
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Check if the username and password are empty
    if (username === "" || password === "") {
        alert("Both username and password are required.");
        return false; // Prevent form submission
    }

    // If both fields are not empty, allow form submission
    return true;
}

function checkEmpty(fieldId) {
    var fieldValue = document.getElementById(fieldId).value;
    var inputElement = document.getElementById(fieldId);

    if (fieldValue === "") {
        // Set a custom validation message for the input field
        inputElement.setCustomValidity("Please enter a " + fieldId + ".");
    } else {
        // Clear any custom validation message
        inputElement.setCustomValidity("");
    }
}

function loginUser() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var korisniciRef = firebase.database().ref("korisnici");

    korisniciRef.once("value")
        .then(function(snapshot) {
            var found = false; // Da li je pronađen korisnik

            snapshot.forEach(function(childSnapshot) {
                var korisnik = childSnapshot.val();

                if (korisnik.username === username && korisnik.password === password) {
                    // Ako je pronađeno podudaranje korisničkog imena i lozinke
                    window.location.href = "prikazSvihKnjigaUlogovaniKorisnik.html";
                    found = true;
                }
            });

            if (!found) {
                alert("Neuspešni kredencijali. Pokušajte ponovo.");
            }
        })
        .catch(function(error) {
            alert("Došlo je do greške pri proveri korisničkih podataka.");
        });

    return false; // Prevent the form from submitting
}

function openRegistrationPopup() {
    var registrationPopup = document.getElementById("registration-popup");
    registrationPopup.style.display = "block";
}

// Zatvaranje registracione pop-up forme
function closeRegistrationPopup() {
    var registrationPopup = document.getElementById("registration-popup");
    registrationPopup.style.display = "none";
}

// Osigurajte da klikom van forme možete da je zatvorite
window.onclick = function(event) {
    var registrationPopup = document.getElementById("registration-popup");
    if (event.target == registrationPopup) {
        registrationPopup.style.display = "none";
    }
}

var registerLink = document.getElementById("register-link");

// Dodajte osluškivanje događaja na klik na link za registraciju
registerLink.addEventListener("click", function(event) {
    event.preventDefault(); // Ovo sprečava da se izvrši podrazumevano ponašanje (navigacija na "#" u URL-u)

    // Pozovite funkciju koja otvara pop-up formu za registraciju
    openRegistrationPopup();
});