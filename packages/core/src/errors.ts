export const ERROR_CODES = {
	BAD_REQUEST: 400,
	UNAUTHENTICATED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	CONTENT_TOO_LARGE: 413,
	UNSUPPORTED_MEDIA_TYPE: 415,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
};

export type ERROR_CODE = keyof typeof ERROR_CODES;

export class APIError extends Error {
	public readonly errorCode: ERROR_CODE;
	public readonly statusCode: number;
	public readonly metadata?: Record<string, unknown>;

	constructor(
		errorCode: ERROR_CODE,
		message: string,
		metadata?: Record<string, unknown>,
	) {
		super(message);
		this.errorCode = errorCode;
		this.statusCode = ERROR_CODES[errorCode];
		this.metadata = metadata;

		Error.captureStackTrace(this, this.constructor);
	}
}
