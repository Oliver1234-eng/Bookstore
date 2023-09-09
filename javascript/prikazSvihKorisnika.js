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

let korisnici = [];
const userList = document.getElementById("userList");
const closeButton = document.getElementById("closeButton");
const editButtons = document.querySelectorAll(".edit-btn");
const editForm = document.getElementById("editForm");
const overlay = document.createElement("div");
overlay.className = "overlay";

closeButton.addEventListener("click", function () {
    editForm.style.display = "none"; // Hide the edit form
});

editButtons.forEach((button) => {
    button.addEventListener("click", function () {
        const usernameToEdit = this.getAttribute("data-username");
        const userToEdit = korisnici.find((korisnik) => korisnik.username === usernameToEdit);

        if (userToEdit) {
            // Fill the form fields with existing values
            document.getElementById("editUsername").value = userToEdit.username;
            document.getElementById("editEmail").value = userToEdit.email;
            // Populate other form fields as needed

            // Show the edit form and overlay
            editForm.style.display = "block";
            document.body.appendChild(overlay);
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // const userList = document.getElementById("userList");

    // Reference to the books collection in Firebase Realtime Database
    const usersRef = firebase.database().ref("korisnici");

    // Function to generate the HTML for a single book card
    function createUserCard(korisnik) {
        return `
        <div class="col-md-4 mb-4">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${korisnik.ime}</h5>
                <p class="card-text">${korisnik.prezime}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-info details-btn details-btn-yellow">Detalji o korisniku</button>
                    <button class="btn btn-success edit-btn" data-username="${korisnik.username}">Izmeni</button>
                    <button class="btn btn-danger delete-btn" data-username="${korisnik.username}">Obriši</button>
                </div>
            </div>
            <div class="card-details d-none">
                <p>Adresa: ${korisnik.adresa}</p>
                <p>Broj telefona: ${korisnik.telefon}</p>
                <p>Email: ${korisnik.email}</p>
                <p>Datum rodjenja: ${korisnik.datumRodjenja}</p>
                <p>Korisničko ime: ${korisnik.username}</p>
            </div>
        </div>
    </div>
        `;
    }

    function deleteUserByUsername(username) {
        // Reference to the specific user by username
        const userRef = usersRef.orderByChild("username").equalTo(username);
    
        userRef.once("value", function(snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(function(childSnapshot) {
                    const userKey = childSnapshot.key;
                    // Now, delete the user with the retrieved key
                    usersRef.child(userKey).remove()
                        .then(function() {
                            // User deleted successfully
                            alert("Korisnik je uspešno obrisan.");
                        })
                        .catch(function(error) {
                            // Error occurred while deleting the user
                            alert("Došlo je do greške pri brisanju korisnika: " + error.message);
                        });
                });
            } else {
                alert("Korisnik sa datim korisničkim imenom nije pronađen.");
            }
        });
    }

    // Function to display all books from Firebase
    function displayUsers() {
        usersRef.on("value", (snapshot) => {
            userList.innerHTML = ""; // Clear the existing book list
            korisnici = [];

            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const username = userData.username;
                korisnici.push(userData);
                const userCard = createUserCard(userData);
                userList.insertAdjacentHTML("beforeend", userCard);
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
                    const usernameToDelete = this.getAttribute("data-username");
                    // Call a function to delete the user from Firebase by username
                    deleteUserByUsername(usernameToDelete);
                });
            });

            const editButtons = document.querySelectorAll(".edit-btn");
            editButtons.forEach((button) => {
                button.addEventListener("click", function () {
                    const usernameToEdit = this.getAttribute("data-username");
                    openEditForm(usernameToEdit);
                });
            });
        });
    }

    // Call the displayBooks function to show books when the page loads
    displayUsers();

    document.getElementById("searchButton").addEventListener("click", function () {
        var searchInput = document.getElementById("searchInput").value.toLowerCase(); // Preuzmite unos korisnika
    
        // Filtrirajte knjige prema unosu korisnika (pretraga po nazivu knjige)
        var filteredUsers = korisnici.filter(function (korisnik) {
            return korisnik.ime.toLowerCase().includes(searchInput); // Pogodi li unos korisnika naziv knjige
        });
    
        // Prikaz rezultata pretrage
        userList.innerHTML = ""; // Clear the existing book list
    
        if (filteredUsers.length === 0) {
            // Nema pronađenih knjiga, možete prikazati poruku da nema rezultata
            userList.innerHTML = "<p>Nema rezultata za uneti pojam.</p>";
        } else {
            // Postoje pronađene knjige, prikažite ih
            filteredUsers.forEach(function (userData) {
                const userCard = createUserCard(userData);
                userList.insertAdjacentHTML("beforeend", userCard);
            });
        }
    });

    document.getElementById("searchButtonTwo").addEventListener("click", function () {
        var searchInput = document.getElementById("searchInputTwo").value.toLowerCase(); // Preuzmite unos korisnika
    
        // Filtrirajte knjige prema unosu korisnika (pretraga po nazivu knjige)
        var filteredUsers = korisnici.filter(function (korisnik) {
            return korisnik.prezime.toLowerCase().includes(searchInput); // Pogodi li unos korisnika naziv knjige
        });
    
        // Prikaz rezultata pretrage
        userList.innerHTML = ""; // Clear the existing book list
    
        if (filteredUsers.length === 0) {
            // Nema pronađenih knjiga, možete prikazati poruku da nema rezultata
            userList.innerHTML = "<p>Nema rezultata za uneti pojam.</p>";
        } else {
            // Postoje pronađene knjige, prikažite ih
            filteredUsers.forEach(function (userData) {
                const userCard = createUserCard(userData);
                userList.insertAdjacentHTML("beforeend", userCard);
            });
        }
    });

    document.getElementById("updateButton").addEventListener("click", function () {
        // Get updated values from the form
        const updatedUsername = document.getElementById("editUsername").value;
        const updatedEmail = document.getElementById("editEmail").value;
        // Get other updated fields as needed
    
        // Find the user in korisnici array by username and update the data
        const userToUpdate = korisnici.find((korisnik) => korisnik.username === updatedUsername);
        if (userToUpdate) {
            // Update the user's data
            userToUpdate.email = updatedEmail;
            // Update other fields as needed
    
            // You can also update the user's data in Firebase here
    
            // Hide the edit form and overlay
            editForm.style.display = "none";
            overlay.remove();
    
            // Display a success message or perform other actions as needed
            alert("Podaci o korisniku su uspešno izmenjeni.");
        } else {
            alert("Korisnik nije pronađen.");
        }
    });

    function openEditForm(username) {
        const userToEdit = korisnici.find((korisnik) => korisnik.username === username);
        if (userToEdit) {
            // Populate the edit form fields with existing data
            document.getElementById("editUsername").value = userToEdit.username;
            document.getElementById("editIme").value = userToEdit.ime;
            document.getElementById("editPrezime").value = userToEdit.prezime;
            document.getElementById("editDatumRodjenja").value = userToEdit.datumRodjenja;
            document.getElementById("editTelefon").value = userToEdit.telefon;
            document.getElementById("editAdresa").value = userToEdit.adresa;
            document.getElementById("editEmail").value = userToEdit.email;
            document.getElementById("editPassword").value = userToEdit.password;
    
            // Show the edit form
            document.getElementById("editForm").style.display = "block";
        }
    }

    function sortAndDisplayBooks(order) {
        korisnici.sort(function (a, b) {
            // Compare book names in ascending or descending order
            const nameA = a.ime.toUpperCase();
            const nameB = b.ime.toUpperCase();

            if (order === "asc") {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });

        // Display the sorted books
        userList.innerHTML = ""; // Clear the existing book list
        korisnici.forEach(function (userData) {
            const userCard = createUserCard(userData);
            userList.insertAdjacentHTML("beforeend", userCard);
        });
    }

    sortAscendingButton.addEventListener("click", function () {
        sortAndDisplayBooks("asc"); // Sort in ascending order
    });

    sortDescendingButton.addEventListener("click", function () {
        sortAndDisplayBooks("desc"); // Sort in descending order
    });

    function updateUserData() {
        const username = document.getElementById("editUsername").value;
        const ime = document.getElementById("editIme").value;
        const prezime = document.getElementById("editPrezime").value;
        const datumRodjenja = document.getElementById("editDatumRodjenja").value;
        const telefon = document.getElementById("editTelefon").value;
        const adresa = document.getElementById("editAdresa").value;
        const email = document.getElementById("editEmail").value;
        const password = document.getElementById("editPassword").value;
        // Additional fields like password can be similarly retrieved
    
        // Update the user data in Firebase using the username as the identifier
        const userRef = usersRef.orderByChild("username").equalTo(username);
        userRef.once("value", function(snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(function(childSnapshot) {
                    const userKey = childSnapshot.key;
                    // Now, update the user data with the retrieved key
                    usersRef.child(userKey).update({
                        ime: ime,
                        prezime: prezime,
                        datumRodjenja: datumRodjenja,
                        telefon: telefon,
                        adresa: adresa,
                        email: email,
                        password: password
                        // Update additional fields like password as needed
                    })
                    .then(function() {
                        // User data updated successfully
                        alert("Podaci korisnika su uspešno izmenjeni.");
                        // Close the edit form
                        document.getElementById("editForm").style.display = "none";
                    })
                    .catch(function(error) {
                        // Error occurred while updating user data
                        alert("Došlo je do greške pri izmeni podataka korisnika: " + error.message);
                    });
                });
            } else {
                alert("Korisnik sa datim korisničkim imenom nije pronađen.");
            }
        });
    }

    document.getElementById("updateButton").addEventListener("click", function () {
        updateUserData();
    });
});

