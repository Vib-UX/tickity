require("dotenv").config();
const OpenAI = require("openai");
const axios = require("axios");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dudyr8sau",
  api_key: process.env.CLOUDINARY_API_KEY || "795874972645181",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload base64 image to Cloudinary with optimization
async function uploadBase64ToCloudinary(
  base64Data,
  folder = "images",
  publicId = null,
  options = {}
) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      public_id: publicId || `img_${Date.now()}`,
      overwrite: true,
      fetch_format: "auto",
      quality: "auto",
      ...options,
    });

    // Generate optimized URL
    const optimizedUrl = cloudinary.url(uploadResponse.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    // Generate auto-crop URL for square aspect ratio
    const autoCropUrl = cloudinary.url(uploadResponse.public_id, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      optimized_url: optimizedUrl,
      auto_crop_url: autoCropUrl,
      public_id: uploadResponse.public_id,
      response: uploadResponse,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

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

  // Extract event details from request body
  const {
    eventName = "",
    eventDescription = "",
    eventLocation = "",
    eventOrganizer = "",
    eventTheme = "",
    eventDate = "",
  } = req.body;

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

    // First, get the base image prompt
    const basePrompt =
      "share the prompt for ghibli style for this image make it detailed so that it catches all the details";

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
                text: basePrompt,
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
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const baseImgPrompt = response.data.choices[0].message.content;

    console.log("Base image prompt:", baseImgPrompt);

    // Now enhance the prompt with event details for background only
    let enhancedImgPrompt = baseImgPrompt;

    if (eventName || eventDescription || eventOrganizer || eventTheme) {
      enhancedImgPrompt += ` Additionally, in the background only, include subtle references to:`;

      if (eventName) {
        enhancedImgPrompt += ` Event: "${eventName}".`;
      }
      if (eventOrganizer) {
        enhancedImgPrompt += ` Organizer: "${eventOrganizer}".`;
      }
      if (eventTheme) {
        enhancedImgPrompt += ` Theme: "${eventTheme}".`;
      }

      enhancedImgPrompt += ` Add these elements as background details, logos, or environmental features while keeping the main image content exactly as described above.`;
    }

    console.log("Enhanced image prompt:", enhancedImgPrompt);

    const imgResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedImgPrompt,
      output_format: "jpeg",
      size: "1024x1024",
    });

    console.log("Generated image response:", imgResponse);

    // gpt-image-1 returns b64_json instead of URL
    const image_base64 = imgResponse.data[0].b64_json;

    // Upload to Cloudinary with optimization
    const cloudinaryResult = await uploadBase64ToCloudinary(
      `data:image/jpeg;base64,${image_base64}`,
      "ghibli-images",
      `ghibli_${Date.now()}`,
      {
        transformation: [
          { fetch_format: "auto", quality: "auto" },
          { crop: "auto", gravity: "auto" },
        ],
      }
    );

    if (cloudinaryResult.success) {
      console.log("Image uploaded to Cloudinary:", cloudinaryResult.url);
      console.log("Optimized URL:", cloudinaryResult.optimized_url);
      console.log("Auto-crop URL:", cloudinaryResult.auto_crop_url);

      // Return the Cloudinary URLs and other data with event context
      res.json({
        result: cloudinaryResult.url,
        optimized_url: cloudinaryResult.optimized_url,
        auto_crop_url: cloudinaryResult.auto_crop_url,
        filename: cloudinaryResult.public_id,
        base_prompt: baseImgPrompt,
        enhanced_prompt: enhancedImgPrompt,
        cloudinary_id: cloudinaryResult.public_id,
        original_base64: `data:image/jpeg;base64,${image_base64}`,
        event_context: {
          eventName,
          eventDescription,
          eventLocation,
          eventOrganizer,
          eventTheme,
          eventDate,
        },
      });
    } else {
      console.error("Cloudinary upload failed:", cloudinaryResult.error);

      // Fallback: return base64 if Cloudinary fails
      const timestamp = Date.now();
      const filename = `ghibli_${timestamp}.jpeg`;
      const image_bytes = Buffer.from(image_base64, "base64");
      fs.writeFileSync(filename, image_bytes);

      console.log(`Image saved locally as: ${filename}`);

      res.json({
        result: `data:image/jpeg;base64,${image_base64}`,
        filename: filename,
        base_prompt: baseImgPrompt,
        enhanced_prompt: enhancedImgPrompt,
        error: "Cloudinary upload failed, using base64 fallback",
        cloudinary_error: cloudinaryResult.error,
        event_context: {
          eventName,
          eventDescription,
          eventLocation,
          eventOrganizer,
          eventTheme,
          eventDate,
        },
      });
    }
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

