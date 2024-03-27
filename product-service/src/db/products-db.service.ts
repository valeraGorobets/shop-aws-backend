import { ICreateProductDTO, IProduct, IStock } from '../types/api-types';
import { DatabaseService } from './db.service';
import {
	GetCommandInput,
	GetCommandOutput,
	PutCommandInput,
	ScanCommandInput,
	ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const ProductsTable: string = process.env.PRODUCTS_TABLE;
const StocksTable: string = process.env.STOCKS_TABLE;

export class ProductsDbService extends DatabaseService {
	public async getAllProducts(): Promise<IProduct[]> {
		const productsParams: ScanCommandInput = {
			TableName: ProductsTable,
		};
		const stocksParams: ScanCommandInput = {
			TableName: StocksTable,
		};
		const productsOutput: ScanCommandOutput = await this.scan(productsParams);
		const stocksOutput: ScanCommandOutput = await this.scan(stocksParams);

		const products: IProduct[] = productsOutput?.Items as IProduct[];
		const stocks: IStock[] = stocksOutput?.Items as IStock[];
		return this.mergeProductsWithStocks(products, stocks);
	}

	public async getProductById(id: string): Promise<IProduct> {
		const productParams: GetCommandInput = {
			TableName: ProductsTable,
			Key: {
				id,
			},
		};

		const stocksParams: GetCommandInput = {
			TableName: StocksTable,
			Key: {
				product_id: id,
			},
		};
		const productsOutput: GetCommandOutput = await this.get(productParams);
		const stocksOutput: GetCommandOutput = await this.get(stocksParams);

		const product: IProduct = productsOutput?.Item as IProduct;
		const stock: IStock = stocksOutput?.Item as IStock;
		return product && this.mergeProductWithCount(product, stock);
	}

	public async createProduct(productDTO: ICreateProductDTO): Promise<IProduct> {
		const id: string = uuidv4();
		const productParams: PutCommandInput = {
			TableName: ProductsTable,
			Item: {
				id,
				...productDTO,
			},
		};

		const stocksParams: PutCommandInput = {
			TableName: StocksTable,
			Item: {
				product_id: id,
				count: productDTO.count,
			},
		};
		await this.transactionWrite({
			TransactItems: [
				productParams,
				stocksParams,
			],
		});

		return {
			id,
			...productDTO,
		};
	}

	private mergeProductsWithStocks(products: IProduct[] = [], stocks: IStock[] = []): IProduct[] {
		return products.map((product: IProduct) => {
			const stock: IStock = stocks.find(({ product_id }: IStock): boolean => product.id == product_id);
			return this.mergeProductWithCount(product, stock);
		});
	}

	private mergeProductWithCount(product: IProduct, stock: IStock): IProduct {
		return {
			...product,
			count: stock?.count || 0,
		};
	}
}