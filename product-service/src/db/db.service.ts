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
	UpdateCommand,
	UpdateCommandInput,
	UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { ScanCommandInput } from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';


const dynamodbClient: DynamoDBClient = new DynamoDBClient({
	region: 'eu-west-1',
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
}