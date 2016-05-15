var LOG = require("./log"),
	path = require("path"),
	G = require("./defs"),
	fs = require("fs");

function open_datafile(name, opts) {
	LOG.info(name, "datafile:", path.join(opts.out, name + ".json"));
	var f = fs.openSync(path.join(opts.out, name + ".json"), "w");

	fs.writeSync(f, "{\n");
	fs.writeSync(f, "\"formatID\":" + G.FORMAT_ID + ",\n");
	fs.writeSync(f, "\"schema\":" + G.SCHEMA + ",\n");
	fs.writeSync(f, "\"copy\":\"" + G.COPY + "\",\n");
	fs.writeSync(f, "\"tables\":{\n");

	return f;
}

function close_datafile(f) {
	fs.writeSync(f, "\n}\n}\n");
	fs.closeSync(f);
	// post_file
}

function tblsep(f, opts) {
	fs.writeSync(opts.f, ",\n");
	fs.writeSync(f, ",\n");
}

function column_cb(f, opts, opts2, cbdat) {
	var ydoc = cbdat.ydoc;
	var i = 0,
		j = 0,
		vals;

	for (i = 0; i < ydoc.length; i++) {
		if (i > 0) {
			fs.writeSync(f, ",\n");
		}
		fs.writeSync(f, "\"" + ydoc[i][opts2.key] + "\":[");
		vals = [];
		for (j = 0; j < opts2.cols.length; j++) {
			if (ydoc[i].hasOwnProperty(opts2.cols[j])) {
				vals.push(JSON.stringify(ydoc[i][opts2.cols[j]]));
			} else {
				vals.push("null");
			}
		}
		fs.writeSync(f, vals.join(","));
		fs.writeSync(f, "]");
	}
    
    return i;
}

//tbl, dat, key, cols, typ
function create_table(f, opts, opts2, cb, cbdat) {
	var i = 0,
		colvals = [];

	fs.writeSync(opts.f, "\"" + opts2.tbl + "\":{\n");
	fs.writeSync(opts.f, "\"j\":\"" + opts2.dat + "\",\n");
	fs.writeSync(opts.f, "\"c\":[");

	for (i = 0; i < opts2.cols.length; i++) {
		colvals.push(JSON.stringify(opts2.cols[i]));
	}
	if (opts2.cxtra) {
		colvals.push(opts2.cxtra.map(function(val, idx, arr) {
			return JSON.stringify(val);
		}));
	}
	fs.writeSync(opts.f, colvals.join(","));
	fs.writeSync(opts.f, "],\n");

	fs.writeSync(opts.f, "\"k\":\"" + opts2.key + "\",\n");
	if (opts2.m) {
		fs.writeSync(opts.f, "\"m\":" + opts2.m + ",\n");
	}
	fs.writeSync(opts.f, "\"t\":\"" + opts2.typ + "\",\n");

	fs.writeSync(f, "\"" + opts2.tbl + "\":{\n");
	fs.writeSync(f, "\"d\":{\n");

	var rows = cb(f, opts, opts2, cbdat);

	fs.writeSync(f, "}\n}");
	fs.writeSync(opts.f, "\"l\":" + rows + "\n}");
}

module.exports = {
	open_datafile: open_datafile,
	close_datafile: close_datafile,
	create_table: create_table,
	column_cb: column_cb,
	tblsep: tblsep
};
