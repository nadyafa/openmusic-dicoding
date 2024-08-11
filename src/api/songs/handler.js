const autoBind = require("auto-bind");

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  // post a new song
  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    // input a song
    const { title, year, performer, genre, duration, albumId } = request.payload;

    // create songId
    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan",
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  // get all songs and filter by title & performer feature
  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const getSongs = await this._service.getSongs({ title, performer });

    const songs = getSongs.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));

    return h.response({
      status: "success",
      data: {
        songs,
      },
    });
  }

  // search song by id
  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return h.response({
      status: "success",
      data: {
        song,
      },
    });
  }

  // edit song based on id
  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return h.response({
      status: "success",
      message: "Lagu berhasil diperbarui",
    });
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return h.response({
      status: "success",
      message: "Lagu berhasil dihapus",
    });
  }
}

module.exports = SongsHandler;
