import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { IProduct, ProductsDbService } from "../../db/products-db.service";

const productsDbService: ProductsDbService = new ProductsDbService();
const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
	const allProducts: IProduct[] = productsDbService.getAllProducts();
	return formatJSONResponse(allProducts);
};

export const main = middyfy(getProductsList);
// message: `Hello ${ event.queryStringParameters.name }`,