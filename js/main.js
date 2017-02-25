// declare global variables
var w, h, screenHeight, allScenarios, data, dataExplain, dataIncome, dataIdeal, dataNeeds, dataActual, decileSelected, thisCity, thisHousehold;

var openSelection = 0;
var scenarioSelected = 0;
var drawTitleComplete = 0;

// get page width and store in global variable for graph sizing
w = d3.select("div.row").node().getBoundingClientRect().width - 30; 

// set whitespace between sections ugh
screenHeight = $( window ).height();
$(".scroll-box").css("margin-bottom", screenHeight/3.5 + "px");
$(".scenario").css("margin-bottom", screenHeight/3.5 + "px");
$(".footer").css("margin-top", screenHeight/4.5 + "px");


// ******************
// *** DATA SETUP ***
// ******************

d3.csv("csv/data.csv", function(error, csv) {  
  if (error) throw error;
  // read numerical values as numbers not strings 
  csv.forEach(function(d){ d['population'] = +d['population']; });
  csv.forEach(function(d){ d['area'] = +d['area']; });
  csv.forEach(function(d){ d['income'] = +d['income']; });       
  csv.forEach(function(d){ d['difference'] = +d['difference']; });
  csv.forEach(function(d){ d['takehome'] = +d['takehome']; });
  csv.forEach(function(d){ d['fifty'] = +d['fifty']; });
  csv.forEach(function(d){ d['thirty'] = +d['thirty']; });
  csv.forEach(function(d){ d['twenty'] = +d['twenty']; });
  csv.forEach(function(d){ d['housing'] = +d['housing']; });
  csv.forEach(function(d){ d['health'] = +d['health']; });
  csv.forEach(function(d){ d['grocery'] = +d['grocery']; });
  csv.forEach(function(d){ d['transit'] = +d['transit']; });
  csv.forEach(function(d){ d['childcare'] = +d['childcare']; });


  data = csv; // pass csv values to the global 'data' object
  allScenarios = csv; // also pass them to this object that -doesn't- get changed in scenario setup

  getUniques('city');      
  getUniques('household');
  getUniques('level');

  init();

});

