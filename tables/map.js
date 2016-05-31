var LOG = require("../log"),
	utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml"),
	clone = require("clone");

function create(opts) {
	var f, i, map, opts2, ynames, names;

	LOG.info("load:", "bsd/invNames.yaml");
	names = {};
	ynames = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/invNames.yaml"), "utf8"));
	for (i = 0; i < ynames.length; i++) {
		names[ynames[i].itemID] = ynames[i].itemName;
	}
	ynames = null;

	map = prep_mapdat(opts, {
		names: names
	});

	opts2 = {
		dat: "mapKSpace",
		map: map.K,
		label: "K"
	};
	f = utils.open_datafile(opts2.dat, opts);
	create_mapRegions(f, opts, opts2);
	utils.tblsep(f, opts);
	create_mapConstellations(f, opts, opts2);
	utils.tblsep(f, opts);
	create_mapSolarSystems(f, opts, opts2);
	utils.tblsep(f, opts);
	create_mapLandmarks(f, opts, opts2);
	utils.tblsep(f, opts);
	create_warCombatZones(f, opts, opts2);
	utils.tblsep(f, opts);
	create_warCombatZoneSystems(f, opts, opts2);
	utils.close_datafile(opts2.dat, opts, f);

	fs.writeSync(opts.f, ",\n");

	opts2.dat = "mapKJumps";
	f = utils.open_datafile(opts2.dat, opts);
	create_mapRegionJumps(f, opts, opts2);
	utils.tblsep(f, opts);
	create_mapConstellationJumps(f, opts, opts2);
	utils.tblsep(f, opts);
	create_mapSolarSystemJumps(f, opts, opts2);
	utils.close_datafile(opts2.dat, opts, f);

	fs.writeSync(opts.f, ",\n");

	opts2.dat = "mapKStars";
	opts2.names = names;
	f = utils.open_datafile(opts2.dat, opts);
	create_mapStars(f, opts, opts2);
	utils.close_datafile(opts2.dat, opts, f);

	fs.writeSync(opts.f, ",\n");

	create_mapSolarSystemObjects(opts, opts2); // segmented

	fs.writeSync(opts.f, ",\n");

	create_mapPlanets(opts, opts2); // segmented

	fs.writeSync(opts.f, ",\n");

	create_mapMoons(opts, opts2); // segmented

	fs.writeSync(opts.f, ",\n");

	create_mapBelts(opts, opts2); // segmented

	fs.writeSync(opts.f, ",\n");

	opts2.dat = "mapKGates";
	f = utils.open_datafile(opts2.dat, opts);
	create_mapGates(f, opts, opts2);
	utils.close_datafile(opts2.dat, opts, f);

	if (map.X) {
		fs.writeSync(opts.f, ",\n");

		opts2 = {
			dat: "mapXSpace",
			map: map.X,
			label: "X"
		};
		f = utils.open_datafile(opts2.dat, opts);
		create_mapRegions(f, opts, opts2);
		utils.tblsep(f, opts);
		create_mapConstellations(f, opts, opts2);
		utils.tblsep(f, opts);
		create_mapSolarSystems(f, opts, opts2);
		utils.close_datafile(opts2.dat, opts, f);

		fs.writeSync(opts.f, ",\n");

		opts2.dat = "mapXJumps";
		f = utils.open_datafile(opts2.dat, opts);
		create_mapRegionJumps(f, opts, opts2);
		utils.tblsep(f, opts);
		create_mapConstellationJumps(f, opts, opts2);
		utils.tblsep(f, opts);
		create_mapSolarSystemJumps(f, opts, opts2);
		utils.close_datafile(opts2.dat, opts, f);

		fs.writeSync(opts.f, ",\n");

		opts2.dat = "mapXStars";
		opts2.names = names;
		f = utils.open_datafile(opts2.dat, opts);
		create_mapStars(f, opts, opts2);
		utils.close_datafile(opts2.dat, opts, f);

		fs.writeSync(opts.f, ",\n");

		create_mapSolarSystemObjects(opts, opts2); // segmented

		fs.writeSync(opts.f, ",\n");

		create_mapPlanets(opts, opts2); // segmented

		fs.writeSync(opts.f, ",\n");

		create_mapMoons(opts, opts2); // segmented

		fs.writeSync(opts.f, ",\n");

		create_mapBelts(opts, opts2); // segmented

		fs.writeSync(opts.f, ",\n");

		opts2.dat = "mapXGates";
		f = utils.open_datafile(opts2.dat, opts);
		create_mapGates(f, opts, opts2);
		utils.close_datafile(opts2.dat, opts, f);
	}

	if (map.J) {
		fs.writeSync(opts.f, ",\n");

		opts2 = {
			dat: "mapJSpace",
			map: map.J,
			label: "J"
		};
		f = utils.open_datafile(opts2.dat, opts);
		create_mapRegions(f, opts, opts2);
		utils.tblsep(f, opts);
		create_mapConstellations(f, opts, opts2);
		utils.tblsep(f, opts);
		create_mapSolarSystems(f, opts, opts2);
		utils.close_datafile(opts2.dat, opts, f);

		fs.writeSync(opts.f, ",\n");

		opts2.dat = "mapJStars";
		opts2.names = names;
		f = utils.open_datafile(opts2.dat, opts);
		create_mapStars(f, opts, opts2);
		utils.close_datafile(opts2.dat, opts, f);

		fs.writeSync(opts.f, ",\n");

		create_mapSolarSystemObjects(opts, opts2); // segmented

		fs.writeSync(opts.f, ",\n");

		create_mapPlanets(opts, opts2); // segmented

		fs.writeSync(opts.f, ",\n");

		create_mapMoons(opts, opts2); // segmented
	}
}

