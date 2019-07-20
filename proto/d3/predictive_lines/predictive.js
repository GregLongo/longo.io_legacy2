//bg
var bgcolor = "#ffffff";

// Set the dimensions of the canvas
var margin = {
        top: 30,
        right: 20,
        bottom: 30,
        left: 50
    },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// bisect the data
var bisectdata = d3.bisector(function(d) {
        return d.date;
    })
    .left;
var bisectscore = d3.bisector(function(s) {
        return s.score;
    })
    .left;

// Set the ranges
var x = d3.scaleLinear()
    .range([0, width]);
var y = d3.scaleLinear()
    .range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisRight(y);

//comma format numbers
var commas = d3.format(",.0f");
var ks = d3.format(".01s");
var percent = d3.format(",.1%");

// maximum y
var datamax = 100000;

///stupid global variable I shoudn't use

var globalval;
var globalindex;
var globald;

var myVar = null;

//different data models and their respective color representations
var models = ["Model1", "Model2", "Model3"];
var colors = ["#085C9B", "#022BC1", "#3B1B99"];

var allon = true;
var selectedmodel;
var isdeltachosen = false;

function draw_line(c, data) {
    var valueline = d3.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d[c]);
        });
    return valueline(data);
};

function draw_area(c, data) {
    var area = d3.area()
        .x(function(d) {
            return x(d.date);
        })
        .y1(function(d) {
            return y(d[c]) - height;
        });
    return area(data);
};

var reservearea = d3.area()
    .x(function(d) {
        return x(d.date);
    })
    .y1(function(d) {
        return y(d.reserve) - height;
    })
    .curve(d3.curveStepAfter);

// Adds the svg canvas
var svg = d3.select("#graph")
    .append("svg")
    .classed("maingraph", true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Priority Levels
heightLevel = 140;

var xLevel = d3.scaleLinear()
    .range([0, width]);
var yLevel = d3.scaleLinear()
    .range([heightLevel, 0]);
var yAxisLevel = d3.axisRight(yLevel);

// Adds the second svg canvas
var svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", heightLevel)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + ", 10)");

var colorLevel = ['#D34B4B', '#F8AA62', '#FFD34C', '#4CC0CD', '#5AC881'];

//add second bg
for (i = 0; i < 5; i++) {
    svg2.append("line")
        .attr("x1", 0) // x position of the first end of the line
        .attr("y1", i * heightLevel / 5) // y position of the first end of the line
        .attr("x2", width) // x position of the second end of the line
        .attr("y2", i * heightLevel / 5)
        .attr('stroke', colorLevel[i])
        .style("z-index", "-1")
        .attr('class', "priority priority" + (5 - i));
}

var valueline2 = d3.line()
    .x(function(d) {
        return xLevel(d.date);
    })
    .y(function(d) {
        return yLevel(d.priority);
    });

