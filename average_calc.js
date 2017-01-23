var data = [];
var csvContent = "data:text/csv;charset=utf-8,";

queue()
  .defer(d3.csv, "average_calculation.csv") // 67KB
  .await(ready);

function ready(error
  ,average_calc
){
  console.log(average_calc);

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

  var weeks = Object.keys(average_calc[0]).filter(function(d){
    return d.slice(0,1) == "w";
  });

  years = ["2012","2013","2014","2015","2016"];

  for (var term in average_calc){

    var yearArray = [average_calc[term].term];

    for (var year in years){
      var weeks_year = weeks.filter(function(d){
        return d.slice(-4) == years[year];
      });

      var data_year = weeks_year.map(function(d){
        return +average_calc[term][d];
      });

      var average_year = d3.mean(data_year);
      yearArray.push(average_year);
    }
    data.push(yearArray);
  }

  data.forEach(function(infoArray, index){

    dataString = infoArray.join(",");
    csvContent += index < data.length ? dataString+ "\n" : dataString;

  });

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);

}
