var LOG = require("../log"),
	utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function create(opts) {
	var opts2, f;

	f = utils.open_datafile("invMeta", opts);
	create_invCategories(f, opts);
	utils.tblsep(f, opts);
	create_invContrabandTypes(f, opts);
	utils.tblsep(f, opts);
	create_invControlTowerResourcePurposes(f, opts);
	utils.tblsep(f, opts);
	create_invControlTowerResources(f, opts);
	utils.tblsep(f, opts);
	create_invFlags(f, opts);
	utils.tblsep(f, opts);
	create_invGroups(f, opts);
	utils.tblsep(f, opts);
	create_invIcons(f, opts);
	utils.tblsep(f, opts);
	create_invMarketGroups(f, opts);
	utils.tblsep(f, opts);
	create_invMetaGroups(f, opts);
	utils.tblsep(f, opts);
	create_invMetaTypes(f, opts);
	utils.tblsep(f, opts);
	create_invTypeMaterials(f, opts);
	utils.tblsep(f, opts);
	create_invTypeReactions(f, opts);
	utils.close_datafile("invMeta", opts, f);

	opts2 = {};
	LOG.info("load:", "fsd/typeIDs.yaml");
	opts2.ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/typeIDs.yaml"), "utf8"));
	opts2.keys = Object.keys(opts2.ydoc).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});
	f = utils.open_datafile("invTypes", opts);
	fs.writeSync(opts.f, ",\n");
	create_invTypes(f, opts, opts2);
	utils.close_datafile("invTypes", opts, f);

	fs.writeSync(opts.f, ",\n");
	create_invTypesDesc(opts, opts2); // segmented
	opts2.ydoc = null;
	opts2.keys = null;
	opts2 = null;

	fs.writeSync(opts.f, ",\n");
	create_invItems(opts); // segmented
}

module.exports = {
	create: create
};

function create_invCategories(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/categoryIDs.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invCategories",
		dat: "invMeta",
		key: "categoryID",
		cols: ["categoryName", "published"],
		typ: "sql",
		ydoc: ydoc
	}, function(f, opts, opts2) {
		var key,
			val,
			first = true,
			count = 0;
		for (key in opts2.ydoc) {
			if (!opts2.ydoc.hasOwnProperty(key)) continue;
			val = opts2.ydoc[key];
			if (!first) {
				fs.writeSync(f, ",\n");
			}
			first = false;
			fs.writeSync(f, "\"" + key + "\": [");
			fs.writeSync(f, JSON.stringify(val.name.en));
			fs.writeSync(f, ",");
			fs.writeSync(f, JSON.stringify(val.published));
			fs.writeSync(f, "]");
			count++;
		}
		return count;
	});
}

function create_invContrabandTypes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invContrabandTypes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invContrabandTypes",
		dat: "invMeta",
		key: "typeID:factionID",
		cols: ["standingLoss", "confiscateMinSec", "fineByValue", "attackMinSec"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invControlTowerResourcePurposes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invControlTowerResourcePurposes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invControlTowerResourcePurposes",
		dat: "invMeta",
		key: "purpose",
		cols: ["purposeText"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invControlTowerResources(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invControlTowerResources.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invControlTowerResources",
		dat: "invMeta",
		key: "controlTowerTypeID:resourceTypeID",
		cols: ["purpose", "quantity", "minSecurityLevel", "factionID"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invFlags(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invFlags.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invFlags",
		dat: "invMeta",
		key: "flagID",
		cols: ["flagName", "flagText", "orderID"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invGroups(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/groupIDs.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invGroups",
		dat: "invMeta",
		key: "groupID",
		cols: ["categoryID", "groupName", "description", "iconID", "useBasePrice",
			"allowManufacture", "allowRecycler", "anchored", "anchorable",
			"fittableNonSingleton", "published"
		],
		typ: "sql",
		ydoc: ydoc
	}, function(f, opts, opts2) {
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
				if (opts2.cols[j] === "groupName") {
					vals.push(opts2.ydoc[k].name.en);
				} else {
					vals.push(opts2.ydoc[k][opts2.cols[j]]);
				}
			}
			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
		}
		return i;
	});
}

function create_invIcons(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/iconIDs.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invIcons",
		dat: "invMeta",
		key: "iconID",
		cols: ["iconFile", "description"],
		typ: "yaml",
		ydoc: ydoc
	}, utils.yamlmap_cb);
}

