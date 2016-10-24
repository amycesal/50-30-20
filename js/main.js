
// on page load, hide scenario sections and post-scenario graph sections, and reveal the page 
$(window).on('load', function() {
   $(".scenario .household").css("display", "none");
   $(".scenario .income").css("display", "none");
   $(".ideal").css("display", "none");
   $(".needs").css("display", "none");
   $(".actual").css("display", "none");
   $(".end").css("display", "none");
   $("#cover").fadeOut(1200);
});

// declare global variables
var w, h, allScenarios, data, dataExplain, dataIncome, dataIdeal, dataNeeds, dataActual, decileSelected;

// get page width and store in global variable for graph sizing
w = d3.select("div.row").node().getBoundingClientRect().width - 30; 

// set height of each section to screen height
$("div.slide").css("height", $(window).height()+"px");  

// one-time data loading and setup
d3.csv("csv/data.csv", function(csv) {  // pull data from csv
  // read numerical values as numbers not strings
  csv.forEach(function(d){ d['income'] = +d['income']; });
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
  data = csv;         // pass csv values to the global 'data' object
  allScenarios = csv; // also pass them to this object that -doesn't- get changed in scenario setup
  // get unique values for all three dropdowns and populate them
  getUniques('city');      
  getUniques('household');
  getUniques('level');
});

// add to d3 selection - select first in a series, used for appending a line to the start of a graph
d3.selection.prototype.first = function() {     
  return d3.select(this[0][0]);
};

// setup data for pre-scenario charts — static, so removed from rest of control flow
dataFiftyThirtyTwenty = [
  [
    { x: 0, y: 50 }
  ],
  [ 
    { x: 0, y: 30 }
  ],
  [
    { x: 0, y: 20 }
  ]
];

var stack = d3.layout.stack();
stack(dataFiftyThirtyTwenty);

// draw the title and explainer graphs
drawTitle();
drawExplain();

// listen for scroll-cue click and send to next section
d3.selectAll('.scrollcue')
  .on('click', function() {
    $('html, body').animate({
      scrollTop: $(this).parent().parent().parent().next(".row").offset().top}, 1200);
});

// kludge for last section
d3.selectAll('.scrollcue2')
  .on('click', function() {
    $('html, body').animate({
      scrollTop: $(".end").offset().top}, 1200);
});

// function for button in end section, sends user to scenario section
function backToScenario() {
  $('html, body').animate({
  scrollTop: $(".scenario").offset().top}, 1200);
};

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
          // if the income graph exists, remove it
          if ($(".graph-income svg").length) { d3.select(".graph-income svg").remove(); }
          // setup data for income graph
          dataIncome = [
            allScenarios[i].inc0, 
            allScenarios[i].inc1, 
            allScenarios[i].inc2, 
            allScenarios[i].inc3, 
            allScenarios[i].inc4, 
            allScenarios[i].inc5, 
            allScenarios[i].inc6, 
            allScenarios[i].inc7, 
            allScenarios[i].inc8, 
            allScenarios[i].inc9];
          // store income decile from selected scenario
          decileSelected = allScenarios[i].decile;
          // draw income graph
          drawIncome();
        };
      };
    };
  });

// listen for scenario selection events and reveal next section if necessary
d3.selectAll('.scenario .location select')
  .on('change.sections', function() { 
    $(".scenario .household").css("display", "block"); // reveal the household section
});
d3.selectAll('.scenario .household select')
  .on('change.sections', function() {
    $(".scenario .income").css("display", "block"); // reveal the income section
});

// used for graph-specific, window-postion based events
function isElementInViewport(elem) {
    var $elem = $(elem);

    // Get the scroll position of the page.
    var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
    var viewportTop = $(scrollElem).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    // Get the position of the element on the page.
    var elemTop = Math.round( $elem.offset().top );
    var elemBottom = elemTop + $elem.height();

    return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
}

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

