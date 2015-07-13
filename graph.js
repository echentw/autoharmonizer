window.addEventListener('load', function () {
  var datapts = [];

  var chart = new CanvasJS.Chart("chartContainer",{
    title :{
      text: "Live Frequency Data"
    },      
    data: [{
      type: "scatter",
      dataPoints: datapts 
    }]
  });

  var time = 0;
  var freqVal = 0;
  var updateInterval = 20;
  var dataLength = 500; // number of dataPoints visible at any point

  var updateChart = function (count) {
    count = count || 1;

    for (var i = 0; i < count; i++) { 
      freqVal = Number(
          document.querySelector('.frequency').childNodes[0].textContent);
      datapts.push({
        x: time,
        y: freqVal
      });
      time += 0.02;
    }
    if (datapts.length > dataLength) {
      datapts.shift();        
    }
    
    chart.render();   
  };

  // generates first set of dataPoints
  updateChart(dataLength); 

  // update chart after specified time. 
  setInterval(function(){updateChart()}, updateInterval); 
});

