create table pendaftar(
	id SERIAL primary KEY,
	nama text,
	password text
);
create table data_user(
	id SERIAL primary KEY,
	code_class text,
	nama text,
	password text
);
create table data_class(
	code_class primary KEY,
	nama_kelas text,
	nama_pengajar text,
	mata_pelajaran text,
	ruangan text,
	password text,
	no_ruangan int
);
create table penilaian(
	id SERIAL primary key,
	pengumuman text
);
create table tugas(
	id SERIAL primary key,
	tugas text
);
