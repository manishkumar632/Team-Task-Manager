const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/uploads/cloudinary-signature
 * Returns a signed payload the browser can use to upload directly to Cloudinary.
 *
 * Required env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * (Optional) CLOUDINARY_UPLOAD_FOLDER (default: "lumen/avatars")
 */
router.post("/cloudinary-signature", requireAuth, (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder    = process.env.CLOUDINARY_UPLOAD_FOLDER || "lumen/avatars";

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      error:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Scope each user's avatars under their own subfolder.
  const userFolder = `${folder}/${req.user.id}`;

  // Cloudinary signature: SHA1 of params (alphabetical, joined as k=v&...) + secret.
  const params = { folder: userFolder, timestamp };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  res.json({
    cloudName,
    apiKey,
    timestamp,
    folder: userFolder,
    signature,
  });
});

module.exports = router;