module.exports = {
	create: create
};

function prep_mapdat(opts, opts2) {
	var i, map = {},
		names = opts2.names,
		ysta, sta = {},
		xspace = ["UUA-F4", "J7HZ-F", "A821-A"];

	LOG.info("load:", "bsd/staStations.yaml");
	ysta = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/staStations.yaml"), "utf8"));
	for (i = 0; i < ysta.length; i++) {
		if (!sta.hasOwnProperty(ysta[i].solarSystemID)) {
			sta[ysta[i].solarSystemID] = 0;
		}
		sta[ysta[i].solarSystemID] += 1;
	}
	ysta = null;

	LOG.info("parse K map dirs");
	if (global.gc) {
		// force GC before each mapgen
		global.gc();
	}
	map.K = prep_KJXmapdat("eve", opts, {
		exclude: xspace,
		//include: ["TheForge"],
		names: names,
		sta: sta,
		jumptable: true,
		connects: 30000142
	});

	LOG.info("parse X map dirs");
	map.X = prep_KJXmapdat("eve", opts, {
		include: xspace,
		names: names,
		sta: sta,
		jumptable: true
	});

	LOG.info("parse J map dirs");
	if (global.gc) {
		// force GC before each mapgen
		global.gc();
	}
	map.J = prep_KJXmapdat("wormhole", opts, {
		names: names,
		sta: sta
	});

	return map;
}

