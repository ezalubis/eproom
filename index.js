import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { client } from "./db.js";

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
// const searchParams = new URLSearchParams(location.search);
// console.log(searchParams.get("nama_pengajar"));

const app = express();


// MIDDLEWARE
// Untuk mengelola cookie
app.use(cookieParser());
app.use(express.json());
app.post("/api/register",async(req,res)=>{
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(req.body.password, salt);
  await client.query(
    `INSERT INTO pendaftar (nama,password) VALUES ('${req.body.nama}','${hash}')`
  );
  res.send("Berhasil Daftar");
});
// // Untuk memeriksa otorisasi
app.use((req, res, next) => {
  if (req.path.startsWith("/api/login") || req.path.startsWith("/assets")) {
    next();
  } else {
    let authorized = false;
    if (req.cookies.token) {
      try {
        req.me = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
        authorized = true;
      } catch (err) {
        res.setHeader("Cache-Control", "no-store"); // khusus Vercel
        res.clearCookie("token");
      }
    }
    if (authorized) {
      if (req.path.startsWith("/login")) {
        res.redirect("/home");
      } else {
        next();
      }
    } else {
      if (req.path.startsWith("/login") || req.path.startsWith("/register")) {
        next();
      } else {
        if (req.path.startsWith("/api")) {
          res.status(401);
          res.send("Anda harus login terlebih dahulu.");
        } else {
          res.redirect("/login");
        }
      }
    }
  }
});

// Untuk mengakses file statis
app.use(express.static("public"));

// // Untuk mengakses file statis (khusus Vercel)
// // import path from "path";
// // const __dirname = path.dirname(new URL(import.meta.url).pathname);
// // app.use(express.static(path.resolve(__dirname, "public")));

// Untuk membaca body berformat JSON
// app.use(express.json());

// ROUTE OTORISASI


// Login (dapatkan token)
// app.post("/api/register",async(req,res)=>{
//   const salt = await bcrypt.genSalt();
//   const hash = await bcrypt.hash(req.body.password, salt);
//   await client.query(
//     `INSERT INTO pendaftar (nama,password) VALUES ('${req.body.nama}','${hash}')`
//   );
//   res.send("Berhasil Daftar");
// });
app.post("/api/login", async (req, res) => {
  const results = await client.query(
    `SELECT * FROM pendaftar WHERE nama = '${req.body.nama}'`
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
    res.send("Akun tidak ditemukan.");
  }
});

app.get("/api/me",async (req,res)=>{
    const results= await client.query(`SELECT * FROM data_class INNER JOIN data_user  ON data_class.code_class = data_user.code_class where data_class.nama_pengajar ='${req.me.nama}' and data_class.code_class = data_user.code_class `);
    req.me = results.rows;
    res.json(req.me);
});
app.get("/api/all",async (req,res)=>{
    const results= await client.query(`SELECT * FROM data_class INNER JOIN data_user ON data_class.code_class = data_user.code_class`);
    req.me = results.rows;
    res.json(req.me);
});
app.get("/api/me2",async (req,res)=>{
    const results= await client.query(`SELECT * FROM data_class WHERE nama_pengajar ='${req.me.nama}'`);
    req.me = results.rows;
    res.json(req.me);
});
app.get("/api/tugas",async (req,res)=>{
  const results= await client.query(`SELECT * FROM penilaian`);
  res.json(results.rows);
})
app.post("/api/join", async (req,res) => {
  await client.query(
    `INSERT INTO data_user (nama, password, code_class) VALUES ('${req.me.nama}','${req.me.password}','${req.body.code_class}')`
  );
  res.send("Code Masuk");
});
app.post("/api/tugas",async(req,res)=>{
  await client.query(
    `INSERT INTO penilaian (tugas,pengumuman,nama_pengajar) VALUES ('${req.file.originalname}','${req.body.pengumuman}','${req.body.nama_pengajar}')`
  );
  res.send("Tugas Masuk");
});

app.get("/api/user", async (req,res)=>{
  const results = await client.query(`SELECT * FROM data_class where code_class ='${req.me.code_class}'`);
  res.json(results.rows);
});
app.get("/api/class/home",async (req,res)=>{
    const results= await client.query(`SELECT * FROM data_class INNER JOIN data_user ON data_class.code_class = data_user.code_class AND data_user.nama = '${req.me.nama}'`);
    res.json(results.rows);
});
app.get("/api/class/home/pengajar",async (req,res)=>{
    const results= await client.query(`SELECT * FROM data_class WHERE nama_pengajar = '${req.me.nama}'`);
    res.json(results.rows);
});
app.post("/api/class",async (req,res)=>{ 
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password, salt);
    await client.query(
      `INSERT INTO data_class (nama_kelas, nama_pengajar, mata_pelajaran,ruangan,no_ruangan, password, code_class) VALUES ('${req.body.nama_kelas}', '${req.me.nama}', '${req.body.mata_pelajaran}', '${req.body.ruangan}', '${req.body.no_ruangan}', '${hash}','${req.body.code_class}')`
    );
    res.send("Class Berhasil Dibuat");
});
app.put("/api/class/:nama_kelas",async (req,res)=>{
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password, salt);
    await client.query(
      `UPDATE data_class SET nama_kelas = '${req.body.nama_kelas}', nama_pengajar = '${req.me.nama}', mata_pelajaran = '${req.body.mata_pelajaran}', ruangan = '${req.body.ruangan}', password = '${hash}', no_ruangan = '${req.body.no_ruangan}' WHERE nama_kelas = '${req.params.nama_kelas}'`
    );
    res.send("class berhasil Diedit");
});
app.delete("/api/class/:nama_kelas", async(req,res)=>{
    await client.query(`DELETE FROM data_class WHERE nama_kelas='${req.params.nama_kelas}'`);
    res.send("Class Berhasil Dihapus");
});
app.delete("/api/user/:code_class", async(req,res)=>{
  await client.query(`DELETE FROM data_user WHERE code_class='${req.params.code_class}'`);
  res.send("Class Berhasil Dihapus");
});
app.get("/api/logout",(req,res)=> {
  res.setHeader("Cache-Control", "no-store");
  res.clearCookie("token");
  res.send("Logout berhasil.");
})

app.listen(3002,()=>{
    console.log("gasskeunnn");
})