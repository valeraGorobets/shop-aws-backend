import { middyfy } from '@libs/lambda';
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import {
	APIGatewayAuthorizerResult,
	APIGatewayRequestAuthorizerHandler,
} from 'aws-lambda/trigger/api-gateway-authorizer';
import * as console from 'console';

enum Effect {
	Allow = 'Allow',
	Deny = 'Deny',
}

const basicAuthorizer: APIGatewayRequestAuthorizerHandler = async (event: APIGatewayRequestAuthorizerEvent) => {
	console.log('basicAuthorizer started');
	console.log(JSON.stringify(event));

	try {
		if (event.type !== 'REQUEST') {
			throw 'Invalid event type';
		}

		const token: string = event.headers.authorization.split(' ')?.[1];

		const [login, password] = Buffer
			.from(token, 'base64')
			.toString('utf-8')
			.split(':');

		console.log(`Login: ${ login }, Password: ${ password }`);

		const isAuthorized: boolean = !!login && !!password && process.env[login] === password;

		console.log(`isAuthorized: ${ isAuthorized }`);

		return generatePolicy('auth result', isAuthorized);
	} catch (error) {
		console.log(`Unauthorized error: ${ JSON.stringify(error) }`);
		return generatePolicy('auth result', false);
	}
};

const generatePolicy = (principalId: string, isAuthorized: boolean): APIGatewayAuthorizerResult => {
	const effect: Effect = isAuthorized
		? Effect.Allow
		: Effect.Deny;

	return {
		principalId,
		policyDocument: {
			Version: '2012-10-17',
			Statement: [{
				Action: 'execute-api:Invoke',
				Effect: effect,
				Resource: '*',
			}],
		},
	};
};

export const main = middyfy(basicAuthorizer);