function create_invMarketGroups(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invMarketGroups.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invMarketGroups",
		dat: "invMeta",
		key: "marketGroupID",
		cols: ["parentGroupID", "marketGroupName", "description", "iconID", "hasTypes"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invMetaGroups(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invMetaGroups.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invMetaGroups",
		dat: "invMeta",
		key: "metaGroupID",
		cols: ["metaGroupName", "description", "iconID"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invMetaTypes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invMetaTypes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invMetaTypes",
		dat: "invMeta",
		key: "typeID",
		cols: ["parentTypeID", "metaGroupID"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invTypeMaterials(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invTypeMaterials.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invTypeMaterials",
		dat: "invMeta",
		key: "typeID:materialTypeID",
		cols: ["quantity"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invTypeReactions(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invTypeReactions.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "invTypeReactions",
		dat: "invMeta",
		key: "typeID:reactionTypeID:input",
		cols: ["quantity"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_invTypes(f, opts, opts2) {
	opts2.tbl = "invTypes";
	opts2.dat = "invTypes";
	opts2.key = "typeID";
	opts2.cols = ["groupID", "typeName", "marketGroupID", "published", "iconID"];
	opts2.typ = "sql";
	utils.create_table(f, opts, opts2, function(f, opts, opts2) {
		var i, j, k,
			keys,
			vals, coln;
		keys = opts2.keys;
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				coln = opts2.cols[j];
				if (coln === "typeName") {
					if (opts2.ydoc[k].hasOwnProperty("name")) {
						vals.push(opts2.ydoc[k].name.en);
					} else {
						vals.push(null);
					}
				} else {
					vals.push(opts2.ydoc[k][coln]);
				}
			}
			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
		}
		return i;
	});
}

function create_invTypesDesc(opts, opts2) {
	opts2.tbl = "invTypesDesc";
	opts2.key = "typeID";
	opts2.cols = [
		"description", "mass", "volume", "capacity",
		"portionSize", "raceID", "basePrice", "radius", "soundID",
		"volume", "graphicID", "sofFactionName", "traits",
		"factionID", "masteries", "chanceOfDuplicating"
	];
	opts2.typ = "sql";
	opts2.segsize = 5000;
	utils.create_segtable(opts, opts2, function(f, seg, opts, opts2) {
		var i, j, k, max, ret,
			keys, coln,
			vals;
		keys = opts2.keys;
		max = (seg + 1) * opts2.segsize;
		if (max > keys.length) {
			max = keys.length;
		}
		ret = {
			minID: keys[seg * opts2.segsize],
			maxID: keys[max - 1],
			segrc: 0
		};
		for (i = (seg * opts2.segsize); i < max; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				coln = opts2.cols[j];
				if (coln === "description") {
					if (opts2.ydoc[k].hasOwnProperty("description")) {
						vals.push(opts2.ydoc[k].description.en);
					} else {
						vals.push(null);
					}
				} else if (coln === "mass" || coln === "volume" || coln === "capacity" || coln === "portionSize" || coln === "basePrice" || coln === "chanceOfDuplicating") {
					if (opts2.ydoc[k].hasOwnProperty(coln)) {
						vals.push(opts2.ydoc[k][coln]);
					} else {
						vals.push(0);
					}
				} else {
					vals.push(opts2.ydoc[k][coln]);
				}
			}
			if (ret.segrc !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
			ret.segrc++;
		}
		return ret;
	});
}

function create_invItems(opts) {
	var i, opts2 = {},
		ydoc, dat = {},
		item, yitem;

	LOG.info("load:", "bsd/invItems.yaml");
	ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invItems.yaml"), "utf8"));
	for (i = 0; i < ydoc.length; i++) {
		yitem = ydoc[i];
		if (!dat.hasOwnProperty(yitem.itemID)) {
			dat[yitem.itemID] = {};
		}
		item = dat[yitem.itemID];
		item.typeID = yitem.typeID;
		item.flagID = yitem.flagID;
		item.locationID = yitem.locationID;
		item.ownerID = yitem.ownerID;
		item.quantity = yitem.quantity;
	}
	ydoc = null;

	LOG.info("load:", "bsd/invNames.yaml");
	ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invNames.yaml"), "utf8"));
	for (i = 0; i < ydoc.length; i++) {
		yitem = ydoc[i];
		if (!dat.hasOwnProperty(yitem.itemID)) {
			dat[yitem.itemID] = {};
		}
		item = dat[yitem.itemID];
		item.itemName = yitem.itemName;
	}
	ydoc = null;

	LOG.info("load:", "bsd/invUniqueNames.yaml");
	ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invUniqueNames.yaml"), "utf8"));
	for (i = 0; i < ydoc.length; i++) {
		yitem = ydoc[i];
		if (!dat.hasOwnProperty(yitem.itemID)) {
			dat[yitem.itemID] = {};
		}
		item = dat[yitem.itemID];
		item.uniqueName = yitem.itemName;
		item.groupID = yitem.groupID;
	}
	ydoc = null;

	LOG.info("load:", "bsd/invPositions.yaml");
	ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invPositions.yaml"), "utf8"));
	for (i = 0; i < ydoc.length; i++) {
		yitem = ydoc[i];
		if (!dat.hasOwnProperty(yitem.itemID)) {
			dat[yitem.itemID] = {};
		}
		item = dat[yitem.itemID];
		item.pitch = yitem.pitch;
		item.roll = yitem.roll;
		item.yaw = yitem.yaw;
		item.x = yitem.x;
		item.y = yitem.y;
		item.z = yitem.z;
	}
	ydoc = null;

	opts2.dat = dat;
	opts2.keys = Object.keys(dat).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});
	opts2.tbl = "invItems";
	opts2.key = "itemID";
	opts2.cols = [
		"typeID", "ownerID", "locationID", "flagID", "quantity",
		"itemName", "uniqueName", "groupID",
		"x", "y", "z", "yaw", "pitch", "roll"
	];
	opts2.typ = "sql";
	opts2.segsize = 12500;
	utils.create_segtable(opts, opts2, function(f, seg, opts, opts2) {
		var i, j, k, max, ret,
			keys, coln,
			vals;
		keys = opts2.keys;
		max = (seg + 1) * opts2.segsize;
		if (max > keys.length) {
			max = keys.length;
		}
		ret = {
			minID: keys[seg * opts2.segsize],
			maxID: keys[max - 1],
			segrc: 0
		};
		for (i = (seg * opts2.segsize); i < max; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				coln = opts2.cols[j];
				if (
					(coln === "x" || coln === "y" || coln === "z" || coln === "yaw" || coln === "pitch" || coln === "roll") && (!opts2.dat[k].hasOwnProperty(coln) || !opts2.dat[k][coln])
				) {
					vals.push(0);
				} else {
					vals.push(opts2.dat[k][coln]);
				}
			}
			if (ret.segrc !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
			ret.segrc++;
		}
		return ret;
	});
}
