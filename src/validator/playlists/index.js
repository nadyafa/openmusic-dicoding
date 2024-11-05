const InvariantError = require("../../exceptions/InvariantError");
const { PlaylistPayloadSchema, SongToPlaylistPayloadSchema } = require("./schema");

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSongToPlaylistPayload: (payload) => {
    const validationResult = SongToPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostActivityPayload: (payload) => {
    const validationResult = PostActivityPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;