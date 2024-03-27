import type { ValidatedAPIGatewayProxyEvent, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { ProductsDbService } from "../../db/products-db.service";
import { ICreateProductDTO, IProduct } from '../../types/api-types';

const productsDbService: ProductsDbService = new ProductsDbService();
const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event: ValidatedAPIGatewayProxyEvent<typeof schema>) => {
	const createProductDTO: ICreateProductDTO = event.body;
	const product: IProduct = await productsDbService.createProduct(createProductDTO);
	return product
		? formatJSONResponse(product)
		: formatJSONResponse(`Product with ${createProductDTO} not found`, 404);
};

export const main = middyfy(createProduct);
