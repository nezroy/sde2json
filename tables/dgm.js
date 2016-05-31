var utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function create(opts) {
	var f = utils.open_datafile("dgmMeta", opts);

	create_chrAncestries(f, opts);
	utils.tblsep(f, opts);
	create_chrAttributes(f, opts);
	utils.tblsep(f, opts);
	create_chrBloodlines(f, opts);
	utils.tblsep(f, opts);
	create_chrFactions(f, opts);
	utils.tblsep(f, opts);
	create_chrRaces(f, opts);
	utils.tblsep(f, opts);
	create_chrCertificates(f, opts);
	utils.tblsep(f, opts);
	create_eveUnits(f, opts);
	utils.tblsep(f, opts);
	create_dgmAttributeCategories(f, opts);
	utils.tblsep(f, opts);
	create_dgmAttributeTypes(f, opts);
	utils.tblsep(f, opts);
	create_dgmEffects(f, opts);

	utils.close_datafile("dgmMeta", opts, f);

	f = utils.open_datafile("dgmTypes", opts);
	fs.writeSync(opts.f, ",\n");
	create_dgmTypes(f, opts);
	utils.close_datafile("dgmTypes", opts, f);
}

module.exports = {
	create: create
};

function create_chrAncestries(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/chrAncestries.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "chrAncestries",
		dat: "dgmMeta",
		key: "ancestryID",
		cols: ["ancestryName", "bloodlineID", "description", "perception", "willpower", "charisma",
			"memory", "intelligence", "iconID", "shortDescription"
		],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_chrAttributes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/chrAttributes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "chrAttributes",
		dat: "dgmMeta",
		key: "attributeID",
		cols: ["attributeName", "description", "iconID", "shortDescription", "notes"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_chrBloodlines(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/chrBloodlines.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "chrBloodlines",
		dat: "dgmMeta",
		key: "bloodlineID",
		cols: ["bloodlineName", "raceID", "description", "maleDescription", "femaleDescription",
			"shipTypeID", "corporationID", "perception", "willpower", "charisma", "memory",
			"intelligence", "iconID", "shortDescription", "shortMaleDescription", "shortFemaleDescription"
		],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_chrFactions(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/chrFactions.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "chrFactions",
		dat: "dgmMeta",
		key: "factionID",
		cols: ["factionName", "description", "raceIDs", "solarSystemID", "corporationID",
			"sizeFactor", "stationCount", "stationSystemCount", "militiaCorporationID", "iconID"
		],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_chrRaces(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/chrRaces.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "chrRaces",
		dat: "dgmMeta",
		key: "raceID",
		cols: ["raceName", "description", "iconID", "shortDescription"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_chrCertificates(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/certificates.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "chrCertificates",
		dat: "dgmMeta",
		key: "raceID",
		cols: ["name", "description", "groupID", "recommendedFor", "skillTypes"],
		m: "{\"recommendedFor\":\"[ typeID, ... ]\",\"skillTypes\":\"{ skillID: { certLevel: skillLevel, ... }, ... }\"}",
		typ: "yaml",
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
			fs.writeSync(f, JSON.stringify(val.name));
			fs.writeSync(f, ",");
			fs.writeSync(f, JSON.stringify(val.description));
			fs.writeSync(f, ",");
			fs.writeSync(f, JSON.stringify(val.groupID));
			fs.writeSync(f, ",");
			if (val.recommendedFor) {
				fs.writeSync(f, JSON.stringify(val.recommendedFor));
			} else {
				fs.writeSync(f, "[]");
			}
			fs.writeSync(f, ",");
			if (val.skillTypes) {
				fs.writeSync(f, JSON.stringify(val.skillTypes));
			} else {
				fs.writeSync(f, "{}");
			}
			fs.writeSync(f, "]");
			count++;
		}
		return count;
	});
}

function create_eveUnits(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/eveUnits.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "eveUnits",
		dat: "dgmMeta",
		key: "unitID",
		cols: ["unitName", "displayName", "description"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_dgmAttributeCategories(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/dgmAttributeCategories.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "dgmAttributeCategories",
		dat: "dgmMeta",
		key: "categoryID",
		cols: ["categoryName", "categoryDescription"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_dgmAttributeTypes(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/dgmAttributeTypes.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "dgmAttributeTypes",
		dat: "dgmMeta",
		key: "attributeID",
		cols: ["attributeName", "description", "iconID", "defaultValue", "published",
			"displayName", "unitID", "stackable", "highIsGood", "categoryID"
		],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_dgmEffects(f, opts) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/dgmEffects.yaml"), "utf8"));
	utils.create_table(f, opts, {
			tbl: "dgmEffects",
			dat: "dgmMeta",
			key: "effectID",
			cols: ["effectName", "effectCategory", "preExpression", "postExpression",
				"description", "guid", "iconID", "isOffensive", "isAssistance",
				"durationAttributeID", "trackingSpeedAttributeID", "dischargeAttributeID", "rangeAttributeID",
				"falloffAttributeID", "disallowAutoRepeat", "published", "displayName",
				"isWarpSafe", "rangeChance", "electronicChance", "propulsionChance",
				"distribution", "sfxName", "npcUsageChanceAttributeID", "npcActivationChanceAttributeID",
				"fittingUsageChanceAttributeID"
			],
			cxtra: ["modifierInfo"],
			typ: "sql",
			ydoc: ydoc
		}, utils.nestcol_cb,
		function(f, opts, opts2, item) {
			var vals = new Array(1),
				yamlMod;

			vals[0] = [];
			if (item.modifierInfo) {
				try {
					yamlMod = yaml.safeLoad(item.modifierInfo);
					vals[0] = yamlMod;
				} catch (ex) {
					vals[0].push("err");
				}
			}

			return vals;
		});
}

function create_dgmTypes(f, opts) {
	var ydocAttr = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/dgmTypeAttributes.yaml"), "utf8"));
	var ydocEff = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/dgmTypeEffects.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "dgmTypes",
		dat: "dgmTypes",
		key: "typeID",
		cols: ["attributes", "effects"],
		m: "{\"attributes\":\"{ attributeID: value, ... }\",\"effects\":\"{ effectID: isDefault, ... }\"}",
		typ: "sql",
		ydocAttr: ydocAttr,
		ydocEff: ydocEff
	}, function(f, opts, opts2) {
		var first = true,
			val,
			key,
			item,
			allTypes = {},
			typeIDs,
			i;
		for (i = 0; i < opts2.ydocAttr.length; i++) {
			item = opts2.ydocAttr[i];
			if (item.hasOwnProperty("valueFloat")) {
				val = item.valueFloat;
			} else {
				val = item.valueInt;
			}
			if (!allTypes.hasOwnProperty(item.typeID)) {
				allTypes[item.typeID] = {
					attributes: {},
					effects: {}
				};
			}
			allTypes[item.typeID].attributes[item.attributeID] = val;
		}
		for (i = 0; i < opts2.ydocEff.length; i++) {
			item = opts2.ydocEff[i];
			val = item.isDefault;
			if (!allTypes.hasOwnProperty(item.typeID)) {
				allTypes[item.typeID] = {
					attributes: {},
					effects: {}
				};
			}
			allTypes[item.typeID].effects[item.effectID] = val;
		}

		typeIDs = Object.keys(allTypes).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});
		for (i = 0; i < typeIDs.length; i++) {
			key = typeIDs[i];
			if (!first) {
				fs.writeSync(f, ",\n");
			}
			first = false;
			i++;

			fs.writeSync(f, "\"" + key + "\":[");
			fs.writeSync(f, JSON.stringify(allTypes[key].attributes));
			fs.writeSync(f, ",");
			fs.writeSync(f, JSON.stringify(allTypes[key].effects));
			fs.writeSync(f, "]");
		}

		return i;
	});
}