// gathers unique values to populate dropdowns, drive scenario selection
function getUniques(dd) {
  var unique = {};
  var distinct = [];
  for (var i in data) {
    if (typeof(unique[data[i][dd]]) == "undefined" && data[i][dd] != null) {
      distinct.push(data[i][dd]);
    }
    unique[data[i][dd]] = 0;
  }
  $('#' + dd + ' option').each(function(i) {     // clear dropdown options
    if (i > 0) {
      $(this).remove();  
    }        
  });
  var option = '';
  for (var i = 0; i < distinct.length; i++) {   // populate dropdown with unique values
    option += '<option value="' + distinct[i] + '">' + distinct[i] + '</option>';
  }
  $('#' + dd).append(option);    
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

function displayEnd() {
  graphPositions[4].fired = 0;
  getPositions();
  $('html, body').animate({scrollTop: $("#sec-end").offset().top}, 1200);
  d3.select("#sec-end").transition().delay(0).duration(1200).style("opacity", 1);
}

function setButtons() {
  var colWidth = d3.select(".location").node().getBoundingClientRect().width;
  d3.selectAll(".runScenario").style("width", colWidth-30 + "px");
}

// scrollcues
d3.selectAll('.scrollcue')
  .on('click', function() {
    $('html, body').animate({
      scrollTop: $(this).parent().parent().parent().next(".row").offset().top}, 1200);
});

// kludge for last section
d3.selectAll('.scrollcue2')
  .on('click', function() {
    displayEnd(); // unhides last section before scroll
    $('html, body').animate({
      scrollTop: $(".end").offset().top}, 1200);
});


// ****************
// *** DISPATCH ***
// ****************

var dispatch = d3.dispatch("sec-explain", "sec-scenario", "sec-ideal", "sec-needs", "sec-end");

var graphPositions = [
  {name: "sec-explain", position: null, fired: 0},
  {name: "sec-scenario", position: null, fired: 0},
  {name: "sec-ideal", position: null, fired: 0},
  {name: "sec-needs", position: null, fired: 0},
  {name: "sec-end", position: null, fired: 0}
];

// track graph draw completion to enable triggering of subsequent graphs
var complete = {
  titlegraph: 0,
  explain: 0,
  scenario: 0,
  ideal: 0,
  needs: 0,
  end: 0
};

function getPositions() {   // called from init after draw functions to ensure we get correct Y vals
  for (i=0;i<graphPositions.length;i++) {   // get the position of the graph, update the array with it
    graphPositions[i].position = $("#" + graphPositions[i].name).offset().top + (0.25 * $("#" + graphPositions[i].name).height());  
  }
}

$( window ).on('scroll', function() {
  var scrollPosition = window.pageYOffset;  // get the window position
  var windowHeight = $( window ).height();  // get the window height
  var windowBottom = scrollPosition + windowHeight; // position of bottom of the window
  var timeoutTime = 160; // how much time to wait before firing the dispatch

  for (i=0;i<graphPositions.length;i++) {
    if (graphPositions[i].position < windowBottom && graphPositions[i].position > scrollPosition && graphPositions[i].fired == 0) {
      switch (graphPositions[i].name) {
        case "sec-explain":
          if (complete.titlegraph == 1) {
            setTimeout(function() {
              d3.select("#sec-explain").transition().duration(1200).style("opacity",1);
              dispatch.call("sec-explain");
            }, timeoutTime);
            graphPositions[i].fired = 1;
          };
          break;
        case "sec-scenario":
          if (complete.explain == 1) {
            setTimeout(function() {
              d3.select("#sec-scenario").transition().duration(1200).style("opacity",1);
              dispatch.call("sec-scenario");
            }, timeoutTime);
            setButtons();
            graphPositions[i].fired = 1;
            console.log("scenario done");
          };
          break;
        case "sec-ideal":
          if (scenarioSelected == 1) {
            setTimeout(function() {
              d3.select("#sec-ideal").transition().duration(1200).style("opacity",1);
              dispatch.call("sec-ideal");
            }, timeoutTime);
            graphPositions[i].fired = 1;
          }
          break;
        case "sec-needs":
          if (scenarioSelected == 1 && complete.ideal == 1) {
            setTimeout(function() {
              d3.select("#sec-needs").transition().duration(1200).style("opacity",1);
              dispatch.call("sec-needs");
            }, timeoutTime);
            graphPositions[i].fired = 1;
          }
          break;
        case "sec-end":
          if (scenarioSelected == 1 && complete.needs == 1) {
            setTimeout(function() {
              d3.select("#sec-end").transition().duration(1200).style("opacity",1);
              dispatch.call("sec-end");
            }, timeoutTime);
            graphPositions[i].fired = 1;
          }
          break;
      }
    }
  }
});

// ********************
// *** CONTROL FLOW ***
// ********************

// runs on completion of data load
function init() {

  /* fade in page */
  d3.select("#cover")
    .transition()
      .duration(1200)
      .style("opacity",0)
      .on("end", function() {this.remove();} );

  drawTitle();
  drawExplain();
  getPositions();
}

// runs on user selection of scenario
function runScenario() {

  // clear post-scenario graphs
  d3.selectAll("svg.post-scen-graph").remove(); 

  if (openSelection == 1) {
    thisCity = $('select#city option:selected').val();
    thisHousehold = $('select#household option:selected').val();
  };

  // reveal post-scenario sections
  d3.select("#sec-ideal").style("display", "block");
  d3.select("#sec-needs").style("display", "block");
  d3.select("#sec-end").style("display", "block");
  // reset dispatch events for same
  graphPositions[2].fired = 0;
  graphPositions[3].fired = 0;

  setScenario();
  setProps();

  drawIdeal();
  drawActual();
  drawNeeds();

  getPositions();
  scenarioSelected = 1;

  $('html, body').animate({scrollTop: $("#sec-ideal").offset().top}, 1200);
}

// captures the three pre-set scenarios
function runScenario1() {
  thisCity = "Boise, ID";
  thisHousehold = "married couple 2 children";
  runScenario();
}

function runScenario2() {
  thisCity = "Chicago, IL";
  thisHousehold = "single man";
  runScenario();
}

function runScenario3() {
  thisCity = "Philadelphia, PA";
  thisHousehold = "single mother, 1 child";
  runScenario();
}

// subsets the scenario data based on user selection
function setScenario() {
  // reset data object to contain all scenarios
  data = allScenarios;
  // select data row based on value
  console.log(thisCity + " " + thisHousehold);
  for (i=0;i<data.length;i++) {
    if (data[i].city == thisCity) {
      if (data[i].household == thisHousehold) {
        data = data[i];   // reduce data object to selected row
        console.log("setScenario successful:");
        console.log(data);
      }
    }
  }
}

// runs post setScenario, creates derivative properties based on selected scenario
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
  console.log("post setProps");
  console.log(data);
};

