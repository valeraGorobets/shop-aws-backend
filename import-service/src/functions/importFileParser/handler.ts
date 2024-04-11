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
import { SendMessageCommand, SendMessageCommandOutput, SQSClient } from '@aws-sdk/client-sqs';
import { DEFAULT_REGION } from '../../../../shared.models';

const getItemFromS3Stream = async (s3Client: S3Client, record: S3EventRecord): Promise<NodeJS.ReadableStream> => {
	console.log(`getItemFromS3Stream: ${ record.s3.object.key }`);

	const getCommand: GetObjectCommand = new GetObjectCommand({
		Bucket: record.s3.bucket.name,
		Key: record.s3.object.key,
	});

	const result: GetObjectCommandOutput = await s3Client.send(getCommand);
	return result.Body;
};

const sendToSQS = (product: Object, sqsClient: SQSClient): Promise<SendMessageCommandOutput> => {
	console.log(`sendToSQS new product`);

	const sendMessageCommand: SendMessageCommand = new SendMessageCommand({
		QueueUrl: process.env.CATALOG_ITEMS_QUEUE_URL,
		MessageBody: JSON.stringify(product),
	});
	return sqsClient.send(sendMessageCommand);
};

const parseRecords = async (recordsStream: NodeJS.ReadableStream, sqsClient: SQSClient): Promise<void> => {
	console.log(`parseRecords started`);

	await new Promise((resolve, reject) => {
		recordsStream
			.pipe(csv())
			.on('data', async (product) => await sendToSQS(product, sqsClient))
			.on('error', reject)
			.on('end', resolve);
	});
};

const moveFile = async (s3Client: S3Client, record: S3EventRecord): Promise<void> => {
	const key = record.s3.object.key;
	const bucket = record.s3.bucket.name;

	console.log(`moveFile: ${ key }`);

	const copyPath: string = key.replace(process.env.UPLOAD_FOLDER, process.env.PARSED_FOLDER);
	const copyCommand: CopyObjectCommand = new CopyObjectCommand({
		Bucket: bucket,
		CopySource: `${ bucket }/${ key }`,
		Key: copyPath,
	});

	await s3Client.send(copyCommand);
	console.log(`moveFile: File moved to ${ copyPath }`);

	const deleteCommand = new DeleteObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	await s3Client.send(deleteCommand);
	console.log(`moveFile: File ${ key } removed`);
};

const importFileParser = async (event: S3Event) => {
	const s3Client: S3Client = new S3Client({ region: DEFAULT_REGION });
	const sqsClient: SQSClient = new SQSClient({ region: DEFAULT_REGION });

	try {
		await Promise.all(
			event.Records.map(async (record: S3EventRecord) => {
				const recordsStream: NodeJS.ReadableStream = await getItemFromS3Stream(s3Client, record);
				await parseRecords(recordsStream, sqsClient);
				await moveFile(s3Client, record);
			}),
		);
		return formatJSONResponse('All records parsed');
	} catch (error) {
		return handleErrorResponse(error, 'importProductsFile');
	} finally {
		s3Client.destroy();
		sqsClient.destroy();
	}
};

export const main = middy(importFileParser);

