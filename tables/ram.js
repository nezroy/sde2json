var //LOG = require("../log"),
	utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function create(opts) {
	var f, opts2 = {};

	opts2.dat = "ramMeta";
	f = utils.open_datafile(opts2.dat, opts);
	create_ramActivities(f, opts, opts2);
	utils.tblsep(f, opts);
	create_ramAssemblyLineStations(f, opts, opts2);
	utils.tblsep(f, opts);
	create_ramAssemblyLineTypes(f, opts, opts2);
	utils.tblsep(f, opts);
	create_ramInstallationTypeContents(f, opts, opts2);
	utils.close_datafile(opts2.dat, opts, f);

	fs.writeSync(opts.f, ",\n");

	opts2.dat = "ramBlueprints";
	f = utils.open_datafile(opts2.dat, opts);
	create_ramBlueprints(f, opts, opts2);
	utils.close_datafile(opts2.dat, opts, f);
}

module.exports = {
	create: create
};

function create_ramActivities(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/ramActivities.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "ramActivities",
		dat: opts2.dat,
		key: "activityID",
		cols: ["activityName", "iconNo", "description", "published"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_ramAssemblyLineStations(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/ramAssemblyLineStations.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "ramAssemblyLineStations",
		dat: opts2.dat,
		key: "stationID:assemblyLineTypeID",
		cols: ["quantity", "stationTypeID", "ownerID", "solarSystemID", "regionID"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_ramAssemblyLineTypes(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/ramAssemblyLineTypes.yaml"), "utf8"));
	var ydocCat = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/ramAssemblyLineTypeDetailPerCategory.yaml"), "utf8"));
	var ydocGrp = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/ramAssemblyLineTypeDetailPerGroup.yaml"), "utf8"));
	utils.create_table(f, opts, {
			tbl: "ramAssemblyLineTypes",
			dat: opts2.dat,
			key: "assemblyLineTypeID",
			cols: [
				"assemblyLineTypeName", "description", "baseTimeMultiplier", "baseMaterialMultiplier",
				"baseCostMultiplier", "volume", "activityID", "minCostPerHour"
			],
			cxtra: ["categoryMulti", "groupMulti"],
			m: "{\"categoryMulti\":\"{ categoryID: [timeMultiplier, materialMultiplier, costMultiplier], ... }\",\"groupMulti\":\"{ groupID: [timeMultiplier, materialMultiplier, costMultiplier], ... }\"}",
			typ: "sql",
			ydoc: ydoc,
			ydocCat: ydocCat,
			ydocGrp: ydocGrp
		}, utils.nestcol_cb,
		function(f, opts, opts2, item) {
			var i, k, vals = new Array(2);

			vals[0] = {};
			vals[1] = {};
			k = item[opts2.key];
			for (i = 0; i < opts2.ydocCat.length; i++) {
				if (k == opts2.ydocCat[i].assemblyLineTypeID) {
					vals[0][opts2.ydocCat[i].categoryID] = [
						opts2.ydocCat[i].timeMultiplier,
						opts2.ydocCat[i].materialMultiplier,
						opts2.ydocCat[i].costMultiplier
					];
					break;
				}
			}
			for (i = 0; i < opts2.ydocGrp.length; i++) {
				if (k == opts2.ydocGrp[i].assemblyLineTypeID) {
					vals[1][opts2.ydocGrp[i].groupID] = [
						opts2.ydocGrp[i].timeMultiplier,
						opts2.ydocGrp[i].materialMultiplier,
						opts2.ydocGrp[i].costMultiplier
					];
					break;
				}
			}

			return vals;
		});
}

function create_ramInstallationTypeContents(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/ramInstallationTypeContents.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "ramInstallationTypeContents",
		dat: opts2.dat,
		key: "installationTypeID:assemblyLineTypeID",
		cols: ["quantity"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_ramBlueprints(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/blueprints.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "ramBlueprints",
		dat: opts2.dat,
		key: "blueprintTypeID",
		cols: ["maxProductionLimit", "activities"],
		typ: "yaml",
		m: "{\"activities\":\"{ activityID: { #see blueprints.yaml# }, ... }\"}",
		ydoc: ydoc
	}, utils.yamlmap_cb);
}
