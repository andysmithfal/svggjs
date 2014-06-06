//helper functions 

function scale(n){
	n = n/2.8344; 
	return n;
}

function process_points(point_array){
	var xys = Array();
	_.each(point_array, function(points, i, pa){
		var point_pairs = points.split(" ");
		var xy = new Array();
		_.each(point_pairs, function(e,i,l){
			if(e.indexOf(",") == -1) return;
			var xyt = e.split(",");
			xyt[0] = scale(xyt[0]);
			xyt[1] = scale(xyt[1]);
			xy.push(xyt);
		});
		xys.push(xy);
	});
	return xys;
}

function points_to_gcode(xys){
	var header = "%\nM3\nG21\n";
	var footer = "G00 Z5.00000\nM5\nG00 X0.0000 Y0.0000\nM2\n%";
	var main = "";
	_.each(xys, function(xy,i,xys){
		var first = "G00 Z5.00000\nG00 X"+xy[0][0]+" Y"+xy[0][1]+"\n"+"G01 Z-0.125000 F100.0\n";
		var path = "";
		_.each(xy, function(e,i,xy){
			if(i == 0) return;
			path = path+"G01 X"+e[0]+" Y"+e[1]+" Z-0.125000";
			if(i == 1){
				path = path+" F400.0\n";
			}else{
				path = path+"\n";
			}
		});
		main = main+first+path;
	});
	return header+main+footer;
}

function rpoints_to_gcode(xys){
	var header = "%\nM3\nG21\n";
	var footer = "G00 Z5.00000\nM5\nG00 X0.0000 Y0.0000\nM2\n%";
	var main = "";
	_.each(xys, function(xy,i,xys){
		var first = "G90\nG00 Z5.00000\nG00 X"+xy[0][0]+" Y"+xy[0][1]+"\n"+"G01 Z-0.125000 F100.0\nG91\n";
		var return_to_home = "G90\nG01 X"+xy[0][0]+" Y"+xy[0][1]+"\n";
		var path = "";
		_.each(xy, function(e,i,xy){
			if(i == 0) return;
			path = path+"G01 X"+e[0]+" Y"+e[1]+" Z-0.125000";
			if(i == 1){
				path = path+" F400.0\n";
			}else{
				path = path+"\n";
			}
		});
		main = main+first+path+return_to_home;
	});
	return header+main+footer;
}



function path_to_r(xy){
	var x = Array();
	var y = Array();
	_.each(xy, function(e,i,l){
		x.push(e[0]);
		y.push(e[1]);
	});
	var out = "x <- c("+x+")\ny <- c("+y+")\nplot(x,-y, type='o')";
	return out;
}

$("#process").on("click", function(e){
	e.preventDefault();
	var polygons = Array();

	switch($('input[name=input_type]:checked').val()){
		case "p": 
			polygons.push($("#input").val());
		break; 
		case "x": 
			console.log("parsing xml...");
			svg = $.parseXML($("#input").val());
			$svg = $( svg );
			$svg.find("polygon").each(function(){
				var s = $(this).attr('points');
				s = s.replace(/ +/g, " ");
				polygons.push(s.trim());
				//DEBUG: 
				//console.log(s);
			});
			//console.log(polygons);
		break;
	}

	var xys = process_points(polygons);
	var output; 
	switch($('input[name=output_type]:checked').val()){
		case "g": 
			output = points_to_gcode(xys);
		break; 
		case "r": 
			output = path_to_r(xys);
		break;
		case "rg": 
			output = rpoints_to_gcode(xys);
		break;
	}
	$("#output").text(output);
	//alert(data);
});