import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { ProductsDbService } from "../../db/products-db.service";
import { IProduct } from "../../types/api-types";

const productsDbService: ProductsDbService = new ProductsDbService();
const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const id: string = event.pathParameters.id;
	const product: IProduct = productsDbService.getProductById(id);
	return product
		? formatJSONResponse(product)
		: formatJSONResponse(`Product with ${id} not found`, 404);
};

export const main = middyfy(getProductsById);
