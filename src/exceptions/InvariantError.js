const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message) {
    super(message);
    // no status code, using ClientError default status code (400)
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;
