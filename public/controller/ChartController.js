app.controller("ChartController", [
  "$scope",
  "$http", // Thêm $http để gọi API
  function ($scope, $http, socket
  ) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL =
      "http://160.30.21.47:1234/api/Invoicedetail/monthly-sales-growth";
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      socket.connect(userInfo);
    }
    // Dữ liệu mặc định của chart
    $scope.chartData = {
      labels: [], // Mảng sẽ chứa tháng và năm
      datasets: [
        {
          label: "Tổng Giá Trị Doanh Thu (VNĐ)", // Thêm VNĐ và tên tiếng Việt
          data: [], // Dữ liệu sẽ được cập nhật từ API
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Tỷ Lệ Tăng Trưởng (%)", // Đổi tên thành tiếng Việt
          data: [], // Dữ liệu sẽ được cập nhật từ API
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Hàm gọi API và cập nhật biểu đồ
    $scope.getSalesGrowthData = function () {
      $http
        .get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token nếu cần
          },
        })
        .then(function (response) {
          const data = response.data;

          // Xử lý dữ liệu API để cập nhật labels và datasets
          $scope.chartData.labels = data.map(function (item) {
            return `${item.month}-${item.year}`;
          });

          // Dữ liệu cho Tổng Giá Trị Doanh Thu (VNĐ)
          $scope.chartData.datasets[0].data = data.map(function (item) {
            return item.total_sales_value;
          });

          // Dữ liệu cho Tỷ Lệ Tăng Trưởng
          $scope.chartData.datasets[1].data = data.map(function (item) {
            if (
              item.previous_month_sales !== null &&
              item.previous_month_sales !== 0
            ) {
              return (
                ((item.total_sales_value - item.previous_month_sales) /
                  item.previous_month_sales) *
                100
              );
            } else {
              return null; // Nếu previous_month_sales là null, ta trả về null hoặc có thể thay bằng 0
            }
          });

          // Vẽ lại các biểu đồ sau khi dữ liệu được cập nhật
          $scope.initPieChart();
          $scope.initBarChart();
          $scope.initDoughnutChart();
        })
        .catch(function (error) {
          console.error("API call failed", error);
        });
    };

    // Hàm để khởi tạo pie chart
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
              text: "Biểu Đồ Hình Cầu Tổng Giá Trị Doanh Thu (VNĐ)",
            },
          },
        },
      });
    };

    // Hàm để khởi tạo bar chart
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
              text: "Biểu Đồ Cột Tổng Giá Trị Doanh Thu (VNĐ)",
            },
          },
        },
      });
    };

    // Hàm để khởi tạo doughnut chart
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
              text: "Biểu Đồ Doughnut Tổng Giá Trị Doanh Thu (VNĐ)",
            },
          },
        },
      });
    };

    // Gọi API để lấy dữ liệu và khởi tạo biểu đồ
    $scope.getSalesGrowthData();
  },
]);
