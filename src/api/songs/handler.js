class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  // post a new song
  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    // input a song
    const { title, year, performer, genre, duration, album_id } = request.payload;

    // create songId
    const songId = await this._service.addSong({ title, year, performer, genre, duration, album_id });

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

  // get all songs return in the dashboard
  async getSongsHandler() {
    const getSongs = await this._service.getSongs();

    const songs = getSongs.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));

    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  // search song by id
  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: "success",
      data: {
        song,
      },
    };
  }

  // edit song based on id
  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: "success",
      message: "Lagu berhasil diperbarui",
    };
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return {
      status: "success",
      message: "Lagu berhasil dihapus",
    };
  }
}

module.exports = SongsHandler;