app.controller("indexController", [
  "$scope",
  "$http",
  "$location",
  "socket", // Inject $location to handle page redirection
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    $scope.showWarning = true;
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      socket.connect(userInfo);
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
    fetchData("http://160.30.21.47:1234/api/payment/historyBank", "transactionHistoryList");
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

    // Fetch the online users count on page load
    fetchOnlineUsers();

    // Open modal to update stock quantity
    $scope.updateStock = function (id) {
      $scope.formData = { newStockQuantity: null, productId: id };
      $("#ModalStockUpdate").modal("show");
    };

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
      fetchData("http://160.30.21.47:1234/api/payment/historyBank", "transactionHistoryList");
      fetchData("http://160.30.21.47:1234/api/Milkdetail/more", "milks");
      fetchOnlineUsers();
    }, 50000);
  },
]);
