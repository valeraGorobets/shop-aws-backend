import { formatJSONResponse, handleErrorResponse } from '@libs/api-gateway';
import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	GetObjectCommandOutput,
	S3Client,
} from '@aws-sdk/client-s3';
import { S3Event, S3EventRecord } from 'aws-lambda';
import csv from 'csv-parser';
import middy from '@middy/core';

const getItemFromS3Stream = async (client: S3Client, record: S3EventRecord): Promise<NodeJS.ReadableStream> => {
	console.log(`getItemFromS3Stream: ${ record.s3.object.key }`);

	const getCommand: GetObjectCommand = new GetObjectCommand({
		Bucket: record.s3.bucket.name,
		Key: record.s3.object.key,
	});

	const result: GetObjectCommandOutput = await client.send(getCommand);
	return result.Body;
};

const parseRecords = async (recordsStream: NodeJS.ReadableStream): Promise<void> => {
	console.log(`parseRecords started`);

	await new Promise((resolve, reject) => {
		recordsStream
			.pipe(csv())
			.on('data', (chunk) => console.log(chunk))
			.on('error', reject)
			.on('end', resolve);
	});
};

const moveFile = async (client: S3Client, record: S3EventRecord): Promise<void> => {
	const key = record.s3.object.key;
	const bucket = record.s3.bucket.name;

	console.log(`moveFile: ${ key }`);

	const copyPath: string = key.replace(process.env.UPLOAD_FOLDER, process.env.PARSED_FOLDER);
	const copyCommand: CopyObjectCommand = new CopyObjectCommand({
		Bucket: bucket,
		CopySource: `${ bucket }/${ key }`,
		Key: copyPath,
	});

	await client.send(copyCommand);
	console.log(`moveFile: File moved to ${ copyPath }`);

	const deleteCommand = new DeleteObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	await client.send(deleteCommand);
	console.log(`moveFile: File ${ key } removed`);
};

const importFileParser = async (event: S3Event) => {
	const client: S3Client = new S3Client({ region: 'eu-west-1' });

	try {
		await Promise.all(
			event.Records.map(async (record: S3EventRecord) => {
				const recordsStream: NodeJS.ReadableStream = await getItemFromS3Stream(client, record);
				await parseRecords(recordsStream);
				await moveFile(client, record);
			}),
		);
		return formatJSONResponse('All records parsed');
	} catch (error) {
		return handleErrorResponse(error, 'importProductsFile');
	} finally {
		client.destroy();
	}
};

export const main = middy(importFileParser);

