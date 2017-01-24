var scatterVisible = false;
var compareLive = false;
var firstChartLive = true;
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0,window.screen.availHeight);
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var fixedScene
var sectionScrollScene;
// var controller = new ScrollMagic.Controller();
var highlightColor = "rgb(41, 99, 255)";
highlightColor = "#2873ff"
highlightColor = "rgb(31, 119, 180)"
highlightColor = "rgb(142, 151, 167)";
highlightColor = "#4285f4"
// highlightColor = "rgb(31, 119, 180)"
compareColor = "#00bd61"
compareColor = "#9E9E9E";
compareColor = "#37474F";
var mouseoverEffect = false;
//var voronoiHighlight = "#f03b20";
voronoiHighlight = "rgb(44, 160, 44)"
var wordsToShow = ["selfie","slay","netflix.and.chill","felicia"];
var wordsToCompareSaved = ["selfie","netflix.and.chill","woke"];
var wordsToCompare = ["selfie","netflix.and.chill","woke"];

var color = d3.scaleOrdinal(d3.schemeCategory10);
var cycleTimeout;
// var color = d3.scaleOrdinal().domain([0,9]).range(["#FF5722","#9C27B0","#00e971","#ff003e","#36c3ff","#ffc400","#9E9E9E","#000","#2873ff","#803eff"]);
var compareWord = {term:"selfie"};
var positions = {};

var topListContainer = d3.select(".top-list-new");

var states = [
  ["Maine","ME",1,"Northeast",23],
  ["Vermont","VT",2,"Northeast",50],
  ["New Hampshire","NH",3,"Northeast",33],
  ["Rhode Island","RI",4,"Northeast",44],
  ["Massachusetts","MA",5,"Northeast",25],
  ["Connecticut","CT",6,"Northeast",9],
  ["Delaware","DE",7,"Northeast",10],
  ["New Jersey","NJ",8,"Northeast",34],
  ["New York","NY",9,"Northeast",36],
  ["Pennsylvania","PA",10,"Northeast",42],
  ["District of Columbia","DC",11,"Northeast",11],
  ["Maryland","MD",12,"Northeast",24],
  ["Virginia","VA",13,"South",51],
  ["North Carolina","NC",14,"South",37],
  ["South Carolina","SC",15,"South",45],
  ["Georgia","GA",16,"South",13],
  ["Alabama","AL",17,"South",1],
  ["Mississippi","MS",18,"South",28],
  ["Louisiana","LA",19,"South",22],
  ["Arkansas","AR",20,"South",5],
  ["Tennessee","TN",21,"South",47],
  ["Kentucky","KY",22,"South",21],
  ["West Virginia","WV",23,"South",54],
  ["Oklahoma","OK",24,"Midwest",40],
  ["Colorado","CO",25,"West",8],
  ["Utah","UT",26,"West",49],
  ["Idaho","ID",27,"West",16],
  ["Wyoming","WY",28,"West",56],
  ["Montana","MT",29,"West",30],
  ["North Dakota","ND",30,"Midwest",38],
  ["South Dakota","SD",31,"Midwest",46],
  ["Nebraska","NE",32,"Midwest",31],
  ["Kansas","KS",33,"Midwest",20],
  ["Iowa","IA",34,"Midwest",19],
  ["Minnesota","MN",35,"Midwest",27],
  ["Wisconsin","WI",36,"Midwest",55],
  ["Indiana","IN",37,"Midwest",18],
  ["Missouri","MO",38,"Midwest",29],
  ["Ohio","OH",39,"Midwest",39],
  ["Michigan","MI",40,"Midwest",26],
  ["Illinois","IL",41,"Midwest",17],
  ["Florida","FL",42,"South",12],
  ["California","CA",43,"West",6],
  ["Nevada","NV",44,"West",32],
  ["Texas","TX",45,"South",48],
  ["Arizona","AZ",46,"West",4],
  ["New Mexico","NM",47,"West",35],
  ["Alaska","AK",48,"West",2],
  ["Washington","WA",49,"West",53],
  ["Oregon","OR",50,"West",41],
  ["Hawaii","HI",51,"West",15],
  ]
  ;

var toRemove = [];

var statesMap = d3.map(states,function(d){return d[0]});
var statesMapName = d3.map(states,function(d){return d[1]});

var mobile = true;
var smallMobile = false;

if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || viewportWidth < 900) {
  mobile = true;
  wordsToShow = ["selfie","slay","felicia"];
  wordsToCompareSaved = ["selfie","woke"];
  wordsToCompare = ["selfie","woke","slay"];
  compareWord = {term:"slay"};
  if(viewportWidth < 351){
    smallMobile = true;
  }
}


queue()
  .defer(d3.csv, "summary_3.csv") // 67KB
  // .defer(d3.csv, "state_data_10.csv") // 67KB
  // .defer(d3.csv, "dma_data.csv") // 67KB
  // .defer(d3.csv, "woke_test.csv") // 67KB
  // .defer(d3.csv, "words.csv") // 67KB
  // .defer(d3.csv, "weekly.csv") // 67KB
  //.defer(d3.csv, "weekly_combined.csv") // 67KB
  // .defer(d3.json, "nielsentopo.json")
  // .defer(d3.json, "us_map_state.json")
  .await(ready);

