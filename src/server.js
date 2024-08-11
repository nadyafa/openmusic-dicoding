require("dotenv").config();

const Hapi = require("@hapi/hapi");

// req from albums
const albums = require("./api/albums");
const AlbumsService = require("./service/postgres/AlbumsService");
const AlbumsValidator = require("./validator/albums");

// req from songs
const songs = require("./api/songs");
const SongsService = require("./service/postgres/SongsService");
const SongsValidator = require("./validator/songs");

const ClientError = require("./exceptions/ClientError");

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // req for albums
  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  server.ext("onPreResponse", (request, h) => {
    // get response from request
    const { response } = request;

    // handling client error internally
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