// Get the data
d3.queue()
    .defer(d3.json, "escalation_data.json")
    .await(function(error, rawdata) {

        var data = rawdata.days;
        var scores = rawdata.scores;

        // var data = d3.entries(rawdata);

        // Scale the range of the data
        x.domain([0, d3.max(data, function(d) {
            return d.date;
        })]);
        y.domain([0, d3.max(data, function(d) {
            return datamax;
        })]);

        // Scale the range of the second data
        xLevel.domain([0, d3.max(data, function(d) {
            return d.date;
        })]);
        yLevel.domain([0, d3.max(data, function(d) {
            return 5;
        })]);

        // Add the X Axis
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.ticks(10));

        // Add the yaxis
        svg.append("g")
            .attr("class", "yaxis yaxis1")
            .call(yAxis.ticks(5)
                .tickFormat(function(d) {
                    return "$" + ks(d)
                }))
            .attr("transform", "translate(-56, 0)");

        svg.append("g")
            .attr("class", "yaxis yaxis2")
            .call(yAxis.ticks(5)
                .tickFormat(function(d) {
                    return percent(d / 100000)
                }))
            .attr("transform", "translate(-112, 0)");

        svg.append("g")
            .attr("class", "yaxis yaxis3")
            .call(yAxis.ticks(5)
                .tickFormat(function(d) {
                    return "$" + ks(d / 20)
                }))
            .attr("transform", "translate(-168, 0)");

        //add axis labels

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("transform", "translate(0," + (height + 56) + ")")
            .text("Days Since Exposure Creation");

        //add rectangle to capture mouse movement
        svg.append("rect")
            .attr("width", width)
            .attr("height", height + 2 * heightLevel)
            .attr("class", "capture")
            .attr("transform", "translate(0 , -" + 2 * heightLevel + ")")
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mousemove", mousemove);

        //draw graphs

        var graphs = svg.append("g")
            .attr("class", "graphs");

        //draw stuff
        var reserveline = d3.line()
            .x(function(d) {
                return x(d.date);
            })
            .y(function(d) {
                return y(d.reserve);
            })
            .curve(d3.curveStepAfter);

        // Add the second valueline path
        svg2.append("path")
            .attr("class", "priority priorityline")
            .attr("d", valueline2(data));

        var prioritypoints = svg2.selectAll(".prioritypoint")
            .data(data)
            .enter()
            .append('rect')
            .attr("height", 10)
            .attr("width", 10)
            .attr("class", function(d) {
                return "prioritypoint priority priority" + (d.priority)
            })
            .attr("transform", function(d) {
                return "translate(0,-6) rotate(45 " + xLevel(d.date) + " " + yLevel(d.priority) + ")"
            })
            .attr("x", function(d) {
                return xLevel(d.date);
            })
            .attr("y", function(d) {
                return yLevel(d.priority);
            })
            .attr("stroke-width", 2)
            .style("stroke", function(d) {
                return colorLevel[(5 - d.priority)]
            })
            .style("fill", function(d) {
                return d3.rgb(colorLevel[(5 - d.priority)])
                    .brighter(.3);
            });

        // Add the second Y Axis
        svg2.append("g")
            .attr("class", "yaxislevel")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxisLevel.ticks(5));

        models.forEach(function(d, i) {

            var graph = graphs.append("g")
                .attr("id", d);

            var yintercept = data[data.length - 1][d];
            var rintercept = data[data.length - 1].reserve;

            //draw y axis labels

            d3.select(".yaxis" + (i + 1))
                .append("text")
                .attr("class", "ylabel ylabel" + (i + 1))
                .attr("text-anchor", "middle")
                .attr("y", 0)
                .attr("x", -height / 2)
                .attr("dy", "-1em")
                .attr("transform", "rotate(-90)")
                .text(d)
                .style("fill", colors[i])
                .style("display", "none");

            //draw reserve 
            graph.append("path")
                .attr("class", "reserve reserve-line")
                .attr("d", reserveline(data))
                .style("display", "none");

            graph.append("line")
                .attr("class", "reserve reserve-line")
                .style("stroke-width", 2)
                .attr("transform", "translate(" + width + " ," + y(rintercept) + ")")
                .attr("x2", 48)
                .style("display", "none")
                .style("opacity", ".3")
                .style("stroke", "#626B87");

            graph.append("path")
                .datum(data)
                .attr("class", "reserve reserve-area")
                .attr("d", reservearea)
                .attr("transform", "translate(0, " + height + ")")
                .style("display", "none");

            graph.append("text")
                .attr("class", "reserve reserve-label")
                .text("reserve")
                .attr("transform", "translate(" + (width + 64) + "," + y(rintercept) + ")")
                .style("display", "none")
                .style("opacity", ".3");

            var serv;

            graph.selectAll(".r-text")
                .data(data)
                .enter()
                .append('text')
                .text(function(d) {
                    if (serv != d.reserve) {
                        serv = d.reserve;
                        return "$" + commas(d.reserve);
                    }
                })
                .attr("class", "reserve r-text")
                .attr("x", function(d) {
                    return x(d.date);
                })
                .attr("y", function(d) {
                    if (d.date != 90) {
                        return (y(d.reserve) - 4);
                    }
                })
                .style("display", "none");

            //draw graphsz
            var line = graph.append("g")
                .attr("class", "line")
                .style("cursor", "pointer")
                .on("click", function() {
                    var chosen = d3.select(this)
                        .classed("chosen");
                    handleClick(chosen, d, i);
                })
                .on("mouseenter", function() {
                    handleHover(d, i);
                })
                .on("mouseleave", function() {
                    var chosen = d3.select(this)
                        .classed("chosen");
                    handleLeave(chosen, d, i);
                })
                .on("mouseup", function() {

                    clickDebounce(d);
                });

            line.append("path")
                .attr("d", draw_line(d, data))
                .style("stroke", colors[i]);

            line.append("path")
                .attr("d", draw_line(d, data))
                .style("stroke", "transparent")
                .style("stroke-width", 15);

            line.append("line")
                .style("stroke", colors[i])
                .attr("transform", "translate(" + width + " ," + y(yintercept) + ")")
                .attr("x2", 48);

            //draw graph areas

            var gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "gradient" + i)
                .attr("x1", "50%")
                .attr("y1", "0%")
                .attr("x2", "50%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colors[i])
                .attr("stop-opacity", .6);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colors[i])
                .attr("stop-opacity", 0);

            graph.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("d", draw_area(d, data))
                .attr("transform", "translate(0, " + height + ")")
                .style("fill", "url(#gradient" + i + ")");

            //add labels to graphs

            var linelabel = graph.append("g")
                .attr("class", "linelabel linelabel" + (i + 1))
                .attr("transform", "translate(" + (width + 66) + "," + y(yintercept) + ")")
                .style("opacity", .3)
                .style("cursor", "pointer")
                .on("click", function() {
                    var chosen = d3.select(this)
                        .classed("chosen");
                    handleClick(chosen, d, i);
                })
                .on("mouseenter", function() {
                    handleHover(d, i);
                })
                .on("mouseleave", function() {
                    var chosen = d3.select(this)
                        .classed("chosen");
                    handleLeave(chosen, d, i);
                })
                .on("mouseup", function() {

                    globald = data[data.length - 1];
                    globalindex = data.length - 1;

                    selectedscore.text(commas(y(globald[d])));
                    selectedvalue.text("$" + commas(data[globalindex][d]));
                    intersection.attr("transform",
                        "translate(0 , " + y(data[globalindex][d]) + ")");
                });

            linelabel.append("rect")
                .attr("height", 20)
                .attr("width", 75)
                .attr("y", -10)
                .attr("x", -18)
                .attr("rx", 4)
                .style("fill", colors[i]);

            linelabel.append("text")
                .text(d)
                .attr("y", 4)
                .style("fill", "white");

        }); //end of for each

        //add AllOn label 

        var alllabel = graphs.append("g")
            .attr("transform", "translate(" + (width + 64) + "," + (height - 16) + ")")
            .style("opacity", .3)
            .style("cursor", "pointer")
            .style("display", "none")
            .on("mouseenter", function() {
                d3.select(this)
                    .style("opacity", 1)
            })
            .on("mouseleave", function() {
                d3.select(this)
                    .style("opacity", .3)
            })
            .on("click", function() {
                defaultgraph()
            });

        alllabel.append("rect")
            .attr("height", 20)
            .attr("width", 75)
            .attr("y", -10)
            .attr("x", -16)
            .attr("rx", 4)
            .style("fill", "#383838");

        alllabel.append("text")
            .classed("alllabel", true)
            .text("View All")
            .attr("y", 4)
            .style("fill", "white");

        //append score severity horizontals

        var sevlines = svg.append("g")
            .style("display", "none");

        var highline = sevlines.append("line")
            .attr("class", "sevline")
            .attr("x", 0)
            .attr("x2", width)
            .style("stroke", "#931100");
        var medline = sevlines.append("line")
            .attr("class", "sevline")
            .attr("x", 0)
            .attr("x2", width)
            .style("stroke", "#D6A61A");

        var lowline = sevlines.append("line")
            .attr("class", "sevline")
            .attr("x", 0)
            .attr("x2", width)
            .style("stroke", "#315C26");

        // append the today line

        var today = svg.append("g")
            .attr("id", "today")
            .attr("transform",
                "translate(" + width + ", 0 )");

        today.append("line")
            .attr("class", "today-line")
            .attr("y1", -50)
            .attr("y2", height);

        today.append("rect")
            .attr("class", "today-rect")
            .attr("width", 80)
            .attr("height", 20)
            .attr("transform",
                "translate(-40, -70 )");

        today.append("text")
            .classed("todayflag", true)
            .text("TODAY")
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .attr("transform",
                "translate(0, -56 )");

        var todayflag = today.append("g")
            .attr("transform",
                "translate(-70, -48)")
            .style("display", "none");

        todayflag.append("rect")
            .attr("class", "today-rect")
            .attr("width", 140)
            .attr("height", 50)
            .style("fill", "white")
            .style("stroke", "#b7b7b7");

        var todayestimate = todayflag.append("text")
            .text("########")
            .attr("fill", "black")
            .attr("transform",
                "translate(70, 20 )")
            .attr("class", "today-value")
            .attr("text-anchor", "middle");

        var todayscore = todayflag.append("text")
            .text("########")
            .attr("fill", "black")
            .attr("transform",
                "translate(70, 40 )")
            .attr("class", "today-score")
            .attr("text-anchor", "middle");

        // append the x line
        var focus = svg.append("g")
            .attr("id", "focus")
            .attr("transform",
                "translate(" + height / 1.2 + ", 0 )")
            .style("display", "none");

        focus.append("line")
            .attr("class", "x-line")
            .attr("y2", (height + (margin.top) + (margin.bottom) + heightLevel + 56))
            .attr("transform", "translate(0 , " + -(+margin.top + margin.bottom + heightLevel + 56) + " )");

        focus.append("circle")
            .attr("r", 5)
            .attr("transform",
                "translate( 0 , " + -((margin.top) + (margin.bottom) + heightLevel + 56) + " )")
            .style("fill", "#b7b7b7");

        // append score flags

        var high;
        var highscore = focus.append("g")
            .attr("class", "scoreflag")
            .style("display", "none");

        highscore.append("rect")
            .attr("height", 14)
            .attr("width", 60)
            .style("fill", "#931100")
            .attr("rx", 3)
            .attr("transform", "translate(-65, -7)");

        highscore.append("text")
            .text("Severe")
            .attr("class", "scoreflag-text")
            .attr("transform", "translate(-60, 4)");

        highscore.append("circle")
            .attr("r", 10)
            .style("fill", "white")
            .style("stroke", "#931100")
            .style("stroke-width", 2);

        var med;
        var medscore = focus.append("g")
            .attr("class", "scoreflag")
            .style("display", "none");

        medscore.append("rect")
            .attr("height", 14)
            .attr("width", 60)
            .style("fill", "#D6A61A")
            .attr("rx", 3)
            .attr("transform", "translate(-65, -7)");

        medscore.append("text")
            .text("Moderate")
            .attr("class", "scoreflag-text")
            .attr("transform", "translate(-60, 4)");

        medscore.append("circle")
            .attr("r", 10)
            .style("fill", "white")
            .style("stroke", "#D6A61A")
            .style("stroke-width", 2);

        var low;
        var lowscore = focus.append("g")
            .attr("class", "scoreflag")
            .style("display", "none");

        lowscore.append("rect")
            .attr("height", 14)
            .attr("width", 60)
            .style("fill", "#315C26")
            .attr("rx", 3)
            .attr("transform", "translate(-65, -7)");

        lowscore.append("text")
            .text("Normal")
            .attr("class", "scoreflag-text")
            .attr("transform", "translate(-60, 4)");

        lowscore.append("circle")
            .attr("r", 10)
            .style("fill", "white")
            .style("stroke", "#315C26")
            .style("stroke-width", 2);

        // intersection point 

        var intersection = focus.append("g")
            .style("cursor", "pointer")
            .on("mouseenter", function() {
                deltapoint.style("fill", "#686868");
            })
            .on("mouseleave", function() {
                deltapoint.style("fill", "#b7b7b7");
            })
            .on("click", function() {

                svg.selectAll(".deltapoint")
                    .remove();

                var deltaindicator = svg.append("g")
                    .attr("class", "deltapoint")
                    .attr("transform",
                        "translate(" + x(globald.date) + "," + y(globald[selectedmodel]) + ")");

                deltaindicator.append("line")
                    .attr("stroke", "#686868")
                    .attr("stroke-width", "2")
                    .attr("y2", (height - y(globald[selectedmodel])));

                deltaindicator.append("circle")
                    .attr("r", 14)
                    .style("fill", "white")
                    .style("stroke", "#686868")
                    .style("stroke-width", 2);

                deltaindicator.append("circle")
                    .attr("r", 10)
                    .style("fill", "#686868");

                deltaindicator.append("text")
                    .attr("x", -4)
                    .attr("y", 5)
                    .text("+")
                    .style("fill", "white");

                isdeltachosen = true;

                showDelta(data);
            });

        intersection.append("circle")
            .attr("r", 14)
            .style("fill", "white")
            .style("stroke-width", 2);

        var deltapoint = intersection.append("circle")
            .attr("r", 10)
            .style("fill", "#b7b7b7");

        var clickme = intersection.append("g")
            .style("opacity", 0);

        clickme.append("rect")
            .attr("height", 14)
            .attr("width", 60)
            .style("fill", "lightgreen")
            .attr("rx", 3)
            .attr("transform", "translate(14, -7)");

        clickme.append("text")
            .text("Delta")
            .attr("class", "clickme-text")
            .attr("transform", "translate(30, 4)");

        //Score Graph STUFF///

        var subheight = 170;
        var subwidth = 300;

        var tooltip = focus.append("g")
            .attr("class", "tooltip")
            .style("display", "none")
            .style("cursor", "pointer");

        // set the ranges
        var x2 = d3.scaleLinear()
            .range([0, subwidth]);
        var y2 = d3.scaleLinear()
            .range([subheight, 0]);

        var x3 = d3.scaleLinear()
            .range([subwidth, 0]);
        var y3 = d3.scaleLinear()
            .range([0, subheight]);

        // Define the axes
        var xAxis2 = d3.axisBottom(x2);
        var yAxis2 = d3.axisLeft(y2);

        function draw_scoreline(c, scores) {

            var scoreline = d3.line()
                .x(function(s) {
                    return x2(s.score);
                })
                .y(function(s) {
                    return y2(s[c]);
                });
            return scoreline(scores);
        }

        var scoregraph = tooltip.append("svg")
            .style("overflow", "visible")
            .append("g");

        scoregraph.append("rect")
            .style("fill", "white")
            .attr("width", subwidth + 120)
            .attr("height", subheight + 80)
            .attr("transform", "translate(-90, -46)")
            .attr("ry", 1);

        // format the data
        scores.forEach(function(s) {
            s.score = +s.score;
            s.Model1 = +s.Model1;
            s.Model2 = +s.Model2;
            s.Model3 = +s.Model3;
        });

        // Scale the range of the data
        x2.domain(d3.extent(scores, function(s) {
            return s.score;
        }));
        y2.domain([0, d3.max(scores, function(s) {
            return datamax;
        })]);

        //add x axis 
        var subx = scoregraph.append("g")
            .attr("transform", "translate(0, " + subheight + ")")
            .call(xAxis2.ticks(10));

        //add axis labels
        scoregraph.append("text")
            .attr("text-anchor", "middle")
            .attr("x", subwidth / 2)
            .attr("y", subheight + 32)
            .text("Model Score");

        var subtexty = scoregraph.append("text")
            .attr("text-anchor", "start")
            .attr("y", 0)
            .attr("x", -subwidth / 2.5)
            .attr("dy", "-4em")
            .attr("transform", "rotate(-90)");

        subx.append("rect")
            .attr("class", "Vband1")
            .style("fill", "red")
            .style("opacity", "0.5")
            .attr("width", 8)
            .attr("height", (y2(80000)))
            .attr("transform", "translate(0, " + (-y2(0)) + ")");

        subx.append("rect")
            .attr("class", "Vband2")
            .style("fill", "yellow")
            .style("opacity", "0.5")
            .attr("width", 8)
            .attr("height", (y2(80000)))
            .attr("transform", "translate(0, " + (-y2(20000)) + ")");

        subx.append("rect")
            .attr("class", "Vband3")
            .style("opacity", "0.5")
            .style("fill", "green")
            .attr("width", 8)
            .attr("height", (y2(40000)))
            .attr("transform", "translate(0, " + (-y2(40500)) + ")");

        subx.append("rect")
            .attr("class", "Hband1")
            .style("fill", "red")
            .style("opacity", "0.5")
            .attr("width", (x2(200)))
            .attr("height", 8)
            .attr("transform", "translate(0, -8)");

        subx.append("rect")
            .attr("class", "Hband2")
            .style("fill", "yellow")
            .style("opacity", "0.5")
            .attr("width", (x2(200)))
            .attr("height", 8)
            .attr("transform", "translate(" + (x2(200)) + " , -8)");

        subx.append("rect")
            .attr("class", "Hband3")
            .style("fill", "green")
            .style("opacity", "0.5")
            .attr("width", (x2(600)))
            .attr("height", 8)
            .attr("transform", "translate(" + (x2(400)) + " , -8)");

        scoregraph.append("line")
            .attr("class", "bacon-line")
            .attr("y2", subheight / 1.4)
            .attr("transform", "translate(" + (x2(200)) + "," + subheight / 3.5 + ")");

        scoregraph.append("line")
            .attr("class", "bacon-line")
            .attr("y2", subheight / 1.4)
            .attr("transform", "translate(" + (x2(400)) + "," + subheight / 3.5 + ")");

        var circle = scoregraph.append("circle")
            .attr("r", 5)
            .style("fill", "red");

        // Scrubber Flag stuff

        var popover = focus.append("g")
            .attr("transform",
                "translate(0, -50 )");

        var dayhat = focus.append("g")
            .attr("transform",
                "translate(-85, -70 )");

        dayhat.append("rect")
            .attr("class", "dayhat")
            .style("fill", "#383838")
            .attr("width", 170)
            .attr("height", 20)
            .attr("ry", 1);

        dayhat.append("rect")
            .attr("class", "dayhat")
            .style("fill", "white")
            .attr("width", 170)
            .attr("height", 2)
            .attr("transform",
                "translate(0, 21 )");

        popover.append("rect")
            .attr("class", "popup")
            .style("fill", "#666666")
            .attr("width", 170)
            .attr("height", 80)
            .attr("ry", 1)
            .attr("transform",
                "translate(-85, 0 )");

        dayhat.append("circle")
            .attr("r", 6)
            .attr("cx", 156)
            .attr("cy", 10)
            .style("fill", "#085C9B")
            .style("opacity", 0)
            .style("pointer-events", "none");

        var opengraph = dayhat.append("svg:image")
            .attr("xlink:href", "info.svg")
            .attr("width", 12)
            .attr("height", 12)
            .attr("x", 150)
            .attr("y", 5)
            .style("cursor", "pointer")
            .on("mouseenter", function() {
                dayhat.select("circle")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
            })
            .on("mouseleave", function() {

                dayhat.select("circle")
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
            })
            .on("click", function() {
                if (allon == false) {

                    var active = d3.select(".tooltip")
                        .classed("active");

                    if (active == false) {
                        focus.select(".tooltip")
                            .classed("active", true)
                            .style("display", "block")
                            .attr("transform", "translate(0 , -30 )scale(0, .4)")
                            .transition()
                            .delay(500)
                            .duration(600)
                            .attr("transform", "translate(-" + (subwidth - 60) / 2 + ", 2 )scale(1, 1)");
                    }
                }

                opengraph.attr("display", "none");
                closegraph.attr("display", "block");
                popover.transition()
                    .duration(500)
                    .attr("transform", "translate(0,-46)scale(0, 1)");
            });

        var closegraph = dayhat.append("svg:image")
            .attr("xlink:href", "lessinfo.svg")
            .attr("width", 12)
            .attr("height", 12)
            .attr("x", 150)
            .attr("y", 5)
            .style("cursor", "pointer")
            .attr("display", "none")
            .on("mouseenter", function() {
                dayhat.select("circle")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
            })
            .on("mouseleave", function() {

                dayhat.select("circle")
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
            })
            .on("click", function() {

                focus.select(".tooltip")
                    .classed("active", false)
                    .transition()
                    .duration(600)
                    .attr("transform", "translate(0 , -46 )scale(0, .4)")
                    .transition()
                    .style("display", "none");

                popover.transition()
                    .delay(600)
                    .duration(500)
                    .attr("transform", "translate(0,-46)scale(1, 1)");

                opengraph.attr("display", "block");
                closegraph.attr("display", "none");

            });

        popover.append('path')
            .attr("d", "M 50,5 95,97.5 5,97.5 z")
            .style("fill", "#666666")
            .attr("transform",
                "translate(25, 87) rotate(180) scale(.5 , .2)");

        var selecteddate = dayhat.append("text")
            .text("########")
            .attr("transform",
                "translate(80, 15 )")
            .attr("class", "selected-date")
            .attr("text-anchor", "middle");

        var selectedvalue = popover.append("text")
            .text("########")
            .attr("transform",
                "translate(65, 25 )")
            .attr("class", "selected-value")
            .attr("text-anchor", "end");

        popover.append("text")
            .text("Estimate:")
            .attr("transform",
                "translate(-65, 25 )")
            .attr("class", "selected-value")
            .attr("text-anchor", "start");

        var selectedcaldate = popover.append("text")
            .text("########")
            .attr("transform",
                "translate(65, 45 )")
            .attr("class", "selected-caldate")
            .attr("text-anchor", "end");

        popover.append("text")
            .text("Date:")
            .attr("transform",
                "translate(-65, 45 )")
            .attr("class", "selected-caldate")
            .attr("text-anchor", "start");

        var selectedscore = popover.append("text")
            .text("########")
            .attr("transform",
                "translate(65, 65 )")
            .attr("class", "selected-score")
            .attr("text-anchor", "end");

        popover.append("text")
            .text("Score:")
            .attr("transform",
                "translate(-65, 65 )")
            .attr("class", "selected-score")
            .attr("text-anchor", "start");

        function handleClick(chosen, d, i) {

            intersection.style("display", "initial");

            if (isdeltachosen == false) {
                globald = data[data.length - 1];
                showDelta(data);
            }

            deltaflag();

            d3.selectAll(".chosen")
                .classed("chosen", false);

            d3.selectAll(".ylabel")
                .style("display", "initial");

            d3.select(".maingraph")
                .style("cursor", "ew-resize");

            if (globalindex == data.length - 1) {
                d3.select("#focus")
                    .style("display", "none");
            } else {
                d3.select("#focus")
                    .style("display", "block");
            }

            alllabel.style("display", "block");

            focus.selectAll(".scoreflag")
                .style("display", "block");

            sevlines.style("display", "block");

            d3.selectAll(".area")
                .transition()
                .duration(100)
                .style("opacity", 0);
            d3.select("#" + d)
                .select(".area")
                .transition()
                .duration(100)
                .style("opacity", 1);

            d3.selectAll(".line")
                .transition()
                .duration(100)
                .style("opacity", .3);
            d3.select("#" + d)
                .select(".line")
                .classed("chosen", true)
                .transition()
                .duration(100)
                .style("opacity", 1);

            d3.selectAll(".yaxis")
                .style("display", "none");
            d3.select(".yaxis" + (i + 1))
                .style("display", "initial");

            d3.selectAll(".yaxis")
                .selectAll(".tick")
                .style("display", "none");
            d3.select(".yaxis" + (i + 1))
                .selectAll(".tick")
                .style("display", "initial");

            d3.selectAll(".linelabel")
                .transition()
                .duration(100)
                .style("opacity", .3)
                .style("fill", "grey");
            d3.select(".linelabel" + (i + 1))
                .classed("chosen", true)
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("fill", colors[i]);

            todayflag.style("display", "block");

            allon = false;

            selectedmodel = d;

            intersection.select("circle")
                .style("display", "block")
                .style("stroke", "#b7b7b7");

            d3.selectAll(".suby")
                .remove();

            if (selectedmodel == "Model1") {

                d3.selectAll(".reserve")
                    .style("display", "initial");

                // Add the subyaxis
                scoregraph.append("g")
                    .attr("class", "suby suby1")
                    .call(yAxis2.ticks(10)
                        .tickFormat(function(s) {
                            return "$" + ks(s)
                        }));

                //define the scoreflags
                high = 100;
                med = 150;
                low = 250;

            } else {
                d3.selectAll(".reserve")
                    .style("display", "none");
            }

            if (selectedmodel == "Model2") {
                scoregraph.append("g")
                    .attr("class", "suby suby2")
                    .call(yAxis2.ticks(10)
                        .tickFormat(function(s) {
                            return "$" + percent(s / 100000)
                        }));

                //define the scoreflags
                high = 200;
                med = 300;
                low = 400;

            }

            if (selectedmodel == "Model3") {
                scoregraph.append("g")
                    .attr("class", "suby suby3")
                    .call(yAxis2.ticks(10)
                        .tickFormat(function(s) {
                            return "$" + ks(s / 30)
                        }));

                //define the scoreflags
                high = 180;
                med = 260;
                low = 350;

            }

            //add the scorepoints

            highline.attr("transform", "translate(0, " + high + ")");
            medline.attr("transform", "translate(0, " + med + ")");
            lowline.attr("transform", "translate(0, " + low + ")");

            highscore.attr("transform", "translate(0, " + high + ")");
            medscore.attr("transform", "translate(0, " + med + ")");
            lowscore.attr("transform", "translate(0, " + low + ")");

            // Add the scoreline path.
            d3.selectAll(".subline")
                .remove();

            scoregraph.append("path")
                .data([scores])
                .attr("class", "subline")
                .attr("d", draw_scoreline(selectedmodel, scores))
                .style("stroke", "grey")
                .style("fill", "none");

            subtexty
                .text(selectedmodel);

            todayestimate.text("Estimate: \xa0" + commas(data[data.length - 1][d]));
            todayscore.text("Score: \xa0" + commas(y(data[data.length - 1][d])));

            //if already chosen, all graphs on

            if (chosen == true) {
                defaultgraph();
            }
        }

        function clickDebounce(d) {

            svg2.selectAll(".priority")
                .style("opacity", .3);

            svg2.selectAll(".priority" + globald.priority)
                .style("opacity", 1);

            selectedcaldate.text(globald.cal);

            selectedscore.text(commas(y(globald[d])));

            selecteddate.text("Day: \xa0\xa0     " + globald.date);

            var clicked = x.invert(d3.mouse(d3.select(".capture")
                .node())[0]);
            if (clicked < globald.date) {
                selectedvalue.text("$" + commas(data[globalindex][d]));
                intersection
                    .attr("transform",
                        "translate(0 , " + y(data[globalindex][d]) + ")");
            }

            if (clicked > globald.date) {
                selectedvalue.text("$" + commas(data[globalindex - 1][d]));
                intersection
                    .attr("transform",
                        "translate(0 , " + y(data[globalindex - 1][d]) + ")");
            }
        }

        function handleHover(d, i) {

            d3.select(".linelabel" + (i + 1))
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("fill", colors[i]);

            d3.select("#" + d)
                .select(".line")
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("stroke", colors[i]);
        }

        function handleLeave(chosen, d, i) {

            if (chosen == false) {
                var label = d3.select(".linelabel" + (i + 1))
                    .transition()
                    .duration(100)
                    .style("opacity", .3);

                if (allon == false) {
                    d3.select("#" + d)

                        .select(".line")
                        .transition()
                        .duration(100)
                        .style("opacity", .3)
                        .style("stroke", "grey");

                    label.transition()
                        .duration(100)
                        .style("fill", "grey");
                }
            }
        }

        function mousemove() {

            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectdata(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            var value = d[selectedmodel];

            globalindex = i;
            globald = d;

            //move scrubber

            svg.select("#focus")
                .attr("transform",
                    "translate(" + (x(d.date)) + ", 0)");

            //move intersection
            if (allon == false) {

                if (globalindex == data.length - 1) {
                    d3.select("#focus")
                        .style("display", "none");
                } else {
                    d3.select("#focus")
                        .style("display", "block");
                }

                deltaflag();

                selecteddate.text("Day: \xa0\xa0     " + d.date);

                selectedvalue.text("$" + commas(value));

                selectedcaldate.text(d.cal);

                intersection
                    .attr("transform",
                        "translate(0 , " + y(value) + ")");

                // red dot mover 
                var model = d[selectedmodel];
                var modelscore = y(model);

                var j = bisectscore(scores, modelscore, 1),
                    s0 = scores[j - 1],
                    s1 = scores[j],
                    s = modelscore - s0.score > s1.score - modelscore ? s1 : s0;

                selectedscore.text(commas(modelscore));

                circle.attr("transform",
                    "translate(" + (x2(s.score)) + "," + (y2(s[selectedmodel])) + ")");
            }

            //use cursor position to illuminate upper chart sections

            if (allon == false) {
                var priority = d.priority;

                svg2.selectAll(".priority")
                    .style("opacity", .3);

                svg2.selectAll(".priority" + d.priority)
                    .style("opacity", 1);
            }
        }

        function showDelta(data) {

            d3.select("#graph5")
                .selectAll("table")
                .remove();
            d3.select("#graph5")
                .selectAll("text")
                .remove();

            if (globald == data[data.length - 1]) {
                d3.select("#graph5")
                    .append("text")
                    .text("Delta View: Today")
                    .attr("class", "deltalabel");
            } else {
                d3.select("#graph5")
                    .append("text")
                    .text("Delta View: \xa0Day\xa0" + globald.date)
                    .attr("class", "deltalabel");
            }

            var chartWidth = "200px";

            //Dummy data
            var data = [
                ["Total Payments", 0.040, -0.040],
                ["Open Recovery Reserves", 0.008, -0.008],
                ["Available Reserves", 0.030, -0.030],
                ["Workload Weight", 0.004, -0.004],
                ["Segmentation Type", 0.047, -0.047],
                ["Influence 6", -0.02, 0.02],
                ["Influence 7", 0.001, -0.001],
                ["Influence 8", -0.004, 0.004],
                ["Influence 9", -0.002, 0.002]
            ];

            // Setup the scale for the values for display, use abs max as max value
            var x = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) {
                    return Math.abs(d[1]);
                })])
                .range(["0%", "95%"]);

            var table = d3.select("#graph5")
                .append("table");
            var thead = table.append("thead");
            var tbody = table.append("tbody");

            var th = thead.append("tr");

            //table header
            th.selectAll("th")
                .data(["Influence \n (Current Score)", "Factor", "Current Value", "Previous Value", "Influence \n (Change From Previous)"])
                .enter()
                .append("th")
                .attr("class", "header")
                .text(function(d) {
                    return d
                });

            // Create a table with rows and bind a data row to each table row

            var tr = tbody.selectAll("tr.data")
                .data(data)
                .enter()
                .append("tr")
                .attr("class", "datarow");

            // Set the even columns
            d3.selectAll(".datarow")
                .filter(":nth-child(even)")
                .attr("class", "datarow even")

            // Create a column at the beginning of the table for the chart 
            var chart1 = tr.append("td")
                .attr("class", "chart")
                .attr("width", chartWidth);

            // Create the name column
            tr.append("td")
                .attr("class", "data name")
                .text(function(d) {
                    return d[0]
                });

            // Create the  value columns
            tr.append("td")
                .attr("class", "data value")
                .text(function(d) {
                    return "######"
                })

            tr.append("td")
                .attr("class", "data value")
                .text(function(d) {
                    return "######"
                })

            // // Create a column at the end of the table for the chart
            var chart2 = tr.append("td")
                .attr("class", "chart")
                .attr("width", chartWidth);

            // Create the div structure of the chart
            chart1.append("div")
                .attr("class", "container1")
                .append("div")
                .attr("class", "positive1");
            chart1.append("div")
                .attr("class", "container1")
                .append("div")
                .attr("class", "negative1");

            chart2.append("div")
                .attr("class", "container2")
                .append("div")
                .attr("class", "positive2");
            chart2.append("div")
                .attr("class", "container2")
                .append("div")
                .attr("class", "negative2");

            // Creates the positive div bar #1
            tr.select("div.positive1")
                .style("height", "45%")
                .style("width", "0%")
                .transition()
                .duration(500)
                .style("width", function(d) {
                    return d[1] > 0 ? x(d[1]) : "0%";
                });

            // Creates the negative div bar #1
            tr.select("div.negative1")
                .style("height", "45%")
                .style("width", "0%")
                .transition()
                .duration(500)
                .style("width", function(d) {
                    return d[1] > 0 ? "0%" : x(Math.abs(d[1]));
                });

            // Creates the positive div bar #2
            tr.select("div.positive2")
                .style("height", "45%")
                .style("width", "0%")
                .transition()
                .duration(500)
                .style("width", function(d) {
                    return d[2] > 0 ? x(d[2]) : "0%";
                });

            // Creates the negative div bar #2
            tr.select("div.negative2")
                .style("height", "45%")
                .style("width", "0%")
                .transition()
                .duration(500)
                .style("width", function(d) {
                    return d[2] > 0 ? "0%" : x(Math.abs(d[2]));
                });

        }

        function deltaflag() {

            myVar && clearTimeout(myVar);
            clickme.style("opacity", 0);
            clickme.select("rect")
                .attr("width", "0");
            myVar = setInterval(function() {

                clickme.transition()
                    .duration(200)
                    .style("opacity", 1);

                clickme.select("rect")
                    .transition()
                    .duration(200)
                    .attr("width", "60");
            }, 2000);
        }

        function defaultgraph(d, i) {

            d3.select("#graph5")
                .selectAll("table")
                .remove();
            d3.select("#graph5")
                .selectAll("text")
                .remove();

            todayflag.style("display", "none");

            d3.selectAll(".chosen")
                .classed("chosen", false);

            d3.selectAll(".ylabel")
                .style("display", "none");

            d3.selectAll(".scoreflag")
                .style("display", "none");

            d3.select("#focus")
                .style("display", "none");

            d3.select(".maingraph")
                .style("cursor", "default");

            svg2.selectAll(".priority")
                .style("opacity", 1);

            alllabel.style("display", "none");

            intersection.style("display", "none");

            sevlines.style("display", "none");

            svg.selectAll(".deltapoint")
                .remove();

            d3.selectAll(".area")
                .transition()
                .duration(100)
                .style("opacity", 1);

            d3.selectAll(".yaxis")
                .style("display", "initial");
            d3.selectAll(".yaxis")
                .selectAll(".tick")
                .style("display", "initial");

            popover.attr("transform", "translate(0,-50)scale(1, 1)");
            tooltip.attr("transform", "translate(0,-50)scale(1, 1)");

            models.forEach(function(d, i) {
                d3.select("#" + d)
                    .select(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("stroke", colors[i]);

                d3.select(".linelabel" + (i + 1))
                    .transition()
                    .duration(100)
                    .style("opacity", .3)
                    .style("fill", colors[i]);
            });

            d3.selectAll(".reserve")
                .style("display", "none");

            tooltip.style("display", "none")
                .classed("active", false);

            allon = true;
            isdeltachosen = false;
        }
    });