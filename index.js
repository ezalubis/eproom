import dotenv from "dotenv";
dotenv.config();

import express from "express";

import { client } from "./db.js";

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.static("public"));

// MIDDLEWARE

// Untuk mengelola cookie
app.use(cookieParser());

// // Untuk memeriksa otorisasi
// app.use((req, res, next) => {
//   if (req.path.startsWith("/api/login") || req.path.startsWith("/assets")) {
//     next();
//   } else {
//     let authorized = false;
//     if (req.cookies.token) {
//       try {
//         jwt.verify(req.cookies.token, process.env.SECRET_KEY);
//         authorized = true;
//       } catch (err) {
//         res.setHeader("Cache-Control", "no-store"); // khusus Vercel
//         res.clearCookie("token");
//       }
//     }
//     if (authorized) {
//       if (req.path.startsWith("/login")) {
//         res.redirect("/");
//       } else {
//         next();
//       }
//     } else {
//       if (req.path.startsWith("/login")) {
//         next();
//       } else {
//         if (req.path.startsWith("/api")) {
//           res.status(401);
//           res.send("Anda harus login terlebih dahulu.");
//         } else {
//           res.redirect("/login");
//         }
//       }
//     }
//   }
// });

// Untuk mengakses file statis
// app.use(express.static("public"));

// Untuk mengakses file statis (khusus Vercel)
// import path from "path";
// const __dirname = path.dirname(new URL(import.meta.url).pathname);
// app.use(express.static(path.resolve(__dirname, "public")));

// Untuk membaca body berformat JSON
app.use(express.json());

// ROUTE OTORISASI

// Login (dapatkan token)
app.post("/api/login", async (req, res) => {
  const results = await client.query(
    `SELECT * FROM data_class WHERE ruangan = '${req.body.ruangan}'`
  );
  if (results.rows.length > 0) {
    if (await bcrypt.compare(req.body.password, results.rows[0].password)) {
      const token = jwt.sign(results.rows[0], process.env.SECRET_KEY);
      res.cookie("token", token);
      res.send("Login berhasil.");
    } else {
      res.status(401);
      res.send("Kata sandi salah.");
    }
  } else {
    res.status(401);
    res.send("Mahasiswa tidak ditemukan.");
  }
});

app.get("/api/class",async (_req,res)=>{
    const results= await client.query("SELECT * FROM data_class ORDER BY no_ruangan");
    res.json(results.rows);
});
app.post("/api/class",async(req,res)=>{
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password, salt);
    const hash2 = await bcrypt.hash(req.body.code_class, salt);
    await client.query(
      `INSERT INTO data_class (nama_kelas, nama_pengajar, mata_pelajaran,ruangan,no_ruangan, password, code_class) VALUES ('${req.body.nama_kelas}', '${req.body.nama_pengajar}', '${req.body.mata_pelajaran}', '${req.body.ruangan}', '${req.body.no_ruangan}', '${hash}','${hash2}')`
    );
    res.send("Class Berhasil Dibuat");
});
app.put("/api/class/:nama_kelas",async (req,res)=>{
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password, salt);
    await client.query(
      `UPDATE data_class SET nama_kelas = '${req.body.nama_kelas}', nama_pengajar = '${req.body.nama_pengajar}', mata_pelajaran = '${req.body.mata_pelajaran}', ruangan = '${req.body.ruangan}', password = '${hash}', no_ruangan = '${req.body.no_ruangan}' WHERE nama_kelas = '${req.params.nama_kelas}'`
    );
    res.send("class berhasil Diedit");
});
app.delete("/api/class/:nama_kelas", async(req,res)=>{
    const results= await client.query(`DELETE FROM data_class WHERE nama_kelas='${req.params.nama_kelas}'`);
    res.send("Class Berhasil Dihapus");
});


app.listen(3002,()=>{
    console.log("gasskeunnn");
})