var blessed = require("blessed");
var moment = require("moment");
var colors = require("colors");
var fs = require("fs");

module.exports = function() {
	// used externally
	this.servers = [];
	this.addServer = function(name) {
		this.servers.push(name);
		this.box.servers.content = this.servers.join(",\n")
	}

	this.commands = {
		"help": {
			desc: "Shows this page",
			func: function() {
				for (var i=0; i<Object.keys(this.commands).length; i++) {
					let key = Object.keys(this.commands)[i];
					this.addMessage(key+" - "+this.commands[key].desc);
				}
			}.bind(this)
		},
		"exit": {
			desc: "Close xmakipp",
			func: function() {
				process.exit(0);
			}
		},
	};
	this.addCommand = function(name, desc, func) {
		commands[name] = {
			desc: desc,
			func: func
		};
	}

	// bless*ed* you
	this.screen = blessed.screen({
		smartCSR: true
	});
	this.screen.title = "xmakipp";

	this.settings = {}
	this.settings.serversWidth = 24;
	this.settings.colorTheme = "blue";

	this.box = {};
	this.box.chat = blessed.log({
		parent: this.screen,
		content: "",
		top: 0,
		left: 0,
		width: "100%-"+(this.settings.serversWidth+1),
		height: "100%-2",
		tags: true,
		style: {
			fg: "white",
		}
	});
	this.box.servers = blessed.box({
		parent: this.screen,
		top: 0,
		left: "100%-"+this.settings.serversWidth,
		width: this.settings.serversWidth,
		height: "100%-2",
		content: "",
		tags: true,
		style: {
			fg: "white",
		}
	});
	this.box.status = blessed.box({
		parent: this.screen,
		top: "100%-2",
		left: 0,
		height: 1,
		width: "100%",
		style: {
			fg: "white",
			bg: this.settings.colorTheme
		},
		content: "status bar yay"
	});
	this.box.form = blessed.form({
		parent: this.screen,
		top: "100%-1",
		left: 0,
		width: "100%",
		height: 1,
		tags: true,
		style: {
			fg: "white",
		}
	});
	this.box.input = blessed.textbox({
		parent: this.box.form,
		inputOnFocus: true,
		input: true,
		keys: true,
		top: 0,
		left: 2,
		height: 1,
		width: "100%-2"
	});
	this.box.input.focus();

	// chat/servers divider
	blessed.line({
		parent: this.screen,
		top: 0,
		left: "100%-"+(this.settings.serversWidth+1),
		height: "100%-2",
		width: 1,
		orientation: "vertical",
		style: {
			fg: this.settings.colorTheme
		}
	});

	// > arrow
	blessed.box({
		parent: this.screen,
		top: "100%-1",
		left: 0,
		height: 1,
		width: 1,
		content: ">",
		style: {
			fg: "cyan"
		}
	});

	// handle input
	this.addMessage = function(text) {
		this.box.chat.add(moment().format("HH:mm:ss")+" | "+text);
	}

	this.clearMessage = function() {
		this.box.chat.content = "";
	}

	this.box.input.on("submit", function() {
		let input = this.box.input.getValue();
		this.addMessage("> ".cyan+input);
		if (input.substring(0, 1) == "/") {
			try {
				let args = input.slice(1).split(" ");
				this.commands[args[0]].func(args);
			} catch(err) {
				this.addMessage("Command not found! Try /help");
				//this.addMessage(err);
			}
		}

		this.box.input.clearValue();
		this.box.input.focus();
	}.bind(this));

	this.screen.key(["escape"], function(ch, key) {
		this.box.input.focus();
	}.bind(this));

	// init
	this.motd = fs.readFileSync(__dirname+"/motd.txt", "utf8").split("\n");
	for (var i = 0; i < this.motd.length; i++) {
		let line = this.motd[i];
		this.addMessage(line.cyan);
	}

	this.render = function() {
		this.screen.render();
	} 

}