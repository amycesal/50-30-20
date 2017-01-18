// declare global variables
var w, h, allScenarios, data, dataExplain, dataIncome, dataIdeal, dataNeeds, dataActual, decileSelected;

// get page width and store in global variable for graph sizing
w = d3.select("div.row").node().getBoundingClientRect().width - 30; 


// ******************
// *** DATA SETUP ***
// ******************

d3.csv("csv/data.csv", function(error, csv) {  
  if (error) throw error;
  // read numerical values as numbers not strings 
  csv.forEach(function(d){ d['income'] = +d['income']; });        // kludgy...
  csv.forEach(function(d){ d['takehome'] = +d['takehome']; });
  csv.forEach(function(d){ d['housing'] = +d['housing']; });
  csv.forEach(function(d){ d['health'] = +d['health']; });
  csv.forEach(function(d){ d['grocery'] = +d['grocery']; });
  csv.forEach(function(d){ d['transit'] = +d['transit']; });
  csv.forEach(function(d){ d['childcare'] = +d['childcare']; });
  csv.forEach(function(d){ d['fifty'] = +d['fifty']; });
  csv.forEach(function(d){ d['thirty'] = +d['thirty']; });
  csv.forEach(function(d){ d['twenty'] = +d['twenty']; });
  csv.forEach(function(d){ d['population'] = +d['population']; });
  csv.forEach(function(d){ d['difference'] = +d['difference']; });
  csv.forEach(function(d){ d['inc0'] = +d['inc0']; });
  csv.forEach(function(d){ d['inc1'] = +d['inc1']; });
  csv.forEach(function(d){ d['inc2'] = +d['inc2']; });
  csv.forEach(function(d){ d['inc3'] = +d['inc3']; });
  csv.forEach(function(d){ d['inc4'] = +d['inc4']; });
  csv.forEach(function(d){ d['inc5'] = +d['inc5']; });
  csv.forEach(function(d){ d['inc6'] = +d['inc6']; });
  csv.forEach(function(d){ d['inc7'] = +d['inc7']; });
  csv.forEach(function(d){ d['inc8'] = +d['inc8']; });
  csv.forEach(function(d){ d['inc9'] = +d['inc9']; });
  csv.forEach(function(d){ d['decile'] = +d['decile']; });

  data = csv; // pass csv values to the global 'data' object
  allScenarios = csv; // also pass them to this object that -doesn't- get changed in scenario setup

  console.log(data);
  init();

});

function setScenario() {
  var selected = {};
  selected.city = "Detroit, MI";
  selected.household = "1 adult";
  // select data row based on value
  for (i=0;i<data.length;i++) {
    if (data[i].city == selected.city) {
      if (data[i].household == selected.household) {
        data = data[i];   // reduce data object to selected row
        console.log(data);
      }
    }
  }
}

// assumes a data object reduced to single scenario (post setScenario)
function setProps() {
  data.difference = data.income - 23850; // TODO: this number is diff for different household sizes
  data.fifty = Math.round(data.takehome * 0.5);
  data.thirty = Math.round(data.takehome * 0.3);
  data.twenty = Math.round(data.takehome * 0.2);
  data.needs = data.housing + data.health + data.grocery + data.transit + data.childcare;
  data.lo = data.takehome - data.needs;
  data.lowants = Math.round(data.lo * 0.6);
  data.losaves = Math.round(data.lo * 0.4);
  data.needsperc = Math.round((data.needs / data.takehome)*100);
  data.wantsperc = Math.round((data.lowants / data.takehome)*100);
  data.savesperc = Math.round((data.losaves / data.takehome)*100);
  data.overneeds = Math.round(data.needs - data.fifty);
  data.overneedsperc = Math.round(data.needsperc-50);
};


// ********************
// *** MISC HELPERS ***
// ********************

