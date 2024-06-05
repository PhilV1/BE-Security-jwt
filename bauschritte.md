 1. **Erstellen Sie die package.json mit `npm init -y`**
 2. **Setzen Sie den Typ in der packag.json auf `type: modules`**i
 3. **Installieren Sie die benötigten Pakete `npm i bcryptjs cors dotenv express jsonwebtoken mongoose`**

 4. **Einrichten von Umgebungsvariablen:**
 - Erstellen Sie eine .env-Datei mit folgendem Inhalt
  ```javascript
  TOKEN_KEY = your secret key
  MONGO_URL = your monGO URL
  API_PORT=3002
  ```
5. **Datenbankverbindung erstellen**
 - Erstellen Sie eine neue ordner  `database`
 - In `database` Erstellen Sie eine neue Datei  `connectDB.js`
 - In der `connectDB.js`-Datei erstellen Sie eine Datenbankverbindung mit mongoDB, wie folgt:

```javascript
import mongoose from "mongoose";

const connectDB = (url) => {
  return mongoose.connect(url);
};

export default connectDB;
```


6. **Benutzermodell erstellen**
 - Erstellen Sie eine neue Datei  model/user

 ```javascript
 const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
});

module.exports = mongoose.model("user", userSchema);

 ```


7. **Express-Server erstellen und die erforderlichen Middleware importieren**

```javascript
require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./model/user");
const auth = require("./middleware/auth");
const app = express();

app.use(express.json());
const port = process.env.PORT || 5060;
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("Verbindung mit MongoDB hat geklappt");
    app.listen(port, () => {
      console.log("Server läuft auf:", port);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

```

8. **JWT-Authentifizierungsmiddleware erstellen** 
- Erstellen Sie eine neue Datei middleware/auth.
- Importieren Sie das Modul jsonwebtoken zur Handhabung von JWT.
- Holen Sie Umgebungsvariablen ab.
- Definieren Sie eine Middleware-Funktion zur Überprüfung von JWT-Token.

```javascript
const jwt = require("jsonwebtoken");

const config = process.env;
const verifyToken = (req, res, next) => {
 
  const token =
  req.body.token || req.query.token || req.headers.authorization.split(" ")[1];;
  

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send(`${token} ${err.name}`);
  }
  return next();
};

module.exports = verifyToken;

```

## -----------Endpunkte---------------

9. **Benutzerregistrierungs-Endpunkt:**
  - Definieren Sie einen POST-Endpunkt unter `/register`    für die Benutzerregistrierung.
   - Überprüfen Sie die Benutzereingabe (Vorname, Nachname, E-Mail und Passwort).
   - Verschlüsseln Sie das Passwort des Benutzers mit bcrypt.
   - Erstellen Sie einen neuen Benutzer in der Datenbank.
   - Generieren Sie ein JWT-Token zur Authentifizierung.
   - Senden Sie die neuen Benutzerdaten zusammen mit dem Token in der Antwort.

```javascript   
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send(req.body);
    }

    // Check if user already exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exists. Please Login.");
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // Sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // Save user token
    user.token = token;

    // Return new user with token
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});
```

10. **Benutzeranmelde-Endpunkt:**
  - Definieren Sie einen POST-Endpunkt unter /login für die Benutzeranmeldung.
  - Überprüfen Sie die Benutzereingabe (E-Mail und Passwort).
  - Überprüfen Sie, ob der Benutzer in der Datenbank existiert und das Passwort übereinstimmt.
  - Generieren Sie ein JWT-Token zur Authentifizierung.
  - Senden Sie die Benutzerdaten zusammen mit dem Token in der Antwort.

 ```javascript  
app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exists in the database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // Save user token
      user.token = token;

      // Send user data along with token in the response
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});
```

11. **Benutzer-Logout-Endpunkt:**
   - Definiere einen POST-Endpunkt unter /logout für das Ausloggen des Benutzers.
   - Überprüfe die Benutzerauthentifizierung mithilfe des   auth-Middleware.
   - Lösche das Token des Benutzers (Ausloggen).
   - Sende eine Erfolgsmeldung in der Antwort.

```javascript
app.post("/logout", auth, async (req, res) => {
  try {
    // Get the user from the request object
    const user = req.user;

    // Clear the user's token (logout)
    user.token = null;

    // Send a success message
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
```

12. **Willkommens-Endpunkt:**
   - Definiere einen GET-Endpunkt unter `/welcome` zum Zugriff auf eine geschützte Route.
    - Überprüfe die Benutzerauthentifizierung mithilfe der `auth`-Middleware.
    - Sende eine Willkommensnachricht in der Antwort.

```javascript
app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌  ");
});
```


13. **404 Route:**
    - Definiere eine Catch-All-Route, um Anfragen an undefinierte Routen zu behandeln.
    - Sende eine JSON-Antwort mit einem Statuscode 404 und einer Nachricht, die darauf hinweist, dass die angeforderte Route auf diesem Server nicht definiert ist.

```javascript    
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});
```