// Endpoint to convert base64 image to Cloudinary URL with optimization
app.post("/convert-base64-to-url", async (req, res) => {
  try {
    const {
      base64Data,
      folder = "images",
      publicId = null,
      options = {},
    } = req.body;

    if (!base64Data) {
      return res.status(400).json({
        error: "base64Data is required in request body",
      });
    }

    const cloudinaryResult = await uploadBase64ToCloudinary(
      base64Data,
      folder,
      publicId,
      options
    );

    if (cloudinaryResult.success) {
      res.json({
        success: true,
        url: cloudinaryResult.url,
        optimized_url: cloudinaryResult.optimized_url,
        auto_crop_url: cloudinaryResult.auto_crop_url,
        public_id: cloudinaryResult.public_id,
        folder: folder,
      });
    } else {
      res.status(500).json({
        success: false,
        error: cloudinaryResult.error,
      });
    }
  } catch (error) {
    console.error("Error converting base64 to URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to convert base64 to URL",
      details: error.message,
    });
  }
});

// Endpoint for generating social media meta tags with Cloudinary URLs
app.post("/generate-social-meta", async (req, res) => {
  try {
    const {
      publicId,
      title = "Generated Image",
      description = "A beautiful Ghibli-style generated image",
      url = "",
      eventName = "",
      eventDescription = "",
    } = req.body;

    if (!publicId) {
      return res.status(400).json({
        error: "publicId is required in request body",
      });
    }

    // Generate optimized URLs for social media
    const socialImageUrl = cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      width: 1200,
      height: 630,
      crop: "fill",
      gravity: "auto",
    });

    const twitterImageUrl = cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      width: 1200,
      height: 600,
      crop: "fill",
      gravity: "auto",
    });

    const thumbnailUrl = cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: "fill",
      gravity: "auto",
    });

    // Generate meta tags
    const metaTags = {
      // Open Graph tags
      "og:title": title,
      "og:description": description,
      "og:image": socialImageUrl,
      "og:url": url,
      "og:type": "website",
      "og:image:width": "1200",
      "og:image:height": "630",

      // Twitter Card tags
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": twitterImageUrl,
      "twitter:image:alt": eventName || "Generated Ghibli-style image",

      // Additional event-specific tags
      "event:name": eventName,
      "event:description": eventDescription,
    };

    res.json({
      success: true,
      meta_tags: metaTags,
      urls: {
        social_image: socialImageUrl,
        twitter_image: twitterImageUrl,
        thumbnail: thumbnailUrl,
        original: cloudinary.url(publicId),
      },
      public_id: publicId,
    });
  } catch (error) {
    console.error("Error generating social meta tags:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate social meta tags",
      details: error.message,
    });
  }
});

// Endpoint for image transformations and optimizations
app.post("/transform-image", async (req, res) => {
  try {
    const { publicId, transformations = {} } = req.body;

    if (!publicId) {
      return res.status(400).json({
        error: "publicId is required in request body",
      });
    }

    // Generate optimized URL
    const optimizedUrl = cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      ...transformations,
    });

    // Generate auto-crop URL for square aspect ratio
    const autoCropUrl = cloudinary.url(publicId, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
      ...transformations,
    });

    // Generate thumbnail URL
    const thumbnailUrl = cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: "fill",
      gravity: "auto",
      ...transformations,
    });

    res.json({
      success: true,
      original_url: cloudinary.url(publicId),
      optimized_url: optimizedUrl,
      auto_crop_url: autoCropUrl,
      thumbnail_url: thumbnailUrl,
      public_id: publicId,
    });
  } catch (error) {
    console.error("Error transforming image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to transform image",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
