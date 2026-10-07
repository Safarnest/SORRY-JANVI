const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

const responsesFile = path.join(
  __dirname,
  "responses.json"
);


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());
app.use(express.json());


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {

  res.json({
    success: true,
    message: "SORRY-JANVI API is running ❤️"
  });

});


/* =========================================================
   SAVE RESPONSE
========================================================= */

app.post("/api/response", (req, res) => {

  const { response } = req.body;


  if (!response) {

    return res.status(400).json({
      success: false,
      message: "Response is required"
    });

  }


  const newResponse = {

    response: response,

    createdAt:
      new Date().toISOString()

  };


  let responses = [];


  try {

    if (fs.existsSync(responsesFile)) {

      const fileData =
        fs.readFileSync(
          responsesFile,
          "utf8"
        );


      if (fileData.trim()) {

        responses =
          JSON.parse(fileData);

      }

    }

  } catch (error) {

    console.error(
      "Could not read responses file:",
      error
    );

  }


  responses.push(newResponse);


  try {

    fs.writeFileSync(

      responsesFile,

      JSON.stringify(
        responses,
        null,
        2
      )

    );

  } catch (error) {

    console.error(
      "Could not save response:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Could not save response"

    });

  }


  res.json({

    success: true,

    message:
      "Response saved ❤️"

  });

});


/* =========================================================
   VIEW SAVED RESPONSES
========================================================= */

app.get("/api/responses", (req, res) => {

  try {

    if (!fs.existsSync(responsesFile)) {

      return res.json({

        success: true,

        responses: []

      });

    }


    const fileData =
      fs.readFileSync(
        responsesFile,
        "utf8"
      );


    const responses =
      fileData.trim()
        ? JSON.parse(fileData)
        : [];


    res.json({

      success: true,

      responses: responses

    });

  } catch (error) {

    console.error(
      "Could not read saved responses:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Could not read responses"

    });

  }

});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

  console.log(
    `SORRY-JANVI API running on http://127.0.0.1:${PORT}`
  );

});