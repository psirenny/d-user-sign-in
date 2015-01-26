var request = require('superagent');

function Component () {}

Component.prototype.create = function (model, dom) {
  if (model.get('autofocus')) this.focus();
  if (this.form) dom.addListener('submit', this.form, this.submit.bind(this));
};

Component.prototype.error = function (err) {
  this.model.del('submitting');
  this.model.set('error', err);
  this.redirect();
};

Component.prototype.focus = function () {
  if (this.handle) this.handle.focus();
};

Component.prototype.redirect = function () {
  var model = this.model;
  var error = model.get('error');
  var redirect = model.get('errorRedirect') || model.get('redirect');
  if (error && redirect) return this.app.history.push(redirect);
  redirect = model.get('successRedirect') || model.get('redirect');
  if (redirect) return this.app.history.push(redirect);
};

Component.prototype.reset = function () {
  if (this.form) this.form.reset();
};

Component.prototype.submit = function (e) {
  if (e) e.preventDefault();
  var self = this;
  var model = this.model;
  var basePath = model.get('basePath') || '';
  var data = model.get('data');
  var origin = model.get('origin') || window.location.origin;
  var path = model.get('path') || '/signin';
  var url = model.get('url') || (origin + basePath + path);

  model.del('error');
  model.set('submitting', true);
  this.emit('submitting');
  this._validate(function (err) {
    if (err) return self.error(err);
    request
      .post(url)
      .withCredentials()
      .send(data)
      .end(function (err, res) {
        self._response(err, res, function (err) {
          if (err) return self.error(err);
          self._submitted(res.body, function (err) {
            model.del('submitting');
            if (err) return self.error(err);
            self.emit('submitted');
            self.redirect();
          });
        });
      });
  });
};

Component.prototype._response = function (err, res, done) {
  done(err || res.body.error);
};

Component.prototype._submitted = function (done) {
  done();
};

Component.prototype._validate = function (done) {
  done();
};

module.exports = Component;
