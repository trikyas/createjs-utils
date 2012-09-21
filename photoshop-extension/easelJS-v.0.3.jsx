﻿// PHOTOSHOP TO EASEL JS SPRITESHEET EXPORTER// enable double clicking from the Macintosh Finder or the Windows Explorer#target photoshop// in case we double clicked the fileapp.bringToFront();// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)$.level = 1;// debugger; // launch debugger on next linefunction main () {    var strtRulerUnits = app.preferences.rulerUnits;    if (strtRulerUnits != Units.PIXELS) {      app.preferences.rulerUnits = Units.PIXELS;    }    if (app.documents.length == 0){                alert ("No document opened");    }        var srcDoc = app.activeDocument;    var destName = srcDoc.name.split(".")[0];            var w = srcDoc.width ;    var h = srcDoc.height ;        // TMP: TODO compute    var rows = 5;    var cols = 5;            var destDoc = srcDoc.duplicate(destName, false);         destDoc.resizeCanvas (cols*w, rows*h, AnchorPosition.TOPLEFT);        // select target doc    app.activeDocument = destDoc;	// starting lib output	var txt = "//EaselJS Spritesheet\r ";	txt += "if (!window.lib) { window.lib = {}; }\r";	txt += "(function() {\r";	var layerSets = destDoc.layerSets;    var layerIndex = 0 ;     var animsTxt = "animations: {";    var framesTxt = "frames:[";    for( var n = 0 ; n < layerSets.length ; n++){                var set = layerSets[n];        var setName = set.name;        $.writeln("Set: " + setName);                animsTxt += "\r\t" + setName + ":{ frames:[";                    for( var i = 0 ; i < set.layers.length ; i++){                        var layer = set.layers[i];            $.writeln("layer: " + layer.name);                        // discard text layers            if (layer.kind == LayerKind.TEXT) {                layerIndex++;                continue;            }                        // select the next layer            destDoc.activeLayer = layer;            destDoc.activeLayer.allLocked=false;                        // compute destination            var destx = (layerIndex % cols) * w;            var desty = (Math.floor(layerIndex/cols)) * h;                        destDoc.activeLayer.translate(destx, desty);                                    // Add frames : x, y, width, height, imageIndex, regX, regY            framesTxt += "\r\t[" + Number(destx) + ", " + Number(desty) + ", " + Number(w) + ", " + Number(h) + ", 0, 0, 0],";                        // Add frames to animation data            animsTxt += layerIndex+", ";            // multiply frames as specified by the user            var sepIndex = layer.name.indexOf(" x");            if(sepIndex>-1) {                var repeat = Number(layer.name.slice(sepIndex+2));                for (var j = 0 ; j < repeat-1 ; j++)  animsTxt += layerIndex+", ";            }                       layerIndex++;                                }            animsTxt += "], next:false},";                //animsTxt += "\r\t" + setName + ":{ frames:["+lastIndex+","+(layerIndex-1)+"], next:false},";                    }		// sprite defintion	txt += "var spritesheetPath='sprites/" + destName + ".png';\r";    	txt += "var "+ destName +" = function() {this.initialize();}\r";    	txt += destName + "._SpriteSheet = new createjs.SpriteSheet("    	txt += "{images: [spritesheetPath], \r";	txt += framesTxt;	txt += "]";	txt += ",\r"+animsTxt;	txt += "}";    	txt += "});\r";	txt += "var "+ destName + "_p = " + destName + ".prototype = new createjs.BitmapAnimation();\r";	txt += destName + "_p.BitmapAnimation_initialize = "+ destName + "_p.initialize;\r";	txt += destName + "_p.initialize = function() {\r";	txt += "\tthis.BitmapAnimation_initialize(" + destName + "._SpriteSheet);\r";	txt += "\tthis.paused = false;\r"	txt += "}\r";	txt += "lib."+ destName + " = " + destName + ";\r";			// end of lib	txt += "}());";    var destF =  Folder.selectDialog ("Select Destination");    var folderName = destF.absoluteURI+"/";    // save files    savePng(destDoc, folderName + destName + ".png" );        // TMP    var libName= "spritelib";    saveTxt(txt, folderName + libName +".js");             // close doc    destDoc.close(SaveOptions.DONOTSAVECHANGES);    // release refs    srcDoc = null;    destDoc = null;    // restore prefs    if (strtRulerUnits != app.preferences.rulerUnits) {      app.preferences.rulerUnits = strtRulerUnits;    }}function processSprite(destDoc, layerSet, txt) {			}function savePng(doc, filepath) {                var pngFile = new File(filepath);    var pngFileOptions = new PNGSaveOptions();    doc.saveAs (pngFile, pngFileOptions, true, Extension.LOWERCASE);}function saveTxt(pText, filepath) {		    // get OS specific linefeed    var fileLineFeed;     if ($.os.search(/windows/i) != -1) {            fileLineFeed = "windows";    } else {		fileLineFeed = "macintosh";	}		    fileOut = new File(filepath);    fileOut.lineFeed = fileLineFeed;    fileOut.open("w", "TEXT", "????");    fileOut.write(pText);    fileOut.close();}main();