const mapDBToAlbums = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapDBToSongs = ({ id, title, year, performer, genre, duration, albumId }) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapDBToPlaylist = ({ id, name, username }) => ({
  id,
  name,
  username,
});

module.exports = { mapDBToAlbums, mapDBToSongs, mapDBToPlaylist };
