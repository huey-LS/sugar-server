import chai from 'chai';
import { request } from './helpers/request';

export default function () {
  return describe('parameter', () => {
    it ('should get query & url-params & header', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter/123?q=abc',
        method: 'POST',
        headers: {
          'X-Custom': 'xyz'
        }
      }, '123')
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('id:123;q:abc;x:xyz');
    })

    it ('should get json body', async () => {
      let postData = {
        a: {
          b: 1
        }
      }
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter-body',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify(postData))
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal(JSON.stringify({ b: 1 }));
    })

    it ('should get body by path with json', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter-body-path',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({ id: 123, name: 'Tim' }))
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('number 123 string Tim');
    })

    it ('should get body by path with form', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter-body-path',
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }
      }, 'id=123&name=Tim')
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('string 123 string Tim');
    })

    it ('should get json body by path', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter-json-path',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({ id: 123, name: 'Tim' }))
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('number 123 string Tim');
    })

    it ('should get formData body', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter-form',
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }
      }, 'f1=abc&f2=' + encodeURIComponent('&&'))
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('abc;&&');
    })

    it ('should get formData with path', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-parameter-form-path',
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }
      }, 'id=123&name=Tim');
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('string 123 string Tim');
    })

    it ('should get config', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/get-parameter-config',
        method: 'GET',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('1;2');
    })

    it ('should get cookie', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/get-parameter-cookie',
        method: 'GET',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Cookie': 'cookie1=1; cookie2=abc;'
        }
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('cookie2 abc; cookie1 1; cookie3 undefined;');
    })
  })
}