// Importation des modules nécessaires
var express = require("express");
var mysql = require("mysql");
const { join } = require("path");
const { urlencoded } = require("express");
let mailer = require("nodemailer");
const util = require("util");
require("dotenv").config();

// Création de l'application Express
const app = express();

// Configuration des dossiers statiques
app.use(express.json());
app.use("/public", express.static(join(__dirname, "public")));
app.use("/images", express.static(join(__dirname, "images")));
app.use("/styles", express.static(join(__dirname, "styles")));

app.use(urlencoded({ extended: true }));

// Configuration de la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "iAMTBFFPITW666s!",
  database: "renterzdb",
});

// Connexion à la base de données
connection.connect((err) => {
  if (err) {
    console.error(
      "Erreur lors de la connexion au serveur MySQL : " + err.stack
    );
    return;
  }
  console.log("Connecté au serveur MySQL !");
});

// Démarrage du serveur
app.listen(8888);
console.log("Serveur démarré");

// Route pour la page d'accueil
app.get("/", async function (_, response) {
  response.sendFile("index.html", { root: __dirname });
});

// Récupérer tous les biens de la base de données
app.get("/biens", function (_, response) {
  connection.query("SELECT * FROM biens", function (err, result) {
    if (err) throw err;
    response.send(result);
  });
});

// Récupérer les trois premiers biens de la base de données
app.get("/biens/first", function (_, response) {
  connection.query("SELECT * FROM biens LIMIT 3", function (err, result) {
    if (err) throw err;
    response.send(result);
  });
});

// Charger la page de réservation lorsqu'on clique sur le bouton "Réserver maintenant" d'une maison spécifique
app.get("/reservation/:id", function (request, response) {
  response.sendFile("public/reservation.html", { root: __dirname });
});

// Récupérer un bien spécifique en fonction de son ID
app.get("/biens/:id", function (request, response) {
  const id = request.params.id;
  connection.query(
    `SELECT * FROM biens WHERE idBien = ${id}`,
    function (err, result) {
      if (err) throw err;
      response.send(result);
    }
  );
});

// Rediriger vers l'API Google Maps
app.get("/maps", function (request, response) {
  response.redirect(
    `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&v=weekly`
  );
});

// Fonctionnalité de réservation
const query = util.promisify(connection.query).bind(connection);