function prep_KJXmapdat(dir, opts, opts2) {
	var map = {
			regions: {}
		},
		i, k, regdir, dirs, region, sysidx,
		rk, ck, sk, gateidx, jumps, rg;

	dirs = fs.readdirSync(path.join(opts.sde, "fsd", "universe", dir));
	for (i = 0; i < dirs.length; i++) {
		regdir = dirs[i];
		if (opts2 && ((opts2.exclude && opts2.exclude.indexOf(regdir) > -1) || (opts2.include && opts2.include.indexOf(regdir) < 0))) continue;
		region = parse_region(dir, regdir, opts, opts2);
		map.regions[region.regionID] = region;
	}

	// create system lookup index
	LOG.info("create system index");
	sysidx = {};
	for (rk in map.regions) {
		for (ck in map.regions[rk].constellations) {
			for (sk in map.regions[rk].constellations[ck].systems) {
				sysidx[sk] = map.regions[rk].constellations[ck].systems[sk];
			}
		}
	}
	map.sysidx = sysidx;

	// create jump table
	if (opts2.jumptable) {
		LOG.info("create jump table");
		gateidx = {};
		for (sk in map.sysidx) {
			for (k in map.sysidx[sk].stargates) {
				gateidx[k] = sk;
			}
		}
		jumps = {};
		for (k in gateidx) {
			sk = gateidx[k]; // source gate system ID
			if (!map.sysidx.hasOwnProperty(sk)) continue;
			rg = map.sysidx[sk].stargates[k].destination; // receiving gate id
			if (!gateidx.hasOwnProperty(rg)) continue;
			rk = gateidx[rg]; // receiving gate system ID
			if (!map.sysidx.hasOwnProperty(rk)) continue;

			if (!jumps.hasOwnProperty(sk)) {
				jumps[sk] = {};
			}
			jumps[sk][rk] = [map.sysidx[sk].regionID, map.sysidx[sk].constellationID, map.sysidx[rk].regionID, map.sysidx[rk].constellationID];
		}
		gateidx = null;
		map.jumps = jumps;
	}

	// create contiguity data
	if (opts2.connects && map.sysidx.hasOwnProperty(opts2.connects)) {
		LOG.info("create contiguity data to:", opts2.connects);
		follow_and_mark(opts2.connects, map);
	}

	return map;
}

function follow_and_mark(idx, map) {
	var k, sys;
	if (!map.sysidx.hasOwnProperty(idx)) return;
	sys = map.sysidx[idx];
	if (sys.security < 0.45) return;
	sys.contiguous = true;

	for (k in map.jumps[idx]) {
		if (!map.sysidx.hasOwnProperty(k) || map.sysidx[k].contiguous) continue; // no data or already checked
		follow_and_mark(k, map);
	}
}

function parse_region(dir, regdir, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd", "universe", dir, regdir, "region.staticdata"), "utf8"));
	var i, constdir, dirs, constellation;
	var region = {
		constellations: {}
	};

	region.regionID = ydoc.regionID;
	region.regionName = opts2.names[region.regionID];
	LOG.info("parse region:", region.regionName);

	region.center = clone(ydoc.center, false);
	region.min = clone(ydoc.min, false);
	region.max = clone(ydoc.max, false);

	region.nebula = ydoc.nebula;
	region.factionID = ydoc.factionID;
	region.wormholeClassID = ydoc.wormholeClassID;
	region.descriptionID = ydoc.descriptionID;

	ydoc = null;

	dirs = fs.readdirSync(path.join(opts.sde, "fsd", "universe", dir, regdir));
	for (i = 0; i < dirs.length; i++) {
		constdir = dirs[i];
		if (constdir === "region.staticdata") continue;
		constellation = parse_constellation(dir, regdir, constdir, opts, opts2, region.regionID);
		region.constellations[constellation.constellationID] = constellation;
	}

	return region;
}

function parse_constellation(dir, regdir, constdir, opts, opts2, regionID) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd", "universe", dir, regdir, constdir, "constellation.staticdata"), "utf8"));
	var i, sysdir, dirs, system;
	var constellation = {
		systems: {}
	};

	constellation.regionID = regionID;
	constellation.constellationID = ydoc.constellationID;
	constellation.constellationName = opts2.names[constellation.constellationID];

	constellation.center = clone(ydoc.center, false);
	constellation.min = clone(ydoc.min, false);
	constellation.max = clone(ydoc.max, false);

	constellation.radius = ydoc.radius;

	ydoc = null;

	dirs = fs.readdirSync(path.join(opts.sde, "fsd", "universe", dir, regdir, constdir));
	for (i = 0; i < dirs.length; i++) {
		sysdir = dirs[i];
		if (sysdir === "constellation.staticdata") continue;
		system = parse_solarsystem(dir, regdir, constdir, sysdir, opts, opts2, regionID, constellation.constellationID);
		constellation.systems[system.solarSystemID] = system;
	}

	return constellation;
}