// scenario reset and expose open scenario selection
$('#backToScenario').click(function() {
  $('#scen-initial').css('display', 'none');
  $('#scen-open').css('display', 'block');
  $('.verdict').css('opacity', 0);
  $('html, body').animate({scrollTop: $("#sec-scenario").offset().top}, 800);
  // hide post-scenario sections
  d3.select("#sec-ideal").transition().delay(1600).style("display", "none");
  d3.select("#sec-needs").transition().delay(1600).style("display", "none");
  d3.select("#sec-end").transition().delay(1600).style("display", "none");
  // reset needs stepper
  $("#step1").css("display", "block");
  $("#needs-copy1").css("display", "block");
  $("#step2").css("display", "none");
  $("#needs-copy2").css("display", "none");
  $("#step3").css("display", "none");
  $("#needs-copy3").css("display", "none");
  $("#step4").css("display", "none");
  $("#needs-copy4").css("display", "none");
  $(".replay-box").css("display", "none");
  $("#needs-copy5").css("display", "none");
  // reset position tracking
  graphPositions[2].fired = 0;
  graphPositions[3].fired = 0;
  graphPositions[4].fired = 0;
  scenarioSelected = 0;
  openSelection = 1;
});

// listen for scenario selection events and update display numbers, income data & graph
d3.selectAll('select')
  .on('change.numbers', function() { // note the .numbers namespace after "change", prevents collision with other listeners below
    var interimSelected = {};
    interimSelected.city = $('select#city option:selected').val();
    interimSelected.household = $('select#household option:selected').val();
    for (i=0;i<allScenarios.length;i++) {
      if (allScenarios[i].city == interimSelected.city) {
        $('span.population').html(numberWithCommas(allScenarios[i].population));
        $('.cityimg').attr('src', 'img/location/' + allScenarios[i].cityimg);
        if (allScenarios[i].household == interimSelected.household) {
          $('span.incomeannual').html(numberWithCommas(allScenarios[i].income));
          $('span.takehome').html(numberWithCommas(allScenarios[i].takehome));
          $('.hhimg').attr('src', 'img/household/' + allScenarios[i].hhimg);
        };
      };
    };
    if (document.getElementById("city").selectedIndex != 0 && document.getElementById("household").selectedIndex != 0) $('input.openExplore').css("display", "block");
    else $('input.openExplore').css("display", "none");
  });


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
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]) })
      .on("end", function(d) {
        if (d[0]==80) { // horrific kludge but works — only fires on the third segment
          d3.select(".scroll-box").transition().delay(0).duration(1200).style("opacity", function() {
            complete.titlegraph = 1;
            console.log("title done");
            return 1;
          });
        };
      });

  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
      .attr("x1", function(d) { return yScale(d[0]); }) 
      .attr("x2", function(d) { return yScale(d[0]); })        
      .attr("y1", 0)  // top of line
      .attr("y2", 40)  
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // hide the first line
  var lineFix = svg.select('line')
    .style("stroke-width", 0);    

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
      .attr("width", 0);

  dispatch.on('sec-explain', function() {
    rects.transition()
      .delay(function(d, i) {++loopTrack; return (loopTrack-1)*1400; }) 
      .duration(1200)
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]) })
      .on("end", fadeInText);
  });

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

  // hide the first line
  var lineFix = svg.select('line')
    .style("stroke-width", 0);

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
        complete.explain = 1;
        console.log("explainer done");
        break;
    }
  }
}

