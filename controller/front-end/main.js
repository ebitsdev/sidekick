'use strict';

const httpError = require('http-errors');
const requirePermission = require('../../middleware/require-permission');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;

	// Site page
	app.get('/sites/:siteId', requirePermission('read'), (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				response.locals.site = site;
				return model.url.getAllBySite(site.id);
			})
			.then(urls => {
				response.locals.urls = urls;
				response.render('site');
			})
			.catch(next);
	});

};