// update various display numbers with the correct values for selected scenario
function addNumbers() {
  $('span.population').html(numberWithCommas(data.population));
  $('span.incomeannual').html(numberWithCommas(data.income));
  $('span.overneeds').html(numberWithCommas(data.overneeds));
  $('span.overneedsperc').html(data.overneedsperc);
}

// add commas to display numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



// ********************
// *** CONTROL FLOW ***
// ********************

// runs on completion of data load
function init() {
  drawTitle();
  drawExplain();
}

// runs on user selection of scenario
function runScenario() {
  setScenario();
  setProps();
  drawIdeal();
}

// **********************
// *** DRAW FUNCTIONS ***
// **********************

function drawTitle() {

  var h = 40; 

  dataIntro = [
    {needs: 50, wants: 30, saves: 20}
  ];

  var stack = d3.stack()
    .keys(["needs", "wants", "saves"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataIntro); 

  var svg = d3.select(".graph-title")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  var groups = svg.selectAll("g")
    .data(dataset)
    .enter().append("g")
    .style("fill", function(d, i) {                  
      var fillColor;                                  
        if (i == 0) { fillColor = "#65B68A";}         // mint
        else if (i == 1) { fillColor = "#297676";}    // teal
        else if (i == 2) { fillColor = "#0C3758";}    // blue
      return fillColor;      
    });

  var yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, w]);

  var loopTrack = 0;

  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d[0]); })
      .attr("y", 0)
      .attr("height", h)
      .attr("width", 0)
    .transition()
      .delay(function(d, i) {++loopTrack; return (loopTrack-1)*1400; }) 
      .duration(1200)
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]) });

}


