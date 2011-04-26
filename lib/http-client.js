({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory.apply(this, deps.map(require))}}).
define(["./http/client", "./console"], function(client, console){

console.warn("DEPRECATED use http/client instead");

return client;
});