function parse_solarsystem(dir, regdir, constdir, sysdir, opts, opts2, regionID, constID) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd", "universe", dir, regdir, constdir, sysdir, "solarsystem.staticdata"), "utf8"));
	var system = {};

	system.regionID = regionID;
	system.constellationID = constID;
	system.solarSystemID = ydoc.solarSystemID;
	system.solarSystemName = opts2.names[system.solarSystemID];

	system.center = clone(ydoc.center, false);
	system.min = clone(ydoc.min, false);
	system.max = clone(ydoc.max, false);

	system.border = ydoc.border;
	system.corridor = ydoc.corridor;
	system.fringe = ydoc.fringe;
	system.hub = ydoc.hub;
	system.international = ydoc.international;
	//system.luminosity = ydoc.luminosity;
	system.radius = ydoc.radius;
	system.regional = ydoc.regional;
	system.security = Math.round(ydoc.security * 1000000) / 1000000;
	system.securityApparent = Math.round(ydoc.security * 10) / 10;
	system.securityClass = ydoc.securityClass;
	//system.sunTypeID = ydoc.sunTypeID;
	system.wormholeClassID = ydoc.wormholeClassID;

	system.star = clone(ydoc.star, false);
	if (!system.star.hasOwnProperty("statistics")) {
		system.star.statistics = {
			luminosity: ydoc.luminosity,
			typeID: ydoc.sunTypeID
		};
	}
	system.planets = clone(ydoc.planets, false);
	system.stargates = clone(ydoc.stargates, false);
	if (opts2.sta.hasOwnProperty(system.solarSystemID)) {
		system.stationCount = opts2.sta[system.solarSystemID];
	} else {
		system.stationCount = 0;
	}

	ydoc = null;

	return system;
}

function create_mapRegions(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "Regions",
		dat: opts2.dat,
		key: "regionID",
		typ: "dir",
		cols: [
			"regionName", "center", "min", "max",
			"factionID", "descriptionID", "nebula", "wormholeClassID"
		],
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, j, k, keys, vals,
			map = opts2.map;
		keys = Object.keys(map.regions).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});

		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				vals.push(map.regions[k][opts2.cols[j]]);
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

function create_mapConstellations(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "Constellations",
		dat: opts2.dat,
		key: "constellationID",
		typ: "dir",
		cols: [
			"regionID", "constellationName", "center",
			"min", "max", "radius"
		],
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, j, rk, k, cidx, keys, vals,
			map = opts2.map;

		cidx = {};
		for (rk in map.regions) {
			for (k in map.regions[rk].constellations) {
				cidx[k] = map.regions[rk].constellations[k];
			}
		}
		keys = Object.keys(cidx).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});

		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				vals.push(cidx[k][opts2.cols[j]]);
			}

			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
		}

		cidx = null;

		return i;
	});

}

