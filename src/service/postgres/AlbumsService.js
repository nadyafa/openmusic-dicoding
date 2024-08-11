const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapDBToAlbums } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  // adding an album
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  // diplay albums in the dasboard
  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapDBToAlbums);
  }

  // search an album by id
  async getAlbumById(id) {
    const albumsQuery = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const songsQuery = {
      text: 'SELECT * FROM songs WHERE "albumId" = $1 LIMIT 2',
      values: [id],
    };

    const albumResult = await this._pool.query(albumsQuery);
    const songsResult = await this._pool.query(songsQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const album = albumResult.rows[0];
    const songs = songsResult.rows.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    return {
      id: album.id,
      name: album.name,
      year: album.year,
      songs,
    };
  }

  // edit an album by id
  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  // delete an album by id
  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = AlbumsService;
