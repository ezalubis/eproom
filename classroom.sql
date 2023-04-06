CREATE DATABASE classroom;
CREATE TABLE pendaftar(
	id SERIAL PRIMARY KEY,
	nama TEXT,
	PASSWORD TEXT
);
CREATE TABLE data_user(
	id SERIAL PRIMARY KEY,
	code_class TEXT,
	nama TEXT,
	PASSWORD TEXT
);
CREATE TABLE penilaian(
	id SERIAL PRIMARY KEY,
	tugas TEXT,
	mata_pelajaran TEXT,
	nama_siswa TEXT,
	pengumuman TEXT,
	nama_pengajar TEXT,
	nama_kelas TEXT
);
CREATE TABLE penilaian(
	code_class TEXT PRIMARY KEY,
	nama_kelas TEXT,
	nama_pengajar TEXT,
	mata_pelajaran TEXT,
	ruangan TEXT,
	PASSWORD TEXT,
	no_ruangan INT
);
