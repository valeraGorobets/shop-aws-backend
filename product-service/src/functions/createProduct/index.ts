import { handlerPath } from '@libs/handler-resolver';
import schema from './schema';

export default {
	handler: `${ handlerPath(__dirname) }/handler.main`,
	events: [
		{
			httpApi: {
				method: 'POST',
				path: '/products',
				request: {
					schemas: {
						'application/json': schema,
					},
				},
				bodyType: 'ICreateProductDTO',
				responses: {
					default: {},
					200: {
						description: 'Created product',
						bodyType: 'IProduct',
					},
					400: 'Bad Request',
					500: 'Backend Error',
				},
			},
		},
	],
};
