var utils = require("../utils"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function create(opts) {
	var f = utils.open_datafile("dgmMeta", opts);

    /*
	create_crpActivities(f, opts);
	utils.tblsep(f, opts);
	create_crpNPCDivisions(f, opts);
	utils.tblsep(f, opts);
	create_crpNPCCorporations(f, opts);
	utils.tblsep(f, opts);
	create_agtAgentTypes(f, opts);
	utils.tblsep(f, opts);
	create_agtAgents(f, opts);
    */
    
	utils.close_datafile(f);
}

module.exports = {
	create: create
};
