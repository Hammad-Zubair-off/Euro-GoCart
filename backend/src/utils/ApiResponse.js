class ApiResponse {
  constructor(data, message = null) {
    this.success = true;
    this.data = data;
    if (message) this.message = message;
  }

  static send(res, statusCode, data, message) {
    return res.status(statusCode).json(new ApiResponse(data, message));
  }
}

module.exports = ApiResponse;
