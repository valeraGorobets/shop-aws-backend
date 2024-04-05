import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

export type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: any, statusCode: number = 200) => {
	return {
		headers: {
			// Required for CORS support to work
			'Access-Control-Allow-Origin': '*',
			// Required for cookies, authorization headers with HTTPS
			'Access-Control-Allow-Credentials': true,
		},
		statusCode,
		body: JSON.stringify(response)
	}
}

export const handleErrorResponse = (error, source: string) => {
	return formatJSONResponse({ message: `Backend Error in ${ source }: ${ JSON.stringify(error) }` }, 500);
}
