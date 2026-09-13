const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const FeedbackReport = require("../src/models/FeedbackReport");

describe("Suite de Pruebas: Sistema de Feedback y Reportes de Desarrollo", () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  after(async () => {
    await FeedbackReport.deleteMany({ comment: "Prueba automatizada de feedback" });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  test("POST /api/feedback - Debe permitir a un usuario o visitante enviar comentarios", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .field("title", "Sugerencia del mapa")
      .field("comment", "Prueba automatizada de feedback")
      .field("type", "suggestion")
      .field("category", "mapa_geolocalizacion")
      .field("rating", 5)
      .field("pageUrl", "/publish");

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.feedback);
    assert.strictEqual(res.body.feedback.comment, "Prueba automatizada de feedback");
    assert.strictEqual(res.body.feedback.status, "nuevo");
  });

  test("POST /api/feedback - Debe rechazar envío con comentario vacío", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .field("title", "Sin detalle")
      .field("comment", "   ");

    assert.strictEqual(res.status, 400);
    assert.match(res.body.msg, /obligatorio/i);
  });

  test("GET /api/feedback - Debe devolver la lista comunitaria de reportes", async () => {
    const res = await request(app)
      .get("/api/feedback")
      .expect(200);

    assert.ok(Array.isArray(res.body.feedbacks));
    assert.ok(typeof res.body.total === "number");
  });
});