function getUniques(dd) {
  var unique = {};
  var distinct = [];
  for (var i in data) {
    if (typeof(unique[data[i][dd]]) == "undefined") {
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

function setupAndDraw() {
  setScenario(); // get current value of dropdowns and set 'data' to the selected scenario
  setProps(); // set calculated properties
  setupData(); // create a stacked array for each graph
  addNumbers(); // overwrite numbers in HTML with correct values per scenario
  drawIdeal(); // draw each post-scenario graph
  drawNeeds();  
  drawActual();
};

function setScenario() {
  var selected = {};
    selected.city = $('select#city option:selected').val();
    selected.household = $('select#household option:selected').val();
  // select data row based on value
  for (i=0;i<data.length;i++) {
    if (data[i].city == selected.city) {
      if (data[i].household == selected.household) {
        data = data[i];   // reduce data object to selected row
      }
    }
  }
};

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

function setupData() {

  // setup an array for each post-scenario graph
  dataIdeal = [
    [
      { x: 0, y: data.fifty, t1: "50%", t2: "Needs:" }
    ],
    [ 
      { x: 0, y: data.thirty, t1: "30%", t2: "Wants:"  }
    ],
    [
      { x: 0, y: data.twenty, t1: "20%", t2: "Saves:"  }
    ]
  ];

  dataNeeds = [
    [
      { x: 0, y: data.housing, section: "Housing & Utilities", icon: "housing.svg" }
    ],
    [
      { x: 0, y: data.health, section: "Healthcare", icon: "health.svg" }, 
    ],
    [
      { x: 0, y: data.grocery, section: "Groceries", icon: "grocery.svg" }, 
    ],
    [
      { x: 0, y: data.transit, section: "Transportation", icon: "transit.svg" },
    ],
    [
      { x: 0, y: data.childcare, section: "Childcare", icon: "childcare.svg" } 
    ],
    [
      { x: 0, y: data.lo, section: "Childcare", icon: "childcare.svg" } 
    ]
  ];

  dataActual = [
    [
      { x: 0, y: data.needs, t1: data.needsperc, t2: "Needs:" }
    ],
    [ 
      { x: 0, y: data.lowants, t1: data.wantsperc, t2: "Wants:"  }
    ],
    [
      { x: 0, y: data.losaves, t1: data.savesperc, t2: "Saves:"  }
    ]
  ];

  // stack each array
  stack(dataIdeal);
  stack(dataActual);
  stack(dataNeeds);
};

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

// ****************
// DRAW TITLE GRAPH
// ****************
function drawTitle() {

  var dataset = dataFiftyThirtyTwenty; 
  var h = 40; 

  // set up scales 
  var xScale = d3.scale.ordinal()      // actually y scale, since we're doing horizontal bars
    .domain(d3.range(dataset[0].length))
    .rangeRoundBands([0, h]);

  var yScale = d3.scale.linear()       // actually x scale
    .domain([0,       
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      })
    ])
    .range([0, w]);
  
  // create SVG element
  var svg = d3.select(".graph-title")
        .append("svg")
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

  // add a rect for each data value
  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d.y0); }) 
      .attr("y", 0)   // 128 is to shift chart down to make way for annotation
      .attr("height", xScale.rangeBand())
      .attr("width", 0);

    d3.selectAll(".graph-title rect")
      .transition()
        .delay(function(d, i) {return (i+0.5) * 1600;}) 
        .duration(1200)
        .attr("width", function(d) { return yScale(d.y); });  
}

// ********************
// DRAW EXPLAINER GRAPH
// ********************
function drawExplain() {

  var dataset = dataFiftyThirtyTwenty; 
  var h = 100; 
  var lineHeight = 100;  // height of solid lines

  // set up scales 
  var xScale = d3.scale.ordinal()      // actually y scale, since we're doing horizontal bars
    .domain(d3.range(dataset[0].length))
    .rangeRoundBands([0, h]);

  var yScale = d3.scale.linear()       // actually x scale
    .domain([0,       
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      })
    ])
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

  // add a rect for each data value
  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return yScale(d.y0); }) 
      .attr("y", 0)   // 128 is to shift chart down to make way for annotation
      .attr("height", xScale.rangeBand())
      .attr("width", 0);

  // TODO: kill listener on success? 
  // trigger transitions when svg is in viewport
  $(window).scroll(function(){
    var $elem = $("svg.explainer");
    if (isElementInViewport($elem)) {
      // stepped transition for bars
      d3.selectAll(".explainer rect")
        .transition()
          .delay(function(d, i) {return i * 1600;}) 
          .duration(1200)
          .attr("width", function(d) { return yScale(d.y); })
          .each("end", fadeInText);
      // corresponding transition for text blocks
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
  });


  // draw a line over the start of each rect
  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
    .attr("y1", 0) 
    .attr("y2", lineHeight) 
    .attr("x1", function(d) { return yScale(d.y0); }) 
    .attr("x2", function(d) { return yScale(d.y0); })        
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
  var lineFix = svg.selectAll('line'); 
  lineFix.first()
    .attr('transform', 'translate(2,0)');
}

// ********************
// DRAW INCOME GRAPH
// ********************
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


/*
  var textLabels = svg.selectAll() 
    .data(dataset)
    .enter().append("text")
    .attr("class", "income-label")
    .style("font-weight", 300)
    .attr("fill", "#231f20")
    .attr('x', function(d,i) { return i * (width / dataset.length); })  
    .attr('y', height + 16)                                       
    .text(function(d) { return d; });
*/ 
// TODO: make text vert, add caption property to data object(?), add the poverty line

}

