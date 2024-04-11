import {
	handleErrorResponse,
	ValidatedAPIGatewayProxyEvent,
	ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import schema from './schema';
import { DEFAULT_REGION } from '../../../../shared.models';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event: ValidatedAPIGatewayProxyEvent<typeof schema>) => {
	const s3Client = new S3Client({ region: DEFAULT_REGION });

	try {
		const fileName: string = event.queryStringParameters.name;
		const folder: string = process.env.UPLOAD_FOLDER;
		const key: string = `${ folder }/${ fileName }`;
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: key,
		};

		const command = new PutObjectCommand(params);

		const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 360 });
		return formatJSONResponse(presignedUrl);
	} catch (error) {
		return handleErrorResponse(error, 'importProductsFile');
	} finally {
		s3Client.destroy();
	}

};

export const main = middyfy(importProductsFile);
