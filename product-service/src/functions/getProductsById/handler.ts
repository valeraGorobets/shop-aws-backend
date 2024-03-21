import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { IProduct, ProductsDbService } from "../../db/products-db.service";

const productsDbService: ProductsDbService = new ProductsDbService();
const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const id: string = event.pathParameters.id;
	const product: IProduct = productsDbService.getProductById(id);
	return formatJSONResponse(product);
};

export const main = middyfy(getProductsById);
// message: `Hello ${ event.queryStringParameters.name }`,