/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1/sites', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent.get('/api/v1/sites');
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with all of the sites in the database as an array', done => {
			dashboard.database.select('sites.*')
				.leftJoin('urls', 'sites.id', 'urls.site')
				.count('urls.id as urlCount')
				.groupBy('sites.id')
				.from('sites')
				.orderBy('sites.name')
				.then(sites => {
					const jsonifiedSites = JSON.parse(JSON.stringify(sites))
						.map(dashboard.model.site.prepareForOutput);
					request.expect(response => {
						assert.isObject(response.body);
						assert.isArray(response.body.sites);
						assert.greaterThan(response.body.sites.length, 0);
						assert.deepEqual(response.body.sites, jsonifiedSites);
					}).end(done);
				})
				.catch(done);
		});

	});

	describe('when the default permissions do not allow read access and a read API key is specified', () => {

		beforeEach(() => {
			request = agent.get('/api/v1/sites').set('X-Api-Key', 'mock-readonly-api-key');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

	});

	describe('when the default permissions do not allow read access and no API key is specified', () => {

		beforeEach(() => {
			request = agent.get('/api/v1/sites');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
