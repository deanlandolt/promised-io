({define:typeof define!='undefined'?define:function(deps,factory){module.exports=factory.apply(this,deps.map(function(id){return require(id)}))}}).

define(['./platform'], function (platform) {
	// TODO
	if (typeof console !== 'undefined' && typeof console.log === 'function') {
		return console;
	}
	return {
		log: platform.print
	};
});
