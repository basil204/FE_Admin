app.controller("indexController", [
  "$scope",
  "$http",
  "$location",
  "socket", // Inject $location to handle page redirection
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    $scope.showWarning = true;
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    if (userInfo) {
      socket.connect().then(function () {
        socket.subscribe(`/user/${userInfo.sub}/queue/messages`, function (message) {
          console.log(message);
          localStorage.setItem('invoice', JSON.stringify(message));
        });
        socket.subscribe("/topic/messages", function (message) {
          Toast.fire({
            icon: 'info',
            title: `Hóa đơn #${message} đã được đặt!`
          });
        })
      });
    }
    // Hide warning after 5 seconds
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.showWarning = false;
      });
    }, 3000);

    // Close warning manually
    $scope.closeWarning = function () {
      $scope.showWarning = false;
    };

    // Setup HTTP headers with token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Handle 403 Forbidden Error and redirect to login
    function handleForbiddenError(error) {
      if (error.status === 403) {
        $location.path("/login");
      } else {
        console.error("Error:", error);
      }
    }

    // Fetch data with proper error handling
    const fetchData = (url, scopeKey) => {
      $http
        .get(url, config)
        .then((response) => {
          $scope[scopeKey] = response.data;
        })
        .catch(handleForbiddenError);
    };

    // Fetch different API endpoints
    fetchData("http://160.30.21.47:1234/api/user/findTop5", "customers");
    fetchData("http://160.30.21.47:1234/api/Milkdetail/low-stock-count", "countend");
    fetchData("http://160.30.21.47:1234/api/Milkdetail/count-milkdetail", "countmilkdetail");
    fetchData("http://160.30.21.47:1234/api/Invoice/count/current", "countinvoice");
    fetchData("http://160.30.21.47:1234/api/user/count", "countuser");
    fetchData("http://160.30.21.47:1234/api/Userinvoice/user-invoices", "orders");
    fetchData("http://160.30.21.47:1234/api/Invoicedetail/milk-sales-details", "milkSalesDetails");
    fetchData("http://160.30.21.47:1234/api/Invoicedetail/invoice-summary", "invoiceSummary");
    fetchData("http://160.30.21.47:1234/api/Milkdetail/more", "milks");

    // Fetch the count of online users
    const fetchOnlineUsers = () => {
      $http
        .get("http://160.30.21.47:1234/api/user/online", config)
        .then((response) => {
          $scope.onlineUsers = response.data.length; // Assuming the response is an array of users
        })
        .catch(handleForbiddenError);
    };

    // Fetch the transaction history separately
    const fetchTransactionHistory = () => {
      $http
        .get("http://160.30.21.47:1234/api/payment/historyBank", config)
        .then((response) => {
          // Assuming the transaction history is inside `data.transactionHistoryList`
          $scope.transactionHistoryList = response.data.transactionHistoryList;

          // Loop through the transactionHistoryList using a for loop
          for (let i = 0; i < $scope.transactionHistoryList.length; i++) {
            let transaction = $scope.transactionHistoryList[i];
            console.log(transaction); // or any logic to process each transaction
          }
        })
        .catch(handleForbiddenError);
    };

    // Fetch the online users count and transaction history on page load
    fetchOnlineUsers();
    fetchTransactionHistory();

    // Open modal to update stock quantity
    $scope.updateStock = function (id) {
      $scope.formData = { newStockQuantity: null, productId: id };
      $("#ModalStockUpdate").modal("show");
    };

    // Fetch Monthly Statistics and Draw Chart
    $scope.fetchMonthlyStatistics = function () {
      let startDate = $scope.startDate;  // Get start date value
      let endDate = $scope.endDate;      // Get end date value

      // Check if start and end dates are not null
      if (!startDate || !endDate) {
        console.error("Please select both start and end dates.");
        return;  // Exit if dates are not selected
      }

      let url = "http://160.30.21.47:1234/api/Thongke/by-month"; // Default URL

      // Convert startDate and endDate to 'YYYY-MM-DDTHH:mm:ss' format
      startDate = new Date($scope.startDate).toISOString();
      endDate = new Date($scope.endDate).toISOString();

      // Create URL with startDate and endDate as query params
      url = `http://160.30.21.47:1234/api/Thongke/by-month?startDate=${startDate}&endDate=${endDate}`;

      // Call API
      $http.get(url, config)
        .then(function (response) {
          // Initialize arrays for labels and data
          const labels = [];
          const revenueData = [];

          // Loop through the response data
          for (let i = 0; i < response.data.length; i++) {
            const monthlyData = response.data[i];  // Get the individual data item
            labels.push(monthlyData.Date);         // Extract Date (X-axis)
            revenueData.push(monthlyData.totalRevenue);  // Extract totalRevenue (Y-axis)
          }

          // Update total revenue (optional, if you want to display the sum)
          $scope.totalRevenue = revenueData.reduce((sum, revenue) => sum + revenue, 0);

          // Draw the chart with the extracted labels and data
          drawChart(labels, revenueData);
        })
        .catch(function (error) {
          console.error("Error fetching data:", error);
        });
    };


    // Function to draw the chart using Chart.js or other library
    function drawChart(labels, data) {
      const ctx = document.getElementById("myChart").getContext("2d");

      const chart = new Chart(ctx, {
        type: 'line',  // or 'bar' depending on the chart type
        data: {
          labels: labels,  // X-axis labels (dates)
          datasets: [{
            label: 'Doanh Thu',
            data: data,  // Y-axis data (revenue values)
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Thời Gian'
              },
              ticks: {
                autoSkip: true,  // Skip some ticks if there are too many dates
                maxRotation: 45,  // Rotate the dates if necessary
                minRotation: 30
              }
            },
            y: {
              title: {
                display: true,
                text: 'Revenue'
              }
            }
          }
        }
      });
    }


    // Save updated stock quantity to API
    $scope.saveStockUpdate = function (formData) {
      const newQuantity = formData.newStockQuantity;
      const id = formData.productId;

      if (newQuantity !== null && !isNaN(newQuantity) && newQuantity >= 0) {
        const url = `http://160.30.21.47:1234/api/Milkdetail/update-stock/${id}?quantity=${newQuantity}`;

        $http({
          method: "PUT",
          url: url,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then(
          function (response) {
            if (response.status === 200) {
              // Show success notification
              showNotification("Số lượng sản phẩm đã được cập nhật thành công.", "success");

              // Reload milk details (re-fetch data)
              fetchData("http://160.30.21.47:1234/api/Milkdetail/more", "milks");

              // Close the modal
              $("#ModalStockUpdate").modal("hide");
            } else {
              showNotification("Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.", "error");
            }
          },
          function (error) {
            const errorMessage = parseErrorMessages(error, "Không thể cập nhật số lượng. Vui lòng thử lại.");
            showNotification(errorMessage, "error");
          }
        );
      } else {
        showNotification("Số lượng không hợp lệ. Vui lòng thử lại.", "error");
      }
    };

    // Placeholder for notification function
    function showNotification(message, type) {
      // Implement your own notification system (e.g., Toast, Alert)
      alert(`${type.toUpperCase()}: ${message}`);
    }

    // Placeholder for parsing error messages (you can customize this)
    function parseErrorMessages(error, fallbackMessage) {
      return error.data ? error.data.message : fallbackMessage;
    }

    // Auto-reload every 5 seconds
    setInterval(function () {
      fetchData("http://160.30.21.47:1234/api/user/findTop5", "customers");
      fetchData("http://160.30.21.47:1234/api/Milkdetail/low-stock-count", "countend");
      fetchData("http://160.30.21.47:1234/api/Milkdetail/count-milkdetail", "countmilkdetail");
      fetchData("http://160.30.21.47:1234/api/Invoice/count/current", "countinvoice");
      fetchData("http://160.30.21.47:1234/api/user/count", "countuser");
      fetchData("http://160.30.21.47:1234/api/Userinvoice/user-invoices", "orders");
      fetchData("http://160.30.21.47:1234/api/Invoicedetail/milk-sales-details", "milkSalesDetails");
      fetchData("http://160.30.21.47:1234/api/Invoicedetail/invoice-summary", "invoiceSummary");
      fetchData("http://160.30.21.47:1234/api/Milkdetail/more", "milks");
      fetchOnlineUsers();
      fetchTransactionHistory(); // Fetch transaction history periodically
    }, 50000);
  },
]);
