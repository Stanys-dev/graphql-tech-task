export class PlayerNotFoundError extends Error {
  constructor(message = 'Player Does Not Exist Error') {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