document.getElementById("register-link").addEventListener("click", function() {
    document.getElementById("registration-popup").style.display = "block";
});

document.getElementById("close-registration-popup").addEventListener("click", function() {
    document.getElementById("registration-popup").style.display = "none";
});

function registerUser() {
    var ime = document.getElementById("ime").value.trim();
    var prezime = document.getElementById("prezime").value.trim();
    var datumRodjenja = document.getElementById("datumRodjenja").value.trim();
    var telefon = document.getElementById("telefon").value.trim();
    var adresa = document.getElementById("adresa").value.trim();
    var email = document.getElementById("email").value.trim();
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value.trim();

    // Validation for non-empty fields
    if (!ime || !prezime || !datumRodjenja || !telefon || !adresa || !email || !username || !password) {
        alert("Sva polja su obavezna.");
        return false;
    }

    // Validation for email format
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        alert("Unesite validnu email adresu.");
        return false;
    }

    // Validation for password strength
    var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
        alert("Lozinka mora biti najmanje 8 karaktera duga, uključujući veliko slovo, malo slovo, broj i specijalni karakter.");
        return false;
    }

    // Check if the user already exists in the database
    var korisniciRef = firebase.database().ref("korisnici");

    korisniciRef.once("value")
        .then(function(snapshot) {
            var korisnici = snapshot.val();
            var korisnikPostoji = false;

            // Check if the user already exists in the database
            for (var key in korisnici) {
                if (korisnici.hasOwnProperty(key)) {
                    var korisnik = korisnici[key];
                    if (korisnik.username === username || korisnik.email === email) {
                        korisnikPostoji = true;
                        break;
                    }
                }
            }

            if (korisnikPostoji) {
                alert("Korisnik već postoji.");
            } else {
                // User does not exist, you can add them to the database
                var noviKorisnikRef = korisniciRef.push();
                noviKorisnikRef.set({
                    ime: ime,
                    prezime: prezime,
                    datumRodjenja: datumRodjenja,
                    telefon: telefon,
                    adresa: adresa,
                    email: email,
                    username: username,
                    password: password
                });

                alert("Uspešno ste se registrovali!");
                // Close the registration pop-up or redirect the user to another page
                document.getElementById("close-registration-popup").addEventListener("click", function() {
                    document.getElementById("registration-popup").style.display = "none";
                });
                window.location.href = "prikazSvihKnjigaUlogovaniKorisnik.html";                

                return;
            }
        })
        .catch(function(error) {
            alert("Došlo je do greške pri proveri korisničkih podataka.");
        });

    return false; // Prevent the form from submitting
}