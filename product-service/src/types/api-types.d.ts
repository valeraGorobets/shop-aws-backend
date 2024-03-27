export interface IProduct {
	count: number;
	description: string;
	id: string;
	price: number;
	title: string;
}

export interface IStock {
	count: number;
	product_id: string;
}

export type IProductArray = IProduct[];
export type String = string;
