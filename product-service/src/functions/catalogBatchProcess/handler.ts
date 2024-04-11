import { SQSHandler } from 'aws-lambda';
import middy from '@middy/core';
import { SQSEvent } from 'aws-lambda/trigger/sqs';
import { ProductsDbService } from '../../db/products-db.service';
import { ICreateProductDTO } from '../../types/api-types';

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
	console.log(`catalogBatchProcess running`);
	const productsDbService: ProductsDbService = new ProductsDbService();
	const products: ICreateProductDTO[] = event.Records.map(({ body }) => JSON.parse(body) as ICreateProductDTO);
	await Promise.all(
		products.map((product: ICreateProductDTO) => productsDbService.createProduct(product)),
	);
};

export const main = middy(catalogBatchProcess);

