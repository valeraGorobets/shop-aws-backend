import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { ProductsDbService } from '../../db/products-db.service';
import { IProduct } from '../../types/api-types';

const productsDbService: ProductsDbService = new ProductsDbService();
const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
	const allProducts: IProduct[] = await productsDbService.getAllProducts();
	return formatJSONResponse(allProducts);
};

export const main = middyfy(getProductsList);
