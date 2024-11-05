const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapDBToPlaylist } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
      SELECT playlists.id, playlists.name, users.username 
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations 
      ON playlists.id = collaborations.playlist_id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1 
      GROUP BY playlists.id, users.username
      LIMIT 2`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToPlaylist);
  }

  // async getPlaylistById(id) {
  //   const query = {
  //     text: `
  //     SELECT playlists.*, users.username
  //     FROM playlists
  //     LEFT JOIN users ON users.id = playlists.owner
  //     WHERE playlists.id = $1`,
  //     values: [id],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rows.length) {
  //     throw new NotFoundError("Playlist tidak ditemukan");
  //   }

  //   return result.rows.map(mapDBToPlaylist)[0];
  // }

  // async editPlaylistById(id, { name }) {
  //   const query = {
  //     text: "UPDATE playlists SET name = $1 WHERE id = $2 RETURNING id",
  //     values: [name, id],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rows.length) {
  //     throw new NotFoundError("Gagal memperbarui playlist. Playlist tidak ditemukan");
  //   }
  // }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        "Playlist gagal dihapus. Playlist tidak ditemukan"
      );
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof AuthorizationError) {
        try {
          await this._collaborationService.verifyCollaborator(
            playlistId,
            userId
          );
        } catch {
          console.error(
            `Access verification failed for user ${credentialId} on playlist ${id}`,
            error
          ); //for debug
          throw error;
        }
      }
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const query = {
      text: "INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2) RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan dalam playlists");
    }
    // return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const playlistQuery = {
      text: `
      SELECT playlists.id, playlists.name, user.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const songsQuery = {
      text: `
      SELECT songs.id, songs.title, songs.performer
      FROM songs
      JOIN playlist_songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const songsResult = await this._pool.query(songsQuery);

    if ((!playlistResult.rows, length)) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return { ...playlistResult.rows[0], songs: songsResult.rows };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Lagu gagal dihapus dari playlist");
    }
  }
}

module.exports = PlaylistsService;
