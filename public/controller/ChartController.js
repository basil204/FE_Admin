app.controller("ChartController", [
  "$scope",
  "$http", "socket", // Thêm $http để gọi API
  function ($scope, $http, socket) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL =
        "http://160.30.21.47:1234/api/Invoicedetail/monthly-sales-growth";
    const API_REVENUE_BY_DAY_URL = "http://localhost:1234/api/Thongke/by-month"; // API mới

    // Cập nhật tháng hiện tại
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' }) + " " + currentDate.getFullYear();
    $scope.currentMonth = currentMonth;

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

    // Dữ liệu cho doanh thu số ngày trong tháng
    $scope.dailyRevenueChartData = {
      labels: [], // Mảng sẽ chứa ngày
      datasets: [
        {
          label: "Doanh Thu Theo Ngày (VNĐ)", // Tên tiếng Việt cho biểu đồ mới
          data: [], // Dữ liệu sẽ được cập nhật từ API
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Hàm gọi API và cập nhật biểu đồ tổng doanh thu
    $scope.getSalesGrowthData = function () {
      $http
          .get(API_BASE_URL, {
            headers: {
              Authorization: `Bearer ${token}`,
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

            // Vẽ lại biểu đồ cột sau khi dữ liệu được cập nhật
            $scope.initBarChart();
          })
          .catch(function (error) {
            console.error("API call failed", error);
          });
    };

    // Hàm gọi API và cập nhật biểu đồ doanh thu theo ngày
    $scope.getDailyRevenueData = function () {
      $http
          .get(API_REVENUE_BY_DAY_URL, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(function (response) {
            const data = response.data;

            // Xử lý dữ liệu API để cập nhật labels và datasets cho doanh thu ngày
            $scope.dailyRevenueChartData.labels = data.map(function (item) {
              return item.Date.split("-")[2]; // Lấy ngày từ chuỗi Date
            });

            // Dữ liệu cho doanh thu theo ngày
            $scope.dailyRevenueChartData.datasets[0].data = data.map(function (item) {
              return item.totalRevenue;
            });

            // Vẽ lại biểu đồ đường sau khi dữ liệu được cập nhật
            $scope.initDailyRevenueChart();
          })
          .catch(function (error) {
            console.error("API call failed", error);
          });
    };

    // Hàm để khởi tạo biểu đồ cột cho doanh thu theo tháng
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

    // Hàm để khởi tạo biểu đồ đường cho doanh thu theo ngày
    $scope.initDailyRevenueChart = function () {
      const ctx = document.getElementById("dailyRevenueChart");
      new Chart(ctx, {
        type: "line", // Biểu đồ đường
        data: $scope.dailyRevenueChartData,
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
              text: "Biểu Đồ Doanh Thu Theo Ngày (VNĐ)",
            },
          },
        },
      });
    };

    // Gọi API để lấy dữ liệu và khởi tạo biểu đồ doanh thu theo tháng
    $scope.getSalesGrowthData();

    // Gọi API để lấy dữ liệu và khởi tạo biểu đồ doanh thu theo ngày
    $scope.getDailyRevenueData();
  },
]);
