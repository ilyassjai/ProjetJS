// Récupération des éléments du DOM
const exploreBtn = document.getElementById("explore");
const container = document.getElementById("container");
const textBlock = document.getElementById("remerciements");
const reviewForm = document.getElementById("form");
const avis = document.getElementById("avis");
const searchBtn = document.getElementById("searchBtn");
const searchForm = document.getElementById("search-box");

// Vérification de l'URL de la page
if (window.location.pathname === "/") {
  // Fonction pour ajouter des écouteurs d'événements aux boutons de réservation
  addBookingEventListeners = () => {
    let bookingButtons = document.querySelectorAll(
      ".property-card .booking-btn"
    );
    bookingButtons.forEach((button, i) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        let houseId =
          button.parentElement.parentElement.parentElement.getAttribute(
            "data-id"
          );
        window.location.href = `/reservation/${houseId}`;
      });
    });
  };

  // Écouteur d'événement pour le bouton "Explorer"
  exploreBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    // Appel à l'API pour récupérer les données des biens
    const response = await fetch("/biens", {
      method: "GET",
    });
    const data = await response.json();

    // Effacement du contenu du conteneur
    container.innerHTML = "";

    // Parcours des données des biens et création des cartes de propriété
    data.forEach((house, i) => {
      if (house.disponible === 1) {
        const productCard = `
          <div class="property-card" data-id="${house.idBien}">
              <img src="${house.img}" alt="" class="product-img">
            <div class="card-info">
                <div class="card-info-content">
                    <img src="./images/location.svg" alt="">
                    <p class="loaction-name">${
                      house.commune + " " + house.rue
                    }</p>
                </div>
                <div class="card-info-content">
                    <div class="content">
                        <img src="./images/bed.svg" alt="">
                        <p>${house.nbCouchages} Bed</p>
                    </div>
                    <div class="content">
                        <img src="./images/size.svg" alt="">
                        <p>10x10m</p>
                    </div>
                    <div class="content">
                        <img src="./images/area.svg" alt="">
                        <p>${house.distance}M</p>
                    </div>
                </div>
                <div class="price">
                     <p>4.8 ⭐</p>
                    <p>${house.prix}€</p>
                    <a href="" class="booking-btn">Book Now</a>
                </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML("beforeend", productCard);
      }
    });
    addBookingEventListeners();
  });

  // Chargement des trois premières maisons lorsque la page se charge
  window.addEventListener("load", async function () {
    const response = await fetch("/biens/first", {
      method: "GET",
    });
    const data = await response.json();
    data.forEach((house, i) => {
      if (house.disponible === 1) {
        const productCard = `
          <div class="property-card" data-id="${house.idBien}">
              <img src="${house.img}" alt="" class="product-img">
            <div class="card-info">
                <div class="card-info-content">
                    <img src="./images/location.svg" alt="">
                    <p class="loaction-name">${
                      house.commune + " " + house.rue
                    }</p>
                </div>
                <div class="card-info-content">
                    <div class="content">
                        <img src="./images/bed.svg" alt="">
                        <p>${house.nbCouchages} Bed</p>
                    </div>
                    <div class="content">
                        <img src="./images/size.svg" alt="">
                        <p>10x10m</p>
                    </div>
                    <div class="content">
                        <img src="./images/area.svg" alt="">
                        <p>${house.distance}M</p>
                    </div>
                </div>
                <div class="price">
                     <p>4.8 ⭐</p>
                    <p>${house.prix}€</p>
                    <a href="" class="booking-btn">Book Now</a>
                </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML("beforeend", productCard);
      }
    });

    addBookingEventListeners();
  });

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get the form data
    const formData = new FormData(searchForm);
    const {
      ville,
      dateDebut,
      dateFin,
      maxPrice,
      numChambres,
      numCouchage,
      distance,
    } = Object.fromEntries(formData);

    const data = await fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ville: ville,
        dateDebut: dateDebut,
        dateFin: dateFin,
        maxPrice: maxPrice,
        numChambres: numChambres,
        numCouchage: numCouchage,
        distance: distance,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Effacement du contenu du conteneur
        container.innerHTML = "";
        if (data.length === 0) {
          container.innerHTML = `<h1 class="no-results">No results found</h1>`;
        } else {
          // Parcours des données des biens et création des cartes de propriété

          data.forEach((house, i) => {
            if (house.disponible === 1) {
              const productCard = `
          <div class="property-card" data-id="${house.idBien}">
              <img src="${house.img}" alt="" class="product-img">
            <div class="card-info">
                <div class="card-info-content">
                    <img src="./images/location.svg" alt="">
                    <p class="loaction-name">${
                      house.commune + " " + house.rue
                    }</p>
                </div>
                <div class="card-info-content">
                    <div class="content">
                        <img src="./images/bed.svg" alt="">
                        <p>${house.nbCouchages} Bed</p>
                    </div>
                    <div class="content">
                        <img src="./images/size.svg" alt="">
                        <p>10x10m</p>
                    </div>
                    <div class="content">
                        <img src="./images/area.svg" alt="">
                        <p>${house.distance}M</p>
                    </div>
                </div>
                <div class="price">
                     <p>4.8 ⭐</p>
                    <p>${house.prix}€</p>
                    <a href="" class="booking-btn">Book Now</a>
                </div>
            </div>
          </div>
        `;
              container.insertAdjacentHTML("beforeend", productCard);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Scroll to container
    container.scrollIntoView({ behavior: "smooth" });
    addBookingEventListeners();
  });
} else if (window.location.pathname.startsWith("/reservation")) {
  // Fonction pour charger les données de réservation
  async function loadReservation() {
    // Vérification si nous sommes sur la page de réservation

    // Récupération de l'ID de réservation depuis l'URL
    let id = window.location.pathname.split("/").pop();

    // Appel à l'API pour récupérer les données de réservation
    const response = await fetch("/biens/" + id);
    const data = await response.json();
    let reservation = data[0];

    // Mise à jour du HTML avec les données de réservation
    document.querySelector("#house-img").src = reservation.img;
    document.querySelector("#address").textContent =
      "Adresse: " + reservation.commune + " " + reservation.rue;
    document.querySelector("#rooms").textContent =
      " Nombre de pièces: " + reservation.nbChambres;
    document.querySelector("#beds").textContent =
      "Nombre de couchages: " + reservation.nbCouchages;
    document.querySelector("#distance").textContent =
      "Distance du centre: " + reservation.distance;
    document.querySelector("#price").textContent =
      "Prix/Nuit: "  + reservation.prix + "€";
    document.querySelector("#address1").value =
      reservation.commune + " " + reservation.rue;
    document.querySelector("#price1").value = reservation.prix;
  }

  window.addEventListener("load", loadReservation);

  let map;
  let geocoder;

  // Fonction pour initialiser la carte
  async function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 17,
    });
    let id = window.location.pathname.split("/").pop();
    const response = await fetch("/biens/" + id);
    const data = await response.json();
    let reservation = data[0];

    const address = reservation.rue + " " + reservation.commune;

    // Géocodage de l'adresse
    geocoder.geocode({ address: address }, function (results, status) {
      if (status === "OK") {
        // Si le géocodage a réussi, déplacer le centre de la carte vers l'emplacement du résultat
        map.setCenter(results[0].geometry.location);
        // Et placer un marqueur là-bas
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
        });
      } else {
        alert("Le géocodage n'a pas réussi pour la raison suivante: " + status);
      }
    });
  }

  window.addEventListener("load", initMap);

  // Récupération de l'ID de réservation depuis l'URL et mise à jour de la valeur de l'élément HTML
  document.getElementById("id").value = window.location.pathname.split("/")[2];

  if (window.location.search.includes("error=1")) {
    alert("Ce bien n'est pas disponible pour la période spécifiée");
  }

  addCommentToDOM = (i) => {
    // Get the form element
    const form = document.getElementById(`form-${i}`);

    form.addEventListener("submit", async (event) => {
      // Prevent the form from being submitted the default way
      event.preventDefault();

      // Get the comment and id from the form
      let random = Math.floor(Math.random() * 100) + 1;
      const commentInput = document.getElementById(`comment-input-${i}`);
      const comment = commentInput.value;
      const idInput = document.getElementById(`id-${i}`);
      const id = Number(idInput.value);

      const avatarUrl = `https://avatar.iran.liara.run/public/${random}`;

      // Send the comment to the server
      const response = await fetch("/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idLocation: id,
          contenu: comment,
        }),
      });

      if (!response.ok) {
        console.error("Error posting comment:", response.statusText);
        return;
      }

      // Add the comment to the DOM
      const commentTitle = document.getElementById(`comment-title-${i}`);

      const timestamp = new Date().toLocaleString();
      const commentCard = `
      <div class="comment">
      <div class="img-container">
      <img src=${avatarUrl}>
      </div>
       <div class="comment-content">
        <p class="comment-text">${comment}</p>
        <span class="timestamp">${timestamp}</span>
        </div>
    </div>
    `;

      //
      commentTitle.insertAdjacentHTML("afterend", commentCard);

      // Clear the comment input
      commentInput.value = "";
    });
  };

  // Fonction pour charger les avis depuis le serveur
  async function loadAvis() {
    let id = window.location.pathname.split("/").pop();
    const avis = await fetch("/avis/" + id);
    const data = await avis.json();

    // Récupération du conteneur des avis
    const reviewContainer = document.getElementById("reviews");

    // random number between 1 and 100

    // Parcours des avis et création des cartes d'avis
    data.forEach((review, i) => {
      // Add published time ago to each comment
      if (review.avis === null) {
        return;
      }
      const reviewCard = `
    <div class="review">
      <div class="review-content">
        <p class="review-text">${review.avis}</p>
        <p class="review-author">- ${review.prenom + " " + review.nom}</p>
      </div>
      <div class="comment-section" id="comment-section-${i}">
        <h3 id="comment-title-${i}">Commentaires</h3>
        ${review.comments
          .map(
            (comment) =>
              `
            <div class="comment">
              <div class="img-container">
               <img src=${comment.avatar_img}>
               </div>
               <div class="comment-content">
                <p class="comment-text">${comment.contenu}</p>
                <span class="timestamp">${new Date(
                  comment.date_publication
                ).toLocaleString()}</span>
                </div>
            </div>
        `
          )
          .join("")}
        <div class="add-comment">
          <form id="form-${i}" method="post" action="/comment">
            <input type="text" name="comment" id="comment-input-${i}" placeholder="Ajouter un commentaire" />
            <input type="hidden" name="id" id="id-${i}" value="${
        review.idLocation
      }" />
            <button type="submit">Commenter</button>
          </form>
        </div>
      </div>
    </div>
  `;
      reviewContainer.insertAdjacentHTML("beforeend", reviewCard);

      addCommentToDOM(i);
    });
  }

  window.addEventListener("load", loadAvis);
} else if (window.location.pathname.startsWith("/confirmation")) {
  // Fonction pour charger la page de confirmation
  async function loadConfirmation() {
    // Récupération des données de location
    const location = await fetch("/lastLocation");
    const locationData = await location.json();
    const user = await fetch("/user");
    const userData = await user.json();
    // Mise à jour du contenu de l'élément HTML
    textBlock.innerHTML = `Merci pour votre réservation! ${userData[0].prenom}.`;
  }

  // Vérification si l'URL contient le paramètre "review=1"
  if (window.location.search.includes("review=1")) {
    reviewForm.remove();
    avis.innerHTML = "Avis ajouté!";
  }

  window.addEventListener("load", loadConfirmation);
}
