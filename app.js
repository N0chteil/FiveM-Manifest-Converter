const fs = require('fs'),
    axios = require('axios');

let rN;

on("onResourceStart", (resourceName) => {
    if (GetCurrentResourceName() !== resourceName) return;

    axios.get('https://raw.githubusercontent.com/Micky014/FiveM-Manifest-Converter/main/fxmanifest.lua', {}).then(function (res) {
        if (!res.status === 200) return log("Http request error", "error");
        let version = GetResourceMetadata(GetCurrentResourceName(), "version");

        rN = GetCurrentResourceName();

        if (!res.data.includes(version)) log("\"manifest_converter\" is not up to date, \"https://github.com/Micky014/FiveM-Manifest-Converter\".", "warn");
        else log("\"manifest_converter\" is up to date.", "success");
    }).catch(function (err) { log("Check update failed", "error") });
});

RegisterCommand("manifest", function (src, args, rw) {
    let arg = args[0];
    if (!src === 0) return log("This command can only be used in the console.", "error")
    if (!arg) return log("Valid arguments: 'find/delete'", "info");

    if (arg === "find") {
        let foundFiles = false;
        for (let i = 0; i < GetNumResources(); i++) {
            let resourceName = GetResourceByFindIndex(i),
                __resource = LoadResourceFile(resourceName, "__resource.lua");

            if (__resource) log(`"${resourceName}/__resource.lua" found.`, "info"), foundFiles = true;
        }
        if (!foundFiles) log("Not files found.", "info");
    } else if (arg === "delete") {
        let foundFiles = false;
        for (let i = 0; i < GetNumResources(); i++) {
            let resourceName = GetResourceByFindIndex(i),
                resourcePath = GetResourcePath(resourceName),
                __resource = LoadResourceFile(resourceName, "__resource.lua");

            if (__resource) log(`"${resourceName}/__resource.lua" found.`, "info");
            if (__resource) {
                foundFiles = true;

                let metadataFound = false,
                    oldMetaData = {
                        1: "resource_manifest_version '77731fab-63ca-442c-a67b-abc70f28dfa5'",
                        2: "resource_manifest_version 'f15e72ec-3972-4fe4-9c7d-afc5394ae207'",
                        3: "resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'",
                        4: "resource_manifest_version '05cfa83c-a124-4cfa-a768-c24a5811d8f9'",
                        5: "resource_manifest_version \"77731fab-63ca-442c-a67b-abc70f28dfa5\"",
                        6: "resource_manifest_version \"f15e72ec-3972-4fe4-9c7d-afc5394ae207\"",
                        7: "resource_manifest_version \"44febabe-d386-4d18-afbe-5e627f4af937\"",
                        8: "resource_manifest_version \"05cfa83c-a124-4cfa-a768-c24a5811d8f9\""
                    },
                    newMetaData = "fx_version 'cerulean'\ngame 'gta5'\n";

                for (j in oldMetaData) {
                    let metadata = oldMetaData[j];

                    if (__resource.includes(metadata)) {
                        log(`[^5${metadata}^0] found in "${resourceName}/__resource.lua".`, "info");
                        let fxmanifest = __resource.replace(metadata, newMetaData),
                            filePath = `${resourcePath}/__resource.lua`,
                            backupSuccess = false,
                            date = Date.now();

                        metadataFound = true;

                        SaveResourceFile(rN, `backup_${resourceName.toLowerCase()}_${date}`, __resource);
                        backup = LoadResourceFile(rN, `backup_${resourceName.toLowerCase()}_${date}`);

                        if (backup.includes(newMetaData) && backup) log(`Successfully created backup for ${resourceName}`, "success"), backupSuccess = true;
                        else log(`An error occurred while creating the backup of ${resourceName}`, "error");

                        if(!backupSuccess) return log(`Conversion process of ${resourceName} stopped because the backup file could not be created`, "error");

                        fs.unlink(filePath, (err) => {
                            if (err) return log(err, "error");

                            log(`"${resourceName}/__resource.lua" file removed.`, "success");
                            SaveResourceFile(resourceName, "fxmanifest.lua", fxmanifest);

                            fxmanifest = LoadResourceFile(resourceName, "fxmanifest.lua");
                            if (fxmanifest.includes(newMetaData) && fxmanifest) log(`"${resourceName}/__resource.lua" to "${resourceName}/fxmanifest.lua" converted.`, "success");
                        });
                    }
                }

                if (!metadataFound) {
                    let filePath = `${resourcePath}/__resource.lua`,
                        fxmanifest = `${newMetaData}\n${__resource}`;

                    fs.unlink(filePath, (err) => {
                        if (err) return log(err, "error");

                        log("\"__resource.lua\" file removed.", "success");
                        SaveResourceFile(resourceName, "fxmanifest.lua", fxmanifest);

                        fxmanifest = LoadResourceFile(resourceName, "fxmanifest.lua");
                        if (fxmanifest.includes(newMetaData) && fxmanifest) log("\"__resource.lua\" to \"fxmanifest.lua\" converted.", "success");
                    })
                }
            }
        }
        if (!foundFiles) log("Not files found.", "info");
    } else log("\"${arg}\" is not a valid argument. Valid arguments: 'find/delete'", "error");
}, false);

function log(str, type) {
    let clr;

    if(type === "info") clr = 4;
    else if(type === "warn") clr = 3;
    else if(type === "success") clr = 2;
    else if(type === "error") clr = 1;

    console.log(`^${clr}[${type.toUpperCase()}]^0 ${str}`);
}