const fs = require('fs')
const axios = require('axios')

on("onResourceStart", (resourceName) => {
    if (GetCurrentResourceName() != resourceName) { return; }

    axios.get('https://raw.githubusercontent.com/Micky014/FiveM-Manifest-Converter/main/fxmanifest.lua', {
    }).then(function(res) {
        if (!res.status == 200) { log("Http request error", "error"); return; }
        let version = GetResourceMetadata(GetCurrentResourceName(), "version");
        
        if (!res.data.includes(version)) log(`"manifest_converter" is not up to date, "https://github.com/Micky014/FiveM-Manifest-Converter".`, "warn")
        if (res.data.includes(version)) log(`"manifest_converter" is up to date.`, "success")
    }).catch(function(err) { log(`Check update failed`, "error") })
});

RegisterCommand("manifest", function(src, args, rw) {
    let arg = args[0]
    if (!src == 0 ) { log("This command can only be used in the console.", "error"); return }
    if (!arg) { { log("Valid arguments: 'find/delete'", "info"); return } }

    if (arg == "find") {
        let foundFiles = false;
        for (let i=0; i<GetNumResources(); i++) {
            let resourceName = GetResourceByFindIndex(i);
            let __resource = LoadResourceFile(resourceName, "__resource.lua");
            if (__resource) { log(`"${resourceName}/__resource.lua" found.`, "info"); foundFiles = true}
        }
        if (!foundFiles) log(`Not files found.`, "info");
    } else if (arg == "delete") {
        let foundFiles = false;
        for (let i=0; i<GetNumResources(); i++) {
            let resourceName = GetResourceByFindIndex(i);
            let resourcePath = GetResourcePath(resourceName);
            let __resource = LoadResourceFile(resourceName, "__resource.lua");
            if (__resource) log(`"${resourceName}/__resource.lua" found.`, "info");
        
            if (__resource) {
                foundFiles = true;

                let metadataFound = false 
                let oldMetaData = {
                    1: "resource_manifest_version '77731fab-63ca-442c-a67b-abc70f28dfa5'",
                    2: "resource_manifest_version 'f15e72ec-3972-4fe4-9c7d-afc5394ae207'",
                    3: "resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'",
                    4: "resource_manifest_version '05cfa83c-a124-4cfa-a768-c24a5811d8f9'",
                    5: "resource_manifest_version \"77731fab-63ca-442c-a67b-abc70f28dfa5\"",
                    6: "resource_manifest_version \"f15e72ec-3972-4fe4-9c7d-afc5394ae207\"",
                    7: "resource_manifest_version \"44febabe-d386-4d18-afbe-5e627f4af937\"",
                    8: "resource_manifest_version \"05cfa83c-a124-4cfa-a768-c24a5811d8f9\""
                }
        
                let newMetaData = "fx_version 'cerulean'\ngame 'gta5'\n";
                
                for (j in oldMetaData) {
                    let metadata = oldMetaData[j]
                    if (__resource.includes(metadata)) { 
                        log(`[^5${metadata}^0] found in "${resourceName}/__resource.lua".`, "info")
                        let fxmanifest = __resource.replace(metadata, newMetaData);
                        let filePath = `${resourcePath}/__resource.lua`
                        metadataFound = true;

                        fs.unlink(filePath, (err) => {
                            if (err) { log(err, "error"); return }

                            log(`"${resourceName}/__resource.lua" file removed.`, "success")
                            SaveResourceFile(resourceName, "fxmanifest.lua", fxmanifest);
                            
                            fxmanifest = LoadResourceFile(resourceName, "fxmanifest.lua");
                            if (fxmanifest.includes(newMetaData) && fxmanifest) log(`"${resourceName}/__resource.lua" to "${resourceName}/fxmanifest.lua" converted.`, "success");
                        })
                    } 
                } 

                if (!metadataFound) {
                    let filePath = `${resourcePath}/__resource.lua`;
                    let fxmanifest = `${newMetaData}\n${__resource}`;
    
                    fs.unlink(filePath, (err) => {
                        if (err) { log(err, "error"); return }

                        log(`"__resource.lua" file removed.`, "success")
                        SaveResourceFile(resourceName, "fxmanifest.lua", fxmanifest);

                        fxmanifest = LoadResourceFile(resourceName, "fxmanifest.lua");
                        if (fxmanifest.includes(newMetaData) && fxmanifest) log(`"__resource.lua" to "fxmanifest.lua" converted.`, "success");
                    })
                }
            } 
        }
        if (!foundFiles) log(`Not files found.`, "info");
    } else { log(`"${arg}" is not a valid argument. Valid arguments: 'find/delete'`, "error") }
}, false)

function log(str, type) {
    if (type == "info") console.log(`^4[INFO]^0 ${str}`)
    if (type == "warn") console.log(`^3[WARN]^0 ${str}`)
    if (type == "success") console.log(`^2[SUCCESS]^0 ${str}`)
    if (type == "error") console.log(`^1[ERROR]^0 ${str}`)
}