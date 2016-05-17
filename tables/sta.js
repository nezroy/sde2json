var //LOG = require("../log"),
	utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function create(opts) {
	var f;

	f = utils.open_datafile("staData", opts);
	create_staServices(f, opts);
	utils.tblsep(f, opts);
	create_staOperations(f, opts);
	utils.tblsep(f, opts);
	create_staStationTypes(f, opts);
	utils.tblsep(f, opts);
	create_staStations(f, opts);
	utils.close_datafile("staData", opts, f);
}

module.exports = {
	create: create
};

function create_staServices(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/staServices.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "staServices",
		dat: "staData",
		key: "serviceID",
		cols: ["serviceName", "description"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_staOperations(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/staOperations.yaml"), "utf8"));
	var ydocSvc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/staOperationServices.yaml"), "utf8"));
	utils.create_table(f, opts, {
			tbl: "staOperations",
			dat: "staData",
			key: "operationID",
			cols: [
				"activityID", "operationName", "description", "fringe", "corridor",
				"hub", "border", "ratio", "caldariStationTypeID", "minmatarStationTypeID",
				"amarrStationTypeID", "gallenteStationTypeID", "joveStationTypeID"
			],
			cxtra: ["services"],
			m: "{\"services\":\"[ serviceID, ... ]\"}",
			typ: "sql",
			ydoc: ydoc,
			ydocSvc: ydocSvc
		}, utils.nestcol_cb,
		function(f, opts, opts2, item) {
			var i, k, vals = new Array(1);

			vals[0] = [];
			k = item[opts2.key];
			for (i = 0; i < opts2.ydocSvc.length; i++) {
				if (k == opts2.ydocSvc[i].operationID) {
					vals[0].push(opts2.ydocSvc[i].serviceID);
				}
			}

			return vals;
		});
}

function create_staStationTypes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/staStationTypes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "staStationTypes",
		dat: "staData",
		key: "stationTypeID",
		cols: [
			"dockEntryX", "dockEntryY", "dockEntryZ",
			"dockOrientationX", "dockOrientationY", "dockOrientationZ",
			"operationID", "officeSlots", "reprocessingEfficiency", "conquerable"
		],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_staStations(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/staStations.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "staStations",
		dat: "staData",
		key: "stationID",
		cols: [
			"security", "dockingCostPerVolume", "maxShipVolumeDockable", "officeRentalCost",
			"operationID", "stationTypeID", "corporationID", "solarSystemID", "constellationID",
			"regionID", "stationName", "x", "y", "z",
			"reprocessingEfficiency", "reprocessingStationsTake", "reprocessingHangarFlag"
		],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}
