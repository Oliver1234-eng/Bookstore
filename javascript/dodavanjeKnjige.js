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

document.addEventListener("DOMContentLoaded", function () {
    const addBookForm = document.getElementById("addBookForm");
    const cancelButton = document.getElementById("cancelButton");

    cancelButton.addEventListener("click", function () {
        window.location.href = "prikazSvihKnjigaUlogovaniKorisnik.html";
    });

    addBookForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent the form from submitting normally

        // Get values from the form
        const autor = document.getElementById("autor").value;
        const brojStranica = parseInt(document.getElementById("brojStranica").value);
        const cena = parseFloat(document.getElementById("cena").value);
        const godinaIzdavanja = parseInt(document.getElementById("godinaIzdavanja").value);
        const isbn = document.getElementById("isbn").value;
        const izdavackaKuca = document.getElementById("izdavackaKuca").value;
        const jezik = document.getElementById("jezik").value;
        const naziv = document.getElementById("naziv").value;
        const ocena = parseFloat(document.getElementById("ocena").value);
        const opis = document.getElementById("opis").value;
        const pismo = document.getElementById("pismo").value;
        const slika = document.getElementById("slika").value;
        const tipPoveza = document.getElementById("tipPoveza").value;

        // Validation checks
        if (!autor || !brojStranica || !cena || !godinaIzdavanja || !isbn || !izdavackaKuca || !jezik || !naziv || !ocena || !opis || !pismo || !slika || !tipPoveza) {
            alert("Sva polja moraju biti popunjena.");
            return;
        }

        if (ocena < 1 || ocena > 5) {
            alert("Ocena mora biti između 1 i 5.");
            return;
        }

        // Reference to the books collection in Firebase Realtime Database
        const booksRef = firebase.database().ref("knjige");

        // Check if a book with the same ISBN already exists in Firebase
        booksRef.orderByChild("isbn").equalTo(isbn).once("value", function (snapshot) {
            if (snapshot.exists()) {
                alert("Knjiga sa istim ISBN brojem već postoji.");
            } else {
                // Create an object representing the new book
                const newBook = {
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
                };

                // Push the new book data to Firebase
                booksRef.push(newBook)
                    .then(function () {
                        // Book added successfully
                        alert("Knjiga je uspešno dodata.");
                        addBookForm.reset(); // Reset the form
                        window.location.href = "prikazSvihKnjigaUlogovaniKorisnik.html";
                    })
                    .catch(function (error) {
                        // Error occurred while adding the book
                        alert("Došlo je do greške pri dodavanju knjige: " + error.message);
                    });
            }
        });
    });
});