function create_mapSolarSystems(f, opts, opts2) {
	var cols = [
		"regionID", "constellationID", "solarSystemName",
		"center", "min", "max", "radius", "border",
		"fringe", "corridor", "hub", "international",
		"regional", "security", "securityApparent",
		"securityClass", "wormholeClassID", "stationCount", "jumps"
	];
	if (opts2.label == "K") {
		cols.push("contiguous");
	}
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "SolarSystems",
		dat: opts2.dat,
		key: "solarSystemID",
		typ: "dir",
		cols: cols,
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, j, k, keys, vals,
			map = opts2.map,
			coln;

		keys = Object.keys(map.sysidx).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				coln = opts2.cols[j];
				if (coln === "contiguous") {
					vals.push(map.sysidx[k][coln] ? true : false);
				} else if (coln === "jumps") {
					if (map.jumps && map.jumps.hasOwnProperty(k)) {
						vals.push(Object.keys(map.jumps[k]));
					} else {
						vals.push([]);
					}
				} else {
					vals.push(map.sysidx[k][coln]);
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

function create_mapRegionJumps(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "RegionJumps",
		dat: opts2.dat,
		key: "fromRegionID:toRegionID",
		typ: "dir",
		cols: [],
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, k, keys,
			map = opts2.map,
			fromSys, jumps, toSys;

		jumps = {};

		for (fromSys in map.jumps) {
			for (toSys in map.jumps[fromSys]) {
				if (map.jumps[fromSys][toSys][0] != map.jumps[fromSys][toSys][2]) {
					if (!jumps.hasOwnProperty(map.jumps[fromSys][toSys][0])) {
						jumps[map.jumps[fromSys][toSys][0]] = {};
					}
					jumps[map.jumps[fromSys][toSys][0]][map.jumps[fromSys][toSys][2]] = [];
				}
			}

		}
		keys = Object.keys(jumps).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(jumps[k]));
		}

		return i;
	});
}

function create_mapConstellationJumps(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "ConstellationJumps",
		dat: opts2.dat,
		key: "fromConstellationID:toConstellationID",
		typ: "dir",
		cols: ["fromRegionID", "toRegionID"],
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, k, keys,
			map = opts2.map,
			fromSys, jumps, toSys;

		jumps = {};

		for (fromSys in map.jumps) {
			for (toSys in map.jumps[fromSys]) {
				if (map.jumps[fromSys][toSys][1] != map.jumps[fromSys][toSys][3]) {
					if (!jumps.hasOwnProperty(map.jumps[fromSys][toSys][1])) {
						jumps[map.jumps[fromSys][toSys][1]] = {};
					}
					jumps[map.jumps[fromSys][toSys][1]][map.jumps[fromSys][toSys][3]] = [map.jumps[fromSys][toSys][0], map.jumps[fromSys][toSys][2]];
				}
			}

		}
		keys = Object.keys(jumps).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(jumps[k]));
		}

		return i;
	});
}

function create_mapSolarSystemJumps(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "SolarSystemJumps",
		dat: opts2.dat,
		key: "fromSolarSystemID:toSolarSystemID",
		typ: "dir",
		cols: ["fromRegionID", "fromConstellationID", "toConstellationID", "toRegionID"],
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, j, k, k2, keys, keys2,
			map = opts2.map;
		keys = Object.keys(map.jumps).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});

		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\": {");
			keys2 = Object.keys(map.jumps[k]).sort(function(a, b) {
				return (a + 0) - (b + 0);
			});
			for (j = 0; j < keys2.length; j++) {
				k2 = keys2[j];
				if (j !== 0) {
					fs.writeSync(f, ",");
				}
				fs.writeSync(f, "\"" + k2 + "\":");
				fs.writeSync(f, JSON.stringify(map.jumps[k][k2]));
			}
			fs.writeSync(f, "}");
		}

		return i;
	});

}

/*
function create_mapJumps(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "mapJumps",
		dat: opts2.dat,
		key: "stargateID",
		typ: "dir",
		cols: ["destinationID"],
		map: opts2.map
	}, function(f, opts, opts2) {
		var i, sk, k, keys, gateidx,
			map = opts2.map;

		gateidx = {};
		for (sk in map.sysidx) {
			for (k in map.sysidx[sk].stargates) {
				gateidx[k] = [map.sysidx[sk].stargates[k].destination];
			}
		}
		keys = Object.keys(gateidx).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(gateidx[k]));
		}

		return i;
	});
}
*/

