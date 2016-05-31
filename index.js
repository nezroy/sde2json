var LOG = require("./log"),
	nconf = require("nconf"),
	path = require("path"),
	fs = require("fs"),
	G = require("./defs"),
	execSync = require("child_process").execSync,
	crp = require("./tables/crp"),
	dgm = require("./tables/dgm"),
	inv = require("./tables/inv"),
	map = require("./tables/map"),
	ram = require("./tables/ram"),
	sta = require("./tables/sta");

var opts = {
	f: null,
	sde: null,
	out: null
};

// parse args
nconf.argv().defaults({
	sde: null,
	out: null,
	prefix: "all",
	listfix: false,
	gzip: true
});

// check for various output things (listfix, help, etc.)
if (nconf.get("listfix")) {
	LOG.info("list prefixes");
	return 0;
}

// check that the SDE path is valid
try {
	opts.sde = path.normalize(nconf.get("sde"));
	fs.accessSync(opts.sde, fs.R_OK);
	fs.accessSync(path.join(opts.sde, "fsd"), fs.R_OK);
	fs.accessSync(path.join(opts.sde, "bsd"), fs.R_OK);
} catch (ex) {
	LOG.error("invalid sde path\n", ex);
	return 1;
}
LOG.info("SDE OK:", opts.sde);

// check that the output path is valid
try {
	if (nconf.get("out")) {
		opts.out = path.normalize(nconf.get("out"));
	} else {
		opts.out = path.join(opts.sde, "sdd");
	}
	try {
		fs.mkdirSync(opts.out);
	} catch (ex) {
		if (ex.code != "EEXIST") {
			throw ex;
		}
	}
	fs.accessSync(opts.out, fs.W_OK);
} catch (ex) {
	LOG.error("invalid out path\n", ex);
	return 1;
}
LOG.info("out OK:", opts.out);

// create metainfo file
opts.f = fs.openSync(path.join(opts.out, "metainf.json"), "w");

fs.writeSync(opts.f, "{\n");
fs.writeSync(opts.f, "\"formatID\":" + G.FORMAT_ID + ",\n");
fs.writeSync(opts.f, "\"schema\":" + G.SCHEMA + ",\n");
fs.writeSync(opts.f, "\"copy\":\"" + G.COPY + "\",\n");
fs.writeSync(opts.f, "\"version\":" + G.VERSION + ",\n");
fs.writeSync(opts.f, "\"verdesc\":\"" + G.VERDESC + "\",\n");
fs.writeSync(opts.f, "\"tables\":{\n");

var prefix = nconf.get("prefix");
try {
	if (prefix == "all" || prefix == "crp") {
		crp.create(opts);
	}
	if (prefix == "all" || prefix == "dgm") {
		fs.writeSync(opts.f, ",\n");
		dgm.create(opts);
	}
	if (prefix == "all" || prefix == "inv") {
		fs.writeSync(opts.f, ",\n");
		inv.create(opts);
	}
	if (prefix == "all" || prefix == "map") {
		fs.writeSync(opts.f, ",\n");
		map.create(opts);
	}
	if (prefix == "all" || prefix == "ram") {
		fs.writeSync(opts.f, ",\n");
		ram.create(opts);
	}
	if (prefix == "all" || prefix == "sta") {
		fs.writeSync(opts.f, ",\n");
		sta.create(opts);
	}
} catch (ex) {
	LOG.error(ex);
}

fs.writeSync(opts.f, "\n}\n"); // end of tables
fs.writeSync(opts.f, "}\n");
fs.closeSync(opts.f);

if (nconf.get("gzip")) {
	LOG.info("compressing files");
	var i, cmd, file, dirs = fs.readdirSync(opts.out);
	for (i = 0; i < dirs.length; i++) {
		file = dirs[i];
		if (path.extname(file) !== ".json") continue;
		LOG.info("compress:", file);
		//cmd = "/usr/bin/7z a -mx=9 -tgzip " + file + ".gz " + file;
		cmd = "\"C:\\Program Files\\7-Zip\\7z.exe\" a -mx=9 -tgzip " + file + ".gz " + file;
		execSync(cmd, {
			cwd: opts.out
		});
	}
}
