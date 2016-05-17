var LOG = require("./log"),
	path = require("path"),
	G = require("./defs"),
	fs = require("fs");

function open_datafile(name, opts) {
	LOG.info("data file:", name);
	var f = fs.openSync(path.join(opts.out, name + ".json"), "w");

	fs.writeSync(f, "{\n");
	fs.writeSync(f, "\"formatID\":" + G.FORMAT_ID + ",\n");
	fs.writeSync(f, "\"schema\":" + G.SCHEMA + ",\n");
	fs.writeSync(f, "\"copy\":\"" + G.COPY + "\",\n");
	fs.writeSync(f, "\"tables\":{\n");

	return f;
}

function close_datafile(name, opts, f) {
	fs.writeSync(f, "\n}\n}\n");
	fs.closeSync(f);
}

function open_segfile(name, segment, opts) {
	var segname = name + "_" + numpad(segment);
	LOG.info("data segment file:", segname);
	var f = fs.openSync(path.join(opts.out, segname) + ".json", "w");

	fs.writeSync(f, "{\n");
	fs.writeSync(f, "\"formatID\":" + G.FORMAT_ID + ",\n");
	fs.writeSync(f, "\"schema\":" + G.SCHEMA + ",\n");
	fs.writeSync(f, "\"copy\":\"" + G.COPY + "\",\n");
	fs.writeSync(f, "\"tables\":{\n");
	fs.writeSync(f, "\"" + name + "\":{\n");
	fs.writeSync(f, "\"d\":{\n");

	return f;
}

function close_segfile(name, segment, opts, f, rows) {
	fs.writeSync(f, "\n},\n\"L\":" + rows + "\n}\n}\n}\n");
	fs.closeSync(f);
}

function tblsep(f, opts) {
	fs.writeSync(opts.f, ",\n");
	fs.writeSync(f, ",\n");
}

function nestcol_cb(f, opts, opts2, rowcb) {
	var k,
		keys,
		keyn,
		val,
		i, j,
		dat = {},
		item;
	keyn = opts2.key.split(":");
	for (i = 0; i < opts2.ydoc.length; i++) {
		val = opts2.ydoc[i];
		k = val[keyn[0]];
		if (keyn.length === 2) {
			if (!dat.hasOwnProperty(k)) {
				dat[k] = {};
			}
			item = dat[k][val[keyn[1]]] = [];
		} else if (keyn.length === 3) {
			if (!dat.hasOwnProperty(k)) {
				dat[k] = {};
			}
			if (!dat[k].hasOwnProperty(val[keyn[1]])) {
				dat[k][val[keyn[1]]] = {};
			}
			item = dat[k][val[keyn[1]]][val[keyn[2]]] = [];
		} else if (keyn.length > 3) {
			throw ("too many keys");
		} else {
			item = dat[k] = [];
		}
		for (j = 0; j < opts2.cols.length; j++) {
			item.push(val[opts2.cols[j]]);
		}
		if (rowcb) {
			Array.prototype.push.apply(item, rowcb(f, opts, opts2, opts2.ydoc[i]));
		}
	}
	keys = Object.keys(dat).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});
	for (i = 0; i < keys.length; i++) {
		k = keys[i];
		if (i !== 0) {
			fs.writeSync(f, ",\n");
		}
		fs.writeSync(f, "\"" + k + "\": ");
		fs.writeSync(f, JSON.stringify(dat[k]));
	}
	return i;
}

function yamlmap_cb(f, opts, opts2, rowcb) {
	var i, j, k,
		keys,
		vals;
	keys = Object.keys(opts2.ydoc).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});
	for (i = 0; i < keys.length; i++) {
		k = keys[i];
		vals = [];
		for (j = 0; j < opts2.cols.length; j++) {
			vals.push(opts2.ydoc[k][opts2.cols[j]]);
		}
		if (i !== 0) {
			fs.writeSync(f, ",\n");
		}
		fs.writeSync(f, "\"" + k + "\":");
		fs.writeSync(f, JSON.stringify(vals));
	}
	return i;
}

function create_table(f, opts, opts2, cb, rowcb) {
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

	var rows = cb(f, opts, opts2, rowcb);

	fs.writeSync(f, "}\n}");
	fs.writeSync(opts.f, "\"l\":" + rows + "\n}");
}

function create_segtable(opts, opts2, segcb) {
	var i, seg, rows, f, res,
		colvals = [];

	fs.writeSync(opts.f, "\"" + opts2.tbl + "\":{\n");
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
	fs.writeSync(opts.f, "\"s\":[\n");

	seg = 0;
	rows = 0;
	do {
		f = open_segfile(opts2.tbl, seg, opts);
		res = segcb(f, seg, opts, opts2);
		close_segfile(opts2.tbl, seg, opts, f, res.segrc);
		if (seg !== 0) {
			fs.writeSync(opts.f, ",\n");
		}
		fs.writeSync(opts.f, "[\"" + numpad(seg) + "\"," + res.minID + "," + res.maxID + "]");
		seg++;
		rows += res.segrc;
	}
	while (res.segrc == opts2.segsize);

	fs.writeSync(opts.f, "],\n");
	fs.writeSync(opts.f, "\"l\":" + rows + "\n}");
}

function numpad(n) {
	if (n < 10) {
		return "0" + n;
	} else {
		return "" + n;
	}
}

module.exports = {
	open_datafile: open_datafile,
	close_datafile: close_datafile,
	create_table: create_table,
	create_segtable: create_segtable,
	nestcol_cb: nestcol_cb,
	yamlmap_cb: yamlmap_cb,
	tblsep: tblsep,
	numpad: numpad
};