function drawIdeal() {

  var barHeight = 50; 
  var lineHeight = 240;  // height of solid lines

  dataIdeal = [
    { needs: data.fifty, wants: data.thirty, saves: data.twenty }
  ];
  console.log(dataIdeal);

  var stack = d3.stack()
    .keys(["needs", "wants", "saves"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataIdeal);
  console.log(dataset);

  // text labels separated from stack, using same key...
  var textLabels1 = {};
    textLabels1.needs = "50%";
    textLabels1.wants = "30%";
    textLabels1.saves = "20%";

  var textLabels2 = {};
    textLabels2.needs = "Needs:";
    textLabels2.wants = "Wants:";
    textLabels2.saves = "Saves:";

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset[dataset.length - 1], function(d) { return d[1]; }) ])
    .range([0, w]);
  
  // create SVG element
  var svg = d3.select("#graph-ideal")
        .append("svg")
        .attr("class", "post-scen-graph")
        .attr("width", w)        
        .attr("height", lineHeight);   

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

  var rects = groups.selectAll("rect")
    .data(function(d) { console.log(d); return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d[0]); })
      .attr("y", 168) // value shifts chart down to make room for annotations
      .attr("height", barHeight)
      .attr("width", 0);

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

  // hide the first line
  var lineFix = svg.select('line')
    .style("stroke-width", 0);

  // add header h2
  svg.append("text")
      .attr("x", 0)
      .attr("dy", 40)  
      .attr("class", "actual-header")
      .text("")
      .append("tspan")
        .style("font-weight", 300)
        .text("What they")
      .append("tspan")
        .style("font-weight", 700)
        .text(" should ")
      .append("tspan")
        .style("font-weight", 300)
        .text("be spending:");

  // add label line 1
  var textLabelOne = svg.selectAll() 
    .data(dataset)
    .enter().append("text")
      .style("opacity", 0)
      .attr("class", "graph-label")
      .attr("id", "graph-label1")
      .style("font-weight", 700)
      .attr("fill", "#231f20")
      .attr("dx", function(d) { return yScale(d[0][0])+2; })  // position horizontally
      .attr("dy", "100")                                        // position vertically
      .text(function(d,i) { return textLabels1[d.key]; })
    .append("tspan")
      .style("font-weight", 400)
      .text(function(d) { return " " + textLabels2[d.key]; });

  // add label line 2
  var textLabelTwo = svg.selectAll()
    .data(dataset)
    .enter().append("text")
      .style("opacity", 0)
      .attr("class", "graph-label")
      .attr("id", "graph-label2")
      .attr("fill", "#231f20")
      .attr("dx", function(d) { return yScale(d[0][0])+2; })  // position horizontally
      .attr("dy", "140")                                      
      .text(function(d) { return "$" + numberWithCommas(d[0][1] - d[0][0]); });

  dispatch.on('sec-ideal.first', function() {

    var loopTrack = 0;  // this is obviously dumb
    var loopTrack2 = 0;
    var loopTrack3 = 0;

    rects.transition()
      .delay(function(d, i) {++loopTrack; return (loopTrack-1)*1400; }) 
      .duration(1200)
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]) });

    svg.selectAll("#graph-label1").transition()
      .delay(function(d, i) {++loopTrack2; return (loopTrack2-1)*1400 + 50; }) 
      .duration(1200) 
      .style("opacity", 1);

    svg.selectAll("#graph-label2").transition()
      .delay(function(d, i) {++loopTrack3; return (loopTrack3-1)*1400 + 50; }) 
      .duration(1200) 
      .style("opacity", 1);
  });


}


