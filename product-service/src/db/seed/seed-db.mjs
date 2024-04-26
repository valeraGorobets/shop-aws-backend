import fs from 'fs';
import path from 'path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { fileURLToPath } from 'url';
import { DEFAULT_REGION } from '../../../../shared.models';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TableId = {
	'Products': 'products',
	'Stocks': 'stocks',
};

const TableIdToFileName = {
	[TableId.Products]: 'products.seed.json',
	[TableId.Stocks]: 'stocks.seed.json',
};

const TableIdToDynamoDBTableName = {
	[TableId.Products]: 'ProductsTable',
	[TableId.Stocks]: 'StocksTable',
};

const dynamodbClient = new DynamoDBClient({
	region: DEFAULT_REGION,
});
const documentClient = DynamoDBDocumentClient.from(dynamodbClient);

(async function run() {
	for (const tableId of Object.values(TableId)) {
		await seedTable(tableId);
		console.log(`Seeding table ${tableId} finished`)
	}
})();

async function seedTable(tableId) {
	const fileDir = path.join(__dirname, TableIdToFileName[tableId]);
	const jsonData = fs.readFileSync(fileDir, 'utf8');
	const data = JSON.parse(jsonData);
	await seedDynamoDB(tableId, data);
}

async function seedDynamoDB(tableId, data) {
	try {
		for (const item of data) {
			const putParams = {
				TableName: TableIdToDynamoDBTableName[tableId],
				Item: item
			};
			await documentClient.send(new PutCommand(putParams));
		}
	} catch (error) {
		console.error('Error seeding DynamoDB:', error);
	}
}
