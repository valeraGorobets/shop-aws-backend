import type { AWS } from '@serverless/typescript';

import importProductsFile from 'src/functions/importProductsFile';
import importFileParser from 'src/functions/importFileParser';

const serverlessConfiguration: AWS = {
	service: 'import-service',
	frameworkVersion: '3',
	plugins: [
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
				],
			},
			authorizers: {
				importFunctionServiceAuthorizer: {
					type: 'request',
					resultTtlInSeconds: 0,
					name: 'importFunctionServiceAuthorizer',
					functionArn: 'arn:aws:lambda:eu-west-1:058264083835:function:authorization-service-beta-basicAuthorizer',
					identitySource: '$request.header.Authorization',
				},
			},
		},
		environment: {
			BUCKET_NAME: 'import-products-file',
			UPLOAD_FOLDER: 'uploaded',
			PARSED_FOLDER: 'parsed',
			CATALOG_ITEMS_QUEUE_URL: '${self:custom.CatalogItemsQueueUrl}',
			CATALOG_ITEMS_QUEUE_ARN: '${self:custom.CatalogItemsQueueArn}',
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
		},
		iamRoleStatements: [{
			Effect: 'Allow',
			Action: [
				's3:*',
				's3:List*',
				's3:PutObject',
				's3:PutObjectAcl',
				's3:DeleteObject',
				'S3:GetObjectTagging',
				'S3:PutObjectTagging',
			],
			Resource: [
				'arn:aws:s3:::${self:provider.environment.BUCKET_NAME}/${self:provider.environment.UPLOAD_FOLDER}/*',
				'arn:aws:s3:::${self:provider.environment.BUCKET_NAME}/${self:provider.environment.PARSED_FOLDER}/*',
			],
		}, {
			Effect: 'Allow',
			Action: [
				'sqs:*',
			],
			Resource: [
				'${self:provider.environment.CATALOG_ITEMS_QUEUE_ARN}',
			],
		}
		],
	},
	// import the function via paths
	functions: {
		importProductsFile,
		importFileParser,
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
		CatalogItemsQueueUrl: {
			'Fn::ImportValue': 'CatalogItemsQueueUrl',
		},
		CatalogItemsQueueArn: {
			'Fn::ImportValue': 'CatalogItemsQueueArn',
		},
	},
};

module.exports = serverlessConfiguration;
