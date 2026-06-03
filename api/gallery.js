const { MongoClient } = require("mongodb");

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

function cleanText(value, fallback) {
  return String(value || fallback).trim().slice(0, 140);
}

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
      const body = request.body || {};
      const src = cleanText(body.src, "");

      if (!src.startsWith("https://res.cloudinary.com/")) {
        response.status(400).json({ error: "La imagen debe venir de Cloudinary." });
        return;
      }

      const photo = {
        src,
        caption: cleanText(body.caption, "Un recuerdo bonito con Lesly"),
        publicId: cleanText(body.publicId, ""),
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

    response.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    response.status(500).json({ error: "No se pudo conectar con la galería." });
  }
};
