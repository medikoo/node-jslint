'use strict';

module.exports = function (t, a) {
	var invoked;
	t('test', { ok: true, options: {} }, function (data) {
		a(typeof data, 'string', "Log string");
		invoked = true;
	});
	a(invoked, true, "Invoked");
};
