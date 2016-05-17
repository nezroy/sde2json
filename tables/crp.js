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

	utils.close_datafile("crpData", opts, f);
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
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_crpNPCDivisions(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/crpNPCDivisions.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "crpNPCDivisions",
		dat: "crpData",
		key: "divisionID",
		cols: ["divisionName", "description", "leaderType"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
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
			m: "{\"divisions\":\"{ divisionID: divisionSize, ... }\",\"research\":\"[ skillID, ... ]\",\"trades\":\"[ typeID, ... ]\"}",
			ydoc: ydoc,
			ydocInv: ydocInv,
			ydocDivs: ydocDivs,
			ydocRes: ydocRes,
			ydocTrades: ydocTrades
		}, utils.nestcol_cb,
		function(f, opts, opts2, item) {
			var i,
				k = item[opts2.key],
				vals = new Array(4);

			// invName by tablescan
			vals[0] = null;
			for (i = 0; i < opts2.ydocInv.length; i++) {
				if (k == opts2.ydocInv[i].itemID) {
					vals[0] = opts2.ydocInv[i].itemName;
					break;
				}
			}

			// related divisions by tablescan
			vals[1] = {};
			for (i = 0; i < opts2.ydocDivs.length; i++) {
				if (k == opts2.ydocDivs[i].corporationID) {
					vals[1][opts2.ydocDivs[i].divisionID] = opts2.ydocDivs[i].size;
				}
			}

			// related research by tablescan
			vals[2] = [];
			for (i = 0; i < opts2.ydocRes.length; i++) {
				if (k == opts2.ydocRes[i].corporationID) {
					vals[2].push(opts2.ydocRes[i].skillID);
				}
			}

			// related trades by tablescan
			vals[3] = [];
			for (i = 0; i < opts2.ydocTrades.length; i++) {
				if (k == opts2.ydocTrades[i].corporationID) {
					vals[3].push(opts2.ydocTrades[i].typeID);
				}
			}

			return vals;
		});
}

function create_agtAgentTypes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/agtAgentTypes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "agtAgentTypes",
		dat: "crpData",
		key: "agentTypeID",
		cols: ["agentType"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
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
			typ: "sql",
			ydoc: ydoc,
			ydocRes: ydocRes
		}, utils.nestcol_cb,
		function(f, opts, opts2, item) {
			var i, vals = new Array(1);

			vals[0] = [];
			for (i = 0; i < opts2.ydocRes.length; i++) {
				if (item[opts2.key] == opts2.ydocRes[i].agentID) {
					vals[0].push(opts2.ydocRes[i].typeID);
				}
			}

			return vals;
		});
}
