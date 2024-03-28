import { handlerPath } from '@libs/handler-resolver';

export default {
	handler: `${ handlerPath(__dirname) }/handler.main`,
	events: [
		{
			httpApi: {
				method: 'GET',
				path: '/products',
				responses: {
					default: {},
					200: {
						description: 'List with all products',
						bodyType: 'IProductArray',
					}
				},
			},
		},
	],
};
