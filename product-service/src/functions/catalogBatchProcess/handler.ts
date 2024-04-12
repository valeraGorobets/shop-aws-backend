import { SQSHandler } from 'aws-lambda';
import middy from '@middy/core';
import { SQSEvent } from 'aws-lambda/trigger/sqs';
import { ProductsDbService } from '../../db/products-db.service';
import { ICreateProductDTO } from '../../types/api-types';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { DEFAULT_REGION } from '../../../../shared.models';

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
	console.log(`catalogBatchProcess running`);

	const snsClient: SNSClient = new SNSClient({ region: DEFAULT_REGION });
	const productsDbService: ProductsDbService = new ProductsDbService();
	const products: ICreateProductDTO[] = event.Records.map(({ body }) => JSON.parse(body) as ICreateProductDTO);
	await Promise.all(
		products.map((product: ICreateProductDTO) => productsDbService.createProduct(product)),
	);

	await snsClient.send(new PublishCommand({
		TopicArn: process.env.SNS_TOPIC_ARN,
		Subject: 'Catalog Batch process notification',
		Message: `Amount of products added: ${ event.Records.length }`,
	}));
};

export const main = middy(catalogBatchProcess);

