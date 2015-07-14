window.addEventListener('load', function () {
  var rawpts = [];
  var datapts = [];

  var chart = new CanvasJS.Chart("chartContainer",{
    title :{
      text: "Live Frequency Data"
    },      
    axisX: {
      title: "Time (s)"
    },
    axisY: {
      title: "Frequency (Hz)"
    },
    data: [
      {
        type: "scatter",
        markerType: "triangle",
        color: "#78eded",
        dataPoints: rawpts,
        showInLegend: true,
        legendText: "raw"
      },
      {
        type: "line",
        color: "#1b6611", // dark green
        dataPoints: datapts,
        showInLegend: true,
        legendText: "calibrated"
      }
    ]
  });

  var time = 0;
  var freqVal = 0;
  var updateInterval = 20;
  var dataLength = 500; // number of dataPoints visible at any point

  var updateChart = function (count) {
    count = count || 1;

    for (var i = 0; i < count; i++) { 
      rawFreqVal = Number(
          document.querySelector('.rawFreq').childNodes[0].textContent);
      freqVal = Number(
          document.querySelector('.frequency').childNodes[0].textContent);
      rawpts.push({
        x: time,
        y: rawFreqVal
      });
      datapts.push({
        x: time,
        y: freqVal
      });
      time += 0.02;
    }
    if (datapts.length > dataLength) {
      rawpts.shift();
      datapts.shift();        
    }
    
    chart.render();   
  };

  // generates first set of dataPoints
  updateChart(dataLength); 

  // update chart after specified time. 
  setInterval(function(){updateChart()}, updateInterval); 
});

