({define:typeof define!='undefined'?define:function(deps,factory){module.exports=factory.apply(this,deps.map(function(id){return require(id)}))}}).

define([], function () {
	return (require.nodeRequire || require)('url');
});
