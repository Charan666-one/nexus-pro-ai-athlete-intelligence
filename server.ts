import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("nexus_pro.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS athletes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sport TEXT,
    age INTEGER,
    gender TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER,
    test_date DATE,
    heart_rate REAL,
    hematocrit REAL,
    testosterone REAL,
    oxygen_level REAL,
    blood_pressure TEXT,
    test_type TEXT,
    risk_score INTEGER,
    suspicion_level TEXT,
    ai_analysis TEXT,
    confidence_score INTEGER,
    final_decision TEXT,
    FOREIGN KEY(athlete_id) REFERENCES athletes(id)
  );
`);

// Seed some data if empty
const athleteCount = db.prepare("SELECT COUNT(*) as count FROM athletes").get() as { count: number };
if (athleteCount.count === 0) {
  const insertAthlete = db.prepare("INSERT INTO athletes (name, sport, age, gender) VALUES (?, ?, ?, ?)");
  insertAthlete.run("John Doe", "Cycling", 28, "Male");
  insertAthlete.run("Sarah Smith", "Swimming", 24, "Female");
  insertAthlete.run("Mike Johnson", "Athletics", 31, "Male");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/athletes", (req, res) => {
    const athletes = db.prepare("SELECT * FROM athletes").all();
    res.json(athletes);
  });

  app.get("/api/athletes/:id", (req, res) => {
    const athlete = db.prepare("SELECT * FROM athletes WHERE id = ?").get(req.params.id);
    const reports = db.prepare("SELECT * FROM reports WHERE athlete_id = ? ORDER BY test_date DESC").all(req.params.id);
    res.json({ ...athlete, reports });
  });

  app.post("/api/athletes", (req, res) => {
    const { name, sport, age, gender } = req.body;
    const result = db.prepare("INSERT INTO athletes (name, sport, age, gender) VALUES (?, ?, ?, ?)").run(name, sport, age, gender);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/reports", (req, res) => {
    const { 
      athlete_id, test_date, heart_rate, hematocrit, testosterone, 
      oxygen_level, blood_pressure, test_type, risk_score, 
      suspicion_level, ai_analysis, confidence_score, final_decision 
    } = req.body;
    
    const result = db.prepare(`
      INSERT INTO reports (
        athlete_id, test_date, heart_rate, hematocrit, testosterone, 
        oxygen_level, blood_pressure, test_type, risk_score, 
        suspicion_level, ai_analysis, confidence_score, final_decision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      athlete_id, test_date, heart_rate, hematocrit, testosterone, 
      oxygen_level, blood_pressure, test_type, risk_score, 
      suspicion_level, ai_analysis, confidence_score, final_decision
    );
    
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/dashboard/stats", (req, res) => {
    const totalAthletes = db.prepare("SELECT COUNT(*) as count FROM athletes").get() as { count: number };
    const highRiskCount = db.prepare("SELECT COUNT(DISTINCT athlete_id) as count FROM reports WHERE risk_score > 60").get() as { count: number };
    const recentReports = db.prepare(`
      SELECT r.*, a.name as athlete_name 
      FROM reports r 
      JOIN athletes a ON r.athlete_id = a.id 
      ORDER BY r.test_date DESC LIMIT 5
    `).all();
    
    res.json({
      totalAthletes: totalAthletes.count,
      highRiskCount: highRiskCount.count,
      recentReports
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
