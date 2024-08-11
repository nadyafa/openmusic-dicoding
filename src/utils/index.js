const mapDBToAlbums = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapDBToSongs = ({
  id, title, year, performer, genre, duration, albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

module.exports = { mapDBToAlbums, mapDBToSongs };