function drawExplain() {

  var h = 100; 
  var lineHeight = 100;  // height of solid lines

  dataIntro = [
    {needs: 50, wants: 30, saves: 20}
  ];

  var stack = d3.stack()
    .keys(["needs", "wants", "saves"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataIntro); 

  var yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, w]);

  // create SVG element
  var svg = d3.select("#graph-explain")
        .append("svg")
        .attr("class", "explainer")
        .attr("width", w)        
        .attr("height", h);   

  // add a group for each row of data
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter().append("g")
    .style("fill", function(d, i) {                  
      var fillColor;                                  
        if (i == 0) { fillColor = "#65B68A";}         // mint
        else if (i == 1) { fillColor = "#297676";}    // teal
        else if (i == 2) { fillColor = "#0C3758";}    // blue
      return fillColor;      
    });

  var loopTrack = 0;

  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d[0]); })
      .attr("y", 0)
      .attr("height", h)
      .attr("width", 0)
    .transition()
      .delay(function(d, i) {++loopTrack; return (loopTrack-1)*1400; }) 
      .duration(1200)
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]) })
      .on("end", fadeInText);

  // draw a line over the start of each rect
  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
    .attr("y1", 0) 
    .attr("y2", h) 
    .attr("x1", function(d) { return yScale(d[0]); })
    .attr("x2", function(d) { return yScale(d[0]); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // add the last line at the end of the graph
  svg.append("line") 
    .attr("y1", 0) 
    .attr("y2", h) 
    .attr("x1", w-2)
    .attr("x2", w-2) 
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // fix the position of the first line of the graph
  var lineFix = svg.select('line')
    .attr('transform', 'translate(2,0)');

  var count = 0;
  function fadeInText() {
    count++;
    switch(count) {
      case 1:
        $(".explain-50").animate( { opacity: 1 }, 600);
        break;
      case 2:
        $(".explain-30").animate( { opacity: 1 }, 600);
        break;
      case 3:
        $(".explain-20").animate( { opacity: 1 }, 600);
        $(".explain-question").delay(600).animate( { opacity: 1 }, 600)
        break;
    }
  }

}


function drawIdeal() {

  var barHeight = 100; 
  var lineHeight = 220;  // height of solid lines

  dataIdeal = [
    { needs: data.fifty, wants: data.thirty, saves: data.twenty }
  ];

  var stack = d3.stack()
    .keys(["needs", "wants", "saves"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataIdeal);

  console.log(dataset);

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset[dataset.length - 1], function(d) { return d[1]; }) ])
    .range([0, w]);
  
  // create SVG element
  var svg = d3.select("#graph-ideal")
        .append("svg")
        .attr("class", "graph")
        .attr("width", w)        
        .attr("height", lineHeight);   // +120 is to open up vertical space for annotation

  // add a group for each row of data
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter().append("g")
    .style("fill", function(d, i) {                  
      var fillColor;                                  
        if (i == 0) { fillColor = "#65B68A";}         // yellow
        else if (i == 1) { fillColor = "#297676";}    // orange
        else if (i == 2) { fillColor = "#0C3758";}    // red
      return fillColor;      
    });

  var loopTrack = 0;

  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d[0]); })
      .attr("y", 0)
      .attr("height", barHeight)
      .attr("width", 0)
    .transition()
      .delay(function(d, i) {++loopTrack; return (loopTrack-1)*1400; }) 
      .duration(1200)
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]) });

  // draw a line over the start of each rect
  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
    .attr("y1", 0) 
    .attr("y2", lineHeight) 
    .attr("x1", function(d) { return yScale(d[0]); })
    .attr("x2", function(d) { return yScale(d[0]); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // add the last line at the end of the graph
  svg.append("line") 
    .attr("y1", 0) 
    .attr("y2", lineHeight) 
    .attr("x1", w-2)
    .attr("x2", w-2) 
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // fix the position of the first line of the graph
  var lineFix = svg.select('line')
    .attr('transform', 'translate(2,0)');

  var textLabels1 = {};
    textLabels1.needs = "50%";
    textLabels1.wants = "30%";
    textLabels1.saves = "20%";

  var textLabels2 = {};
    textLabels2.needs = "Needs:";
    textLabels2.wants = "Wants:";
    textLabels2.saves = "Saves:";


  // add label line 1
  var textLabelOne = svg.selectAll() 
    .data(dataset)
    .enter().append("text")
    .attr("class", "graph-label")
    .style("font-weight", 700)
    .attr("fill", "#231f20")
    .attr("dx", function(d) { return yScale(d[0][0])+10; })  // position horizontally
    .attr("dy", "60")                                     // position vertically
    .text(function(d,i) { return d.key; });


}


function drawActual() {

  var dataset = dataActual;
  var h = 100; 
  var barOffset = 160;

  // reset scales 
  var xScale = d3.scale.ordinal()
    .domain(d3.range(dataset[0].length))
    .rangeRoundBands([0, h]);

  var yScale = d3.scale.linear()
    .domain([0,       
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      })
    ])
    .range([0, w]);

  // create SVG element
  var svg = d3.select("#graph-actual")
        .append("svg")
        .attr("class", "graph ok")
        .attr("width", w)         
        .attr("height", h+240);   // +240 opens up vertical space for annotation

  // add a group for each row of data
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter().append("g")
    .style("fill", function(d, i) {                   
      var fillColor;                                  
        if (i == 0) { fillColor = "#65B68A";}         // yellow
        else if (i == 1) { fillColor = "#297676";}    // orange
        else if (i == 2) { fillColor = "#0C3758";}    // red
      return fillColor;      
    });

  // add a rect for each data value
  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d.y0); })
      .attr("y", barOffset)    // set vertical position of bar inside svg
      .attr("class", "actual-rect")    // set vertical position of bar inside svg
      .attr("width", 0)
      .attr("height", xScale.rangeBand());

    d3.selectAll("#graph-actual rect")
      .transition()
        .delay(function(d, i) {return (i+0.5) * 1600;}) 
        .duration(1200)
        .attr("width", function(d) { 
          if (yScale(d.y) <= 0) {return 0;}
          else {return yScale(d.y);}
        })
        .each("end", getVerdict);

  // draw a line over the start of every rect
  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
    .attr("x1", function(d) { return yScale(d.y0); }) 
    .attr("x2", function(d) { return yScale(d.y0); })        
    .attr("y1", barOffset)  // top of line
    .attr("y2", barOffset+h)  
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // fix the position of the first line of the graph
  var lineFix = svg.selectAll('line'); 
  lineFix.first()
    .attr('transform', 'translate(2,0)');

  // add the last line at the end of the graph
  svg.append("line")
    .attr("x1", w-2) 
    .attr("x2", w-2) 
    .attr("y1", barOffset) 
    .attr("y2", barOffset+h) 
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  var dashedHeight = 80;

  // add dashed lines
  svg.append("line")
    .attr("y1", barOffset-60)   // 60 extends dashed line above bar
    .attr("y2", barOffset+140) // 240 extends dashed line to bottom of svg
    .attr("x1", 2) 
    .attr("x2", 2) 
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // second dashed line
  svg.append("line")
    .attr("y1", barOffset-60)   // 60 extends dashed line above bar
    .attr("y2", barOffset+140) // 240 extends dashed line to bottom of svg
    .attr("x1", function(d) { return yScale(data.fifty); })
    .attr("x2", function(d) { return yScale(data.fifty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // third dashed line
  svg.append("line")
    .attr("y1", barOffset-60)   // 60 extends dashed line above bar
    .attr("y2", barOffset+140) // 240 extends dashed line to bottom of svg
    .attr("x1", function(d) { return yScale(data.fifty) + yScale(data.thirty); })
    .attr("x2", function(d) { return yScale(data.fifty) + yScale(data.thirty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // fourth dashed line
  svg.append("line")
    .attr("y1", barOffset-60)   // 60 extends dashed line above bar
    .attr("y2", barOffset+140) // 240 extends dashed line to bottom of svg
    .attr("x1", w-2)
    .attr("x2", w-2)
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // add label line 1
  var textLabelOne = groups.selectAll("text") // TODO: need to separate bold and reg trext via tspans
    .data(function(d) { return d; })
    .enter().append("text")
      .attr("class", "actual-label")
      .style("font-weight", 700)
      .attr("fill", "#231f20")
      .attr("dx", function(d) { return yScale(d.y0)+10; })    // position horizontally
      .attr("dy", barOffset - 60)                             // position vertically
      .text(function(d) { return d.t1; });

  var textLabelTwo = d3.selectAll(".actual-label")
    .append("tspan")
    .style("font-weight", 400)
    .text(function(d) { return "% " + d.t2 });

  // add label line 2
  var textLabelThree = d3.selectAll(".actual-label")
    .append("tspan")
    .attr("class", "labelThree")
    .attr("x", function(d) { return yScale(d.y0)+10; })
    .attr("dy", 36)
    .style("font-weight", 400)
    .text(function(d) { return "$" + d.y });

  // if needs exceed takehome, move wants and saves labels to their fallback positions
  if (data.lowants <= 0) {
    d3.selectAll('text.actual-label')
      .attr('dx', function(d,i) {
        if (i > 0) {return (yScale(d.y0)+10)-(i*200);}
        else {return yScale(d.y0)+10;}
      });
    d3.selectAll('tspan.labelThree')
      .attr('x', function(d,i) {
        if (i > 0) {return (yScale(d.y0)+10)-(i*200);}
        else {return yScale(d.y0)+10;}
      });
  }
  // otherwise check for overlap etc. and display as normal
  else {arrangeLabels();}

}


function drawNeeds() {

  var graphOffset = 60;
  var h = 100; 
  var dataset = dataNeeds;

  var xScale = d3.scale.ordinal()              
    .domain(d3.range(dataset[0].length))
    .rangeRoundBands([0, h]); 

  var yScale = d3.scale.linear()               
    .domain([0,
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      })
    ])
    .range([0, w]); 

  // create new svg element
  var svg = d3.select("#graph-needs")
    .append("svg")
    .attr("class", "graph")
    .attr("width", w)
    .attr("height", h+120);    

  // add background rect
  svg.append("rect")
    .attr("x", 0) 
    .attr("y", graphOffset) 
    .attr("width", function(d) { return yScale(data.lo + data.needs); })
    .attr("height", xScale.rangeBand())
    .style("fill", "#e8e8e8")
    .style("fill-opacity", 1);

  // add a group for each row of data
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter().append("g");

  // add a rect for each data value
  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d.y0); })
      .attr("y", function(d, i) { return xScale(i) + graphOffset; })  
      .attr("class", "needs-rect")    
      .attr("width", 0)
      .attr("height", xScale.rangeBand())
      .style("fill", "url(#diagonal-stripe-2)");

  // transition first rect into view - subsequent rects handled via stepper, below / outside main draw function
  d3.select("rect.needs-rect")
    .transition()
    .delay(800)
    .duration(1200)
    .attr("width", function(d) { return yScale(d.y); });

  // add a label to each row, indicating which value (housing, healthcare etc.) is being added to the cumulative total
  var textLabelOne = groups.selectAll("text")
    .data(function(d) { return d; })
    .enter().append("text")
      .attr("x", function(d) { return yScale(d.y0)+4; })      // value adjusts horizontal position of labels
      .attr("y", function(d, i) { return xScale(i)+48; })     // value adjusts vertical position of labels
      .attr("fill", "#231f20")
      .attr("class", "needs-label")
      .style("opacity", "0")
      .text(function(d) { 
        if (d.section != null) { return d.section; } // only add label if 'section' exists in the object
        else { return null; }                        // TODO: destroy the text element instead of return null
      });                              

  // add dollar value to labels
  var textLabelTwo = d3.selectAll(".needs-label")
    .append("tspan")
    .style("font-weight", 700)
    .text(function(d) { return " +$" + numberWithCommas(d.y) });

    d3.select(".needs-label")
      .style("opacity", "1");

  // first dashed line - 50% of ideal budget
  svg.append("line")
    .attr("y1", graphOffset+h) 
    .attr("y2", graphOffset) 
    .attr("x1", function(d) { return yScale(data.fifty); })
    .attr("x2", function(d) { return yScale(data.fifty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // second dashed line - next 30% of ideal budget
  svg.append("line")
    .attr("y1", graphOffset+h) 
    .attr("y2", graphOffset) 
    .attr("x1", function(d) { return yScale(data.fifty) + yScale(data.thirty); })
    .attr("x2", function(d) { return yScale(data.fifty) + yScale(data.thirty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

}

// hide all step links in the "needs" section, except the first one
$(".step-link").css("display", "none");
$("#step1").css("display", "block");

// hide corresponding copy, except for the first 
$(".needs-copy").css("display", "none");
$("#needs-copy1").css("display", "block");

// hide replay button and next section button
$(".hidey").css("display", "none");

// listen for replay-cue click and reset needs section
d3.selectAll('.replaycue')
  .on('click', function() {
    // hide all step links in the "needs" section, except the first one
    $(".step-link").css("display", "none");
    $("#step1").css("display", "block");

    // hide corresponding copy, except for the first 
    $(".needs-copy").css("display", "none");
    $("#needs-copy1").css("display", "block");

    // hide replay button only
    $(".replay-box").css("display", "none");

    // reset needs visualization and redraw in initial state
    d3.select("#graph-needs svg").remove()
    drawNeeds();
});

function nextStep(step) {

  // set variables and scales, identical to code in drawNeeds()
  var graphOffset = 60;
  var h = 100; 
  var dataset = dataNeeds;

  var xScale = d3.scale.ordinal()              
    .domain(d3.range(dataset[0].length))
    .rangeRoundBands([0, h]); 

  var yScale = d3.scale.linear()               
    .domain([0,
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      })
    ])
    .range([0, w]); 

  // draw next rect
  d3.selectAll("rect.needs-rect")
    .style("fill", function(d, i) {
      if (i < step) {return "#65B68A";}
      else if (i == 5) {return "#e8e8e8";}
      else {return "url(#diagonal-stripe-2)";}
    })
    .transition().duration(800) // TODO: this only fires correctly on steps 1 and 2
      .attr("width", function(d, i) {
        if (i <= step) {return yScale(d.y);}
      });  

  // add next label
  d3.selectAll(".needs-label")
    .style("opacity", function(d,i) {
      if (i < step) {return "0";}
      else if (i == step) {return "1";}
      else {return "0";}
    });
}

// stepper functions, each is called by a different button in last graph. this is obviously a bashy way to do this.
function step1() {
  // hide step 1, display step 2
  $("#step2").css("display", "block");
  $("#needs-copy2").css("display", "block");
  nextStep(1);
  $("#step1").css("display", "none");
  $("#needs-copy1").css("display", "none");
}

function step2() {
  // hide step 2, display step 3
  $("#step3").css("display", "block");
  $("#needs-copy3").css("display", "block");
  nextStep(2);
  $("#step2").css("display", "none");
  $("#needs-copy2").css("display", "none");
}

function step3() {
  // hide step 3, display step 4
  $("#step4").css("display", "block");
  $("#needs-copy4").css("display", "block");
  nextStep(3);
  $("#step3").css("display", "none");
  $("#needs-copy3").css("display", "none");
}

function step4() {
  // hide step 4, display step 5
  $("#step5").css("display", "block");
  $("#needs-copy5").css("display", "block");
  nextStep(4);
  $("#step4").css("display", "none");
  $("#needs-copy4").css("display", "none");
}

function step5() {
  // hide stepper, show next section, show replay
  $(".hidey").css("display", "block");
  $("#step5").css("display", "none");
  $("#needs-copy5").css("display", "none");
}


function getVerdict() {
  if (data.needs > data.takehome) {
   setTimeout(function() {
      $(".verdict .icon").html("<img src='img/verdict-3.svg' />");
      $(".verdict .text")
      .html("Following 50-30-20 is <span class='red'>virtually impossible</span> in this situation. <span class='strong'>The average needs of this household exceed the income.</span> This harms the household’s ability to not only save for the future, but take care of their necessities.");
      $(".verdict").animate( { opacity: 1 }, 600);
    }, 3200);
  }
  else if (data.needs > data.fifty) {
    setTimeout(function() {
      $(".verdict .icon").html("<img src='img/verdict-2.svg' />");
      $(".verdict .text")
      .html("Following 50-30-20 <span class='red'>isn't possible</span> in this situation. The average needs of this household exceed 50% of the income by <span class='strong'>" + 
        data.overneedsperc + "%</span>, which reduces the ability for this household to save for the future.");
      $(".verdict").animate( { opacity: 1 }, 600);
    }, 3200);
  }
  else {
   setTimeout(function() {
      $(".verdict .icon").html("<img src='img/verdict-1.svg' />");
      $(".verdict .text")
      .html("Following 50-30-20 is <span class='yellow'>basically possible</span> in this situation. <span class='strong'>The average needs of this household are under 50%.</span> The household needs to stay within the average, and control their spending on their wants.");
      $(".verdict").animate( { opacity: 1 }, 600);
    }, 3200);
  }

}


// re-arrange labels to prevent overlap in Actual graph
function arrangeLabels() {

  var secondLabel = document.getElementsByClassName("actual-label")[1];
  var thirdLabel = document.getElementsByClassName("actual-label")[2];
  var secondLabelThirdLine = document.getElementsByClassName("labelThree")[1];
  var thirdLabelThirdLine = document.getElementsByClassName("labelThree")[2];

  var a = secondLabel.getBoundingClientRect();
  var b = thirdLabel.getBoundingClientRect();

  var secondX = d3.select(secondLabel).attr("dx");
  var secondY = d3.select(secondLabel).attr("dy");
  var secondThirdX = d3.select(secondLabelThirdLine).attr("x");

  var thirdX = d3.select(thirdLabel).attr("dx");
  var thirdY = d3.select(thirdLabel).attr("dy");
  var thirdThirdX = d3.select(thirdLabelThirdLine).attr("x");

  // detect overlap between second and third labels
  if((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) && 
     (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) { 

    d3.select(secondLabel)
      .attr("dx", secondX-208)
      .attr("dy", secondY-36);
    d3.select(secondLabelThirdLine)
      .attr("x", secondThirdX-208);

    d3.select(thirdLabel)
      .attr("dx", thirdX-104)
      .attr("dy", thirdY-72);
    d3.select(thirdLabelThirdLine)
      .attr("x", thirdThirdX-104);

    var thisLabel = secondLabel.getBBox();
    var thisRect = document.getElementsByClassName('actual-rect')[1].getBBox();
    var tspanWidth = document.getElementsByClassName('labelThree')[1].getComputedTextLength();

    // draw lines from 2nd label
    d3.select("svg.ok") // horizontal
      .append("line")
      .attr("x1", thisLabel.x + tspanWidth+10) 
      .attr("y1", 90)
      .attr("x2", thisRect.x + (thisRect.width / 2) + 2 ) 
      .attr("y2", 90) 
      .style("stroke-width", 4)
      .style("stroke", "#231f20")
      .style("fill", "none");

    d3.select("svg.ok") // vertical
      .append("line")
      .attr("x1", thisRect.x + (thisRect.width / 2) ) 
      .attr("y1", 90)
      .attr("x2", thisRect.x + (thisRect.width / 2) ) 
      .attr("y2", 140) 
      .style("stroke-width", 4)
      .style("stroke", "#231f20")
      .style("fill", "none");

    var thisLabel = thirdLabel.getBBox();
    var thisRect = document.getElementsByClassName('actual-rect')[2].getBBox();
    var tspanWidth = document.getElementsByClassName('labelThree')[2].getComputedTextLength();

    // draw lines from 3rd label
    d3.select("svg.ok") // horizontal
      .append("line")
      .attr("x1", thisLabel.x + tspanWidth+10) 
      .attr("y1", 54)
      .attr("x2", thisRect.x + (thisRect.width / 2) + 2 ) 
      .attr("y2", 54) 
      .style("stroke-width", 4)
      .style("stroke", "#231f20")
      .style("fill", "none");

    d3.select("svg.ok") // vertical
      .append("line")
      .attr("x1", thisRect.x + (thisRect.width / 2) ) 
      .attr("y1", 54)
      .attr("x2", thisRect.x + (thisRect.width / 2) ) 
      .attr("y2", 140) 
      .style("stroke-width", 4)
      .style("stroke", "#231f20")
      .style("fill", "none");
  }
}




// Income histogram for scenario selection

function drawIncome() {

  dataset = dataIncome;
  var width = 350; // d3.select("div.income").node().getBoundingClientRect().width - 30;
  var height = 100;
  var barPadding = 1;

  var yScale = d3.scale.linear()
    .domain([0, 25]) // use a constant > largest individual value across cities for upper bound of domain OR d3.max(dataset)...
    .range([0,height]);

  var svg = d3.select(".graph-income")
    .append("svg")
    .attr("width", width)
    .attr("height", height+20);

  svg.selectAll('rect')
    .data(dataset)
    .enter().append('rect')
    .attr('x', function(d,i) { return i * (width / dataset.length); })
    .attr('y', function(d) { return height - yScale(d); })
    .attr("width", width / dataset.length - barPadding)
    .attr("height", function(d) { return yScale(d); })
    .attr("fill", function(d, i) {
      if (i == decileSelected) { return "orange"; } // highlight the correct decile
      else { return "white"; }
    });

}







