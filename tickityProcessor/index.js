require("dotenv").config();
const OpenAI = require("openai");
const axios = require("axios");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI();

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Node.js backend!");
});

// Example API route
app.get("/api/data", (req, res) => {
  res.json({ message: "This is some data from the backend" });
});

// OpenAI Chat
app.post("/chat", async (req, res) => {
  // Input validation
  if (!req.body || !req.body.message) {
    return res.status(400).json({
      error: "Missing required field 'message' in request body",
    });
  }

  const userMessage = req.body.message;

  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OpenAI API key is not configured",
    });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from OpenAI API");
    }

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: "Error processing request",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

app.post("/analyze-image", upload.single("file"), async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error:
        "No file uploaded. Please upload an image file with field name 'file'",
    });
  }

  const imagePath = req.file.path;

  try {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
    // console.log("Image data:", imageData);
    // return;
    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe the image." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ result: response.data.choices[0].message.content });
  } catch (err) {
    // Clean up file if it exists and there was an error
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to analyze image",
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

app.post("/analyze-image-anime", upload.single("file"), async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error:
        "No file uploaded. Please upload an image file with field name 'file'",
    });
  }

  const imagePath = req.file.path;

  try {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
    // console.log("Image data:", imageData);
    // return;
    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "share the prompt for anime for this image, make it detailed so that it catches all the details",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imgPrompt = response.data.choices[0].message.content;

    console.log("Image prompt:", imgPrompt);

    const imgResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imgPrompt,
      n: 1,
      size: "1024x1024",
    });

    // res.json({ result: response.data.choices[0].message.content });
    res.json({
      result: imgResponse.data[0].url,
      prompt: imgPrompt,
    });
  } catch (err) {
    // Clean up file if it exists and there was an error
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to analyze image",
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

app.post(
  "/analyze-image-pixel-art",
  upload.single("file"),
  async (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error:
          "No file uploaded. Please upload an image file with field name 'file'",
      });
    }

    const imagePath = req.file.path;

    try {
      // Validate file exists
      if (!fs.existsSync(imagePath)) {
        return res.status(400).json({ error: "File upload failed" });
      }

      const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
      // console.log("Image data:", imageData);
      // return;
      // Clean up uploaded file
      fs.unlinkSync(imagePath);

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "share the prompt for pixel art for this image, make it detailed so that it catches all the details",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageData}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const imgPrompt = response.data.choices[0].message.content;

      console.log("Image prompt:", imgPrompt);

      const imgResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imgPrompt,
        n: 1,
        size: "1024x1024",
      });

      // res.json({ result: response.data.choices[0].message.content });
      res.json({
        result: imgResponse.data[0].url,
        prompt: imgPrompt,
      });
    } catch (err) {
      // Clean up file if it exists and there was an error
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      console.error(err.response?.data || err.message);
      res.status(500).json({
        error: "Failed to analyze image",
        details: err.response?.data?.error?.message || err.message,
      });
    }
  }
);

app.post("/analyze-image-surreal", upload.single("file"), async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error:
        "No file uploaded. Please upload an image file with field name 'file'",
    });
  }

  const imagePath = req.file.path;

  try {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
    // console.log("Image data:", imageData);
    // return;
    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "share the prompt for Surrealist Abstraction for this image, make it detailed so that it catches all the details",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imgPrompt = response.data.choices[0].message.content;

    console.log("Image prompt:", imgPrompt);

    const imgResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imgPrompt,
      n: 1,
      size: "1024x1024",
    });

    // res.json({ result: response.data.choices[0].message.content });
    res.json({
      result: imgResponse.data[0].url,
      prompt: imgPrompt,
    });
  } catch (err) {
    // Clean up file if it exists and there was an error
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to analyze image",
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

app.post("/analyze-image-ghibli", upload.single("file"), async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error:
        "No file uploaded. Please upload an image file with field name 'file'",
    });
  }

  const imagePath = req.file.path;

  try {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
    // console.log("Image data:", imageData);
    // return;
    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "share the prompt for ghibly style for this image make it detailed so that it catches all the details",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imgPrompt = response.data.choices[0].message.content;

    console.log("Image prompt:", imgPrompt);

    const imgResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imgPrompt,
      n: 1,
      size: "1024x1024",
    });

    // res.json({ result: response.data.choices[0].message.content });
    res.json({
      result: imgResponse.data[0].url,
      prompt: imgPrompt,
    });
  } catch (err) {
    // Clean up file if it exists and there was an error
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to analyze image",
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