function create_mapLandmarks(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "fsd/landmarks/landmarks.staticdata"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "mapLandmarks",
		dat: opts2.dat,
		key: "landmarkID",
		cols: ["landmarkNameID", "descriptionID", "locationID", "position", "iconID"],
		typ: "dir",
		ydoc: ydoc
	}, function(f, opts, opts2) {
		var k,
			item, vals,
			first = true,
			count = 0;
		for (k in opts2.ydoc) {
			item = opts2.ydoc[k];
			vals = [
				item.landmarkNameID,
				item.descriptionID,
				item.locationID,
				item.position,
				item.iconID
			];
			if (!first) {
				fs.writeSync(f, ",\n");
			}
			first = false;
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
			count++;
		}
		return count;
	});
}

function create_warCombatZoneSystems(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/warCombatZoneSystems.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "warCombatZoneSystems",
		dat: opts2.dat,
		key: "solarSystemID",
		cols: ["combatZoneID"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_warCombatZones(f, opts, opts2) {
	var ydoc = yaml.safeLoad(fs.readFileSync(path.join(opts.sde, "bsd/warCombatZones.yaml"), "utf8"));
	utils.create_table(f, opts, {
		tbl: "warCombatZones",
		dat: opts2.dat,
		key: "combatZoneID",
		cols: ["combatZoneName", "factionID", "centerSystemID", "description"],
		typ: "sql",
		ydoc: ydoc
	}, utils.nestcol_cb);
}

function create_mapStars(f, opts, opts2) {
	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "Stars",
		dat: opts2.dat,
		key: "itemID",
		typ: "dir",
		cols: [
			"solarSystemID", "typeID", "radius", "itemName",
			"age", "life", "locked", "luminosity", "spectralClass", "temperature"
		],
		map: opts2.map,
		names: opts2.names
	}, function(f, opts, opts2) {
		var i, j, sk, k, stars, keys, vals,
			map = opts2.map,
			names = opts2.names,
			coln;

		stars = {};
		for (sk in map.sysidx) {
			k = map.sysidx[sk].star.id;
			stars[k] = {
				dat: map.sysidx[sk].star,
				sk: sk
			};
		}
		keys = Object.keys(stars).sort(function(a, b) {
			return (a + 0) - (b + 0);
		});

		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				coln = opts2.cols[j];
				if (coln === "itemName") {
					vals.push(names[k]);
				} else if (coln === "solarSystemID") {
					vals.push(stars[k].sk);
				} else if (coln === "radius" || coln === "typeID") {
					vals.push(stars[k].dat[coln]);
				} else {
					vals.push(stars[k].dat.statistics[coln]);
				}
			}

			if (i !== 0) {
				fs.writeSync(f, ",\n");
			}
			fs.writeSync(f, "\"" + k + "\":");
			fs.writeSync(f, JSON.stringify(vals));
		}

		stars = null;

		return i;
	});

}

