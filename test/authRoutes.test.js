const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { activeTokens } = require('../routes/auth');
const sinon = require('sinon');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Authentication API', () => {
  let authToken;
  let userID;
  before((done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'admin@gmail.com', password: 'admin' })
      .end((err, res) => {
        if (!err) {
          authToken = res.body.token;
          done();
        } else {
          done(err);
        }
      });
  });
  it('should register a user', (done) => {
    const registrationData = { name: 'Test User', email: 'tlsslk@example.com', password: 'password', role: 'user' };
    chai
      .request(app)
      .post('/auth/register')
      .send(registrationData)
      .end((err, res) => {
        userID = res.body.user._id
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Registration successful');
        expect(res.body).to.have.property('token');
        done();
      });

  });
  it('should login a user', (done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'tlsslk@example.com', password: 'password' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Login successful');
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('should not login with invalid credentials', (done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Invalid credentials');
        done();
      });
  });

  it('should log out a user', (done) => {
    const token = [...activeTokens][0];

    chai
      .request(app)
      .post('/auth/logout')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Logout successful');
        done();
      });
  });
  it('should delete a user by ID', (done) => {
    chai
      .request(app)
      .delete('/users/delete-user/' + userID)
      .set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('User Deleted successfully');
        done();
      });
  });

});


describe('Group API', () => {
  let authToken;
  before((done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .end((err, res) => {
        if (!err) {
          authToken = res.body.token;
          done();
        } else {
          done(err);
        }
      });
  });

  it('should create a new group', (done) => {
    chai
      .request(app)
      .post('/group/create-group')
      .set('Authorization', authToken)
      .send({ name: 'Test Group', description: 'Test Description' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('Group has been Created successful');
        done();
      });
  });

  it('should fail to create a new group without a valid JWT token', (done) => {
    chai
      .request(app)
      .post('/group/create-group')
      .send({ name: 'Test Group', description: 'Test Description' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Authentication required');
        done();
      });
  });

  it('should delete a group by ID', (done) => {
    chai
      .request(app)
      .post('/group/create-group')
      .set('Authorization', authToken)
      .send({ name: 'Test Group', description: 'Test Description' })
      .end((err, res) => {
        const groupId = res.body.group._id;
        chai
          .request(app)
          .delete(`/group/delete-group/${groupId}`).set('Authorization', authToken)

          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Group Deleted successfully');
            done();
          });
      });
  });

  it('should fail to delete a group with an invalid ID', (done) => {
    chai
      .request(app)
      .delete('/group/delete-group/invalid-id').set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body.error).to.equal('Group not found');
        done();
      });
  });

  // Test case for adding a user to a group
  it('should add a user to a group', (done) => {
    chai
      .request(app)
      .post('/group/653560d0d301133bba5390f0/addUser/65350446d6218c7ad38d498d').set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('User added to the group');
        done();
      });
  });

  // Test case for retrieving all users in a group
  it('should retrieve all users in a group', (done) => {
    chai
      .request(app)
      .get('/group/users/653560d0d301133bba5390f0').set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);

        done();
      });
  });

  // Test case for finding messages in a group
  it('should find messages in a group', (done) => {
    chai
      .request(app)
      .get('/group/message/653560d0d301133bba5390f0')
      .set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);

        done();
      });
  });

  // Test case for searching for a user in a group
  it('should search for a user in a group', (done) => {
    chai
      .request(app)
      .get('/group/search/653560d0d301133bba5390f0/user-name')
      .set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);

        done();
      });
  });
});


describe('Message API', () => {
  let authToken;
  before((done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .end((err, res) => {
        if (!err) {
          authToken = res.body.token;
          done();
        } else {
          done(err);
        }
      });
  });
  it('should write a message to a group', (done) => {
    chai
      .request(app)
      .post('/message/writemessage/653560d0d301133bba5390f0')
      .set('Authorization', authToken)
      .send({ content: 'Test message content' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('Message has been sent successfully');
        done();
      });
  });

  it('should like a message', (done) => {
    chai
      .request(app)
      .post('/message/like/65356877bb0098f81bdcd651')
      .set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('Message has been Liked successfully');
        done();
      });
  });
});



describe('User API', () => {
  let authToken;
  let userID;

  before((done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'admin@gmail.com', password: 'admin' })
      .end((err, res) => {
        if (!err) {
          authToken = res.body.token;
          done();
        } else {
          done(err);
        }
      });
  });

  // Test case for getting user profile
  it('should get user profile', (done) => {
    chai
      .request(app)
      .get('/users/profile/6534edffe98d1eff3bbe4811')
      .set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.be.an('object');
        done();
      });
  });

  // Test case for creating a new user (admin only)
  it('should create a new user', (done) => {
    chai
      .request(app)
      .post('/users/create-user')
      .set('Authorization', authToken)
      .send({ name: 'New User', email: 'tessusssser@example.com', password: 'password', role: 'admin' })
      .end((err, res) => {
        userID = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('User Creation successful');
        done();
      });
  });

  // Test case for updating a user by ID (admin only)
  it('should update a user by ID', (done) => {
    chai
      .request(app)
      .put('/users/edit-user/' + userID)
      .set('Authorization', authToken)
      .send({ name: 'Updated Name', role: 'user' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('User updated successfully');
        expect(res.body.user).to.be.an('object');
        done();
      });
  });


  // Test case for deleting a user by ID (admin only)
  it('should delete a user by ID', (done) => {
    chai
      .request(app)
      .delete('/users/delete-user/' + userID)
      .set('Authorization', authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('User Deleted successfully');
        done();
      });
  });
});
