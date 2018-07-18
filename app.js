var cli = new (require(__dirname+"/cli.js"))();

cli.addServer("cock.li")
cli.addServer("maki.cat")
cli.render();