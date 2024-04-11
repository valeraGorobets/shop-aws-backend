import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DeleteCommand,
	DeleteCommandInput,
	DeleteCommandOutput,
	DynamoDBDocumentClient,
	GetCommand,
	GetCommandInput,
	GetCommandOutput,
	PutCommand,
	PutCommandInput,
	PutCommandOutput,
	ScanCommand,
	ScanCommandOutput,
	TransactWriteCommand,
	UpdateCommand,
	UpdateCommandInput,
	UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { ScanCommandInput } from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {
	TransactWriteCommandInput,
	TransactWriteCommandOutput,
} from '@aws-sdk/lib-dynamodb/dist-types/commands/TransactWriteCommand';
import { DEFAULT_REGION } from '../../../shared.models';


const dynamodbClient: DynamoDBClient = new DynamoDBClient({
	region: DEFAULT_REGION,
});
const documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamodbClient);

export abstract class DatabaseService {
	public async get(params: GetCommandInput): Promise<GetCommandOutput> {
		try {
			return await documentClient.send(new GetCommand(params));
		} catch (error) {
			throw new Error(error);
		}
	};

	public async create(params: PutCommandInput): Promise<PutCommandOutput> {
		try {
			return await documentClient.send(new PutCommand(params));
		} catch (error) {
			console.error('create-error', error);
			throw new Error(error);
		}
	};

	public async update(params: UpdateCommandInput): Promise<UpdateCommandOutput> {
		try {
			return await documentClient.send(new UpdateCommand(params));
		} catch (error) {
			throw new Error(error);
		}
	};

	public async scan(params: ScanCommandInput): Promise<ScanCommandOutput> {
		try {
			return await documentClient.send(new ScanCommand(params));
		} catch (error) {
			throw new Error(error);
		}
	};

	public async delete(params: DeleteCommandInput): Promise<DeleteCommandOutput> {
		try {
			return await documentClient.send(new DeleteCommand(params));
		} catch (error) {
			throw new Error(error);
		}
	};

	public async transactionWrite(params: TransactWriteCommandInput): Promise<TransactWriteCommandOutput> {
		try {
			return await documentClient.send(new TransactWriteCommand(params));
		} catch (error) {
			throw new Error(error);
		}
	};

	public destroy(): void {
		dynamodbClient.destroy();
	};
}