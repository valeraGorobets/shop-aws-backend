import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';

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
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
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
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
				},
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