// ***********************
// DRAW IDEAL BUDGET GRAPH
// ***********************
function drawIdeal() {

  var dataset = dataIdeal; 
  var h = 100; 
  var lineHeight = 220;  // height of solid lines

  // set up scales 
  var xScale = d3.scale.ordinal()      // actually y scale, since we're doing horizontal bars
    .domain(d3.range(dataset[0].length))
    .rangeRoundBands([0, h]);

  var yScale = d3.scale.linear()       // actually x scale
    .domain([0,       
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      })
    ])
    .range([0, w]);
  
  // create SVG element
  var svg = d3.select("#graph-ideal")
        .append("svg")
        .attr("class", "graph")
        .attr("width", w)        
        .attr("height", h+120);   // +120 is to open up vertical space for annotation

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
      .attr("y", 128)   // 128 is to shift chart down to make way for annotation
      .attr("height", xScale.rangeBand())
      .attr("width", "0");

    d3.selectAll("#graph-ideal rect")
      .transition()
        .delay(function(d, i) {return (i+0.5) * 1600;}) 
        .duration(1200)
        .attr("width", function(d) { return yScale(d.y); });  

  // draw a line over the start of each rect
  var lines = groups.selectAll("line")
    .data(function(d) { return d; })
    .enter().append("line")
    .attr("y1", 0) 
    .attr("y2", lineHeight) 
    .attr("x1", function(d) { return yScale(d.y0); }) 
    .attr("x2", function(d) { return yScale(d.y0); })        
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
  var lineFix = svg.selectAll('line'); 
  lineFix.first()
    .attr('transform', 'translate(2,0)');

  // add label line 1
  var textLabelOne = svg.selectAll() // TODO: need to separate bold and regular text via tspans
    .data(dataset)
    .enter().append("text")
    .attr("class", "graph-label")
    .style("font-weight", 700)
    .attr("fill", "#231f20")
    .attr("dx", function(d) { return yScale(d[0].y0)+10; })  // position horizontally
    .attr("dy", "60")                                        // position vertically -- TODO: base these on type size?
    .text(function(d) { return d[0].t1; });

  var textLabelOneAyy = d3.selectAll(".graph-label")
    .append("tspan")
    .style("font-weight", 400)
    .text(function(d) { return " " + d[0].t2 })

  // add label line 2
  var textLabelTwo = svg.selectAll()
    .data(dataset)
    .enter().append("text")
    .attr("class", "graph-label")
    .attr("fill", "#231f20")
    .attr("dx", function(d) { return yScale(d[0].y0)+10; })  // position horizontally
    .attr("dy", "100")                                       // position vertically -- TODO: base these on type size?
    .text(function(d) { return "$" + d[0].y; });
}

// ************************
// DRAW ACTUAL BUDGET GRAPH
// ************************
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

// ***********************
// DRAW NEEDS GRAPH 
// ***********************
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

/*
  // icons — on hold for now.

  // add svg icons to text labels
  var icons = svg.selectAll("svg") 
    .data(dataset[1])                     // this now targets the second array in dataset, where caption info is stored
    .enter().append("svg:image")
    .attr("xlink:href", function(d) {
      if(d.icon != null) {                // TODO: probably don't need this conditional anymore
        return "img/" + d.icon; }
      else { return null; }
    })
    .attr("y", function(d, i) { return xScale(i)+16; })     
    .attr("x", function(d) { return yScale(d.y0)+6; })
    .attr("width", 20)      
    .attr("height", 20);

  // add below-the-bar icons 
  var subIcons = svg.selectAll("svg")
    .data(dataset[1])
    .enter().append("svg:image")    // first add one icon of each type
    .attr("class", "subicon")
    .attr("xlink:href", function(d) {
      if(d.icon != null) {
        return "img/grey-" + d.icon; }
      else { return null; }
    })
    .attr("y", function(d, i) { return xScale(i)+116; })                // vertical position below the relevant bar
    .attr("x", function(d) { return yScale(d.y0)+(yScale(d.y)/2)-10; }) // horizontal position in the middle of the relevant bar
    .attr("width", 20)      
    .attr("height", 20)
    .each(function(d,i) {           // then add a corresponding icon for each remaining bar
      for (n=i; n<4; n++) {
        svg.selectAll("svg")
          .data([d])
          .enter().append("svg:image")
          .attr("class", "subicon")
          .attr("xlink:href", "img/grey-" + d.icon)
          .attr("y", function(d, i) { return xScale(i)+260+(n*144); })  // vert - 260 is 116 + 144 (height of bar etc.)
          .attr("x", function(d) { return yScale(d.y0)+(yScale(d.y)/2)-10; }) // horz - same as above
          .attr("width", 20)      
          .attr("height", 20);
      }
    });
  */
}

// NEEDS GRAPH STEPPERS ETC.

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

// DRY I know... this is called by the jquery stepper functions below to update the needs visualization - labels and rects
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

// stepper functions, each is called by a different button. this is obviously a bashy way to do this.
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