function drawActual() {

  var barHeight = 100; 
  var barOffset = 160;
  var dashedHeight = 80;

  dataActual = [
    { needs: data.needs, wants: data.lowants, saves: data.losaves }
  ];

  var stack = d3.stack()
    .keys(["needs", "wants", "saves"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataActual);

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset[dataset.length - 1], function(d) { return d[1]; }) ])
    .range([0, w]);
  
  // text labels separated from stack, using same key...
  var textLabels1 = {};
    textLabels1.needs = data.needsperc;
    textLabels1.wants = data.wantsperc;
    textLabels1.saves = data.savesperc;

  var textLabels2 = {};
    textLabels2.needs = "Needs:";
    textLabels2.wants = "Wants:";
    textLabels2.saves = "Saves:";

  // create SVG element
  var svg = d3.select("#graph-actual")
        .append("svg")
        .attr("class", "ok post-scen-graph")
        .attr("width", w)         
        .attr("height", barHeight+160);   // +240 opens up vertical space for annotation, this is weird...

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
      .attr("y", barOffset) // value shifts chart down to make room for annotations
      .attr("height", barHeight) 
      .attr("width", function(d) {
        if (yScale(d[1]) - yScale(d[0]) >= 0) return yScale(d[1]) - yScale(d[0]);
        else return 0;})
      .attr("class", "actual-rect");

  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
      .attr("x1", function(d) { return yScale(d[0]); }) 
      .attr("x2", function(d) { return yScale(d[0]); })        
      .attr("y1", barOffset)  // top of line
      .attr("y2", barOffset+barHeight)  
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none");

  // hide the first line
  var lineFix = svg.select('line')
    .style("stroke-width", 0);

  // add dashed lines
  svg.append("line")
    .attr("y1", barOffset-60)   // 60 extends dashed line above bar
    .attr("y2", barOffset+140) // 240 extends dashed line to bottom of svg
    .attr("x1", function(d) { return yScale(data.fifty); })
    .attr("x2", function(d) { return yScale(data.fifty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  svg.append("line")
    .attr("y1", barOffset-60)   // 60 extends dashed line above bar
    .attr("y2", barOffset+140) // 240 extends dashed line to bottom of svg
    .attr("x1", function(d) { return yScale(data.fifty) + yScale(data.thirty); })
    .attr("x2", function(d) { return yScale(data.fifty) + yScale(data.thirty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // add header h2
  svg.append("text")
      .attr("x", 0)
      .attr("dy", barOffset-120) 
      .attr("class", "actual-header")
      .text("")
      .append("tspan")
        .style("font-weight", 300)
        .text("What they")
      .append("tspan")
        .style("font-weight", 700)
        .text(" are actually ")
      .append("tspan")
        .style("font-weight", 300)
        .text("spending:");

  // add label line 1
  var textLabelOne = svg.selectAll() 
    .data(dataset)
    .enter().append("text")
      .attr("class", "actual-label")
      .attr("id", "actual-label1")
      .style("font-weight", 700)
      .attr("fill", "#231f20")
      .style("opacity", 0)
      .attr("dx", function(d) { return yScale(d[0][0])+2; })    // position horizontally
      .attr("dy", barOffset - 60)                             // position vertically
      .text(function(d) { return textLabels1[d.key]; })
    .append("tspan")
      .style("font-weight", 400)
      .text(function(d) { return "% " + textLabels2[d.key]; });

  // add label line 2
  var textLabelThree = d3.selectAll(".actual-label")
    .append("tspan")
    .attr("class", "labelThree")
    .attr("x", function(d) { return yScale(d[0][0])+2; })
    .attr("dy", 36)
    .style("font-weight", 400)
    .text(function(d) { 
      var thisValue = d[0][1] - d[0][0];
      if (thisValue > 0) return "$" + numberWithCommas(thisValue);
      else return "$0"; 
    });

  // if 'needs' exceed takehome, move 'wants' and 'saves' labels to their fallback positions
  if (data.lowants <= 0) {
    d3.selectAll('text.actual-label')
      .attr('dx', function(d,i) {
        if (i > 1) return (yScale(data.fifty) + yScale(data.thirty) + 2);
        else if (i > 0) return (yScale(data.fifty) + 2);
        else return yScale(d[0][0])+2;
      });
    d3.selectAll('tspan.labelThree')
      .attr('x', function(d,i) {
        if (i > 1) return (yScale(data.fifty) + yScale(data.thirty) + 2);
        else if (i > 0) return (yScale(data.fifty) + 2);
        else return yScale(d[0][0])+2;
      });
  }
  else arrangeLabels();

  dispatch.on('sec-ideal.second', function() {

    var loopTrack = 0;  // this is obviously dumb
    var loopTrack2 = 0;

    svg.selectAll("#actual-label1").transition()
      .delay(function(d, i) {++loopTrack2; return (loopTrack2-1)*1400 + 50; }) 
      .duration(1200) 
      .style("opacity", 1);

    svg.selectAll("#line-first").transition()
      .delay(1450) 
      .duration(1200) 
      .style("opacity", 1);

    svg.selectAll("#line-second").transition()
      .delay(2900) 
      .duration(1200) 
      .style("opacity", 1);


    rects.transition() 
      .delay(0)
      .duration(0)
      .attr("width", 0)
    .transition()
      .delay(function(d, i) {++loopTrack; return (loopTrack-1)*1400; }) 
      .duration(1200)
      .attr("width", function(d) {
        if (yScale(d[1]) - yScale(d[0]) >= 0) return yScale(d[1]) - yScale(d[0]);
        else return 0;
      })
      .on("end", getVerdict);



  });

  // check if selected household situation meets 50-30-20 rule or no, and update text and icon in verdict section
  function getVerdict() {
    if (data.needs > data.takehome) {
     setTimeout(function() {
        $(".verdict").css("border-top", "#B43236 3px solid");
        $(".verdict").css("border-bottom", "#B43236 3px solid");        
        $(".verdict .icon").html("<img src='img/verdict-3.svg' />");
        $(".verdict .text")
        .html("<h3>Following the 50/30/20 guideline is <span class='red'>virtually impossible</span> in this situation. </h3> <span class='strong'>The average needs of this household exceed the income.</span> This harms the household’s ability to not only save for the future, but take care of their necessities.");
        $(".verdict").animate( { opacity: 1 }, 600);
        $(".ideal-question").delay(1200).animate( { opacity: 1 }, 600);
          complete.ideal = 1;
      }, 3200);
    }
    else if (data.needs > data.fifty) {
      setTimeout(function() {
        $(".verdict").css("border-top", "#B43236 3px solid");
        $(".verdict").css("border-bottom", "#B43236 3px solid");  
        $(".verdict .icon").html("<img src='img/verdict-2.svg' />");
        $(".verdict .text")
        .html("<h3>Following the 50/30/20 guideline <span class='red'>isn't possible</span> in this situation. </h3>The average needs of this household exceed 50% of the income by <span class='strong'>" + 
          data.overneedsperc + "%</span>, which reduces the ability for this household to save for the future.");
        $(".verdict").animate( { opacity: 1 }, 600);
        $(".ideal-question").delay(1200).animate( { opacity: 1 }, 600);
          complete.ideal = 1;
      }, 3200);
    }
    else {
     setTimeout(function() {
        $(".verdict").css("border-top", "#FAAF40 3px solid");
        $(".verdict").css("border-bottom", "#FAAF40 3px solid");        
        $(".verdict .icon").html("<img src='img/verdict-1.svg' />");
        $(".verdict .text")
        .html("<h3>Following the 50/30/20 guideline is <span class='yellow'>probably possible</span> in this situation.</h3> <span class='strong'>The average needs of this household are under 50%.</span> The household needs to stay within the average, and control their spending on their wants.");
        $(".verdict").animate( { opacity: 1 }, 600);
        $(".ideal-question").delay(1200).animate( { opacity: 1 }, 600);
          complete.ideal = 1;
      }, 3200);
    }
  }

  // re-arrange labels to prevent overlap
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
        .attr("dx", secondX-238)
        .attr("dy", secondY-36);
      d3.select(secondLabelThirdLine)
        .attr("x", secondThirdX-238);

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
        .attr("id", "line-first")
        .attr("x1", thisLabel.x + tspanWidth+10) 
        .attr("y1", 90)
        .attr("x2", thisRect.x + (thisRect.width / 2) + 2 ) 
        .attr("y2", 90) 
        .style("opacity", 0)
        .style("stroke-width", 4)
        .style("stroke", "#231f20")
        .style("fill", "none");

      d3.select("svg.ok") // vertical
        .append("line")
        .attr("id", "line-first")
        .attr("x1", thisRect.x + (thisRect.width / 2) ) 
        .attr("y1", 90)
        .attr("x2", thisRect.x + (thisRect.width / 2) ) 
        .attr("y2", 140) 
        .style("opacity", 0)
        .style("stroke-width", 4)
        .style("stroke", "#231f20")
        .style("fill", "none");

      var thisLabel = thirdLabel.getBBox();
      var thisRect = document.getElementsByClassName('actual-rect')[2].getBBox();
      var tspanWidth = document.getElementsByClassName('labelThree')[2].getComputedTextLength();

      // draw lines from 3rd label
      d3.select("svg.ok") // horizontal
        .append("line")
        .attr("id", "line-second")
        .attr("x1", thisLabel.x + tspanWidth+10) 
        .attr("y1", 54)
        .attr("x2", thisRect.x + (thisRect.width / 2) + 2) 
        .attr("y2", 54) 
        .style("opacity", 0)
        .style("stroke-width", 4)
        .style("stroke", "#231f20")
        .style("fill", "none");

      d3.select("svg.ok") // vertical
        .append("line")
        .attr("id", "line-second")
        .attr("x1", thisRect.x + (thisRect.width / 2)) 
        .attr("y1", 54)
        .attr("x2", thisRect.x + (thisRect.width / 2)) 
        .attr("y2", 140) 
        .style("opacity", 0)
        .style("stroke-width", 4)
        .style("stroke", "#231f20")
        .style("fill", "none");
    }
  }

}



function drawNeeds() {

/* 
IN CASE WE NEED THEM AGAIN....
icon: "housing.svg"
icon: "health.svg"
icon: "grocery.svg"
icon: "transit.svg"
icon: "childcare.svg"
icon: "childcare.svg"
*/

  var barHeight = 100; 
  var graphOffset = 60;

  dataNeeds = [
    { housing: data.housing, health: data.health, grocery: data.grocery, transit: data.transit, childcare: data.childcare, lo: data.lo }
  ];

  var sectionLabels = {};
    sectionLabels.housing = "Housing & Utilities";
    sectionLabels.health = "Healthcare";
    sectionLabels.grocery = "Groceries";  
    sectionLabels.transit = "Transportation";
    sectionLabels.childcare = "Childcare";
    sectionLabels.lo = "Childcare";

  var stack = d3.stack()
    .keys(["housing", "health", "grocery", "transit", "childcare", "lo"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataNeeds);

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset[dataset.length - 1], function(d) { return d[1]; }) ])
    .rangeRound([0, w]);

  // create new svg element
  var svg = d3.select("#graph-needs")
    .append("svg")
    .attr("class", "post-scen-graph")
    .attr("width", w)
    .attr("height", barHeight+80);    

  // add background rect
  svg.append("rect")
    .attr("x", 0) 
    .attr("y", barHeight-40) 
    .attr("width", function(d) { return yScale(data.lo + data.needs); })
    .attr("height", barHeight)
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
      .attr("x", function(d) { return yScale(d[0]); })
      .attr("y", function(d, i) { return barHeight-40; })  
      .attr("class", "needs-rect")    
      .attr("width", 0)
      .attr("height", barHeight)
      .style("fill", "url(#diagonal-stripe-2)");

  // transition first rect into view - subsequent rects handled via stepper, below / outside main draw function
  dispatch.on('sec-needs', function() {
    d3.select("rect.needs-rect")
      .transition()
      .delay(200)
      .duration(1200)
      .attr("width", function(d) { return yScale(d[1]) - yScale(d[0]); });
  }); 

  // add a label to each row, indicating which value (housing, healthcare etc.) is being added to the cumulative total
  var textLabelOne = groups.selectAll("text")
    .data(dataset)
    .enter().append("text")
      .attr("x", function(d) { return yScale(d[0][0])+4; })      // value adjusts horizontal position of labels
      .attr("y", function(d, i) { return barHeight-60; })     // value adjusts vertical position of labels
      .attr("fill", "#231f20")
      .attr("class", "needs-label")
      .style("opacity", "0")
      .text(function(d) { return sectionLabels[d.key]; });                              

  // add dollar value to labels
  var textLabelTwo = d3.selectAll(".needs-label")
    .append("tspan")
    .style("font-weight", 700)
    .text(function(d) { return " $" + numberWithCommas(d[0][1] - d[0][0]) });

  // show the first label
  d3.select(".needs-label")
    .style("opacity", "1");

  // first dashed line - 50% of ideal budget
  svg.append("line")
    .attr("y1", barHeight-40) 
    .attr("y2", barHeight+60) 
    .attr("x1", function(d) { return yScale(data.fifty); })
    .attr("x2", function(d) { return yScale(data.fifty); })
    .style("stroke-width", 4)
    .style("stroke", "white")
    .style("fill", "none")
    .style("stroke-dasharray", ("4, 8"));

  // second dashed line - next 30% of ideal budget
  svg.append("line")
    .attr("y1", barHeight-40) 
    .attr("y2", barHeight+60) 
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
    dispatch.call("sec-needs"); // re-draws that first rect

});

