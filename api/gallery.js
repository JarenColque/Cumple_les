const { MongoClient } = require("mongodb");
const crypto = require("crypto");

let cachedClient;
let cachedCollection;

async function getCollection() {
  if (cachedCollection) return cachedCollection;

  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI.");
  }

  cachedClient = cachedClient || new MongoClient(process.env.MONGODB_URI);
  if (!cachedClient.topology?.isConnected?.()) {
    await cachedClient.connect();
  }

  const database = cachedClient.db(process.env.MONGODB_DB || "birthday_lesly");
  cachedCollection = database.collection("photos");
  return cachedCollection;
}

function cleanText(value, fallback, maxLength = 140) {
  return String(value || fallback).trim().slice(0, maxLength);
}

function getRequestBody(request) {
  if (!request.body) return {};

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body;
}

async function deleteFromCloudinary(publicId) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Faltan variables privadas de Cloudinary.");
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  const formData = new URLSearchParams({
    public_id: publicId,
    api_key: process.env.CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
    signature
  });

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!cloudinaryResponse.ok) {
    throw new Error("Cloudinary no pudo eliminar la imagen.");
  }

  return cloudinaryResponse.json();
}

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  try {
    const collection = await getCollection();

    if (request.method === "GET") {
      const photos = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(120)
        .project({ _id: 0 })
        .toArray();

      response.status(200).json(photos);
      return;
    }

    if (request.method === "POST") {
      const body = getRequestBody(request);
      const src = cleanText(body.src, "", 500);

      if (!src.startsWith("https://res.cloudinary.com/")) {
        response.status(400).json({ error: "La imagen debe venir de Cloudinary." });
        return;
      }

      const photo = {
        src,
        caption: cleanText(body.caption, "Un recuerdo bonito con Lesly"),
        publicId: cleanText(body.publicId, "", 255),
        createdAt: new Date()
      };

      await collection.insertOne(photo);
      response.status(201).json({
        src: photo.src,
        caption: photo.caption,
        publicId: photo.publicId,
        createdAt: photo.createdAt
      });
      return;
    }

    if (request.method === "DELETE") {
      const adminKey = request.headers["x-admin-key"];

      if (!process.env.DELETE_SECRET || adminKey !== process.env.DELETE_SECRET) {
        response.status(401).json({ error: "No autorizado." });
        return;
      }

      const body = getRequestBody(request);
      const publicId = cleanText(body.publicId, "", 255);
      const src = cleanText(body.src, "", 500);

      if (!publicId && !src) {
        response.status(400).json({ error: "Falta publicId o src." });
        return;
      }

      const photo = await collection.findOne(
        publicId ? { publicId } : { src },
        { projection: { _id: 0 } }
      );

      if (!photo) {
        response.status(404).json({ error: "La foto no existe." });
        return;
      }

      if (photo.publicId) {
        await deleteFromCloudinary(photo.publicId);
      }

      const result = await collection.deleteOne(
        photo.publicId ? { publicId: photo.publicId } : { src: photo.src }
      );

      response.status(200).json({
        deleted: result.deletedCount > 0
      });
      return;
    }

    response.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "No se pudo procesar la galería." });
  }
};