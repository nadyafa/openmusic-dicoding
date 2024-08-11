const InvariantError = require("../../exceptions/InvariantError");
const { SongPayloadSchema } = require("./schema");

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);

    if (validationResult.error) {
      console.error("Validation Error: ", validationResult.error.details); //checking detail error for debugging (delete later)
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
