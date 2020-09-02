// set myChart as global variable
var myChart;
var hasChartBeenMade = false;

function makeChart() {
    var ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
            label: '# of Times Appeared in Searched Articles',
            data: chartValues,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

//create function for making chart so we can nest it into ajax on other script
function updateChart() {
    if(hasChartBeenMade === false) {
        makeChart();
    } else {
        myChart.data.labels = chartLabels;
        myChart.data.datasets[0].data = chartValues;
    }
}

// a function that takes in a parameter and outputs an array of strings, which in this case will be words
