({define:typeof define!='undefined'?define:function(deps,factory){module.exports=factory.apply(this,deps.map(function(id){return require(id)}))}}).

define([ './platform' ], function (platform) {
	// TODO
	// return platform.require('./crypto/' + platform.type);
	return (require.nodeRequire || require)('crypto');
});
