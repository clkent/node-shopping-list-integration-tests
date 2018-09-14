'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Recipes', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  //GET ALL recipes
  // test strategy:
  //   1. make request to `/shopping-list`
  //   2. inspect response object and prove has right code and have
  //   right keys in response object.

  it('Should list out recipes on GET', function() {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(0);

        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // POST create recipes
  // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`

  it('should add a new recipe on POST', function() {
    const newRecipe = { name: 'Pancakes', ingredients: ['pan', 'cakes'] };
    return chai
      .request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'ingredients');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(
          Object.assign(newRecipe, { id: res.body.id })
        );
      });
  });

  // PUT update recipes
  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.

  it('should update recipes on PUT', function() {
    const updateData = {
      name: 'Brownies',
      ingredients: ['Brow', 'knees']
    };

    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai
          .request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  //DELETE recipes
  // test strategy:
  //  1. GET shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204

  it('should delete items on DELETE', function() {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app).delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});
