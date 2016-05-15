var //LOG = require("../log"),
	utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function create(opts) {
	var f = utils.open_datafile("crpData", opts);

	create_crpActivities(f, opts);
	utils.tblsep(f, opts);
	create_crpNPCDivisions(f, opts);
	utils.tblsep(f, opts);
	create_crpNPCCorporations(f, opts);
	utils.tblsep(f, opts);
	create_agtAgentTypes(f, opts);
	utils.tblsep(f, opts);
	create_agtAgents(f, opts);

	utils.close_datafile(f);
}

module.exports = {
	create: create
};

function create_crpActivities(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpActivities.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "crpActivities",
		dat: "crpData",
		key: "activityID",
		cols: ["activityName", "description"],
		typ: "sql"
	}, utils.column_cb, {
		ydoc: ydoc
	});
}

function create_crpNPCDivisions(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpNPCDivisions.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "crpNPCDivisions",
		dat: "crpData",
		key: "divisionID",
		cols: ["divisionName", "description", "leaderType"],
		typ: "sql"
	}, utils.column_cb, {
		ydoc: ydoc
	});
}

function create_crpNPCCorporations(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpNPCCorporations.yaml"), "utf8"));
	var ydocDivs = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpNPCCorporationDivisions.yaml"), "utf8"));
	var ydocRes = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpNPCCorporationResearchFields.yaml"), "utf8"));
	var ydocTrades = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpNPCCorporationTrades.yaml"), "utf8"));
	var ydocInv = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invNames.yaml"), "utf8"));

	utils.create_table(f, opts, {
			tbl: "crpNPCCorporations",
			dat: "crpData",
			key: "corporationID",
			cols: ["size", "extent", "solarSystemID", "investorID1", "investorShares1", "investorID2", "investorShares2",
				"investorID3", "investorShares3", "investorID4", "investorShares4", "friendID", "enemyID",
				"publicShares", "initialPrice", "minSecurity", "scattered", "fringe", "corridor", "hub",
				"border", "factionID", "sizeFactor", "stationCount", "stationSystemCount", "description", "iconID"
			],
			typ: "sql",
			cxtra: ["corpName", "divisions", "research", "trades"],
			m: "{\"divisions\":\"{ divisionID: divisionSize, ... }\",\"research\":\"[ skillID, ... ]\",\"trades\":\"[ typeID, ... ]\"}"
		},
		function(f, opts, opts2, cbdat) {
			var ydoc = cbdat.ydoc;
			var i = 0,
				j = 0,
				vals,
				found = false,
				key,
				item;

			for (i = 0; i < ydoc.length; i++) {
				item = ydoc[i];
				key = item[opts2.key];
				if (i > 0) {
					fs.writeSync(f, ",\n");
				}
				fs.writeSync(f, "\"" + key + "\":[");
				vals = [];
				for (j = 0; j < opts2.cols.length; j++) {
					if (item.hasOwnProperty(opts2.cols[j])) {
						vals.push(JSON.stringify(item[opts2.cols[j]]));
					} else {
						vals.push("null");
					}
				}

				// print invName by tablescan
				fs.writeSync(f, vals.join(","));
				for (j = 0; j < cbdat.ydocInv.length; j++) {
					if (key == cbdat.ydocInv[j].itemID) {
						fs.writeSync(f, "," + JSON.stringify(cbdat.ydocInv[j].itemName));
						found = true;
						break;
					}
				}
				if (!found) {
					fs.writeSync(f, ",null");
				}

				// print related divisions by tablescan
				fs.writeSync(f, ",{");
				vals = [];
				for (j = 0; j < cbdat.ydocDivs.length; j++) {
					if (key == cbdat.ydocDivs[j].corporationID) {
						vals.push("\"" + cbdat.ydocDivs[j].divisionID + "\":" + JSON.stringify(cbdat.ydocDivs[j].size));
					}
				}
				fs.writeSync(f, vals.join(",") + "}");

				// print related research by tablescan
				fs.writeSync(f, ",[");
				vals = [];
				for (j = 0; j < cbdat.ydocRes.length; j++) {
					if (key == cbdat.ydocRes[j].corporationID) {
						vals.push(JSON.stringify(cbdat.ydocRes[j].skillID));
					}
				}
				fs.writeSync(f, vals.join(",") + "]");

				// print related trades by tablescan
				fs.writeSync(f, ",[");
				vals = [];
				for (j = 0; j < cbdat.ydocTrades.length; j++) {
					if (key == cbdat.ydocTrades[j].corporationID) {
						vals.push(JSON.stringify(cbdat.ydocTrades[j].typeID));
					}
				}
				fs.writeSync(f, vals.join(",") + "]");

				// done
				fs.writeSync(f, "]");
			}

			return i;
		}, {
			ydoc: ydoc,
			ydocInv: ydocInv,
			ydocDivs: ydocDivs,
			ydocRes: ydocRes,
			ydocTrades: ydocTrades
		});
}

function create_agtAgentTypes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/agtAgentTypes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "agtAgentTypes",
		dat: "crpData",
		key: "agentTypeID",
		cols: ["agentType"],
		typ: "sql"
	}, utils.column_cb, {
		ydoc: ydoc
	});
}

function create_agtAgents(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/agtAgents.yaml"), "utf8"));
	var ydocRes = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/agtResearchAgents.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "agtAgents",
		dat: "crpData",
		key: "agentID",
		cols: ["divisionID", "corporationID", "locationID", "level", "quality", "agentTypeID", "isLocator"],
		cxtra: ["research"],
		m: "{\"research\":\"[ typeID, ... ]\"}",
		typ: "sql"
	}, function column_cb(f, opts, opts2, cbdat) {
		var ydoc = cbdat.ydoc;
		var i = 0,
			j = 0,
			key,
			item,
			vals;

		for (i = 0; i < ydoc.length; i++) {
			item = ydoc[i];
			key = item[opts2.key];
			if (i > 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + key + "\":[");
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				if (item.hasOwnProperty(opts2.cols[j])) {
					vals.push(JSON.stringify(item[opts2.cols[j]]));
				} else {
					vals.push("null");
				}
			}
			fs.writeSync(f, vals.join(","));
			fs.writeSync(f, ",[");
			vals = [];
			for (j = 0; j < ydocRes.length; j++) {
				if (key == cbdat.ydocRes[j].agentID) {
					vals.push(JSON.stringify(cbdat.ydocRes[j].typeID));
				}
			}
			fs.writeSync(f, vals.join(","));
			fs.writeSync(f, "]]");
		}

		return i;
	}, {
		ydoc: ydoc,
		ydocRes: ydocRes
	});
}
