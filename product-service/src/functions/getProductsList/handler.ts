import {
	handleErrorResponse,
	ValidatedAPIGatewayProxyEvent,
	ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { ProductsDbService } from '../../db/products-db.service';
import { IProduct } from '../../types/api-types';

const SOURCE: string = '[getProductsList]';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event: ValidatedAPIGatewayProxyEvent<typeof schema>) => {
	console.log(`Lambda ${ SOURCE } started`);
	console.log(`Lambda ${ SOURCE } event: ${ JSON.stringify(event) }`);

	const productsDbService: ProductsDbService = new ProductsDbService();
	try {
		const allProducts: IProduct[] = await productsDbService.getAllProducts();
		return formatJSONResponse(allProducts);
	} catch (error) {
		return handleErrorResponse(error, SOURCE);
	} finally {
		productsDbService.destroy();
	}
};

export const main = middyfy(getProductsList);
