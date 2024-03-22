import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: any) => {
	return {
		headers: {
			// Required for CORS support to work
			'Access-Control-Allow-Origin': '*',
			// Required for cookies, authorization headers with HTTPS
			'Access-Control-Allow-Credentials': true,
		},
		statusCode: 200,
		body: JSON.stringify(response)
	}
}