function ready(error
  ,summary
  // ,state_data
  // ,dma_data
  // ,woke_test
  // ,words
  // ,weeklyData
//  ,weeklyCombined
  // ,usMap
  // ,usState
){

  var wordArray = [];

  var weeks = Object.keys(summary[0]).filter(function(d){
    return d.slice(0,1) == "w";
  });

  var lastWeek = weeks.length - 1;
  var maxValuesCumulative = [];
  var maxValues = [];

  function simple_moving_averager(period) {
      var nums = [];
      return function(num) {
          nums.push(num);
          if (nums.length > period)
              nums.splice(0,1);  // remove the first element of the array
          var sum = 0;
          for (var i in nums)
              sum += nums[i];
          var n = period;
          if (nums.length < period)
              n = nums.length;
          return(sum/n);
      }
  }

  function movingAvg(points,count) {
    points = points.map(function(each, index, array) {
      var to = index + count - 1;
      var subSeq, sum;
      if (to < points.length) {
          subSeq = array.slice(index, to + 1);
          sum = subSeq.reduce(function(a,b) { return [a[0] + b[0], a[1] + b[1]]; });
          return sum.map(function(each) { return each / count; });
      }
        // return undefined;
    });
    points = points.filter(function(each) { return typeof each !== 'undefined' });
    return points
  }

  var extentCumulative = d3.extent(maxValuesCumulative);
  var extent = d3.extent(maxValues);

  function topListNew(topListData){

    var colorNumberMap = d3.map(topListData.map(function(d,i){return [d.term,i]}),function(d){
      return d[0];
    });

    topListData = topListData.filter(function(d){
      return toRemove.indexOf(d.term) == -1;
    });

    var maxValues = [];

    var topListDataMap = d3.nest().key(function(d){
        return d.year;
      })
      .entries(topListData)
      ;

    var containerWidth = 1050;

    var topListLineWideContainerSourceLeftInitial = 160;
    var itemWidth = 380;
    var termWidth = 130;
    var lineWidth = 14;
    var rowHeight = 40;
    var lineOffset = 17;
    var leftColTitleWidth = 500;
    var firstChartFontSize = 20;
    var fontExtent = [9,18];
    var opacityExtent = [.8,.84];
    var rightTermsOffset = 16;
    var rightSpacing = 30;
    if(mobile){
      containerWidth = viewportWidth;
      itemWidth = viewportWidth;
      firstChartFontSize = 14;
      termWidth = 100;
      leftColTitleWidth = viewportWidth;
      if(smallMobile){
        rowHeight = 35;
      }
    }

    var heightExtent = d3.extent(maxValues);

    var heightScale = d3.scaleLinear().domain([0,15]).range([rowHeight*10,0]).clamp(true);
    var widthSmallLineInitial = 400;
    var heightSmallLineInitial = 300;

    var marginSmallLine = {top:30, right:100, bottom:10, left:0};
    if(mobile){
      widthSmallLineInitial = viewportWidth - 150;
      heightSmallLineInitial = 420;
      marginSmallLine.right = 60;
      if(smallMobile){
        heightSmallLineInitial = 350;
      }
    }
    var widthSmallLine = widthSmallLineInitial - marginSmallLine.left - marginSmallLine.right,
      heightSmallLine = heightSmallLineInitial - marginSmallLine.top - marginSmallLine.bottom
      ;

    var openingLineChart = d3.select(".opening-line-chart-container");

    openingLineChart.append("p")
      .attr("class","opening-line-chart-title")
      .style("width",widthSmallLine+"px")
      .html("Search Interest 2015 - 2016<br><span class='opening-line-chart-title-span'>Moving 3-month Average for Rising Words</span>")
      ;

    var topListSvg = openingLineChart
      .append("div")
      .attr("class","top-list-new-svg-container")
      .append("svg")
      .attr("class","top-list-new-svg")
      .attr("width",widthSmallLine+marginSmallLine.left+marginSmallLine.right)
      .attr("height",heightSmallLine+marginSmallLine.top+marginSmallLine.bottom)
      .style("height",heightSmallLine+marginSmallLine.top+marginSmallLine.bottom+"px")
      // .attr("viewBox","0 0 100 50")
      ;

    var smallLineWeeks = Object.keys(topListDataMap[0].values[0]).filter(function(d){
      return d.slice(0,1) == "w";
    });

    var termMaxes = [];

    for (var year in topListDataMap){
      var maxVolume = [];
      topListDataMap[year].rhoExtent = d3.extent(topListDataMap[year].values,function(d){
        return +d["rho"+topListDataMap[year].key];
      });

      var fontScale = d3.scaleLinear().domain([10,0]).range([10,12]);
      // var fontScale = d3.scaleLinear().domain(topListDataMap[year].rhoExtent).range(fontExtent);
      var opacityScale = d3.scaleLinear().domain([10,0]).range([".8","1"])
      // var opacityScale = d3.scaleLinear().domain(topListDataMap[year].rhoExtent).range(opacityExtent)

      for (var term in topListDataMap[year].values){

        topListDataMap[year].values[term].fontSize = +fontScale(topListDataMap[year].values[term]["rho"+topListDataMap[year].key]);
        topListDataMap[year].values[term].opacityValue = +opacityScale(topListDataMap[year].values[term]["rho"+topListDataMap[year].key]);

        var weekArray = smallLineWeeks.map(function(d,i){
          return {date:d,volume:topListDataMap[year].values[term][d]};
        });

        topListDataMap[year].values[term].weekArray = weekArray;

        var rollingArray = movingAvg(smallLineWeeks.map(function(d,i){
          return [i,+topListDataMap[year].values[term][d]];
        }),46).map(function(d,i){
          maxVolume.push(d[1]);
          return {date:i,volume:d[1]};
        });

        var termMaxIndex = d3.scan(rollingArray, function(a, b) { return b.volume - a.volume; });
        var termMaxItem = rollingArray[termMaxIndex];
        var termMax = d3.max(rollingArray,function(d){
          return +d.volume;
        });

        if(wordsToShow.indexOf(topListDataMap[year].values[term].term) != -1){
          termMaxes.push(termMaxItem.volume);
        }
        if(compareWord.term == topListDataMap[year].values[term].term){

          compareWord.termMax = termMaxItem.volume;
          compareWord.termMaxDate = termMaxItem.date;
        }
        topListDataMap[year].values[term].termMaxDate = termMaxItem.date;
        topListDataMap[year].values[term].termMax = termMaxItem.volume;
        topListDataMap[year].values[term].rollingArray = rollingArray;
        topListDataMap[year].values[term].topTen = false;
        if(+topListDataMap[year].key == 2016 && term < 10){
          topListDataMap[year].values[term].topTen = true
        }
      }
      topListDataMap[year].max = d3.max(maxVolume);
    }

    var yWideMax = d3.max(termMaxes);

    var yWideCompareMax = yWideMax;

    var rightColArray = topListDataMap.filter(function(d){
      return d.key == "2016";
    })[0];

    var max = rightColArray.max;

    var smallLineData = rightColArray.values.slice(0,10);
    var x = d3.scaleLinear().domain([109,214]).range([0,widthSmallLine]);
    var y = d3.scaleLinear().domain([0,max]).range([heightSmallLine,0]);

    var voronoiSmallLine = d3.voronoi()
        .x(function(d,i) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.volume);
        })
        .extent([[-marginSmallLine.left, -marginSmallLine.top], [widthSmallLine + marginSmallLine.right, heightSmallLine + marginSmallLine.bottom]])
        ;

    var smallLine = d3.line()
        .x(function(d,i) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.volume);
        })
        .curve(d3.curveLinear)
        ;

    var topLineNewSvgContainer = topListSvg
      .append("g")
      .attr("class","top-list-new-svg-line-container")

    topListSvg
      .append("g")
      .attr("transform","translate("+marginSmallLine.left+","+(marginSmallLine.bottom+marginSmallLine.top+heightSmallLine+6)+")")
      .attr("class","top-list-new-svg-line-text-container")
      .selectAll("text")
      .data(["2015","2016","2017"])
      .enter()
      .append("text")
      .attr("class","top-list-new-svg-line-text")
      .attr("x",function(d,i){
        return widthSmallLine/2*i;
      })
      .attr("y",0)
      .text(function(d){
        return d;
      })
      ;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var smallLineVoronoi = topListSvg
      .append("g")
      .attr("class","small-line-voronoi-paths")
      .attr("transform","translate("+marginSmallLine.left+","+marginSmallLine.top+")")
      .selectAll("path")
      .data(voronoiSmallLine.polygons(
          d3.merge(smallLineData.map(function(d){
            var term = d.term;
            return d.rollingArray.map(function(d,i){
              return {date:d.date,volume:d.volume,term:term};
            });
          }))
        )
      )
      .enter()
      .append("path")
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
      .attr("class","top-list-new-svg-voronoi-paths")
      .on("mouseover",function(d){
        var term = d.data.term;

        // smallLinePaths.style("opacity",function(d){
        //   if(d.term == term){
        //     return 1;
        //   }
        //   return .1;
        // })

        smallLineText.classed("text-scroll",function(d){
          if(d.term == term){
            return true;
          }
          return false;
        });

        smallLineText.classed("text-scroll",function(d){
          if(d.term == term){
            return true;
          }
          return false;
        });
      })
      ;

    var smallLinePaths = topListSvg
      .append("g")
      .attr("transform","translate("+marginSmallLine.left+","+marginSmallLine.top+")")
      .selectAll("path")
      .data(smallLineData)
      .enter()
      .append("path")
      .attr("class","top-list-new-svg-paths")
      .attr("d",function(d){
        return smallLine(d.rollingArray.slice(-104));
      })
      ;

    var textColors = {};

    var smallLineText = topListSvg
      .append("g")
      .attr("transform","translate("+marginSmallLine.left+","+marginSmallLine.top+")")
      .selectAll("text")
      .data(smallLineData)
      .enter()
      .append("text")
      .attr("class","top-list-new-svg-text")
      .attr("x",function(d){
        return widthSmallLine + 3;
      })
      .attr("y",function(d){
        return y(d.rollingArray.slice(-104)[104-1].volume)+6;
      })
      .html(function(d){
        if(mobile){
          return "<tspan dy='0'>"+d.term+"</tspan>";
        }
        return "<tspan style='font-size:11px;'>←</tspan><tspan dy='0'>"+d.term+"</tspan>";
      })
      .style("fill",function(d,i){
        textColors[d.term] = color(i);
        return color(i);
      })
      ;

    var topListYearColumn = topListContainer
      .selectAll("div")
      .data(topListDataMap)
      .enter()
      .append("div")
      .attr("class","top-list-new-year-column")
      .style("display",function(d){
        if(+d.key != 2016){
          return "none"
        }
        return null;
      })
      ;

    var titles = {
      first:{main:"top rising words in 2016",sub:"Words, ranked by Search interest&#185; growth, 2016"},
      second:{topMain:-18,topSub:4,main:"2016 words in context",sub:"Search interest&#185; for historically popular words vs. 2016"},
      third:{topMain:-60,topSub:-35,main:"2016 words vs. Peak &ldquo;Selfie&rdquo;",sub:"Maximum Search interest&#185; for historically popular words"},
      fourth:{main:"The Rise And Fall Of 50+ Words",sub:"Search interest&#185; of words terms, 2013 - 2016"}
    }

    if(mobile){
      titles.second.sub = "Search interest&#185; for established words vs. 2016"
      titles.third.sub = "Max. Search interest&#185; for established words"
      titles.fourth.sub = "Search interest&#185; for words, 2013 - 2016"
    }

    var leftColTitle = topListContainer
      .append("p")
      .attr("class","top-list-new-year-column-title")
      .html(titles.first.main)
      ;

    var leftColTitleSub = topListContainer
      .append("p")
      .attr("class","top-list-new-year-column-title top-list-new-year-column-sub")
      .html(titles.first.sub)
      ;

    var topListBackgroundYear = topListContainer.append("div")
      .attr("class","top-list-new-year-container-year")
      ;




    topListBackgroundYear.append("p")
      .attr("class","top-list-new-year-container-year-text")
      .style("color",function(d){
        return highlightColor;
      })
      .text(function(d){
        return "2016";
      })
      ;

    topListBackgroundYear.append("p")
      .attr("class","top-list-new-year-container-year-sub")
      .text("Words of the Year")
      .style("color",function(d){
        return highlightColor;
      })
      ;

    var topListItem = topListYearColumn
      .append("div")
      .attr("class","top-list-new-item-container")
      .selectAll("div")
      .data(function(d){
        return d.values;
      })
      .enter()
      .append("div")
      .attr("class","top-list-new-item")
      .style("width",itemWidth+"px")
      .style("top",function(d,i){
        return rowHeight*i+"px";
      })
      .style("display",function(d){
        if(d.topTen == false && +d.year == 2016){
          return "none";
        }
        return null;
      })
      .on("mouseover",function(d){
        var term = d.term;
        topListSvg.classed("path-mouseover",true);
        topListSvg.classed("path-scroll",false);


        topListItem.classed("row-highlight",function(d,i){
          if(d.term==term && !compareLive && !firstChartLive){
            return true;
          }
          return false;
        })
        ;

        smallLinePaths.classed("path-highlight",function(d){
          if(d.term == term){
            return true;
          }
          return false;
        });

        smallLineText.classed("text-highlight",function(d){
          if(d.term == term){
            return true;
          }
          return false;
        });
      })
      .on("mouseout",function(d){
        topListSvg.classed("path-mouseover",false);
        topListSvg.classed("path-scroll",true);

      })
      ;

    var topListItemTerm = topListItem.append("p")
      .attr("class","top-list-new-row-word")
      .html(function(d,i){
        if(i==0){
          return "<span class='year-right-col-absolute'>"+d.year+"</span><span class='top-list-number-new'>"+(i+1)+". </span>"+ d.term.replace("."," ").replace("."," ");
        }
        return "<span class='top-list-number-new'>"+(i+1)+". </span>"+ d.term.replace("."," ").replace("."," ");
      })
      .style("font-size",firstChartFontSize+"px")
      .style("left",function(d){
        var divWidth = d3.select(this).node().offsetWidth;
        d.width = divWidth;
        return termWidth-divWidth+"px";
      })
      ;

    var topListItemTermYears = d3.selectAll(".year-right-col-absolute");

    var topListItemLineNumbers = topListItem.append("p")
      .attr("class","top-list-new-row-amount")
      .text(function(d){
        var amount = d.termMax;
        if(amount > 10){
          return Math.round(d.termMax*10)/10;
        }
        return Math.round(d.termMax*100)/100;
      })
      ;

    var topListItemLines = topListItem.append("div")
      .attr("class","top-list-new-row-line")
      .style("left",function(d){
        var divWidth = d3.select(this.parentNode).select(".top-list-new-row-word").node().offsetWidth;
        d.width = divWidth;
        return termWidth-divWidth-lineWidth-10+"px";
      })
      .style("background-color",function(d,i){
        return textColors[d.term];
      })
      .style("width",lineWidth+"px")

    topListItemLines
      .filter(function(d){
        return d.topTen == true;
      })
      .on("mouseover",function(d){
        d3.select(this.parentNode).select(".top-list-new-row-word").style("opacity",1).style("color",highlightColor).style("font-weight",600);
        topListBackgroundYear.style("visibility","hidden")
      })
      .on("mouseout",function(d){
        d3.select(this.parentNode).select(".top-list-new-row-word")
          .style("opacity",function(){
            if(mobile){
              return 0;
            }
            return .2;
          })
          .style("color",highlightColor)
          .style("font-weight",null)
          ;

        if(scatterVisible){
          topListBackgroundYear.style("visibility","visible")
        }
      })
      ;


    var topListItemDefinition = topListItem
      .filter(function(d,i){
        return d.topTen == true;
      })
      .append("a")
      .attr("href",function(d){
        return "https://www.google.com/search?q=what%20is%20the%%20definition%20of%20"+d.term.replace(/\./g,'%20');
      })
      .attr("target","_blank")
      .append("div")
      .attr("class","top-list-new-row-definition")
      .style("width",function(){
        if(mobile){
          return itemWidth-termWidth-30+"px"
        }
        return itemWidth-termWidth-0+"px";
      })
      .style("opacity",function(d,i){
        if(i==0){
          return 1;
        }
        return null;
      })
      .on("mouseover",function(d){
        if(!compareLive){
          var term = d.term;
          topListItemDefinition.style("opacity",function(d,i){
            if(d.term == term){
              return 1;
            }
            return null;
          })
        }
      })

    topListItemDefinition.append("p")
      .attr("class","top-list-new-row-definition-text")
      .html(function(d){
        if(smallMobile){
          return "what is the definition of <span class='definition-highlight'>"+d.term.replace(/\./g,' ')+"</span>";
        }
        if(d.topTen){
          return "what is the definition of <span class='definition-highlight'>"+d.term.replace(/\./g,' ')+"</span>";
        }
        return null;
      })
      ;

    topListItemDefinition
      .append("div")
      .attr("class","top-list-new-row-definition-icon")
      .append("svg")
      .attr("focusable","false")
      .attr("xmlns","http://www.w3.org/2000/svg")
      .attr("viewBox","0 0 24 24")
      .append("path")
      .attr("d","M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z")
      ;

    var topListBackground = topListYearColumn.append("div")
      .attr("class","top-list-new-year-background")
      ;

    var topListBackgroundColumn = topListBackground.append("div")
      .attr("class","top-list-new-year-container-column")
      ;

    var widthLineWideInitial = containerWidth/2;
    var heightLineWideInitial = 400;

    var marginLineWide = {top:30, right:0, bottom:10, left:40};
    if(mobile){
      widthLineWideInitial = viewportWidth
      marginLineWide.left = 20;
      marginLineWide.right = 60;
      if(smallMobile){
        heightLineWideInitial = 350;
      }
    }
    var widthLineWide = widthLineWideInitial - marginLineWide.left - marginLineWide.right,
      heightLineWide = heightLineWideInitial - marginLineWide.top - marginLineWide.bottom
      ;

    var topListLineWideContainer = topListContainer.append("div")
      .attr("class","top-list-new-wide-svg-container")
      ;

    var topListLineWideContainerSource = topListLineWideContainer.append("div")
      .attr("class","top-list-new-wide-svg-source")
      ;
      // .style("top",heightLineWide+marginLineWide.top+marginLineWide.bottom+25+"px")
      // .style("left",function(){
      //   if(mobile){
      //     return null;
      //   }
      //   return topListLineWideContainerSourceLeftInitial+"px";
      // })

    topListLineWideContainerSource
      .append("p")
      .attr("class","top-list-new-wide-svg-source-text")
      .html("*To identify emerging words, we required that they were historically uncommon (i.e., rarely searched) relative to routinely searched definitions.")
      ;

    topListLineWideContainerSource
      .append("p")
      .attr("class","top-list-new-wide-svg-source-text")
      .html("&#185;Searches for &ldquo;definition of&rdquo; word, using a moving 3-month average, and removing proper nouns and acronyms")
      ;

    // topListLineWideContainerSource
    //   .append("p")
    //   .attr("class","top-list-new-wide-svg-source-text")
    //   .html("&#178;")
    //   ;

    function buildGridLines(){

      topLineNewSvgContainer
        .append("line")
        .attr("class","top-list-new-svg-line")
        .attr("x1",marginSmallLine.left)
        .attr("x2",marginSmallLine.left+widthSmallLine)
        .attr("y1",marginSmallLine.top+heightSmallLine+5)
        .attr("y2",marginSmallLine.top+heightSmallLine+5)
        ;

      topLineNewSvgContainer.append("line")
        .attr("class","top-list-new-svg-line-grid")
        .attr("x1",marginSmallLine.left)
        .attr("x2",marginSmallLine.left+widthSmallLine)
        .attr("y1",marginSmallLine.top+heightSmallLine/3)
        .attr("y2",marginSmallLine.top+heightSmallLine/3)
        ;

      topLineNewSvgContainer.append("line")
        .attr("class","top-list-new-svg-line-grid")
        .attr("x1",marginSmallLine.left)
        .attr("x2",marginSmallLine.left+widthSmallLine)
        .attr("y1",marginSmallLine.top)
        .attr("y2",marginSmallLine.top)
        ;

      topLineNewSvgContainer.append("line")
        .attr("class","top-list-new-svg-line-grid")
        .attr("x1",marginSmallLine.left)
        .attr("x2",marginSmallLine.left+widthSmallLine)
        .attr("y1",marginSmallLine.top+heightSmallLine*.66)
        .attr("y2",marginSmallLine.top+heightSmallLine*.66)
        ;

    }
    buildGridLines();

    topListLineWide = topListLineWideContainer.append("svg")
      .attr("class","top-list-new-wide-svg")
      .attr("width",containerWidth)
      // .attr("width",widthLineWide+marginLineWide.left+marginLineWide.right)
      .attr("height",heightLineWide+marginLineWide.top+marginLineWide.bottom)
      ;

    topListLineWide.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", marginLineWide.top)
      .attr("width",  containerWidth)
      .attr("height", heightLineWide- 1);

    var topListLineWideGrid = topListLineWide
      .append("g")
      .attr("class","top-list-new-wide-svg-line-container")
      ;

    var topListLineWideAxis = topListLineWideGrid
      .append("g")
      .attr("transform","translate("+marginLineWide.left+","+(marginLineWide.bottom+marginLineWide.top+heightLineWide)+")")
      .attr("class","top-list-new-wide-svg-axis")
      .selectAll("text")
      .data(["2013","2014","2015","2016","2017"])
      .enter()
      .append("text")
      .attr("class","top-list-new-wide-svg-axis-text")
      .attr("x",function(d,i){
        return widthLineWide/4*i;
      })
      .attr("y",0)
      .text(function(d){
        return d;
      })
      ;

    var topListLineWideLine = topListLineWideGrid
        .append("line")
        .attr("class","top-list-new-wide-svg-line")
        .attr("x1",marginLineWide.left)
        .attr("x2",marginLineWide.left+widthLineWide)
        .attr("y1",marginLineWide.top+heightLineWide)
        .attr("y2",marginLineWide.top+heightLineWide)
        ;

    var fullTextWidth = 200;

    var xWide = d3.scaleLinear().domain([0,214]).range([0,widthLineWide]);
    var yWide = d3.scaleLinear().domain([0,5]).range([heightLineWide,0]);
    var yWideFull = d3.scaleLinear().domain([0,yWideMax]).range([heightLineWide,0]);
    var xWideFull = d3.scaleLinear().domain([0,214]).range([0,containerWidth-marginLineWide.left-fullTextWidth-rightSpacing]);

    if(mobile){
      xWideFull.range([0,widthLineWide])
    }

    var wideLineFull = d3.line()
      .x(function(d,i) {
        return xWideFull(d.date);
      })
      .y(function(d) {
        return yWideFull(d.volume);
      })
      .curve(d3.curveLinear)
      ;

    var wideLine = d3.line()
        .x(function(d,i) {
          return xWide(d.date);
        })
        .y(function(d) {
          return yWide(d.volume);
        })
        .curve(d3.curveLinear)
        ;

    var voronoiWideLine = d3.voronoi()
        .x(function(d) {
          return xWide(d.date);
        })
        .y(function(d) {
          return yWide(d.volume);
        })
        .extent([[-marginLineWide.left, -marginLineWide.top], [widthLineWide + marginLineWide.right, heightLineWide + marginLineWide.bottom]])
        ;

    var voronoiWideLineTwo = d3.voronoi()
        .x(function(d) {
          return xWide(d.date);
        })
        .y(function(d) {
          return yWideFull(d.volume);
        })
        .extent([[-marginLineWide.left, -marginLineWide.top], [widthLineWide + marginLineWide.right, heightLineWide + marginLineWide.bottom]])
        ;

    var topListLineWideCompare = topListLineWide
      .append("g")
      .attr("class","top-list-new-wide-svg-compare-container")

    var compareLine = topListLineWideCompare
      .append("line")
      .attr("class","top-list-new-wide-svg-compare-line")
      .attr("x1",marginLineWide.left)
      .attr("x2",marginLineWide.left+widthLineWide)
      .attr("y1",marginLineWide.top+ +yWideFull(compareWord.termMax)-2)
      .attr("y2",marginLineWide.top+ +yWideFull(compareWord.termMax)-2)
      ;

    var compareLineRect = topListLineWideCompare
      .append("rect")
      .attr("class","top-list-new-wide-svg-compare-rect")
      .attr("x",marginLineWide.left)
      .attr("y",(marginLineWide.top+yWideFull(compareWord.termMax))-10)
      .attr("width",70)
      .attr("height",40)
      ;

    var compareText = topListLineWideCompare
      .append("text")
      .attr("class","top-list-new-wide-svg-compare-text")
      .attr("x",marginLineWide.left)
      .attr("y",(marginLineWide.top+yWideFull(compareWord.termMax))-4)
      .html(function(d){
        return "<tspan x='"+marginLineWide.left+"' dy='5'>Peak &ldquo;"+compareWord.term.replace(/\./g,' ')+"&rdquo;</tspan>";
      })
      ;

    var topListLineWideLineContainer = topListLineWide
      .append("g")
      .attr("clip-path", "url(#clip)")
      .attr("class","top-list-new-wide-svg-path-container")
      ;

    var lineChartWideData = [];

    for (var year in topListDataMap){
      for (var term in topListDataMap[year].values){
        lineChartWideData.push(topListDataMap[year].values[term])
      }
    }

    var wideScreenTopHeight = 147;

    var wideScreenTopCompare = topListLineWideContainer
      .append("div")
      .attr("class","top-list-new-wide-screen-top-compare")
      .style("height",(yWideFull(4)+2)+"px")
      .style("top",function(d){
        return (marginLineWide.top-2)+"px";
      })
      .style("width",containerWidth/2+"px")
      .style("left",marginLineWide.left+"px")
      ;

    var wideScreenTop = topListLineWideContainer
      .append("div")
      .attr("class","top-list-new-wide-screen-top")
      .style("height",wideScreenTopHeight+"px")
      .style("top",function(d){
        return (yWide(4)-wideScreenTopHeight+marginLineWide.top-2)+"px";
      })
      .style("left",marginLineWide.left+"px")
      .style("width",function(){
        if(mobile){
          return widthLineWide+"px"
        }
        return null;
      })
      ;

    var rareThreshold = wideScreenTop.append("p")
      .attr("class","top-list-new-wide-screen-word")
      .html("rare search terms ↓")
      ;

    var rareThreshold = wideScreenTop.append("p")
      .attr("class","top-list-new-wide-screen-word top-list-new-wide-screen-word-top")
      .html("rising search terms ↑")
      ;

    var wideScreenLeft = topListLineWideContainer
      .append("div")
      .attr("class","top-list-new-wide-screen-left")
      .style("height",marginLineWide.top+heightLineWide+"px")
      ;

    var wideLinePathsVoronoiContainer = topListLineWideLineContainer
      .append("g")
      .attr("transform","translate("+marginLineWide.left+","+marginLineWide.top+")")
      .attr("class","top-list-new-wide-svg-voronoi-path-container")
      ;

    var wideLinePathsVoronoiContainerTwo = topListLineWideLineContainer
      .append("g")
      .attr("transform","translate("+marginLineWide.left+","+marginLineWide.top+")")
      .attr("class","top-list-new-wide-svg-voronoi-path-container-two")
      ;

    var wideLinePathsVoronoi = wideLinePathsVoronoiContainer
      .selectAll("path")
      .data(voronoiWideLine.polygons(
          d3.merge(lineChartWideData.filter(function(d){
            return d.topTen == true;
          })
            .map(function(d){
            var term = d.term;
            return d.rollingArray.map(function(d,i){
              return {date:d.date,volume:d.volume,term:term};
            });
          }))
        )
      )
      .enter()
      .append("path")
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
      .attr("class","top-list-new-wide-svg-voronoi-paths")
      .on("mouseover",function(d){
        var term = d.data.term;

        topListBackgroundYear.style("visibility","hidden")

        var item = topListItem.filter(function(d){
          return term == d.term
        })
        ;
        item.select(".top-list-new-row-line").style("background-color",function(d){
          return textColors[d.term];
        });
        item.select(".top-list-new-row-word").style("color",function(d){
          return textColors[d.term];
        }).style("opacity",1).style("font-weight",600);

        wideLinePaths
          .filter(function(d){
            return term == d.term
          })
          .style("stroke",function(d,i){
            return textColors[d.term];
          })
          .style("stroke-opacity",function(d){
            return 1;
          })
          ;
      })
      .on("mouseout",function(d){

        var term = d.data.term;

        if(scatterVisible){
          topListBackgroundYear.style("visibility","visible")
        }

        var item = topListItem.filter(function(d){
          return term == d.term
        })
        ;

        item.select(".top-list-new-row-line").style("background-color",highlightColor);

        item.select(".top-list-new-row-word")
          .style("color",function(d,i){
            if(mouseoverEffect){
              return "rgb(142, 151, 167)"
            }
            return textColors[d.term];
          })
          .style("opacity",function(){
            if(mouseoverEffect){
              if(mobile){
                return 0;
              }
              return .2;
            }
            return null;
          })
          .style("font-weight",null)
          ;

        wideLinePaths
          .filter(function(d){
            return term == d.term
          })
          .style("stroke",function(d){
            return highlightColor;
          })
          .style("stroke-opacity",function(d){
            return .5;
          })
          ;

      })
      ;

    var wideLinePathsVoronoiTwo = wideLinePathsVoronoiContainerTwo
      .selectAll("path")
      .data(voronoiWideLineTwo.polygons(
          d3.merge(lineChartWideData.filter(function(d){
            return d.topTen == true;
          })
            .map(function(d){
            var term = d.term;
            return d.rollingArray.map(function(d,i){
              return {date:d.date,volume:d.volume,term:term};
            });
          }))
        )
      )
      .enter()
      .append("path")
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
      .attr("class","top-list-new-wide-svg-voronoi-paths-two")
      .on("mouseover",function(d){
        var term = d.data.term;

        topListBackgroundYear.style("visibility","hidden")

        var item = topListItem.filter(function(d){
          return term == d.term
        })
        ;
        item.select(".top-list-new-row-line").style("background-color",function(d){
          return textColors[d.term];
        });
        item.select(".top-list-new-row-word").style("color",function(d){
          return textColors[d.term];
        }).style("opacity",1).style("font-weight",600);

        wideLinePaths
          .filter(function(d){
            return term == d.term
          })
          .style("stroke",function(d){
            return textColors[d.term];
          })
          .style("stroke-opacity",function(d){
            return 1;
          })
          ;
      })
      .on("mouseout",function(d){

        var term = d.data.term;

        if(scatterVisible){
          topListBackgroundYear.style("visibility","visible")
        }

        var item = topListItem.filter(function(d){
          return term == d.term
        })
        ;

        item.select(".top-list-new-row-line").style("background-color",highlightColor);
        item.select(".top-list-new-row-word")
          .style("color",function(d,i){
            if(mouseoverEffect){
              return "rgb(142, 151, 167)"
            }
            return textColors[d.term];
          })
          .style("opacity",function(){
            if(mouseoverEffect){
              if(mobile){
                return 0;
              }
              return .2;
            }
            return null;
          })
          .style("font-weight",null);

        wideLinePaths
          .filter(function(d){
            return term == d.term
          })
          .style("stroke",function(d){
            return highlightColor;
          })
          .style("stroke-opacity",function(d){
            return .5;
          })
          ;

      })
      ;

    var wideLinePaths = topListLineWideLineContainer
      .append("g")
      .attr("transform","translate("+marginLineWide.left+","+marginLineWide.top+")")
      .selectAll("path")
      .data(lineChartWideData)
      .enter()
      .append("path")
      .attr("class","top-list-new-wide-svg-paths")
      .style("stroke",highlightColor)
      .style("stroke-opacity",function(){
        if(mobile){
          return 0;
        }
        return .5;
      })
      .attr("d",function(d){
        var dataPoints = d.rollingArray.filter(function(d){
          return d.volume < 4;
        })
        var finalPointDate = dataPoints[dataPoints.length-1].date;
        d.finalPointDate = finalPointDate - 1;

        var points = d.rollingArray.slice(0,d.finalPointDate);
        points.push({date:d.finalPointDate+1,volume:4});
        return wideLine(points);
      })
      .attr("stroke-dasharray",function(d){
        if(mobile){
          return null;
        }
        var totalLength = d3.select(this).node().getTotalLength();
        return 0 + " " + totalLength;
      })
      .on("mouseover",function(d){
      })
      ;

    var fontScale = d3.scaleLinear().domain([25,0]).range([10,12]);
    var colorScaleTwo = d3.scaleLinear().domain([40,0]).range([".8","1"])

    var widthCompareCol = 180;


    var topListLineWideContainerCloudSelector = topListLineWideContainer;
    if(mobile){
      topListLineWideContainerCloudSelector = d3.select(".mobile-word-selector");
    }

    var topListLineWideContainerCloud = topListLineWideContainerCloudSelector
      .append("div")
      .attr("class","horz-word-selector")
      .style("left",function(){
        if(mobile){
          return null;
        }
        return xWideFull.range()[1]+marginLineWide.left +rightTermsOffset + rightSpacing +"px";
      })
      .style("height",function(){
        if(mobile){
          return null
        }
        return marginLineWide.top+heightLineWide+"px"
      })
      .style("width",function(){
        if(mobile){
          return null;
        }
        return widthCompareCol+"px";
      })

    var termsWrapper = topListLineWideContainerCloud
      .selectAll("div")
      .data(topListDataMap)
      .enter()
      .append("div")
      .attr("class","horz-word-cloud-wrapper")

    termsWrapper
      .style("border-bottom",function(d,i){
        if(i == termsWrapper.size()-1){
          return "none";
        }
        return null;
      })
      ;

    var terms = termsWrapper
      .selectAll("div")
      .data(function(d){
        return d.values;
      })
      .enter()
      .append("div")
      .style("font-size", function(d,i) {
        // if(mobile){
          if(smallMobile){
            return "10px";
          }
          return "12px";
        // }
        // return fontScale(i) + "px";
      })
      .style("line-height", function(d) {
        var fontSize = fontScale(+d.rho);
        if(fontSize > 34){
          return "35px"
        }
        if(fontSize < 34 && fontSize > 20){
          return "24px"
        }
        return Math.max(fontScale(+d.rho)*1.1,14) + "px";
      })
      .style("opacity", function(d,i) {
        return colorScaleTwo(i);
      })
      .attr("class",function(d,i){
        if(i>14){
          return "horz-word-cloud-text horz-word-cloud-text-hidden";
        }
        return "horz-word-cloud-text";
      })
      .html(function(d,i) {
        if(i%25==0){
          return "<span class='year-right-col' style=''>"+d.year+"</span><span class='number' style='font-size:9px;'>"+(i%25+1)+". </span><span class='cloud-term'>"+d.term.replace("."," ")+"</span>";
        }
        return "<span class='number' style='font-size:9px;'>"+(i%25+1)+". </span><span class='cloud-term'>"+d.term.replace("."," ")+"</span>";
      })
      .on("click",function(d){
        var word = d.term;

        if(wordsToCompare.indexOf(d.term) == -1){

          wordsToCompare.push(d.term);
          var index = wordsToCompare.indexOf(d.term);
          if(d.termMax > yWideCompareMax){

            yWideCompareMax = d.termMax;

            yWideFull.domain([0,yWideCompareMax+5]);

            compareLine
              .transition()
              .duration(500)
              .attr("y1",marginLineWide.top+ +yWideFull(compareWord.termMax)-2)
              .attr("y2",marginLineWide.top+ +yWideFull(compareWord.termMax)-2)
              ;

            compareLineRect
              .transition()
              .duration(500)
              .attr("y",(marginLineWide.top+yWideFull(compareWord.termMax))-10)
              ;

            compareText
              .transition()
              .duration(500)
              .attr("y",(marginLineWide.top+yWideFull(compareWord.termMax))-4)
              ;

            wideLinePaths
              .transition()
              .duration(500)
              .attr("d",function(d){
                return wideLineFull(d.rollingArray);
              })
              ;

            topListItem
              .transition()
              .duration(500)
              .style("top",function(d){
                return yWideFull(d.termMax)+"px";
              })
              ;

            wideLinePaths
              .filter(function(d){
                return d.term == word;
              })
              .transition()
              .duration(500)
              .delay(500)
              .style("stroke-opacity",function(d){
                return 1;
              })
              .style("stroke",function(d){
                return color(wordsToCompare.indexOf(d.term));
              })
              .style("stroke-width",function(d){
                return "1.5px";
              })
              ;
          }
          else{
            wideLinePaths
              .filter(function(d){
                return d.term == word;
              })
              .transition()
              .duration(500)
              .style("stroke-opacity",function(d){
                return 1;
              })
              .style("stroke",function(d){
                return color(wordsToCompare.indexOf(d.term));
              })
              .style("stroke-width",function(d){
                return "1.5px";
              })
              ;
          }

          d3.select(this)
            .style("color",function(d){
              return color(index);
            })
            .select(".cloud-term")
            .style("background-color",function(d){
              var fill = d3.color(color(index));
              return "rgba("+fill.r+","+fill.g+","+fill.b+",.12)";
            })
            ;

          topListItemTerm
            .filter(function(d){
              return d.term == word;
            })
            .transition()
            .duration(500)
            .style("opacity",function(d){
              return 1;
            })
            .style("color",function(d){
              return color(index);
            })
            ;

          topListItem
            .transition()
            .duration(500)
            .style("top",function(d){
              return yWideFull(d.termMax)+"px";
            })
            ;

        }
        else if(wordsToCompare.length == 1){

        }
        else{

          var index = wordsToCompare.indexOf(d.term);
          wordsToCompare.splice(index, 1);

          if(d.termMax == yWideCompareMax){
            var maxes = [];
            wideLinePaths
              .each(function(d){
                if(wordsToCompare.indexOf(d.term) > -1){
                  maxes.push(+d.termMax);
                }
              })
              ;
            yWideCompareMax = d3.max(maxes);

            yWideFull.domain([0,yWideCompareMax+5]);

            compareLine
              .transition()
              .duration(500)
              .attr("y1",marginLineWide.top+ +yWideFull(compareWord.termMax)-2)
              .attr("y2",marginLineWide.top+ +yWideFull(compareWord.termMax)-2)
              ;

            compareLineRect
              .transition()
              .duration(500)
              .attr("y",(marginLineWide.top+yWideFull(compareWord.termMax))-10)
              ;

            compareText
              .transition()
              .duration(500)
              .attr("y",(marginLineWide.top+yWideFull(compareWord.termMax))-4)
              ;

            wideLinePaths
              .transition()
              .duration(500)
              .attr("d",function(d){
                return wideLineFull(d.rollingArray);
              })
              ;

            wideLinePaths
              .filter(function(d){
                return d.term == word;
              })
              .transition()
              .duration(500)
              .delay(500)
              .style("stroke-opacity",function(d){
                if(mobile){
                  return 0;
                }
                return 0;
              })
              .style("stroke",function(d){
                return "rgb(0, 0, 0)";
              })
              .style("stroke-width",function(d){
                return "1px";
              })
              .style("top",function(d){
                return yWideFull(d.termMax)+"px";
              })
              ;

            topListItem
              .transition()
              .duration(500)
              .style("top",function(d){
                return yWideFull(d.termMax)+"px";
              })
              ;

          }
          else{
            wideLinePaths
              .filter(function(d){
                return d.term == word;
              })
              .transition()
              .duration(500)
              .style("stroke-opacity",function(d){
                if(mobile){
                  return 0;
                }
                return 0;
              })
              .style("stroke",function(d){
                return "rgb(0, 0, 0)";
              })
              .style("stroke-width",function(d){
                return "1px";
              })
              .style("top",function(d){
                return yWideFull(d.termMax)+"px";
              })
              ;

          }


          topListItemTerm
            .filter(function(d){
              return d.term == word;
            })
            .transition()
            .duration(500)
            .style("opacity",function(d){
              return 0;
            })
            .style("color",function(d){
              return null;
            })
            ;

          d3.select(this)
            .style("color",function(d){
              return null;
            })
            .select(".cloud-term")
            .style("background-color",function(d){
              return null;
            })
            ;

          topListItem
            .transition()
            .duration(500)
            .style("top",function(d){
              return yWideFull(d.termMax)+"px";
            })
            ;

        }

      })
      ;

    topListLineWideContainerCloud
      .append("p")
      .attr("class","horz-word-selector-label")
      .text("Filter Words")
      ;

    function scatterChart(){
      mouseoverEffect = true;
      if(mobile){
        openingLineChart
          .style("opacity",null)
          .style("pointer-events",null)
          ;
      }

      scatterVisible = true;
      wideLinePathsVoronoiContainer.style("pointer-events","all")
      wideLinePathsVoronoiContainerTwo.style("pointer-events",null);

      topListLineWideContainerSource
        .style("left",function(){
          if(mobile){
            return null;
          }
          return marginLineWide.left+"px"
        })
        .style("opacity",1)
        ;

      topListItemLineNumbers.style("visibility","hidden");
      wideScreenTop.style("visibility","visible");
      topListLineWideGrid.style("visibility","visible");

      compareLive = true;

      topListItemDefinition
        .style("opacity",0)
        .style("pointer-events","none")
        .style("display","none")
        ;

      topListItemLines
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .style("visibility","visible")
        .style("left","0px")
        .style("width","7px")
        .style("border-radius","4px")
        .style("height","7px")
        .style("top","24px")
        .style("background-color",function(d){
          if(d.year == "2016"){
            return highlightColor;
          }
          return compareColor;
        })
        ;

      topListItemTerm
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .style("font-weight",function(d){
          if(d.year == "2016"){
            return null;
          }
          if(mobile){
            return 400;
          }
          return 600;
        })
        .style("width","100px")
        .style("font-size","10px")
        .style("left",0+"px")
        .style("font-size","10px")
        .style("transform","rotate(-45deg)")
        .style("color",function(d){
          if(d.year == "2016"){
            return highlightColor;
          }
          return compareColor;
        })
        .style("opacity",function(d){
          if(d.year == "2016"){
            if(mobile){
              return 0;
            }
            return .2;
          }
          return 1;
        })
        .transition()
        .duration(function(){
          if(mobile){
            return 200;
          }
          return 200;
        })
        .style("left","-5px")
        .style("top","9px")
        ;

      wideScreenLeft
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .style("left",function(){
          if(mobile){
            return (marginLineWide.left+widthLineWide+1)+"px";
          }
          return (marginLineWide.left+widthLineWide+1)+"px";
        })
        .style("width","1px")
        ;

      topListItem
        .transition()
        .duration(function(d){
          if(mobile){
            return 0;
          }
          if (d.year == "2016"){
            return 800;
          }
          return 0;
        })
        .style("pointer-events","none")
        .style("left",function(d){
          if(d.year == "2016"){
            if(mobile){
              return "0px";
            }
            return marginLineWide.left+xWide(d.finalPointDate)+"px";
          }
          return "-1000px";
        })
        .filter(function(d){
          if(mobile){
            if(d.year == "2016" || wordsToShow.indexOf(d.term) > -1){
              return d;
            }
            return null;
          }
          return d;
        })
        .style("top",function(d){
          return yWide(4)+"px";
        })
        .style("width",lineWidth+"px")
        .style("border-bottom","none")
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .delay(function(d){
          if(mobile){
            return 0;
          }
          if (d.year == "2016"){
            return 0;
          }
          return 800;
        })
        .style("left",function(d){
          if(d.year == "2016" || wordsToShow.indexOf(d.term) > -1){
            return marginLineWide.left+xWide(d.finalPointDate)+"px";
          }
          return "-1000px";
        })
        ;

      wideLinePaths
        .filter(function(d){
          return wordsToShow.indexOf(d.term) != -1;
        })
        .style("stroke-opacity",1)
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .delay(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .style("stroke",compareColor)
        .attr("stroke-dasharray",function(d){
          if(mobile){
            return null;
          }
          var totalLength = d3.select(this).node().getTotalLength();
          return totalLength + " " + 0;
        })
        ;

      wideLinePaths
        .filter(function(d,i){
          return d.topTen == true
        })
        .transition()
        .duration(0)
        .style("stroke-opacity",.5)
        .attr("stroke-dasharray",function(d){
          if(mobile){
            return null;
          }
          var totalLength = d3.select(this).node().getTotalLength();
          return totalLength + " " + 0;
        })
        ;

      topListYearColumn
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 600;
        })
        .style("left",function(d,i){
          return 0+"px";
        })
        ;

      leftColTitle
        .text(titles.second.main)
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 300;
        })
        .delay(function(){
          if(mobile){
            return 0
          }
          return 200;
        })
        .style("top",titles.second.topMain+"px")
        .style("left",function(){
          if(mobile){
            return "0px";
          }
          return marginLineWide.left+"px";
        })
        ;

      leftColTitleSub
        .html(titles.second.sub)
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 300;
        })
        .delay(function(){
          if(mobile){
            return 0
          }
          return 200;
        })
        .style("top",titles.second.topSub+"px").style("left",function(){
          if(mobile){
            return "0px";
          }
          return marginLineWide.left+"px";
        })
        ;

      topListBackgroundYear.style("visibility","visible");

      topListItem.classed("row-highlight", false)

    }
    function compareMax(){
      scatterVisible = false;
      var duration = 1000;

      wideLinePathsVoronoiContainer.style("pointer-events",null)
      wideLinePathsVoronoiContainerTwo.style("pointer-events","all")

      topListLineWideCompare
        .transition()
        .duration(0)
        .delay(function(){
          if(mobile){
            return 0;
          }
          return 1000+duration
        })
        .style("visibility","visible")
        ;

      yWide.domain([0,yWideMax]);

      topListBackgroundYear.style("visibility","hidden");

      wideScreenTopCompare
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return duration;
        })
        .delay(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .style("visibility","visible")
        .style("height",0+"px")
        ;

      wideScreenTop
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .style("top",(yWide(4)-wideScreenTopHeight+marginLineWide.top)+"px")
        .transition()
        .duration(0)
        .style("background","none")
        ;

      wideLinePaths
        .filter(function(d){
          return d.topTen == true || wordsToShow.indexOf(d.term) > -1;
        })
        .transition()
        .duration(0)
        .attr("stroke-dasharray",function(d){
          if(mobile){
            return null;
          }
          var totalLength = d3.select(this).node().getTotalLength();
          return totalLength + " " + 0;
        })
        .style("stroke",function(d){
          if(d.year == "2016"){
            return highlightColor;
          }
          return compareColor;
        })
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .attr("d",function(d){
          var points = d.rollingArray.slice(0,d.finalPointDate);
          points.push({date:d.finalPointDate+1,volume:4});
          return wideLine(points);
        })
        .transition()
        .duration(0)
        .attr("d",function(d){
          return wideLine(d.rollingArray.slice(0,d.termMaxDate+1));
        })
        ;

      topListItem
        .transition()
        .duration(0)
        .style("left",function(d){
          if(d.year == "2016" || wordsToShow.indexOf(d.term) > -1){
            return marginLineWide.left+xWide(d.finalPointDate)+"px";
          }
          return "-1000px";
        })
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .style("top",function(d){
          return yWide(4)+"px";
        })
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .style("left",function(d){
          if(d.year == "2016" || wordsToShow.indexOf(d.term) != -1){
            return marginLineWide.left+xWide(d.termMaxDate-1)+"px";
          }
          return "-1000px";
        })
        .style("top",function(d){
          return yWide(d.termMax)+"px";
        })
        ;

      leftColTitle
        .html(titles.third.main)
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 200;
        })
        .style("left",function(){
          if(mobile){
            return null;
          }
          return marginLineWide.left+"px"
        })
        .style("top",titles.third.topMain+"px")
        ;

      leftColTitleSub
        .html(titles.third.sub)
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 200;
        })
        .style("left",function(){
          if(mobile){
            return null;
          }
          return marginLineWide.left+"px"
        })
        .style("top",titles.third.topSub+"px")
        ;

    }
    var sourceText;
    if(mobile){
      sourceText =  d3.select(".top-list-new-wide-svg-source");
    }

    function compareFull(){
      if(mobile){
        sourceText.style("visibility","hidden");
      }
      wideLinePathsVoronoiContainer.style("pointer-events",null);
      wideLinePathsVoronoiContainerTwo.style("pointer-events",null);

      scatterVisible = false;
      wordsToCompare = [];
      for (var word in wordsToCompareSaved){
        wordsToCompare.push(wordsToCompareSaved[word]);
      }
      yWideFull.domain([0,yWideMax]);
      var delay = 500;
      var rowHeightFull = 17;

      leftColTitle
        .html(titles.fourth.main)
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .delay(function(){
          if(mobile){
            return 0;
          }
          return delay;
        })
        .style("left",function(){
          if(mobile){
            return null;
          }
          return marginLineWide.left+"px";
        })
        .style("width",function(){
          if(mobile){
            return null;
          }
          return xWideFull.range()[1]+marginLineWide.left+"px";
        })
        ;

      leftColTitleSub
        .html(titles.fourth.sub)
        ;

      topListItem
        .filter(function(d){
          return d.topTen == false && +d.year == 2016;
        })
        .style("display",null)
        ;

      topListItem
        .transition()
        .duration(delay)
        .transition()
        .duration(500)
        .style("top",function(d){
          return yWide(d.termMax)+"px";
        })
        .style("width","20px")
        .style("left",function(d){
          return marginLineWide.left+xWideFull(d.termMaxDate-1)+"px";
        })
        ;

      wideScreenLeft
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 1000;
        })
        .style("visibility","hidden")
        .style("left",xWideFull.range()[1]+marginLineWide.left+"px")
        .style("width","1px")
        ;

      topListItemLines
        .transition()
        .duration(delay)
        .style("background-color",function(d){
          return color(wordsToCompare.indexOf(d.term));
        })
        .style("opacity",0)
        ;

      topListItemTerm
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return delay;
        })
        .style("left",-6+"px")
        .style("font-size","10px")
        .style("transform","rotate(-45deg)")
        .style("opacity",function(d){
          if(wordsToCompare.indexOf(d.term) > -1){
            return 1;
          }
          return 0;
        })
        .style("font-weight",function(){
          if(mobile){
            return 400;
          }
          return 600;
        })
        .style("color",function(d){
          if(wordsToCompare.indexOf(d.term)!=-1){
            return color(wordsToCompare.indexOf(d.term));
          }
          return "rgb(55, 71, 79)"
        })
        ;

      compareLine
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .delay(function(){
          if(mobile){
            return 0;
          }
          return delay;
        })
        .attr("x2",xWideFull.range()[1]+marginLineWide.left)
        ;

      wideScreenTop
        .transition()
        .duration(0)
        // .delay(0)
        .style("visibility","hidden")
        ;

      topListLineWideLine
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .delay(function(){
          if(mobile){
            return 0;
          }
          return delay;
        })
        .attr("x2",xWideFull.range()[1]+marginLineWide.left)
        ;

      topListLineWideAxis
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .delay(function(){
          if(mobile){
            return 0;
          }
          return delay;
        })
        .attr("x",function(d,i){
          return xWideFull.range()[1]/4*i;
        })
        ;

      wideScreenTopCompare
        .transition()
        .duration(0)
        .style("height",0+"px")
        ;

      wideLinePaths
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return delay;
        })
        .style("stroke-opacity",function(d){
          if(wordsToCompare.indexOf(d.term)!=-1){
            return 1;
          }
          if(mobile){
            return 0;
          }
          return 0;
        })
        .attr("d",function(d){
          return wideLine(d.rollingArray);
        })
        .style("stroke",function(d){
          var index = wordsToCompare.indexOf(d.term);
          if(index>-1){
            return color(wordsToCompare.indexOf(d.term));
          }

          return "black";
        })
        .style("stroke-width",function(d){
          var index = wordsToCompare.indexOf(d.term);
          if(index > -1){
            return null;
          }
          return "1px";
        })
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .attr("stroke-dasharray",function(d){
          if(mobile){
            return null;
          }
          var totalLength = d3.select(this).node().getTotalLength();
          return totalLength + " " + 0;
        })
        .attr("d",function(d){
          return wideLineFull(d.rollingArray);
        })
        ;

      topListLineWideContainerCloud
        .transition()
        .duration(0)
        .delay(function(){
          if(mobile){
            return 0;
          }
          return delay+500;
        })
        .style("display",function(){
          if(mobile){
            return null;
          }
          return "block";
        })
        ;

      termsWrapper
        .transition()
        .duration(function(){
          if(mobile){
            return 0;
          }
          return 500;
        })
        .delay(function(d,i){
          if(mobile){
            return 0;
          }
          return delay+200+(i*100)
        })
        .style("opacity",1)
        ;

      terms
        .style("color",function(d){
          var index = wordsToCompare.indexOf(d.term);
          if(index>-1){
            return color(index);
          }
          return null;
        })
        .select(".cloud-term")
        .style("background-color",function(d){
          var index = wordsToCompare.indexOf(d.term);
          if(index>-1){
            var fill = d3.color(color(index));
            return "rgba("+fill.r+","+fill.g+","+fill.b+",.12)";
          }
          return null;
        })
        ;
    }
    var sectionScroll = -1;

    // if(mobile){
    //   var selectorOffset = d3.select(".compare-full").node();
    //   var selectorOffsetTwo = d3.select(".title-block").node();
    // }

    var pinHook = 0;
    var pinDuration = "400%"
    // var fixedTriggerElement = ".container"
    // if(mobile){
    //   pinHook = 0;
    //   //pinDuration = viewportHeight*4.9+"px";
    //   pinDuration = selectorOffset.offsetTop - selectorOffsetTwo.offsetTop + (selectorOffsetTwo.offsetHeight*(1/(1.2)) - 500);
    //   if(smallMobile){
    //     pinDuration = selectorOffset.offsetTop - selectorOffsetTwo.offsetTop + (selectorOffsetTwo.offsetHeight*(1/(1.2)) - 450);
    //   }
    //   fixedTriggerElement = ".title-block";
    //   //pinDuration = "100%";
    //   //pinDuration = "515%";
    //
    // }

    // fixedScene = new ScrollMagic.Scene({
    //     triggerElement: fixedTriggerElement,
    //     triggerHook:pinHook,
    //     duration:pinDuration
    //   })
    //   .setPin(".top-list-new", {pushFollowers: false})
    //   // .addIndicators({name: "set pin"}) // add indicators (requires plugin)
    //   .addTo(controller)
    //   .on("enter",function(e){
    //     var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0,window.screen.availHeight);
    //     // fixedScene.duration(viewportHeight*5.15);
    //     if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //     }
    //     else{
    //       if(!mobile){
    //         window.clearTimeout(cycleTimeout);
    //       }
    //     }
    //   })
    //   .on("leave",function(e){
    //     var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0,window.screen.availHeight);
    //     // fixedScene.duration(viewportHeight*5.15);
    //     if(e.target.controller().info("scrollDirection") == "FORWARD"){
    //     }
    //     else{
    //       if(!mobile){
    //         window.clearTimeout(cycleTimeout);
    //         cycle();
    //       }
    //
    //     }
    //     ;
    //   })
    //   ;

    // var sectionScrollSceneDuration = viewportHeight/2;
    // if(mobile){
    //   sectionScrollSceneDuration = viewportHeight*1.2;
    //   sectionScrollSceneDuration = 200;
    //   //sectionScrollSceneDuration = "120%"
    // }
    //
    // var compareSectionOffset = viewportHeight/2;
    // var compareSceneDuration = viewportHeight - 100
    // if(mobile){
    //   compareSectionOffset = 0;
    //   compareSceneDuration = viewportHeight*1.2;
    //   //compareSceneDuration = "120%"
    // }
    //
    // sectionScrollScene = new ScrollMagic.Scene({
    //       // triggerElement: ".third-chart-wrapper",
    //       triggerElement: ".opening-line-chart-text",
    //       triggerHook:1,
    //       offset: 0,//heightSmallLine+marginSmallLine.top,
    //       duration: sectionScrollSceneDuration
    //     })
    //     // .addIndicators({name: "section chart"}) // add indicators (requires plugin)
    //     .addTo(controller)
    //     .on("enter",function(e){
    //       compareLive = false;
    //       firstChartLive = false;
    //       scatterVisible = false;
    //       mouseoverEffect = false;
    //
    //       if(mobile){
    //
    //         topListItemDefinition
    //           .style("transform","translate(140%,0%)")
    //           ;
    //
    //         openingLineChart
    //           .style("opacity",function(){
    //             return 1;
    //           })
    //           .style("pointer-events","none")
    //           ;
    //       }
    //
    //       wideScreenTop.style("visibility",null);
    //
    //       topListItemLines.style("visibility","visible").style("pointer-events","none");
    //       //
    //       wideScreenLeft.transition().duration(0).style("width",null).style("left",null);
    //       //
    //       topListBackgroundYear.style("visibility","hidden");
    //       //
    //       leftColTitle
    //         .html(titles.first.main)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 200;
    //         })
    //         .style("top",null)
    //         .style("left",null)
    //         .style("width",leftColTitleWidth+"px")
    //         ;
    //
    //       leftColTitleSub
    //         .html(titles.first.sub)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 200;
    //         })
    //         .style("top",null)
    //         .style("left",null)
    //         .style("width",leftColTitleWidth+"px")
    //         ;
    //
    //       topListItemLineNumbers.style("visibility","hidden")
    //
    //       topListYearColumn
    //         .transition()
    //         .duration(0)
    //         .style("left",function(d){
    //           if(+d.key != 2016){
    //             return "-1000px"
    //           }
    //           if(mobile){
    //             return "0px";
    //           }
    //           return (containerWidth/2-itemWidth)+"px";
    //         })
    //         ;
    //
    //       topListItem
    //         .filter(function(d){
    //           return d.topTen == true;
    //         })
    //         .transition()
    //         .duration(0)
    //         .style("pointer-events",null)
    //         .style("width",itemWidth+"px")
    //         .style("top",function(d,i){
    //           return rowHeight*i+"px";
    //         })
    //         .style("left","0px")
    //         ;
    //
    //       wideLinePaths
    //         .transition()
    //         .duration(0)
    //         .attr("stroke-dasharray",function(d){
    //           if(mobile){
    //             return null;
    //           }
    //           var totalLength = d3.select(this).node().getTotalLength();
    //           return 0 + " " + totalLength;
    //         })
    //         ;
    //
    //       topListItemLines
    //         .filter(function(d){
    //           return d.topTen == true;
    //         })
    //         .style("background-color",function(d,i){
    //           return textColors[d.term];
    //         });
    //       //
    //       topListLineWideGrid.style("visibility","hidden");
    //
    //       if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //
    //         topListLineWideContainerSource
    //           .style("left",function(){
    //             if(mobile){
    //               return null;
    //             }
    //             return topListLineWideContainerSourceLeftInitial+"px";
    //           })
    //           ;
    //
    //         yWide.domain([0,5]);
    //
    //         wideLinePaths
    //           .filter(function(d){
    //             return d.topTen == true || wordsToShow.indexOf(d.term) > -1;
    //           })
    //           .transition()
    //           .duration(0)
    //           .style("stroke",function(d){
    //             if(d.year == "2016"){
    //               return highlightColor;
    //             }
    //             return compareColor;
    //           })
    //           .attr("d",function(d){
    //             var points = d.rollingArray.slice(0,d.finalPointDate);
    //             points.push({date:d.finalPointDate+1,volume:4});
    //             return wideLine(points);
    //           })
    //           .style("stroke-opacity",function(d){
    //             return null;
    //           })
    //           ;
    //
    //         if(!mobile){
    //
    //           topListItemDefinition
    //             .style("pointer-events",null)
    //             .style("display",null)
    //             ;
    //         }
    //
    //         topListItemTerm
    //           .filter(function(d){
    //             return d.topTen == true;
    //           })
    //           .transition()
    //           .duration(0)
    //           .style("font-weight",null)
    //           .style("color",function(d,i){
    //             return textColors[d.term];
    //           })
    //           .style("transform","rotate(0deg)")
    //           .style("opacity",1)
    //           .style("font-size",firstChartFontSize+"px")
    //           .style("top",null)
    //           .style("width",null)
    //           .on("end",function(d){
    //
    //             var divWidth = d3.select(this).node().offsetWidth;
    //
    //             d3.select(this.parentNode)
    //               .select(".top-list-new-row-line")
    //               .transition()
    //               .duration(0)
    //               .style("left",termWidth-divWidth-lineWidth-10+"px")
    //               .style("visibility","visible")
    //               .style("width",lineWidth+"px")
    //               .style("border-radius",null)
    //               .style("height",null)
    //               .style("top",null)
    //               ;
    //
    //             d3.select(this)
    //               .transition()
    //               .duration(function(){
    //                 if(mobile){
    //                   return 0
    //                 }
    //                 return 300;
    //               })
    //               .style("left",function(d){
    //                 return termWidth-divWidth+"px";
    //               })
    //               ;
    //
    //           })
    //           ;
    //
    //       }
    //       else{
    //
    //         d3.selectAll(".top-list-number-new").style("visibility","hidden");
    //         topListItemTerm
    //           .transition()
    //           .duration(0)
    //           .style("color",function(d,i){
    //             return textColors[d.term];
    //           })
    //         smallLinePaths
    //           .transition()
    //           .duration(function(){
    //             if(mobile){
    //               return 0
    //             }
    //             return 500;
    //           })
    //           .style("stroke",function(d,i){
    //             return textColors[d.term];
    //           })
    //           ;
    //       }
    //     })
    //     .on("leave",function(e){
    //       if(e.target.controller().info("scrollDirection") == "FORWARD"){
    //       }
    //       else{
    //
    //         if(mobile){
    //           topListItemDefinition
    //             .style("opacity",function(d,i){
    //               if(i==0){return 1};
    //               return null;
    //             })
    //             .style("pointer-events",null)
    //             .style("transform",null)
    //             .style("display",null)
    //             ;
    //
    //           openingLineChart
    //             .style("opacity",null)
    //             .style("pointer-events",null)
    //             ;
    //         }
    //
    //         topListItem.classed("row-highlight",false);
    //
    //         topListItem
    //           .transition()
    //           .duration(0)
    //           .style("pointer-events",null)
    //           .style("width",itemWidth+"px")
    //           .style("top",function(d,i){
    //             return rowHeight*i+"px";
    //           })
    //           .style("left","0px")
    //           ;
    //
    //         firstChartLive = true;
    //         d3.selectAll(".top-list-number-new").style("visibility","visible");
    //
    //         topListItemLines
    //           .style("visibility","hidden")
    //           .style("pointer-events",null)
    //           .transition()
    //           .duration(0)
    //           .style("visibility","hidden")
    //           .style("pointer-events",null)
    //           ;
    //
    //         topListItemTerm
    //           .style("color",null)
    //           ;
    //       }
    //       // ;
    //     })
    //
    //
    // sectionScrollScene
    //     .on("progress",function(e){
    //       var progress = e.progress.toFixed(1)*10;
    //
    //       if(sectionScroll != progress){
    //         if(progress == 10){
    //           progress = 9;
    //         }
    //         sectionScroll = progress;
    //
    //         topListSvg.classed("path-scroll",true);
    //
    //         topListItemDefinition
    //           .style("opacity",function(d,i){
    //             if(i==sectionScroll){
    //               return 1;
    //             }
    //             return null;
    //           })
    //           ;
    //
    //         topListItem
    //           .classed("row-highlight",function(d,i){
    //             if(i==sectionScroll){
    //               return true;
    //             }
    //             return false;
    //           })
    //           ;
    //
    //         smallLineText.classed("text-scroll",function(d,i){
    //           if(i==sectionScroll){
    //             return true;
    //           }
    //           return false;
    //         });
    //
    //         smallLinePaths
    //           .classed("path-highlight",function(d,i){
    //             if(i==sectionScroll){
    //               return true;
    //             }
    //             return false;
    //           })
    //           ;
    //       }
    //
    //     })
    //     ;
    //
    // var compareScene = new ScrollMagic.Scene({
    //     // triggerElement: ".third-chart-wrapper",
    //     triggerElement: ".compare-section-trigger",
    //     triggerHook:1,
    //     offset: compareSectionOffset,
    //     duration:compareSceneDuration
    //   })
    //   // .addIndicators({name: "compare section"}) // add indicators (requires plugin)
    //   .addTo(controller)
    //   .on("enter",function(e){
    //     if(e.target.controller().info("scrollDirection") == "FORWARD"){
    //       if(!compareLive){
    //         scatterChart();
    //       }
    //     }
    //     else{
    //
    //       wideLinePathsVoronoiContainer.style("pointer-events","all");
    //       wideLinePathsVoronoiContainerTwo.style("pointer-events",null);
    //
    //       scatterVisible = true;
    //       topListBackgroundYear.style("visibility","visible")
    //       yWide.domain([0,5]);
    //
    //       wideLinePaths
    //         .filter(function(d){
    //           return d.topTen == true || wordsToShow.indexOf(d.term) > -1;
    //         })
    //         .transition()
    //         .duration(0)
    //         .style("stroke",function(d){
    //           if(d.year == "2016"){
    //             return highlightColor;
    //           }
    //           return compareColor;
    //         })
    //         .style("stroke-opacity",function(d){
    //           if(d.year == "2016"){
    //             return .5;
    //           }
    //           return 1;
    //         })
    //         .attr("d",function(d){
    //           var points = d.rollingArray.slice(0,d.finalPointDate);
    //           points.push({date:d.finalPointDate+1,volume:4});
    //           return wideLine(points);
    //         })
    //         ;
    //
    //       topListLineWideCompare
    //         .transition()
    //         .duration(0)
    //         .style("visibility",null)
    //         ;
    //
    //       wideScreenTopCompare
    //         .transition()
    //         .duration(0)
    //         .style("height",(yWideFull(4)+2)+"px")
    //         .style("top",function(d){
    //           return (marginLineWide.top-2)+"px";
    //         })
    //         .style("visibility",null)
    //         ;
    //
    //       wideScreenTop
    //         .transition()
    //         .duration(0)
    //         .style("background",null)
    //         .style("height",wideScreenTopHeight+"px")
    //         .style("top",function(d){
    //           return (yWide(4)-wideScreenTopHeight+marginLineWide.top-2)+"px";
    //         })
    //         ;
    //
    //       leftColTitle
    //         .html(titles.second.main)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 200;
    //         })
    //         .style("top",titles.second.topMain+"px")
    //         .style("left",function(){
    //           if(mobile){
    //             return null;
    //           }
    //           return marginLineWide.left+"px"
    //         })
    //         ;
    //
    //       leftColTitleSub
    //         .html(titles.second.sub)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 200;
    //         })
    //         .style("top",titles.second.topSub+"px")
    //         .style("left",function(){
    //           if(mobile){
    //             return null;
    //           }
    //           return marginLineWide.left+"px"
    //         })
    //         ;
    //
    //
    //       topListItem
    //         .filter(function(d){
    //           return d.year == "2016" || wordsToShow.indexOf(d.term) > -1;
    //         })
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .style("top",function(d){
    //           return yWide(4)+"px";
    //         })
    //         .style("left",function(d){
    //           return marginLineWide.left+xWide(d.finalPointDate)+"px";
    //         })
    //         ;
    //
    //
    //     }
    //   })
    //   .on("leave",function(e){
    //     if(e.target.controller().info("scrollDirection") == "FORWARD"){
    //       compareMax();
    //     }
    //   })
    //   ;
    //
    //
    // var fullSceneDuration = viewportHeight - 100;
    // var fullSceneOffset = 0;
    //
    // if(mobile){
    //   //fullSceneDuration = "100%";
    //   fullSceneDuration = viewportHeight;
    //   fullSceneOffset = 0;
    // }
    //
    // var fullScene = new ScrollMagic.Scene({
    //     // triggerElement: ".third-chart-wrapper",
    //     triggerElement: ".compare-full-trigger",
    //     triggerHook:1,
    //     offset: fullSceneOffset,
    //     duration:fullSceneDuration
    //   })
    //   // .addIndicators({name: "full section"}) // add indicators (requires plugin)
    //   .addTo(controller)
    //   .on("enter",function(e){
    //     if(e.target.controller().info("scrollDirection") == "FORWARD"){
    //       compareFull();
    //     }
    //   })
    //   .on("leave",function(e){
    //
    //     if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //       yWideCompareMax = yWideMax;
    //       wideLinePathsVoronoiContainer.style("pointer-events",null);
    //       wideLinePathsVoronoiContainerTwo.style("pointer-events","all");
    //
    //       if(mobile){
    //         sourceText.style("visibility",null);
    //       }
    //
    //       leftColTitle
    //         .html(titles.third.main)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .style("left",function(){ if(mobile){ return null; } return marginLineWide.left+"px" })
    //         .style("top",titles.third.topMain+"px")
    //         ;
    //
    //       leftColTitleSub
    //         .html(titles.third.sub)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .style("left",function(){ if(mobile){ return null; } return marginLineWide.left+"px" })
    //         .style("top",titles.third.topSub+"px")
    //         ;
    //
    //       compareLineRect
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .attr("x",marginLineWide.left)
    //         .attr("y",(marginLineWide.top+wideLine(compareWord.termMax))-10)
    //         .attr("width",70)
    //         .attr("height",40)
    //         ;
    //
    //       compareText
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .attr("x",marginLineWide.left)
    //         .attr("y",(marginLineWide.top+wideLine(compareWord.termMax))-4)
    //         ;
    //
    //       compareLine
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .attr("x1",marginLineWide.left)
    //         .attr("x2",marginLineWide.left+widthLineWide)
    //         .attr("y1",marginLineWide.top+ +wideLine(compareWord.termMax)-2)
    //         .attr("y2",marginLineWide.top+ +wideLine(compareWord.termMax)-2)
    //         ;
    //
    //       topListItemLines
    //         .transition()
    //         .duration(0)
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .style("opacity",function(d){
    //           return 1;
    //         })
    //         .style("background-color",function(d){
    //           if(d.year == "2016"){
    //             return highlightColor;
    //           }
    //           return compareColor;
    //         })
    //         .style("left","0px")
    //         .style("width","7px")
    //         .style("border-radius","4px")
    //         .style("height","7px")
    //         .style("top","24px")
    //         ;
    //
    //       topListItem
    //         .filter(function(d){
    //           return d.topTen == false && +d.year == 2016;
    //         })
    //         .style("display","none")
    //         ;
    //
    //       topListItem
    //         .transition()
    //         .duration(function(d){
    //           if(mobile){
    //             return 0;
    //           }
    //           if(d.year != "2016" && wordsToShow.indexOf(d.term) == -1){
    //             return 0;
    //           }
    //           return 500;
    //         })
    //         .style("width",lineWidth+"px")
    //         .style("left",function(d){
    //           if(d.year == "2016" || wordsToShow.indexOf(d.term) != -1){
    //             return marginLineWide.left+xWide(d.termMaxDate-1)+"px";
    //           }
    //           return "-1000px";
    //         })
    //         .style("top",function(d){
    //           return yWide(d.termMax)+"px";
    //         })
    //         ;
    //
    //       topListItemTerm
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .style("font-weight",function(d){
    //           if(d.year == "2016"){
    //             return null;
    //           }
    //           if(mobile){
    //             return 400;
    //           }
    //           return 600;
    //         })
    //         .style("width","100px")
    //         .style("font-size","10px")
    //         .style("font-size","10px")
    //         .style("transform","rotate(-45deg)")
    //         .style("color",function(d){
    //           if(d.year == "2016"){
    //             return highlightColor;
    //           }
    //           return compareColor;
    //         })
    //         .style("opacity",function(d){
    //           if(d.year == "2016"){
    //             if(mobile){
    //               return 0;
    //             }
    //             return .2;
    //           }
    //           return 1;
    //         })
    //         .style("left","-5px")
    //         .style("top","9px")
    //         ;
    //
    //       wideLinePaths
    //         .filter(function(d){
    //           return d.topTen == false && wordsToShow.indexOf(d.term) == -1;
    //         })
    //         .transition()
    //         .duration(0)
    //         .attr("stroke-dasharray",function(d){
    //           if(mobile){
    //             return null;
    //           }
    //           var totalLength = d3.select(this).node().getTotalLength();
    //           return 0 + " " + totalLength;
    //         })
    //         .style("stroke",function(d){
    //           return compareColor;
    //         })
    //         .style("stroke-width",function(d){
    //           return "1.5px"
    //         })
    //         .style("stroke-opacity",function(d){
    //           return 0;
    //         })
    //         // .attr("d",function(d){
    //         //   return wideLine(d.rollingArray.slice(0,d.termMaxDate+1));
    //         // })
    //         ;
    //
    //       wideLinePaths
    //         .filter(function(d){
    //           return d.topTen == true || wordsToShow.indexOf(d.term) > -1;
    //         })
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .attr("stroke-dasharray",function(d){
    //           if(mobile){
    //             return null;
    //           }
    //           var totalLength = d3.select(this).node().getTotalLength();
    //           return totalLength + " " + 0;
    //         })
    //         .style("stroke",function(d){
    //           if(d.year == "2016"){
    //             return highlightColor;
    //           }
    //           return compareColor;
    //         })
    //         .style("stroke-width",function(d){
    //           return "1.5px"
    //         })
    //         .style("stroke-opacity",function(d){
    //           if(d.topTen){
    //             return .5;
    //           }
    //           return 1;
    //         })
    //         .attr("d",function(d){
    //           return wideLine(d.rollingArray.slice(0,d.termMaxDate+1));
    //         })
    //         ;
    //
    //       wideScreenTop
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .style("visibility","visible")
    //         .style("background","none")
    //         .style("top",(yWide(4)-wideScreenTopHeight+marginLineWide.top)+"px")
    //         ;
    //
    //       topListLineWideLine
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .attr("x2",marginLineWide.left+widthLineWide)
    //         ;
    //       topListLineWideAxis
    //         .transition()
    //         .duration(function(){
    //           if(mobile){
    //             return 0
    //           }
    //           return 500;
    //         })
    //         .attr("x",function(d,i){
    //           return widthLineWide/4*i;
    //         })
    //         ;
    //
    //       if(!mobile){
    //         topListLineWideContainerCloud
    //           .transition()
    //           .duration(0)
    //           .style("display","none")
    //           ;
    //         termsWrapper
    //           .transition()
    //           .duration(500)
    //           .style("opacity",0)
    //           ;
    //       }
    //
    //     }
    //   })
    //   ;

  }

  function buildHorzCloud(data){

    var wordCloudData = data.filter(function(d){
      return toRemove.indexOf(d.term) == -1;
    });

    wordCloudData = d3.nest().key(function(d){
        return d.year;
      })
      .entries(wordCloudData)
      ;

    var maxValues = [];

    var newWordCloud = d3.select(".horz-word-cloud")

    var height = 500;

    var extent = d3.extent(wordCloudData,function(d){ return +d.rho; })
    var fontScale = d3.scaleLinear().domain([10,0]).range([10,12]);
    // var fontScale = d3.scaleLinear().domain(extent).range([9,18]);
    var colorScale = d3.scaleLinear().domain(extent).range(["#555","rgb(66, 132, 243)"])
    var colorScaleTwo = d3.scaleLinear().domain([40,0]).range([".8","1"])

    var width = 200;
    var height = 350;

    // var toolTip = newWordCloud.append("div")
    //   .attr("class","horz-word-cloud-tool-tip")
    //   .style("visibility","hidden")
    //   ;
    //
    // var toolTipLineChartWrapper = toolTip.append("div")
    //   .attr("class","horz-word-cloud-tool-line-wrapper")
    //   ;
    //
    // toolTipLineChartWrapper.append("p")
    //   .attr("class","horz-word-cloud-tool-title")
    //   .text("Monthly Growth")
    //   ;
    //
    // var toolTipLineChart = toolTipLineChartWrapper.append("div")
    //   .attr("class","horz-word-cloud-tool-line")
    //   ;
    //
    // var toolTipBarChartWrapper = toolTip.append("div")
    //   .attr("class","horz-word-cloud-tool-bar-wrapper")
    //   ;
    //
    // toolTipBarChartWrapper.append("p")
    //   .attr("class","horz-word-cloud-tool-title")
    //   .text("Peak Search Volume")
    //   ;

    // var toolTipBarChart = toolTipBarChartWrapper.append("div")
    //   .attr("class","horz-word-cloud-tool-bar")
    //   ;

    var termsWrapper = newWordCloud
      .selectAll("div")
      .data(wordCloudData)
      .enter()
      .append("div")
      .attr("class","horz-word-cloud-wrapper")
      // .on("mousemove",function(d){
      //   var coor = d3.mouse(this);
      //   toolTip
      //     .style("top",coor[1]+ 30 +"px")
      //     .style("left",coor[0] + 30 +"px")
      //     ;
      // })
      // .on("mouseover",function(d){
      //   toolTip.style("visibility",null);
      // })
      // .on("mouseout",function(d){
      //   toolTip.style("visibility","hidden");
      // })
      ;

    var terms = termsWrapper
      .selectAll("div")
      .data(function(d){
        return d.values;
      })
      .enter()
      .append("div")
      .style("font-size", function(d,i) {
        return fontScale(i) + "px";
      })
      .style("line-height", function(d) {
        var fontSize = fontScale(+d.rho);
        if(fontSize > 34){
          return "35px"
        }
        if(fontSize < 34 && fontSize > 20){
          return "24px"
        }
        return Math.max(fontScale(+d.rho)*1.1,14) + "px";
      })
      .style("opacity", function(d,i) {
        return colorScaleTwo(i);
      })
      .attr("class",function(d,i){
        return "horz-word-cloud-text";
      })
      .html(function(d,i) {
        if(i%10==0){
          return "<span class='year-right-col' style=''>"+d.year+"</span><span class='number' style='font-size:9px;'>"+(i%10+1)+". </span><span class='cloud-term'>"+d.term.replace("."," ")+"</span>";
        }
        return "<span class='number' style='font-size:9px;'>"+(i%10+1)+". </span><span class='cloud-term'>"+d.term.replace("."," ")+"</span>";
      })
      .on("mouseover",function(d){

        toolTip.style("visibility",null);
        var term = d.term;
        var barChartData = d.rollingAverage;

        var maxRollingAverage = d3.max(barChartData,function(d){ return d; });

        var comparisons = [0,300,400,500];
        toolTipLineChart.select("svg").remove();
        toolTipBarChart.select("div").remove();


        var margin = {top:10, right:10, bottom:20, left:10};
        var width = 130 - margin.left - margin.right,
          height = 130 - margin.top - margin.bottom
          ;

        var maxValues = [];

        var newData = d.weekArray;
        var max = d3.max(newData,function(d){ return d.volume;})

        var x = d3.scaleLinear().domain([0,weeks.length-1]).range([0,width]);
        var y = d3.scaleLinear().domain([0,max]).range([height,0]);
        var colorScale = d3.scaleLinear().domain([0,max]).range(["#aaa","red"]);
        var barHeight = d3.scaleLinear().domain([0,200]).range([0,115]);
        var line = d3.line()
          .x(function(d,i) {
            return x(i);
          })
          .y(function(d,i) {
            return y(d.volume);
          })
          .curve(d3.curveBasis)
          ;

        var svg = toolTipLineChart.append("svg")
          .attr("width",width+margin.left+margin.right)
          .attr("height",height+margin.top+margin.bottom)
          ;

        var lineChartG = svg
          .selectAll("g")
          .data([newData])
          .enter()
          .append("g")

        lineChartG
          .append("g")
          .attr("transform","translate("+margin.left+","+margin.top+")")
          .append("path")
          .attr("class","horz-word-cloud-tool-tip-line-chart-line")
          .attr("d",function(d,i){
            return line(d);
          })
          .transition()
          .duration(400)
          .attrTween("stroke-dasharray", tweenDash);

          function tweenDash() {
            var l = this.getTotalLength(),
                i = d3.interpolateString("0," + l, l + "," + l);
            return function(t) { return i(t); };
          }

        lineChartG.append("g")
          .attr("transform","translate("+margin.left+","+margin.top+")")
          .append("text")
          .attr("class","horz-word-cloud-tool-tip-line-chart-term")
          .attr("x",width/2)
          .text(term.replace(".",""))
          ;

        var map = {0:2015,54:2016};

        lineChartG.append("g")
          .attr("transform","translate("+margin.left+","+ (margin.top+height+5) +")")
          .append("line")
          .attr("class","horz-word-cloud-tool-tip-line-chart-bottom-axis")
          .attr("x1",0)
          .attr("x2",width)
          .attr("y0",0)
          .attr("y1",0)
          .text(function(d,i){
            return map[d];
          })
          ;

        lineChartG.append("g")
          .attr("transform","translate("+margin.left+","+ (margin.top+height+margin.bottom) +")")
          .selectAll("text")
          .data([0,54])
          .enter()
          .append("text")
          .attr("class","horz-word-cloud-tool-tip-line-chart-axis")
          .attr("x",function(d){
            return x(d);
          })
          .text(function(d,i){
            return map[d];
          })
          ;

        var toolTipBarChartBar = toolTipBarChart.append("div")
          .attr("class","horz-word-cloud-tool-tip-bar-chart-wrapper")
          ;

        var barMax = 0;

        for (var item in comparisons){
          if(comparisons[item] < maxRollingAverage){
            barMax = item;
          }
        }
        barMax = +barMax+1;
        var newMax = comparisons[barMax];
        barHeight.domain([0,newMax+50]);

        toolTipBarChartBar
          .append("div")
          .attr("class","horz-word-cloud-tool-tip-bar-chart-bar")
          .style("width","20px")
          .style("height","0px")
          .transition()
          .duration(400)
          .delay(100)
          .style("height",function(d){
            return barHeight(maxRollingAverage) + "px";
          })
          ;

        toolTipBarChartBar
          .append("p")
          .attr("class","horz-word-cloud-tool-tip-bar-chart-term")
          .text(term.replace(".",""))
          ;

        toolTipBarChartBar
          .append("div")
          .attr("class","horz-word-cloud-tool-tip-bar-chart-axis")
          ;

        toolTipBarChartBar
          .append("div")
          .attr("class","horz-word-cloud-tool-tip-bar-chart-comparison-line")
          .style("bottom",function(d){
            return barHeight(newMax)+"px";
          })
          ;

        toolTipBarChartBar
          .append("div")
          .attr("class","horz-word-cloud-tool-tip-bar-chart-comparison-annotation")
          .style("bottom",function(d){
            return (barHeight(newMax)-12)+"px";
          })
          .style("right","-4px")
          .text("← FOMO ('14) would be here")
          ;



        //toolTipBarChart
        //toolTipLineChart
      })
      ;

    termsWrapper.each(function(d){
        var element = d3.select(this);
        positions[d.key] = {top_position:element.node().offsetTop};
      })
      ;

    terms.each(function(d){
        var element = d3.select(this);
        var word = element.select(".cloud-term");
        var wordWidth = word.node().offsetWidth;
        var leftPos = element.node().offsetLeft;
        var topPos = element.node().offsetTop;
        var divWidth = element.node().offsetWidth;
        positions[d.term] = {
          full_width:divWidth,
          word_width:wordWidth,
          left_position:leftPos,
          top_position:topPos
        };
      })
      ;

  }

  // function geoHeatMap(){
  //
  //   var heatMapWordSelected = d3.select(".geo-heat-map-word");
  //   var wordSelected = "woke"
  //   var heatMapContainer = d3.select(".geo-heat-map");
  //   var rollingAmount = 4;
  //   var miniChartPaths;
  //   var stateSelected = false;
  //
  //   function miniMultiplesHeat(){
  //
  //     var timeParse = d3.timeParse("%-m/%-e/%y");
  //     var timeFormat = d3.timeFormat("%b '%y");
  //     var date = timeParse("1/1/16")
  //     var paths = topojson.feature(usState, usState.objects.states).features;
  //     var pathsMap = d3.map(paths,function(d){return d.id});
  //     for (var state in nestedStates){
  //       var item = statesMapName.get(nestedStates[state].key);
  //       var pathData = pathsMap.get(item[4]);
  //       nestedStates[state].pathData = pathData;
  //     }
  //
  //     var adjust = .75;
  //     if(mobile){
  //       adjust = .66;
  //     }
  //
  //     var miniChart = d3.select(".mini-multiples").on("click",function(){
  //       if(stateSelected){
  //         miniChartPaths.style("fill",function(d){
  //           return null;
  //         })
  //         ;
  //
  //         heatMapContainerRowTextContainerMouseover.style("opacity",function(d){
  //           return null;
  //         })
  //
  //         heatMapContainerRowColumnsContainer.style("border",function(d){
  //           return null;
  //         })
  //
  //         heatMapContainerRowTextContainer.style("opacity",null);
  //         stateSelected = false;
  //       }
  //     });
  //     var width = 150*adjust,
  //         height = 100*adjust;
  //     // sets the type of view
  //     var projection = d3.geoAlbers()
  //       .scale(200*adjust) // size, bigger is bigger
  //       .translate([width / 2, height / 2]);
  //
  //     var graticule = d3.geoGraticule()
  //         .extent([[-98 - 45, 38 - 45], [-98 + 45, 38 + 45]])
  //         .step([5, 5]);
  //
  //     //creates a new geographic path generator
  //     var path = d3.geoPath().projection(projection);
  //
  //     var xScale = d3.scaleLinear()
  //       .domain([0, 7])
  //       .range([0, 500]);
  //
  //     var datesAdjusted = dates.slice(-(dates.length - 1 -rollingAmount));
  //
  //     var monthCheck = [];
  //
  //     datesAdjusted = datesAdjusted.reverse().map(function(d,i){
  //       var date = d.split("/");
  //       var month = date[0].concat(date[2])
  //       var important = 0;
  //       if(monthCheck.indexOf(month) == -1){
  //         monthCheck.push(month);
  //         important = 1;
  //       }
  //       return [i,d,important]
  //       }).filter(function(d){
  //       return d[2] == 1;
  //       }).reverse();
  //
  //     var miniChartSvgs = miniChart
  //       .selectAll("svg")
  //       .data(datesAdjusted)
  //       .enter()
  //       .append("svg")
  //       .attr("class","dma-svgs")
  //       .attr("width", width)
  //       .attr("height", height)
  //       .append("g")
  //       .attr("class","dma-path-containers")
  //
  //     miniChartPaths = miniChartSvgs
  //       .append("g")
  //       .selectAll("path")
  //       .data(nestedStates)
  //       .enter()
  //       .append("path")
  //       .attr("class","dma-path")
  //       .attr("d",function(d){
  //         return path(d.pathData);
  //       })
  //       .attr("fill",function(d){
  //         var item = d3.select(this.parentNode).datum()[0];
  //         var rollingArray = d.termData[wordSelected].rollingArray;
  //         var data = rollingArray[rollingArray.length - 1 - item].volume;
  //         return termValues[wordSelected].scale(+data);
  //       })
  //       .on("mouseover",function(d){
  //         var state = d.key;
  //
  //         heatMapContainerRowTextContainer.style("opacity",function(d){
  //           return 0;
  //         })
  //         ;
  //
  //         heatMapContainerRowTextContainerMouseover.style("opacity",function(d){
  //           if(state == d.key){
  //             return 1
  //           }
  //           return null;
  //         })
  //         ;
  //
  //         heatMapContainerRowColumnsContainer.style("border",function(d){
  //           if(state == d.key){
  //             return "1px solid black"
  //           }
  //           return null;
  //         })
  //         ;
  //
  //         miniChartPaths.style("fill",function(d){
  //           if(state == d.key){
  //             return null
  //           }
  //           return "#dfdfdf";
  //         })
  //         ;
  //       })
  //       .on("mouseout",function(d){
  //         heatMapContainerRowTextContainer.style("opacity",function(d){
  //           return null;
  //         })
  //         ;
  //
  //         heatMapContainerRowTextContainerMouseover.style("opacity",function(d){
  //           return null;
  //         })
  //         ;
  //         heatMapContainerRowColumnsContainer.style("border",function(d){
  //           return null;
  //         })
  //         ;
  //         miniChartPaths.style("fill",function(d){
  //           return null;
  //         })
  //         ;
  //       })
  //       ;
  //
  //     miniChartSvgs
  //       .append("g")
  //       .append("text")
  //       .text(function(d){
  //         return timeFormat(timeParse(d[1]));
  //       })
  //       .attr("class","dma-text-label")
  //       .attr("x",0)
  //       .attr("y",height-10)
  //       .style("fill",function(d,i){
  //         if(i==0 || d[1].split("/")[0] == 1){
  //           return "black"
  //         }
  //         return null;
  //       })
  //       .style("font-weight",function(d,i){
  //         if(i==0 || d[1].split("/")[0] == 1){
  //           return "600"
  //         }
  //         return null;
  //       })
  //       .style("font-size",function(d,i){
  //         if(i==0 || d[1].split("/")[0] == 1){
  //           return "10px"
  //         }
  //         return null;
  //       })
  //       ;
  //
  //   }
  //
  //   var nestedStates = d3.nest()
  //     .key(function(d){
  //       return d.region;
  //       //return statesMap.get(d.region)[1];
  //     })
  //     .sortKeys(function(a,b){
  //       return +statesMapName.get(a)[2] - +statesMapName.get(b)[2];
  //     })
  //     .entries(state_data)
  //     ;
  //
  //   var dates = nestedStates[0].values.map(function(d){
  //     return d.date;
  //   })
  //
  //   var nestedDates = d3.nest().key(function(d){
  //       return d.slice(-2);
  //     })
  //     .entries(dates)
  //     ;
  //
  //   var datesMap = d3.map(nestedDates,function(d){return d.key});
  //   var terms = Object.keys(nestedStates[0].values[0]).filter(function(d){
  //     return d != "date" && d!="region";
  //   });
  //
  //   var filtersContainer = d3.select(".geo-heat-map-filters");
  //
  //   var filters = filtersContainer.selectAll("p")
  //     .data(terms)
  //     .enter()
  //     .append("p")
  //     .attr("class",function(d,i){
  //       if(i==0){
  //         return "front-curve geo-heat-map-filter"
  //       }
  //       if(i==terms.length-1){
  //         return "back-curve geo-heat-map-filter"
  //       }
  //       return "geo-heat-map-filter";
  //     })
  //     .classed("geo-heat-map-filter-highlighted",function(d){
  //       if(d==wordSelected){
  //         return true;
  //       }
  //       return false;
  //     })
  //
  //   filters.append("span")
  //     .attr("class","geo-heat-map-filter-text")
  //     .text(function(d,i){
  //       return d.replace(/\./g,' ')//+"</span><span class='dot'></span>";
  //     })
  //     .on("click",function(d){
  //
  //       var word = d;
  //       wordSelected = word;
  //
  //       filters.classed("geo-heat-map-filter-highlighted",function(d){
  //           if(d==wordSelected){
  //             return true;
  //           }
  //           return false;
  //         })
  //         ;
  //
  //       miniChartPaths
  //         .attr("fill",function(d){
  //           var item = d3.select(this.parentNode).datum()[0];
  //           var rollingArray = d.termData[wordSelected].rollingArray;
  //           var data = rollingArray[rollingArray.length - 1 - item].volume;
  //           return termValues[wordSelected].scale(+data);
  //         })
  //         ;
  //
  //       heatMapContainerRowColumns
  //         .style("background-color",function(d){
  //           return termValues[word].scale(d[word]);
  //         })
  //         ;
  //
  //       heatMapWordSelected.text(function(){
  //         return word;
  //       })
  //       ;
  //
  //
  //
  //     })
  //     ;
  //
  //   filters.append("span")
  //     .attr("class","geo-heat-map-filter-dot")
  //     .text(function(d,i){
  //       if(i==filters.size()-1){
  //         return null;
  //       }
  //       return "•";
  //     })
  //
  //   filtersContainer.append("p")
  //     .text("Filter Word:")
  //     .attr("class","geo-heat-map-filter-label")
  //
  //   var termValues = {};
  //
  //   for (var term in terms){
  //     termValues[terms[term]] = {};
  //     termValues[terms[term]].values = [];
  //   }
  //
  //   for (var state in nestedStates){
  //     var stateData = nestedStates[state].values;
  //     var terms = Object.keys(stateData[0]).filter(function(d){
  //       return d != "date" && d!="region";
  //     });
  //     var termData = {};
  //     var datesArray;
  //     for(var term in terms){
  //       termData[terms[term]] = {};
  //       var word = terms[term];
  //       var rollingArray = movingAvg(stateData.map(function(d,i){
  //         return [i,+d[word]]
  //       }),rollingAmount).map(function(d,i){
  //         termValues[word]["values"].push(d[1]);
  //         return {date:i,volume:d[1]};
  //       })
  //       ;
  //
  //       if(term == 0){
  //         datesArrayCalculated = rollingArray.map(function(d){
  //           return {};
  //         })
  //         ;
  //         datesArray = datesArrayCalculated;
  //       }
  //       for (var date in datesArray){
  //         datesArray[date][word] = rollingArray[date].volume;
  //       }
  //       termData[word].rollingArray = rollingArray;
  //     }
  //     termData["dates"] = datesArray;
  //     nestedStates[state].termData = termData;
  //   }
  //
  //   var colorsHeat = ["#ffffb2","#fed976","#fd8d3c","#f03b20","#bd0026","#ab0623"];
  //       colorsHeat = ["#fff7f3", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"]
  //
  //   var heatMapLegend = d3.select(".geo-heat-map-legend")
  //     ;
  //
  //   heatMapLegend.append("p")
  //     .attr("class","geo-heat-map-legend-text")
  //     .html("<span class='boldify'>Zero</span> Search Interest")
  //     ;
  //
  //   heatMapLegend
  //     .selectAll("div")
  //     .data(colorsHeat)
  //     .enter()
  //     .append("div")
  //     .attr("class","geo-heat-map-legend-box")
  //     .style("background-color",function(d){
  //       return d;
  //     })
  //     ;
  //
  //   heatMapLegend.append("p")
  //     .attr("class","geo-heat-map-legend-text")
  //     .html("<span class='boldify'>Peak</span> Search Interest")
  //     ;
  //
  //   // d3.schemeYlOrRd[7]
  //   for (var term in Object.keys(termValues)){
  //     var word = Object.keys(termValues)[term];
  //     termValues[word].extent = d3.extent(termValues[word].values);
  //
  //     termValues[word].scale = d3.scaleQuantize().domain(termValues[word].extent)
  //       .range(colorsHeat)
  //       ;
  //   }
  //
  //   var nestedRegions = d3.nest().key(function(d){
  //       return statesMapName.get(d.key)[3];
  //     })
  //     .entries(nestedStates)
  //     ;
  //
  //   var heatMapContainerRegion = heatMapContainer
  //     .append("div")
  //     .attr("class","geo-heat-map-chart")
  //     .selectAll("div")
  //     .data(nestedRegions)
  //     .enter()
  //     .append("div")
  //     .attr("class","geo-heat-map-region")
  //     ;
  //
  //   heatMapContainer.append("p")
  //     .attr("class","geo-heat-map-chart-source")
  //     .html("&#185;Moving 4-week Average")
  //     ;
  //
  //   var heatMapContainerRow = heatMapContainerRegion
  //     .selectAll(".geo-heat-map-row")
  //     .data(function(d){
  //       return d.values;
  //     })
  //     .enter()
  //     .append("div")
  //     .attr("class","geo-heat-map-row")
  //     .on("mouseover",function(d){
  //       var state = d.key;
  //       stateSelected = true;
  //       miniChartPaths.style("fill",function(d){
  //         if(state == d.key){
  //           return null
  //         }
  //         return "#dfdfdf";
  //       })
  //       ;
  //
  //       heatMapContainerRowTextContainerMouseover.style("opacity",function(d){
  //         if(d.key == state){
  //           return 1
  //         }
  //         return null;
  //       })
  //
  //       heatMapContainerRowColumnsContainer.style("border",function(d){
  //         if(d.key == state){
  //           return "1px solid black"
  //         }
  //         return null;
  //       })
  //
  //       heatMapContainerRowTextContainer.style("opacity",0);
  //     })
  //     .on("mouseout",function(d){
  //       if(!mobile){
  //         stateSelected = false;
  //
  //         miniChartPaths.style("fill",function(d){
  //           return null;
  //         })
  //         ;
  //
  //         heatMapContainerRowTextContainerMouseover.style("opacity",function(d){
  //           return null;
  //         })
  //
  //         heatMapContainerRowColumnsContainer.style("border",function(d){
  //           return null;
  //         })
  //
  //         heatMapContainerRowTextContainer.style("opacity",null);
  //       }
  //
  //     })
  //     ;
  //
  //   heatMapContainerRegion.append("p")
  //     .attr("class","geo-heat-map-region-label")
  //     .text(function(d){
  //       return d.key;
  //     })
  //     ;
  //
  //   var heatMapContainerRowTextContainer = heatMapContainerRow.append("div")
  //     .attr("class","geo-heat-map-row-text-container")
  //     ;
  //
  //   var heatMapContainerRowTextContainerMouseover = heatMapContainerRow.append("p")
  //     .attr("class","geo-heat-map-row-text-container-mouseover")
  //     .text(function(d){
  //       if(d.key == "DC"){
  //         return "DC"
  //       }
  //       return statesMapName.get(d.key)[0];
  //     })
  //     ;
  //
  //   heatMapContainerRowTextContainer.append("p")
  //     .attr("class","geo-heat-map-row-text")
  //     .style("left",function(d,i){
  //       if (i%2==0){
  //         return "-35px"
  //       }
  //     })
  //     .text(function(d){
  //       return d.key;
  //     })
  //     ;
  //
  //   heatMapContainerRowTextContainer.append("div")
  //     .attr("class","geo-heat-map-row-text-line")
  //     .style("width",function(d,i){
  //       if (i%2==0){
  //         return "20px"
  //       }
  //     })
  //     .style("left",function(d,i){
  //       if (i%2==0){
  //         return "-20px"
  //       }
  //     })
  //     ;
  //
  //   var heatMapContainerRowColumnsContainer = heatMapContainerRow.append("div")
  //     .attr("class","geo-heat-map-row-box-container")
  //     ;
  //
  //   var heatMapContainerRowColumns = heatMapContainerRowColumnsContainer
  //     .selectAll("div")
  //     .data(function(d,i){
  //       return d.termData.dates;
  //     })
  //     .enter()
  //     .append("div")
  //     .filter(function(d,i){
  //       if(mobile){
  //         if(i%2==0){
  //           return d;
  //         }
  //         return null;
  //       }
  //       return d;
  //     })
  //     .attr("class","geo-heat-map-row-box")
  //     .style("border-left",function(d,i){
  //       if(i==0){
  //         return "1px solid rgba(0, 0, 0, 0.28)";
  //       }
  //       if(i==Math.round(d3.select(this.parentNode.parentNode).selectAll(".geo-heat-map-row-box").size()/2)){
  //         return "1px solid rgba(0, 0, 0, 0.28)";
  //       }
  //       return "none";
  //     })
  //     .style("background-color",function(d){
  //       return termValues[wordSelected].scale(d[wordSelected]);
  //     })
  //     ;
  //
  //   heatMapContainerRowColumns.filter(function(d,i){
  //       return d3.select(this.parentNode).datum().key == "ME";
  //     })
  //     .append("p")
  //     .attr("class","geo-heat-map-row-axis")
  //     .html(function(d,i){
  //       if(i==0){
  //         return "Jan &lsquo;15";
  //       }
  //       if(i==Math.round(d3.select(this.parentNode.parentNode).selectAll(".geo-heat-map-row-box").size()/2)){
  //         return "Jan &lsquo;16";
  //       }
  //       return null
  //     })
  //     ;
  //
  //   var heatMapContainerRowTextContainerRight = heatMapContainerRow.append("div")
  //     .attr("class","geo-heat-map-row-text-container")
  //     ;
  //
  //   heatMapContainerRowTextContainerRight.append("p")
  //     .attr("class","geo-heat-map-row-text")
  //     .style("left",function(d,i){
  //       if (i%2==0){
  //         return "22px"
  //       }
  //       return "6px"
  //     })
  //     .text(function(d){
  //       return d.key;
  //     })
  //     ;
  //
  //   heatMapContainerRowTextContainerRight.append("div")
  //     .attr("class","geo-heat-map-row-text-line")
  //     .style("width",function(d,i){
  //       if (i%2==0){
  //         return "20px"
  //       }
  //       return "5px"
  //     })
  //     .style("left",function(d,i){
  //       return "0px";
  //     })
  //     ;
  //
  //   miniMultiplesHeat();
  //   // miniPrints();
  // }

  function scrollTween(offset) {
		var distanceScrolled = window.pageYOffset || document.documentElement.scrollTop;

		return function() {
			var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
			return function(t) { scrollTo(0, i(t)); };
		};
	}

  var opacityScale = d3.scaleLinear().domain([0,1]).range([.05,.2])
  var container = d3.select(".top-word-cloud-container");
  d3.select(".top-word-cloud-box-text").style("opacity",1);
  d3.select(".top-word-cloud-button").attr("href","#").on("click",function(){
    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0,window.screen.availHeight);

    d3.transition()
      .duration(500)
      .tween("scroll",scrollTween(viewportHeight));

  });
  var height = -1215;
  var count = 40;
  var wordCount = 60;
  var wordCloudWords = container.selectAll("p")
    .data(summary.slice(-wordCount))
    .enter()
    .append("p")
    .attr("class","top-word-cloud-word top-word-cloud-word-term")
    .style("color",function(d,i){
      return "black";
    })
    .text(function(d,i){
      return d.term.replace(/\./g,' ')//+"</span><span class='dot'></span>";
    })
    .style("opacity",function(d,i){
      if(i==wordCount-1 && !mobile){
        return 1
      }
      return null;
    })

  function cycle(){

    cycleTimeout = window.setTimeout(function(d){
      count++;
      if(count>wordCount-10){
        count = 0;
      }
      wordCloudWords
        .transition()
        .duration(250)
        .delay(250)
        .style("opacity",function(d,i){
          if(i==wordCount-count-1){
            return 1
          }
          if(i>wordCount-count-1){
            return .1
          }
          return null;
        })

      container
        .transition()
        .duration(500)
        .style("top",height+21*count+"px")
      cycle();
    },2000)
  }

  // if(!mobile){
  //   cycle();
  // }

  var summaryMap = d3.map(summary,function(d){
    return +d.year;
  })

  buildHorzCloud(summary);
  topListNew(summary);
  // geoHeatMap();

  d3.select("body").style("height",null).style("overflow",null);
  d3.select(".top-section-text-title-sub-two").html("From &ldquo;selfie&rdquo; to &ldquo;woke,&rdquo; Google searches reveal how we adopt new words.")
//ready function
};