function create_mapSolarSystemObjects(opts, opts2) {
	var planets = {},
		moons = {},
		belts = {},
		gates = {},
		stations = {},
		map = opts2.map,
		gk, bk, mk, pk, sk, nk, keys;
	for (sk in map.sysidx) {
		for (pk in map.sysidx[sk].planets) {
			if (!planets.hasOwnProperty(sk)) {
				planets[sk] = [];
			}
			planets[sk].push(pk);

			for (nk in map.sysidx[sk].planets[pk].npcStations) {
				if (!stations.hasOwnProperty(sk)) {
					stations[sk] = [];
				}
				stations[sk].push(nk);
			}

			for (bk in map.sysidx[sk].planets[pk].asteroidBelts) {
				if (!belts.hasOwnProperty(sk)) {
					belts[sk] = [];
				}
				belts[sk].push(bk);
			}

			for (mk in map.sysidx[sk].planets[pk].moons) {
				if (!moons.hasOwnProperty(sk)) {
					moons[sk] = [];
				}
				moons[sk].push(mk);

				for (nk in map.sysidx[sk].planets[pk].moons[mk].npcStations) {
					if (!stations.hasOwnProperty(sk)) {
						stations[sk] = [];
					}
					stations[sk].push(nk);
				}

				for (bk in map.sysidx[sk].planets[pk].moons[mk].asteroidBelts) {
					if (!belts.hasOwnProperty(sk)) {
						belts[sk] = [];
					}
					belts[sk].push(bk);
				}
			}
		}

		for (gk in map.sysidx[sk].stargates) {
			if (!gates.hasOwnProperty(sk)) {
				gates[sk] = [];
			}
			gates[sk].push(gk);
		}
	}
	keys = Object.keys(map.sysidx).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});

	utils.create_segtable(opts, {
		tbl: "map" + opts2.label + "SolarSystemObjects",
		key: "solarSystemID",
		typ: "dir",
		cols: ["planets", "moons", "belts", "gates", "stations"],
		map: map,
		segsize: 2000,
		keys: keys,
		planets: planets,
		moons: moons,
		belts: belts,
		stations: stations
	}, function(f, seg, opts, opts2) {
		var i, k, max, ret,
			keys,
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
			vals = [
				planets.hasOwnProperty(k) ? planets[k] : [],
				moons.hasOwnProperty(k) ? moons[k] : [],
				belts.hasOwnProperty(k) ? belts[k] : [],
				gates.hasOwnProperty(k) ? gates[k] : [],
				stations.hasOwnProperty(k) ? stations[k] : []
			];
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

function create_mapPlanets(opts, opts2) {
	var planets = {},
		map = opts2.map,
		k, sk, keys;
	for (sk in map.sysidx) {
		for (k in map.sysidx[sk].planets) {
			planets[k] = {
				dat: map.sysidx[sk].planets[k],
				sk: sk
			};
		}
	}
	keys = Object.keys(planets).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});

	utils.create_segtable(opts, {
		tbl: "map" + opts2.label + "Planets",
		key: "itemID",
		typ: "dir",
		cols: [
			"solarSystemID", "itemName", "typeID", "celestialIndex",
			"position", "heightMap1", "heightMap2", "population", "shaderPreset",
			"density", "eccentricity", "escapeVelocity", "fragmented", "life",
			"locked", "massDust", "massGas", "orbitPeriod", "orbitRadius",
			"pressure", "radius", "rotationRate", "spectralClass", "surfaceGravity",
			"temperature"
		],
		map: map,
		names: opts2.names,
		segsize: 5000,
		keys: keys,
		planets: planets
	}, function(f, seg, opts, opts2) {
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
				if (coln === "solarSystemID") {
					vals.push(opts2.planets[k].sk);
				} else if (coln === "itemName") {
					vals.push(opts2.names[k]);
				} else if (coln === "typeID" || coln === "celestialIndex" || coln === "position") {
					vals.push(opts2.planets[k].dat[coln]);
				} else if (coln === "heightMap1" || coln === "heightMap2" || coln === "population" || coln === "shaderPreset") {
					if (opts2.planets[k].dat.hasOwnProperty("planetAttributes")) {
						vals.push(opts2.planets[k].dat.planetAttributes[coln]);
					} else {
						vals.push(null);
					}
				} else {
					if (opts2.planets[k].dat.hasOwnProperty("statistics")) {
						vals.push(opts2.planets[k].dat.statistics[coln]);
					} else {
						vals.push(null);
					}
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

function create_mapMoons(opts, opts2) {
	var moons = {},
		map = opts2.map,
		k, pk, sk, keys;
	for (sk in map.sysidx) {
		for (pk in map.sysidx[sk].planets) {
			for (k in map.sysidx[sk].planets[pk].moons) {
				moons[k] = {
					dat: map.sysidx[sk].planets[pk].moons[k],
					sk: sk,
					pk: pk
				};
			}
		}
	}
	keys = Object.keys(moons).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});

	utils.create_segtable(opts, {
		tbl: "map" + opts2.label + "Moons",
		key: "itemID",
		typ: "dir",
		cols: [
			"solarSystemID", "planetID", "itemName", "typeID",
			"position", "heightMap1", "heightMap2", "population", "shaderPreset"
		],
		map: map,
		names: opts2.names,
		segsize: 10000,
		keys: keys,
		moons: moons
	}, function(f, seg, opts, opts2) {
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
				if (coln === "solarSystemID") {
					vals.push(opts2.moons[k].sk);
				} else if (coln === "planetID") {
					vals.push(opts2.moons[k].pk);
				} else if (coln === "itemName") {
					vals.push(opts2.names[k]);
				} else if (coln === "typeID" || coln === "position") {
					vals.push(opts2.moons[k].dat[coln]);
				} else {
					if (opts2.moons[k].dat.hasOwnProperty("planetAttributes")) {
						vals.push(opts2.moons[k].dat.planetAttributes[coln]);
					} else {
						vals.push(null);
					}
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

function create_mapBelts(opts, opts2) {
	var belts = {},
		map = opts2.map,
		k, mk, pk, sk, keys;
	for (sk in map.sysidx) {
		for (pk in map.sysidx[sk].planets) {
			for (k in map.sysidx[sk].planets[pk].asteroidBelts) {
				belts[k] = {
					dat: map.sysidx[sk].planets[pk].asteroidBelts[k],
					sk: sk,
					pk: pk,
					mk: null
				};
			}

			for (mk in map.sysidx[sk].planets[pk].moons) {
				for (k in map.sysidx[sk].planets[pk].moons[mk].asteroidBelts) {
					belts[k] = {
						dat: map.sysidx[sk].planets[pk].moons[mk].asteroidBelts[k],
						sk: sk,
						pk: pk,
						mk: mk
					};
				}
			}
		}
	}
	keys = Object.keys(belts).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});

	utils.create_segtable(opts, {
		tbl: "map" + opts2.label + "Belts",
		key: "itemID",
		typ: "dir",
		cols: ["solarSystemID", "planetID", "moonID", "itemName", "typeID", "position"],
		map: map,
		names: opts2.names,
		segsize: 10000,
		keys: keys,
		belts: belts
	}, function(f, seg, opts, opts2) {
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
				if (coln === "solarSystemID") {
					vals.push(opts2.belts[k].sk);
				} else if (coln === "planetID") {
					vals.push(opts2.belts[k].pk);
				} else if (coln === "moonID") {
					vals.push(opts2.belts[k].mk);
				} else if (coln === "itemName") {
					vals.push(opts2.names[k]);
				} else {
					vals.push(opts2.belts[k].dat[coln]);
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

function create_mapGates(f, opts, opts2) {
	var gates = {},
		map = opts2.map,
		k, sk, keys;
	for (sk in map.sysidx) {
		for (k in map.sysidx[sk].stargates) {
			gates[k] = {
				dat: map.sysidx[sk].stargates[k],
				sk: sk
			};
		}
	}
	keys = Object.keys(gates).sort(function(a, b) {
		return (a + 0) - (b + 0);
	});

	utils.create_table(f, opts, {
		tbl: "map" + opts2.label + "Gates",
		dat: "map" + opts2.label + "Gates",
		key: "itemID",
		typ: "dir",
		cols: ["solarSystemID", "itemName", "typeID", "destination", "position"],
		map: map,
		names: opts2.names,
		keys: keys,
		gates: gates
	}, function(f, opts, opts2) {
		var i, j, k,
			keys, coln,
			vals;
		keys = opts2.keys;
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			vals = [];
			for (j = 0; j < opts2.cols.length; j++) {
				coln = opts2.cols[j];
				if (coln === "solarSystemID") {
					vals.push(opts2.gates[k].sk);
				} else if (coln === "itemName") {
					vals.push(opts2.names[k]);
				} else {
					vals.push(opts2.gates[k].dat[coln]);
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