app.post("/confirmation", async (request, response) => {
  try {
    const {
      id,
      nom,
      prenom,
      email,
      telephone,
      dateDebut,
      dateFin,
      address1,
      price1,
    } = request.body;

    console.log(request.body);
    // Vérifier si le bien est disponible pour la période spécifiée
    const availability = await query(
      "SELECT * FROM locations WHERE idBien = ? AND (dateDebut <= ? AND dateFin >= ?)",
      [id, dateFin, dateDebut]
    );
    if (availability.length > 0) {
      // Si le bien n'est pas disponible, rediriger vers la page de réservation avec un message d'erreur
      return response.status(400).redirect("/reservation/" + id + "?error=1");
    }

    const biens = await query("SELECT * FROM biens WHERE idBien = ?", [id]);

    if (biens.length > 0) {
      const users = await query("SELECT * FROM Utilisateurs WHERE mail = ?", [
        email,
      ]);

      if (users.length === 0) {
        // Si l'utilisateur n'existe pas, insérer un nouvel utilisateur
        await query(
          "INSERT INTO Utilisateurs (mail, prenom, nom, telephone) VALUES (?, ?, ?, ?)",
          [email, prenom, nom, telephone]
        );
      }
      // Si l'utilisateur existe ou après l'insertion d'un nouvel utilisateur, insérer une nouvelle location
      const locations = await query(
        "SELECT MAX(idLocation) AS maxId FROM locations"
      );
      const idLocation = locations[0].maxId + 1;
      await query(
        "INSERT INTO locations (idLocation, idBien, mailLoueur, dateDebut, dateFin) VALUES (?, ?, ?, ?, ?)",
        [idLocation, id, email, dateDebut, dateFin]
      );
    }

    // Get the number of nights

    let dateD = new Date(dateDebut);
    let dateF = new Date(dateFin);
    let diffTime = Math.abs(dateF - dateD);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let days = Number(diffDays);
    if (days === 0) {
      days = 1;
    }
    let total = Number(price1) * days;

    // send confirmation email with details to user

    let transporter = mailer.createTransport({
      service: "outlook",
      auth: {
        user: "housefinder@outlook.fr",
        pass: "h*NvG5@E3y/Pb@:",
      },
    });

    let mailOptions = {
      from: "housefinder@outlook.fr",
      to: email,
      subject: "Reservation Confirmation",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="text-align: center; color: #4CAF50;">Reservation Confirmation</h1>
        <p>Dear ${prenom},</p>
        <p>We are pleased to confirm your reservation with the following details:</p>
        <ul>
          <li><strong>Address:</strong> ${address1}</li>
          <li><strong>Number of nights:</strong> ${diffDays}</li>
          <li><strong>Price:</strong> $ ${total}</li>
        </ul>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,</p>
        <p>Your HouseFinder Team</p>
      </div>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    response.sendFile("public/confirmation.html", { root: __dirname });
  } catch (err) {
    console.error(err);
    response.status(500).send("Erreur du serveur");
  }
});

// Récupérer le dernier élément de la table "locations"
app.get("/lastLocation", function (_, response) {
  connection.query(
    "SELECT * FROM locations ORDER BY idLocation DESC LIMIT 1",
    function (err, result) {
      if (err) throw err;
      response.send(result);
    }
  );
});

// Récupérer l'utilisateur dont l'email correspond à celui de la dernière location dans la base de données
app.get("/user", function (_, response) {
  connection.query(
    "SELECT * FROM Utilisateurs WHERE mail = (SELECT mailLoueur FROM locations ORDER BY idLocation DESC LIMIT 1)",
    function (err, result) {
      if (err) throw err;
      response.send(result);
    }
  );
});

// Rajouter l'avis à la base de données à la derniere location

app.get("/confirmation", function (_, response) {
  response.sendFile("public/confirmation.html", { root: __dirname });
});

app.post("/avis", async (request, response) => {
  try {
    const { review } = request.body;

    const locations = await query(
      "SELECT MAX(idLocation) AS maxId FROM locations"
    );
    const idLocation = locations[0].maxId;

    await query("UPDATE locations SET avis = ? WHERE idLocation = ?", [
      review,
      idLocation,
    ]);

    // Rester sur la même page et ajouter un paramètre d'URL
    response.status(200).redirect("/confirmation" + "?review=1");
  } catch (err) {
    console.error(err);
    response.status(500).send("Erreur du serveur");
  }
});

app.get("/avis/:id", async function (request, response) {
  try {
    const id = request.params.id;
    const reviews = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT locations.idLocation, locations.avis, Utilisateurs.nom, Utilisateurs.prenom
                FROM locations
                JOIN Utilisateurs ON locations.mailLoueur = Utilisateurs.mail
                WHERE locations.idBien = ${id}`,
        function (err, result) {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    for (const review of reviews) {
      const comments = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT * FROM commentaires WHERE idLocation = ${review.idLocation} ORDER BY date_publication DESC`,
          function (err, result) {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
      review.comments = comments;
    }

    response.send(reviews);
  } catch (err) {
    console.error(err);
    response.status(500).send("Erreur du serveur");
  }
});

// Ajouter des commentaires à la table "commentaires" dans la base de données et les regrouper en utilisant idLocation

app.post("/comment", async (request, response) => {
  try {
    const { idLocation, contenu } = request.body;

    if (!idLocation || !contenu) {
      response.status(400).send("Données invalides");
      return;
    }

    let random = Math.floor(Math.random() * 100) + 1;
    const avatarUrl = `https://avatar.iran.liara.run/public/${random}`;

    const date = new Date();
    await query(
      "INSERT INTO commentaires (idLocation, contenu, date_publication, avatar_img) VALUES (?, ?, ?, ?)",
      [idLocation, contenu, date, avatarUrl]
    );

    response.redirect("/"); // Rediriger vers la page d'accueil ou vers l'endroit souhaité
  } catch (err) {
    console.error(err);
    response.status(500).send("Erreur du serveur");
  }
});

app.post("/search", async (req, res) => {
  try {
    const {
      ville,
      dateDebut,
      dateFin,
      maxPrice,
      numChambres,
      numCouchage,
      distance,
    } = req.body;
    console.log(req.body);
    let query1 = `
    SELECT biens.*
    FROM biens
    WHERE biens.disponible = 1
      AND NOT EXISTS (
        SELECT 1 FROM locations l2
        WHERE l2.idBien = biens.idBien
          AND (
            (l2.dateDebut <= ? AND l2.dateFin >= ?)
            OR (l2.dateDebut <= ? AND l2.dateFin >= ?)
            OR (l2.dateDebut >= ? AND l2.dateFin <= ?)
          )
      )`;

    if (ville) query1 += " AND biens.commune = ?";
    if (maxPrice) query1 += " AND biens.prix <= ?";
    if (numChambres) query1 += " AND biens.nbChambres >= ?";
    if (numCouchage) query1 += " AND biens.nbCouchages >= ?";
    if (distance) query1 += " AND biens.distance <= ?";

    const values = [dateDebut, dateDebut, dateFin, dateFin, dateDebut, dateFin];

    if (ville) values.push(ville);
    if (maxPrice) values.push(Number(maxPrice));
    if (numChambres) values.push(Number(numChambres));
    if (numCouchage) values.push(Number(numCouchage));
    if (distance) values.push(Number(distance));

    connection.query(query1, values, (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur du serveur");
  }
});
