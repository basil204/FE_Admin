app.controller("ChartController", [
  "$scope",
  function ($scope) {
    $scope.chartData = {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    $scope.initPieChart = function () {
      const ctx = document.getElementById("pieChart");
      new Chart(ctx, {
        type: "pie",
        data: $scope.chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Biểu Đồ Hình Cầu Số Phiếu",
            },
          },
        },
      });
    };

    $scope.initBarChart = function () {
      const ctx = document.getElementById("barChart");
      new Chart(ctx, {
        type: "bar",
        data: $scope.chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Biểu Đồ Cột Số Phiếu",
            },
          },
        },
      });
    };

    $scope.initDoughnutChart = function () {
      const ctx = document.getElementById("doughnutChart");
      new Chart(ctx, {
        type: "doughnut",
        data: $scope.chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Biểu Đồ Doughnut Số Phiếu",
            },
          },
        },
      });
    };

    $scope.initPieChart();
    $scope.initBarChart();
    $scope.initDoughnutChart();
  },
]);
