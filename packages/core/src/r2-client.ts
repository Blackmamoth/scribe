import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const r2Client = new S3Client({
	region: "auto",
	endpoint: env.R2_API_ENDPOINT,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_ACCESS_KEY,
	},
});

export const uploadToR2 = async (
	fileName: string,
	body: Buffer,
	contentType: string,
) => {
	await r2Client.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: fileName,
			Body: body,
			ContentType: contentType,
			ACL: "public-read",
		}),
	);

	return `${env.R2_PUBLIC_URL}/${fileName}`;
};
