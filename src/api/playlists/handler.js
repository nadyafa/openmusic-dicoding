const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return h.response({
      status: "success",
      data: {
        playlists,
      },
    });
  }

  async getPlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistsService.getPlaylistById(id);

    return h.response({
      status: "success",
      data: {
        playlist,
      },
    });
  }

  async putPlaylistByIdHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistsService.editPlaylistById(id, request.payload);

    return h.response({
      status: "success",
      message: "Playlist berhasil diperbarui",
    });
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return h.response({
      status: "success",
      message: "Playlist berhasil dihapus",
    });
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongToPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.getSongById(songId);
    await this._playlistsService.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan dalam playlist",
      data: {
        playlistId,
        songId,
        credentialId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

    return h.response({
      status: "success",
      data: {
        playlist,
      },
    });
  }

  async deleteSongFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    return h.response({
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    });
  }
}

module.exports = PlaylistsHandler;
