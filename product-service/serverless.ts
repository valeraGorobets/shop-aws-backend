import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
	service: 'product-service',
	frameworkVersion: '3',
	plugins: [
		'serverless-auto-swagger',
		'serverless-esbuild',
		'serverless-offline',
	],
	provider: {
		name: 'aws',
		runtime: 'nodejs20.x',
		stage: 'beta',
		region: 'eu-west-1',
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		httpApi: {
			cors: {
				allowCredentials: false,
				maxAge: 300,
				allowedMethods: ['GET'],
				allowedOrigins: [
					'http://localhost:4200',
					'https://d1cu1goqkk0ah.cloudfront.net',
				]
			}
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
			PRODUCTS_TABLE: 'ProductsTable',
			STOCKS_TABLE: 'StocksTable',
			CATALOG_ITEMS_QUEUE: 'CatalogItemsQueue',
		},
		iam: {
			role: {
				statements: [
					{
						Effect: 'Allow',
						Action: [
							'dynamodb:DescribeTable',
							'dynamodb:Query',
							'dynamodb:Scan',
							'dynamodb:GetItem',
							'dynamodb:PutItem',
							'dynamodb:UpdateItem',
							'dynamodb:DeleteItem',
						],
						Resource: [
							{ 'Fn::GetAtt': ['${self:provider.environment.PRODUCTS_TABLE}', 'Arn'] },
							{ 'Fn::GetAtt': ['${self:provider.environment.STOCKS_TABLE}', 'Arn'] },
						],
					},
				],
			},
		},
	},
	functions: {
		getProductsList,
		getProductsById,
		createProduct,
		catalogBatchProcess,
	},
	resources: {
		Resources: {
			ProductsTable: {
				Type: 'AWS::DynamoDB::Table',
				DeletionPolicy: 'Delete',
				Properties: {
					TableName: '${self:provider.environment.PRODUCTS_TABLE}',
					AttributeDefinitions: [
						{ AttributeName: 'id', AttributeType: 'S' },
					],
					KeySchema: [
						{ AttributeName: 'id', KeyType: 'HASH' },
					],
					BillingMode: 'PAY_PER_REQUEST'
				},
			},
			StocksTable: {
				Type: 'AWS::DynamoDB::Table',
				DeletionPolicy: 'Delete',
				Properties: {
					TableName: '${self:provider.environment.STOCKS_TABLE}',
					AttributeDefinitions: [
						{ AttributeName: 'product_id', AttributeType: 'S' },
					],
					KeySchema: [
						{ AttributeName: 'product_id', KeyType: 'HASH' },
					],
					BillingMode: 'PAY_PER_REQUEST'
				},
			},
			CatalogItemsQueue: {
				Type: 'AWS::SQS::Queue',
				Properties: {
					QueueName: '${self:provider.environment.CATALOG_ITEMS_QUEUE}',
				}
			}
		},
		Outputs: {
			CatalogItemsQueueUrl: {
				Value: {
					Ref: '${self:provider.environment.CATALOG_ITEMS_QUEUE}'
				},
				Export: {
					Name: 'CatalogItemsQueueUrl',
				}
			},
			CatalogItemsQueueArn: {
				Value: {
					'Fn::GetAtt': ['${self:provider.environment.CATALOG_ITEMS_QUEUE}', 'Arn']
				},
				Export: {
					Name: 'CatalogItemsQueueArn',
				}
			}
		}
	},
	package: { individually: true },
	custom: {
		esbuild: {
			bundle: true,
			minify: false,
			sourcemap: true,
			exclude: ['aws-sdk'],
			target: 'node14',
			define: { 'require.resolve': undefined },
			platform: 'node',
			concurrency: 10,
		},
	},
};

module.exports = serverlessConfiguration;