function nextStep(step) {

  // set positioning, data and scales, identical to drawNeeds()
  var barHeight = 100; 
  var graphOffset = 60;

  dataNeeds = [
    { housing: data.housing, health: data.health, grocery: data.grocery, transit: data.transit, childcare: data.childcare, lo: data.lo }
  ];

  var stack = d3.stack()
    .keys(["housing", "health", "grocery", "transit", "childcare", "lo"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var dataset = stack(dataNeeds);

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset[dataset.length - 1], function(d) { return d[1]; }) ])
    .rangeRound([0, w]);

  // draw next rect
  d3.selectAll("rect.needs-rect")
    .style("fill", function(d, i) {
      if (i < step) {return "#65B68A";}
      else if (i == 5) {return "#e8e8e8";}
      else {return "url(#diagonal-stripe-2)";}
    })
    .transition().duration(800) // TODO: this only fires correctly on steps 1 and 2
      .attr("width", function(d, i) {
        if (i <= step) {return yScale(d[1]) - yScale(d[0]);}
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
  $("#step4").css("display", "none");
  $("#needs-copy4").css("display", "none");
  nextStep(4);
  $(".replay-box").css("display", "block");
  $("#step5").css("display", "none");
  $("#needs-copy5").css("display", "block");
  $(".needs-question").delay(600).animate( { opacity: 1 }, 600);

}








/*


// on resize, redraw all present graphs
window.onresize = reDrawAll;

function reDrawAll() {
  // get page width and update global width variable for graph sizing
  w = d3.select("div.row").node().getBoundingClientRect().width - 30; 

  // reset height of each section to screen height
  $("div.slide").css("height", $(window).height()+"px");  

  // redraw the explainer graph
  d3.select("svg.explainer").remove()
  drawExplain();  // TODO: no need to do the transitions on resize...

  // redraw the post-scenario graphs, but only if they've been drawn already
  if (d3.selectAll("svg.graph").empty() == false) {
    d3.selectAll("svg.graph").remove()
    setupAndDraw();
  }
};


// listen for scenario selection events and reveal next section if necessary
d3.selectAll('.scenario .location select')
  .on('change.sections', function() { 
    $(".scenario .household").css("display", "block"); // reveal the household section
});
d3.selectAll('.scenario .household select')
  .on('change.sections', function() {
    $(".scenario .income").css("display", "block"); // reveal the income section
});




// when user clicks run scenario button...
function runScenario() {
  data = allScenarios; // reset 'data' to include all scenarios 
  $(".ideal").css("display", "block"); // display all post-scenario sections
  $(".needs").css("display", "block");
  $(".actual").css("display", "block");  
  $(".end").css("display", "block");
  d3.selectAll("svg.graph").remove(); // clear any existing post-scenario graphs (redundant?)
  setupAndDraw(); // get the selected scenario, setup the data, draw the graphs
  $('html, body').animate({ // send user to first post-scenario graph section
    scrollTop: $(".ideal").offset().top}, 1200);
};


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






*/










