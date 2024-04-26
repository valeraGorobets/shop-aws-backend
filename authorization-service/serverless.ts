import type { AWS } from '@serverless/typescript';

import basicAuthorizer from 'src/functions/basicAuthorizer';

const serverlessConfiguration: AWS = {
	service: 'authorization-service',
	frameworkVersion: '3',
	plugins: [
		'serverless-esbuild',
		'serverless-dotenv-plugin',
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
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
		},
		iamRoleStatements: [],
	},
	// import the function via paths
	functions: {
		basicAuthorizer,
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
