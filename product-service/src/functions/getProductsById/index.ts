import { handlerPath } from '@libs/handler-resolver';

export default {
	handler: `${ handlerPath(__dirname) }/handler.main`,
	events: [
		{
			httpApi: {
				method: 'GET',
				path: '/products/{id}',
				responses: {
					default: {},
					200: {
						description: 'Getting product by id',
						bodyType: 'IProduct',
					},
					404: 'Id not found',
					500: 'Backend Error',
				},
			},
		},
	],
};
